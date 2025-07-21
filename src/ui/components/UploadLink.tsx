import React from "react"
import type Preact from "preact"
import styled from "styled-components"

export interface UploadLinkProps {
	children?: Preact.ComponentChildren
	className?: string
	style?: React.JSX.CSSProperties
	accept: typeof HTMLInputElement.prototype.accept
	multiple?: typeof HTMLInputElement.prototype.multiple
	capture?: typeof HTMLInputElement.prototype.capture
	onFileChosen: (files: FileList) => void
	"aria-label"?: string
	"aria-describedby"?: string
}

export function UploadLink(props: UploadLinkProps) {
	const filePicker = React.useRef<HTMLInputElement>(null)
	const filePickerId = React.useId()

	return (
		<>
			<StyledButton
				type="button"
				onClick={showFilePicker}
				onKeyDown={handleKeyDown}
				className={props.className}
				style={props.style}
				aria-label={props["aria-label"]}
				aria-describedby={props["aria-describedby"] || filePickerId}
			>
				{props.children}
			</StyledButton>
			<VisuallyHiddenInput
				ref={filePicker}
				id={filePickerId}
				type="file"
				accept={props.accept}
				multiple={props.multiple}
				capture={props.capture}
				onChange={onFileChosen}
				tabIndex={-1}
				aria-hidden="true"
			/>
		</>
	)

	function showFilePicker(ev: React.MouseEvent) {
		ev.stopPropagation()
		ev.preventDefault()
		filePicker.current?.click()
	}

	function handleKeyDown(ev: React.KeyboardEvent) {
		if (ev.key === "Enter" || ev.key === " ") {
			ev.preventDefault()
			filePicker.current?.click()
		}
	}

	function onFileChosen() {
		const files = filePicker.current?.files
		if (!files || files.length === 0) return
		props.onFileChosen(files)
		
		// Announce to screen readers
		const fileCount = files.length
		const announcement = document.createElement("div")
		announcement.setAttribute("role", "status")
		announcement.setAttribute("aria-live", "polite")
		announcement.className = "sr-only"
		announcement.textContent = `${fileCount} file${fileCount > 1 ? 's' : ''} selected`
		document.body.appendChild(announcement)
		setTimeout(() => document.body.removeChild(announcement), 1000)
	}
}
export default UploadLink

const StyledButton = styled.button`
	background: none;
	border: none;
	padding: 0;
	font: inherit;
	color: var(--figma-color-text-brand, #007be5);
	text-decoration: underline;
	cursor: pointer;
	display: inline-block;
	
	&:hover {
		text-decoration: none;
	}
	
	&:focus-visible {
		outline: 2px solid var(--figma-color-text-brand, #007be5);
		outline-offset: 2px;
		text-decoration: none;
	}
`

const VisuallyHiddenInput = styled.input`
	position: absolute;
	width: 1px;
	height: 1px;
	padding: 0;
	margin: -1px;
	overflow: hidden;
	clip: rect(0, 0, 0, 0);
	white-space: nowrap;
	border: 0;
`
