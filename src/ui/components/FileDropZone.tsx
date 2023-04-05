import React from "react"
import styled from "styled-components"
import type { UploadLinkProps } from "./UploadLink"
import { classNames } from "utils/classNames"

// FileDropZone uses the same props as UploadLink and functions in largely the same way,
// but some props such as "accept" do not work.

export function FileDropZone(props: UploadLinkProps) {
	const [isDragging, setIsDragging] = React.useState(false)

	return (
		<DropZone
			className={classNames(props.className, isDragging && "drag-over")}
			style={props.style}
			onDragStart={onDragStart}
			onDragEnter={onDragEnter}
			onDragOver={onDragOver}
			onDragLeave={onDragLeave}
			onDrop={onDrop}
		>
			{props.children}
		</DropZone>
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
}
export default FileDropZone

const DropZone = styled.div`
	border: 3px dashed var(--figma-color-border-disabled-strong, rgba(0, 0, 0, 0.3));
	padding: 2em;
	background-color: var(--figma-color-bg-secondary, #f5f5f5);

	* {
		pointer-events: none;
	}

	&.drag-over {
		border: 3px solid var(--figma-color-border-selected, #0d99ff);
		background-color: var(--figma-color-bg-selected, #e5f4ff);
	}
`
