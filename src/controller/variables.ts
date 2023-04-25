import type { OperationResult } from "shared/collab"
import { jsonColorToFigmaColor } from "utils/color"
import { type JsonToken, type JsonTokenDocument, type JsonManifest, allTokenNodes } from "utils/tokens"
import type { JsonTokenType } from "utils/tokens/types"
import { getAliasTargetName } from "utils/tokens/utils"

/** Delete me and replace me with figma.variables.createVariableBinding once that exists */
function createVariableBinding(variable: Variable): BoundVariableDescriptor {
	return { type: "VARIABLE_ID", id: variable.id }
}

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
			return "FLOAT"
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
		return [{ result: "error", text: `Failed to create any variables because you‘re not in the required Figma beta.` }]
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
		// NOTE: As of writing this code, PluginAPI.teamLibrary was not present in the typings, so I changed them manually.
		const remoteCollectionsArray = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync()
		for (const collection of remoteCollectionsArray)
		{
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
			let modeID: string | undefined = undefined
			if (!variable) {
				// This variable doesn't exist yet. First, create its collection and mode if necessary.
				collection = collections[update.collectionName]
				if (!collection) {
					collection = figma.variables.createVariableCollection(update.collectionName)
					collections[update.collectionName] = collection
					modeID = collection.modes[0].modeID
					collection.renameMode(modeID, update.modeName)
				}
				else if (!("id" in collection))
				{
					// The variable doesn't exist, but it's in a remote collection that does.
					results.push({ result: "error", text: `Failed to create ${update.figmaName} because it‘s defined in a different library.` })
					continue
				}

				// Then we can create the variable itself.
				variable = figma.variables.createVariable(update.figmaName, collection.id, figmaType)
				variables[update.figmaName] = variable
				variablesCreated++
			} else if (!("id" in variable))
			{
				results.push({ result: "error", text: `Failed to update ${update.figmaName} because it‘s defined in a different library.` })
				continue
			} else {
				otherUpdatesCount++
				collection = figma.variables.getVariableCollectionById(variable.variableCollectionId)!
			}
			if (!modeID) {
				const mode = collection.modes.find(obj => obj.name === update.modeName)
				modeID = mode ? mode.modeID : collection.addMode(update.modeName)
			}
			if (!("id" in variable)) throw new Error("Why wasn't this case caught by earlier code?")

			// Then, we just need to update its value for this mode.

			if (targetVariable) {
				// This variable is an alias token.
				if (!("id" in targetVariable))
				{
					// ...and it's referencing a variable in a different file, so we need to import that target before we can reference it.
					targetVariable = await figma.variables.importVariableByKeyAsync(targetVariable.key)
				}
				variable.setValueForMode(modeID, createVariableBinding(targetVariable as Variable))
			} else {
				const value = update.token.$value
				switch (update.token.$type) {
					case "color": {
						const color = jsonColorToFigmaColor(value)
						if (color) variable.setValueForMode(modeID, color)
						else results.push({ result: "error", text: `Invalid color: ${update.figmaName} = ${JSON.stringify(value)}` })
						break
					}
					case "dimension": {
						const float = parseFloat(value)
						if (!isNaN(float)) variable.setValueForMode(modeID, float)
						else results.push({ result: "error", text: `Invalid dimension: ${update.figmaName} = ${JSON.stringify(value)}` })
						break
					}
					default:
						throw new Error(
							`Failed to update a variable of type ${update.token.$type}. tokenTypeToFigmaType probably needs to be updated.`
						)
				}
			}

			// Any time we successfully make any updates, we need to loop again unless we completely finish.
			keepGoing = true
		}
		queuedUpdates = retryNextTime
	} while (keepGoing && queuedUpdates.length)

	// Now, if queuedUpdates isn't empty, it's just a list of unresolved aliases, so report those as errors.
	for (const missing of queuedUpdates) {
		results.push({
			result: "error",
			text: `Unable to add ${missing.figmaName} mode ${missing.modeName} because it is an alias of ${tokenNameToFigmaName(
				getAliasTargetName(missing.token.$value) || "another token"
			)} but that doesn‘t exist.`,
		})
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
