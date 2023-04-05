import styled from "styled-components"

export const Textbox = styled.input`
	padding: 7px;

	background-color: var(--figma-color-bg, white);
	border: 1px solid var(--figma-color-border, #e6e6e6);
	border-radius: 2px;

	color: var(--figma-color-text, #333333);
	fill: var(--figma-color-icon, #333333);
	font: inherit;

	cursor: default;
	user-select: initial;

	&:focus-visible {
		border-color: var(--figma-color-border-selected, #0d99ff);
		outline: 1px solid var(--figma-color-border-selected, #0d99ff);
		outline-offset: -2px;
	}

	&:focus::selection {
		color: var(--figma-color-text, #333333);
		background-color: var(--figma-color-bg-onselected, #bde3ff);
	}
`
export default Textbox
