import type { JsonToken, JsonTokenGroup } from "./types"

export function isChildName(name: string): boolean {
	return name.charCodeAt(0) !== 36 /* "$" */
}

export function isToken(obj: JsonTokenGroup | JsonToken): obj is JsonToken {
	return typeof obj === "object" && "$value" in obj
}

export function isTokenGroup(obj: JsonTokenGroup | JsonToken): obj is JsonTokenGroup {
	return typeof obj === "object" && !("$value" in obj)
}

export function isAliasValue(value: string): boolean {
	return value.charCodeAt(0) === 123 /* "{" */ && value.charCodeAt(value.length - 1) === 125 /* "}" */
}

export function getAliasTargetName(value: any): string | null {
	if (typeof value === "string" && value.charCodeAt(0) === 123 /* "{" */ && value.charCodeAt(value.length - 1) === 125 /* "}" */)
		return value.slice(1, -1)
	else return null
}
