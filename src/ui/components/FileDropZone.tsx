import React from "react"
import styled from "styled-components"
import type { UploadLinkProps } from "./UploadLink"
import { classNames } from "utils/classNames"

// FileDropZone uses the same props as UploadLink and functions in largely the same way,
// but some props such as "accept" do not work.

interface FileDropZoneProps extends UploadLinkProps {
	"aria-label"?: string
	"aria-describedby"?: string
}

export function FileDropZone(props: FileDropZoneProps) {
	const [isDragging, setIsDragging] = React.useState(false)
	const [isFocused, setIsFocused] = React.useState(false)
	const fileInputRef = React.useRef<HTMLInputElement>(null)

	// Announce drag state changes to screen readers
	React.useEffect(() => {
		if (isDragging) {
			const announcement = document.createElement("div")
			announcement.setAttribute("role", "status")
			announcement.setAttribute("aria-live", "polite")
			announcement.className = "sr-only"
			announcement.textContent = "Drop zone active. Release files to upload."
			document.body.appendChild(announcement)
			
			setTimeout(() => document.body.removeChild(announcement), 1000)
		}
	}, [isDragging])

	return (
		<>
			<DropZone
				className={classNames(
					props.className, 
					isDragging && "drag-over",
					isFocused && "focused"
				)}
				style={props.style}
				onDragStart={onDragStart}
				onDragEnter={onDragEnter}
				onDragOver={onDragOver}
				onDragLeave={onDragLeave}
				onDrop={onDrop}
				onClick={handleClick}
				onKeyDown={handleKeyDown}
				tabIndex={0}
				role="button"
				aria-label={props["aria-label"] || "Drop files here or click to browse"}
				aria-describedby={props["aria-describedby"]}
				aria-dropeffect={isDragging ? "copy" : "none"}
				onFocus={() => setIsFocused(true)}
				onBlur={() => setIsFocused(false)}
			>
				{props.children}
				<HiddenFileInput
					ref={fileInputRef}
					type="file"
					multiple={props.multiple}
					accept={props.accept}
					onChange={handleFileChange}
					tabIndex={-1}
					aria-hidden="true"
				/>
			</DropZone>
			<ScreenReaderOnly id="drop-zone-instructions">
				Press Enter or Space to open file browser. Or drag and drop files onto this area.
			</ScreenReaderOnly>
		</>
	)

	function onDragStart(ev: DragEvent) {
		ev.preventDefault()
	}

	function onDragEnter(ev: DragEvent) {
		ev.stopPropagation()
		ev.preventDefault()
		setIsDragging(true)
	}

	function onDragOver(ev: DragEvent) {
		ev.stopPropagation()
		ev.preventDefault()
		if (ev.dataTransfer) ev.dataTransfer.dropEffect = "copy"
	}

	function onDragLeave(ev: DragEvent) {
		ev.stopPropagation()
		ev.preventDefault()
		setIsDragging(false)
	}

	function onDrop(ev: DragEvent) {
		ev.stopPropagation()
		ev.preventDefault()
		setIsDragging(false)
		if (ev.dataTransfer && ev.dataTransfer.files) props.onFileChosen(ev.dataTransfer.files)
	}

	function handleClick() {
		fileInputRef.current?.click()
	}

	function handleKeyDown(ev: React.KeyboardEvent) {
		if (ev.key === "Enter" || ev.key === " ") {
			ev.preventDefault()
			fileInputRef.current?.click()
		}
	}

	function handleFileChange(ev: React.ChangeEvent<HTMLInputElement>) {
		if (ev.target.files) {
			props.onFileChosen(ev.target.files)
		}
	}
}
export default FileDropZone

const DropZone = styled.div`
	border: 3px dashed var(--figma-color-border-disabled-strong, rgba(0, 0, 0, 0.3));
	padding: 2em;
	background-color: var(--figma-color-bg-secondary, #f5f5f5);
	cursor: pointer;
	position: relative;
	transition: border-color 0.2s ease, background-color 0.2s ease;

	* {
		pointer-events: none;
	}

	&.drag-over {
		border: 3px solid var(--figma-color-border-selected, #0d99ff);
		background-color: var(--figma-color-bg-selected, #e5f4ff);
	}

	&.focused {
		outline: 2px solid var(--figma-color-border-selected, #0d99ff);
		outline-offset: 2px;
	}

	&:hover {
		border-color: var(--figma-color-border-strong, #666666);
	}
`

const HiddenFileInput = styled.input`
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

const ScreenReaderOnly = styled.span`
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
