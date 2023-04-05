import type { JsonToken, JsonTokenDocument } from "./types"
import { isChildName, isToken, isTokenGroup } from "./utils"

export type IteratedToken = [name: string, token: JsonToken]

/**
	Given a token document in DTCG format, iterates through all of the tokens. Each item returned from the generator is a 2-element tuple array of the form [ name, token ].
	@param root An object representation of a token document in the DTCG format: as in the return value of JSON.parse() or similar.
	@example for (const [name, token] of allTokenNodes(root)) { console.log(name, "=", token) }
*/
export function* allTokenNodes(root: JsonTokenDocument): Generator<IteratedToken, void> {
	if (typeof root !== "object") throw new Error("Tokens must be in the Design Token Community Group format.")

	const groups = [{ nameDot: "", node: root }]
	while (true) {
		const thisGroup = groups.pop()
		if (!thisGroup) break
		for (const name in thisGroup.node) {
			if (!isChildName(name)) continue
			if (!thisGroup.node.hasOwnProperty(name)) continue
			const child = thisGroup.node[name]
			if (isToken(child)) {
				yield [thisGroup.nameDot + name, child]
			} else if (isTokenGroup(child)) {
				groups.unshift({ nameDot: `${thisGroup.nameDot}${name}.`, node: child })
			}
		}
	}
}

/**
	Given a token document in the DTCG format, returns an object mapping each token's full name to the token itself,
	"flattening" the structure to remove groups.
	@param root An object representation of a token document in the DTCG format: as in the return value of JSON.parse() or similar.
	@returns An object mapping token names to tokens.
	@example {"Global.Color.Purple": { $value: "#ff00ff" }}
*/
export function getAllTokens(root: JsonTokenDocument): Record<string, JsonToken> {
	const tokens: Record<string, JsonToken> = {}
	for (const [name, token] of allTokenNodes(root)) {
		tokens[name] = token
	}
	return tokens
}
