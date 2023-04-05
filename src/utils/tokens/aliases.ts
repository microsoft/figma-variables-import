import type { OperationResult } from "shared/collab"
import type { JsonToken } from "./types"
import { getAliasTargetName } from "./utils"

/**
	Given an object mapping token full names to tokens (such as from getAllTokens), resolves all aliases.
	@param tokens An object mapping token full names to tokens.
	@returns Details about any errors that occurred.
	@example const tokens = resolveAllAliases(getAllTokens(JSON.parse(tokenJson)))
 */
export function resolveAllAliases(tokens: Record<string, JsonToken>): OperationResult[] {
	const results: OperationResult[] = []
	for (const name in tokens) {
		resolveOneAlias(name, results)
	}
	return results

	function resolveOneAlias(name: string, currentResults: OperationResult[], previousReferences?: string | ReadonlyArray<string>): void {
		const token = tokens[name]
		if (!token) {
			currentResults.push({ result: "error", text: `A token was an alias of "${name}" but that token doesn‘t exist.` })
			return
		}
		const value = token.$value
		if (!token) {
			currentResults.push({ result: "error", text: `A token was an alias of "${name}" but that doesn‘t have a value.` })
			return
		}
		const targetName = getAliasTargetName(value)

		// If this isn't an alias then there's nothing left to do.
		if (!targetName) return

		// An alias to the same token is never valid.
		if (targetName === name) {
			currentResults.push({ result: "error", text: `Alias cycle detected: ${targetName} ← ${name}.` })
			return
		}

		// Alias cycles (A -> B -> A) are not valid.
		if (previousReferences) {
			if (typeof previousReferences === "string") {
				if (previousReferences === targetName) {
					currentResults.push({ result: "error", text: `Alias cycle detected: ${targetName} ← ${name} ← ${targetName}.` })
					return
				}
			} else {
				if (previousReferences.indexOf(targetName) >= 0) {
					currentResults.push({
						result: "error",
						text: `Alias cycle detected: ${targetName} ← ${name} ← ${previousReferences.join(" ← ")}.`,
					})
					return
				}
			}
		}

		// If this token IS an alias, resolve it recursively.
		resolveOneAlias(
			targetName,
			currentResults,
			!previousReferences ? name : typeof previousReferences === "string" ? [name, previousReferences] : [name, ...previousReferences]
		)
		// Figma native app doesn't support this syntax
		// tokens[name] = { ...tokens[name], ...tokens[targetName] }
		tokens[name] = Object.assign([], tokens[name], tokens[targetName])
		return
	}

	/*
		Examples of reference cycles:

		{
			"Invalid1": { "$value": "{Invalid2}" },
			"Invalid2": { "$value": "{Invalid1}" },
			"Invalid3": { "$value": "{Invalid3}" },
			"Invalid4": { "$value": "{Invalid5}" },
			"Invalid5": { "$value": "{Invalid6}" },
			"Invalid6": { "$value": "{Invalid4}" }
		}
	*/
}
