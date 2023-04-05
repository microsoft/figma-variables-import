/**
	Creates a space-delimited CSS class list.
	@param args A list of CSS classes or falsy values.
	@returns A single space-separated string suitable for an element's "class" property.
	@example <Thing className={classNames("always-there", sometimes && "sometimes-there")} />
*/
export function classNames(...args: (string | false | undefined | null)[]): string {
	return args.filter(value => !!value).join(" ")
}
