function toHex2(num: number): string {
	return Math.round(num * 0xff)
		.toString(16)
		.padStart(2, "0")
}

export function toHexColor(rgb: RGB, opacity?: number): string {
	return `#${toHex2(rgb.r)}${toHex2(rgb.g)}${toHex2(rgb.b)}${opacity !== undefined && opacity < 1.0 ? toHex2(opacity) : ""}`
}

/** Converts a 2-character hex string 00-FF to a number 0-1 without rounding. */
function hex2ToFloat(hex2: string): number {
	return parseInt(hex2, 16) / 0xff
}

/** Converts a 2-character hex string 00-FF to a number 0.00-1.00 with two digits of precision after the decimal point. */
function hex2ToFloat2(hex2: string): number {
	return Math.round(parseInt(hex2, 16) * (100 / 0xff)) / 100
}

/**
	Converts any valid Color value in the DTCG format to a Figma solid paint color.
	@param hex A string representing a valid color in the DTCG format.
	@returns A Figma RGB or RGBA object, or null if the string could not be parsed.
	@see https://tr.designtokens.org/format/#color
*/
export function jsonColorToFigmaColor(hex: string): RGB | RGBA | null {
	if (!hex.startsWith("#")) {
		return null
	} else if (hex.length === 9) {
		const color = {
			r: hex2ToFloat(hex.slice(1, 3)),
			g: hex2ToFloat(hex.slice(3, 5)),
			b: hex2ToFloat(hex.slice(5, 7)),
			a: hex2ToFloat2(hex.slice(7, 9)),
		}
		if (isNaN(color.r) || isNaN(color.g) || isNaN(color.b) || isNaN(color.a)) return null
		return color
	} else if (hex.length === 7) {
		const color = {
			r: hex2ToFloat(hex.slice(1, 3)),
			g: hex2ToFloat(hex.slice(3, 5)),
			b: hex2ToFloat(hex.slice(5, 7)),
		}
		if (isNaN(color.r) || isNaN(color.g) || isNaN(color.b)) return null
		return color
	} else {
		return null
	}
}

/**
	Converts any valid Color value in the DTCG format to a Figma solid paint color and an opacity value.
	@param hex A string representing a valid color in the DTCG format.
	@returns If the string could be parsed, a 2-element array containing a Figma RGB object and an opacity value; or null if the string could not be parsed.
	@see https://tr.designtokens.org/format/#color
*/
export function jsonColorToFigmaColorAndOpacity(hex: string): [color: RGB, opacity: number] | null {
	if (hex.startsWith("#") && (hex.length === 7 || hex.length === 9)) {
		const a = hex.length === 9 ? hex2ToFloat2(hex.slice(7, 9)) : 1
		if (isNaN(a)) return null
		const color = {
			r: hex2ToFloat(hex.slice(1, 3)),
			g: hex2ToFloat(hex.slice(3, 5)),
			b: hex2ToFloat(hex.slice(5, 7)),
		}
		if (isNaN(color.r) || isNaN(color.g) || isNaN(color.b)) return null
		return [color, a]
	} else {
		return null
	}
}
