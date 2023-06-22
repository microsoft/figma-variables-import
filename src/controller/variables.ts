import type { OperationResult } from "shared/collab"
import { jsonColorToFigmaColor } from "utils/color"
import { type JsonToken, type JsonTokenDocument, type JsonManifest, allTokenNodes } from "utils/tokens"
import type { JsonTokenType } from "utils/tokens/types"
import { getAliasTargetName } from "utils/tokens/utils"

/** For a given token name in the DTCG format, return a valid token name in the Figma format. */
function tokenNameToFigmaName(name: string): string {
	return name.replaceAll(".", "/")
}

/** For a given token $type in the DTCG format, return the corresponding Figma token type, or null if there isn't one. */
function tokenTypeToFigmaType($type: JsonTokenType): VariableResolvedDataType | null {
	switch ($type) {
		case "color":
			return "COLOR"
		case "dimension":
		case "duration":
		case "number":
			return "FLOAT"
		case "boolean":
			return "BOOLEAN"
		case "string":
			return "STRING"
		default:
			return null
	}
}

interface QueuedUpdate {
	figmaName: string
	token: JsonToken
	collectionName: string
	modeName: string
}

export async function importTokens(files: Record<string, JsonTokenDocument>, manifest?: JsonManifest): Promise<OperationResult[]> {
	if (!figma.variables) {
		return [
			{
				result: "error",
				text: `Update and restart Figma to enable Variables features!`,
			},
		]
	}

	const results: OperationResult[] = []

	// If a manifest wasn't supplied, invent a basic one before starting.
	if (!manifest) {
		const filenames = Object.keys(files)
		const name = filenames.join(", ")
		manifest = {
			name: name,
			collections: {
				[name]: {
					modes: {
						Default: filenames,
					},
				},
			},
		}
	}

	// First, we need to know what variables are already present, so we can update them if necessary.
	const collections: Record<string, VariableCollection | LibraryVariableCollection> = {}
	const variables: Record<string, Variable | LibraryVariable> = {}

	{
		// Remote / team library variables
		const remoteCollectionsArray = figma.teamLibrary ? await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync() : []
		for (const collection of remoteCollectionsArray) {
			collections[collection.name] = collection
			const variablesArray = await figma.teamLibrary.getVariablesInLibraryCollectionAsync(collection.key)
			for (const variable of variablesArray) variables[variable.name] = variable
		}

		// Local variables
		const collectionsArray = figma.variables.getLocalVariableCollections()
		for (const collection of collectionsArray) collections[collection.name] = collection
		const variablesArray = figma.variables.getLocalVariables()
		for (const variable of variablesArray) variables[variable.name] = variable
	}

	// Aliases can't be created until their target is, and we might see the alias before the target. So we have to maintain a queue
	// of tokens to add and update, and go through it multiple times.
	let queuedUpdates: QueuedUpdate[] = []

	for (const collectionName in manifest.collections) {
		const collection = manifest.collections[collectionName]
		for (const modeName in collection.modes) {
			const modeFilenames = collection.modes[modeName]
			for (const filename of modeFilenames) {
				const document = files[filename]
				if (document) {
					for (const [name, token] of allTokenNodes(document)) {
						queuedUpdates.push({ figmaName: tokenNameToFigmaName(name), collectionName, modeName, token })
					}
				} else {
					results.push({
						result: "error",
						text: `The manifest mentioned ${filename} but you didn‘t give me that file, so I skipped it.`,
					})
				}
			}
		}
	}

	// Now keep processing the queue of token updates until we make it through a whole iteration without accomplishing anything.
	let variablesCreated = 0,
		otherUpdatesCount = 0
	let keepGoing: boolean
	do {
		keepGoing = false
		const retryNextTime: typeof queuedUpdates = []
		for (const update of queuedUpdates) {
			const figmaType = tokenTypeToFigmaType(update.token.$type)
			if (!figmaType) {
				results.push({
					result: "info",
					text: `Unable to add ${update.figmaName} mode ${update.modeName} because ${update.token.$type} tokens aren‘t supported.`,
				})
				continue
			}

			// First, if this is an alias, see if the target exists already.
			const targetName = getAliasTargetName(update.token.$value)
			let targetVariable: Variable | LibraryVariable | undefined = undefined
			if (targetName) {
				const targetFigmaName = tokenNameToFigmaName(targetName)
				targetVariable = variables[targetFigmaName]
				if (!targetVariable) {
					// This is an alias to a variable that hasn't been created yet, so we can't process it right now.
					// Save it for next iteration.
					retryNextTime.push(update)
					continue
				}
			}

			// TODO: Check for matching types: a variable can't be a string in one mode and a color in another.

			// Okay, this either isn't an alias, or it's an alias to something that indeed exists, so we can continue.
			// If the variable doesn't exist yet, create it now.
			let collection: VariableCollection | LibraryVariableCollection
			let variable: Variable | LibraryVariable | undefined = variables[update.figmaName]
			let modeId: string | undefined = undefined
			if (!variable) {
				// This variable doesn't exist yet. First, create its collection and mode if necessary.
				collection = collections[update.collectionName]
				if (!collection) {
					collection = figma.variables.createVariableCollection(update.collectionName)
					collections[update.collectionName] = collection
					modeId = collection.modes[0].modeId
					collection.renameMode(modeId, update.modeName)
				} else if (!("id" in collection)) {
					// The variable doesn't exist, but it's in a remote collection that does.
					results.push({
						result: "error",
						text: `Failed to create ${update.figmaName} because it‘s defined in a different library.`,
					})
					continue
				}

				// Then we can create the variable itself.
				variable = figma.variables.createVariable(update.figmaName, collection.id, figmaType)
				variables[update.figmaName] = variable
				variablesCreated++
			} else if (!("id" in variable)) {
				results.push({ result: "error", text: `Failed to update ${update.figmaName} because it‘s defined in a different library.` })
				continue
			} else {
				otherUpdatesCount++
				collection = figma.variables.getVariableCollectionById(variable.variableCollectionId)!
			}
			if (!modeId) {
				const mode = collection.modes.find(obj => obj.name === update.modeName)
				modeId = mode ? mode.modeId : collection.addMode(update.modeName)
			}
			if (!("id" in variable)) throw new Error("Why wasn't this case caught by earlier code?")

			// Then, we just need to update its value for this mode.

			if (targetVariable) {
				// This variable is an alias token.
				if (!("id" in targetVariable)) {
					// ...and it's referencing a variable in a different file, so we need to import that target before we can reference it.
					targetVariable = await figma.variables.importVariableByKeyAsync(targetVariable.key)
				}
				variable.setValueForMode(modeId, figma.variables.createVariableAlias(targetVariable as Variable))
			} else {
				const value = update.token.$value
				switch (update.token.$type) {
					case "color": {
						const color = jsonColorToFigmaColor(value)
						if (color) variable.setValueForMode(modeId, color)
						else results.push({ result: "error", text: `Invalid color: ${update.figmaName} = ${JSON.stringify(value)}` })
						break
					}
					case "dimension":
					case "duration":
					case "number": {
						const float = typeof value === "number" ? value : parseFloat(value)
						if (!isNaN(float)) variable.setValueForMode(modeId, float)
						else
							results.push({
								result: "error",
								text: `Invalid ${update.token.$type}: ${update.figmaName} = ${JSON.stringify(value)}`,
							})
						break
					}
					case "boolean":
						if (typeof value === "boolean") variable.setValueForMode(modeId, value)
						else
							results.push({
								result: "error",
								text: `Invalid ${update.token.$type}: ${update.figmaName} = ${JSON.stringify(value)}`,
							})
						break
					case "string":
						variable.setValueForMode(modeId, value)
						break
					default:
						throw new Error(
							`Failed to update a variable of type ${update.token.$type}. tokenTypeToFigmaType probably needs to be updated.`
						)
				}

				variable.description = update.token.$description || ""
			}

			// Any time we successfully make any updates, we need to loop again unless we completely finish.
			keepGoing = true
		}
		queuedUpdates = retryNextTime
	} while (keepGoing && queuedUpdates.length)

	// Now, if queuedUpdates isn't empty, it's just a list of unresolved aliases, so report those as errors.
	if (queuedUpdates.length) {
		const isTeamLibraryAvailable = !!figma.teamLibrary
		if (!isTeamLibraryAvailable) {
			results.push({
				result: "error",
				text: "The Figma community version of this plugin cannot create variables that alias variables in other files during this phase of the Figma beta. (You can build this plugin from the source code to get all features.) With that in mind:",
			})
		}
		for (const missing of queuedUpdates) {
			results.push({
				result: "error",
				text: `Unable to add ${missing.figmaName} mode ${missing.modeName} because it is an alias of ${tokenNameToFigmaName(
					getAliasTargetName(missing.token.$value) || "another token"
				)} but ${isTeamLibraryAvailable ? "that doesn‘t exist" : "it wasn‘t found—it may be in a different file"}.`,
			})
		}
	}

	if ((variablesCreated || otherUpdatesCount) && results.length)
		results.push({
			result: "error",
			text: `${variablesCreated} variables were created and ${otherUpdatesCount} other updates were made, but ${results.length} had errors. Not great, not terrible.`,
		})
	else if (variablesCreated || otherUpdatesCount)
		results.push({
			result: "info",
			text: `${variablesCreated} variables were created and ${otherUpdatesCount} other updates were made.`,
		})
	else results.push({ result: "error", text: `Failed to create or update any variables due to errors.` })

	return results
}
