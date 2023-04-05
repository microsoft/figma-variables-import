import React from "react"
import type Preact from "preact"

export interface UploadLinkProps {
	children?: Preact.ComponentChildren
	className?: string
	style?: React.JSX.CSSProperties
	accept: typeof HTMLInputElement.prototype.accept
	multiple?: typeof HTMLInputElement.prototype.multiple
	capture?: typeof HTMLInputElement.prototype.capture
	onFileChosen: (files: FileList) => void
}

export function UploadLink(props: UploadLinkProps) {
	const filePicker = React.useRef<HTMLInputElement>(null)

	return (
		<>
			<a href="#" onClick={showFilePicker} className={props.className} style={props.style}>
				{props.children}
			</a>
			<input
				ref={filePicker}
				type="file"
				accept={props.accept}
				multiple={props.multiple}
				capture={props.capture}
				style={{ display: "none" }}
				onChange={onFileChosen}
			/>
		</>
	)

	function showFilePicker(ev: MouseEvent) {
		ev.stopPropagation()
		ev.preventDefault()
		filePicker.current?.click()
	}

	function onFileChosen() {
		const files = filePicker.current?.files
		if (!files || files.length === 0) return
		props.onFileChosen(files)
	}
}
export default UploadLink
