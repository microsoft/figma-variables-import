/** Extract the first font family name from a CSS font-family string. */
export function extractFirstFontFamily(value: any): string {
	if (typeof value !== "string") {
		return String(value)
	}

	// Check if split method exists
	if (typeof value.split !== "function") {
		return value.replace(/^['"]|['"]$/g, "")
	}

	// Split by comma to get the first font in the stack
	const firstFont = value.split(",")[0].trim()

	// Remove surrounding quotes (single or double)
	const withoutQuotes = firstFont.replace(/^['"]|['"]$/g, "")

	return withoutQuotes
}
