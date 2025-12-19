/** Convert line height percentage values to multipliers. */
export function convertLineHeightPercentageToMultiplier(value: any): number {
	if (typeof value === "number") {
		return value / 100
	} else {
		return parseFloat(value) / 100
	}
}
