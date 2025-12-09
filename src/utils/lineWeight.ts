/** Map numeric font weight values to their string equivalents.
 * This mapping is for Segoe Sans font weights (our default font). Figma has its own terminology for font weights and not numeric values. Mapping the value to a word helps designers accurately predict what font is going to have what weight.
*/
export function mapFontWeight(value: any): string | number {
	const fontWeightMap: Record<number, string> = {
		100: "hairline",
		200: "thin",
		300: "light",
		400: "semilight",
		500: "regular",
		600: "semibold",
		700: "bold",
		800: "extrabold",
		900: "black",
	}

	const numericValue = typeof value === "number" ? value : parseFloat(value)

	if (!isNaN(numericValue) && fontWeightMap[numericValue]) {
		return fontWeightMap[numericValue]
	}

	// Return original value if no mapping found
	return value
}
