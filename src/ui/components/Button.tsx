import styled, { css } from "styled-components"

export const ButtonBaseStyles = css`
	height: 32px;
	line-height: 30px;
	max-width: 200px;
	padding: 0 11px;

	background-color: transparent;
	border-radius: 6px;
	border: 1px solid var(--figma-color-border-strong, #2c2c2c);

	color: var(--figma-color-text, rgba(0, 0, 0, 0.9));
	font: inherit;
	text-align: center;

	cursor: default;
	user-select: none;
`

export const OutlineButton = styled.button`
	${ButtonBaseStyles}

	&:focus-visible {
		border-color: var(--figma-color-border-brand-strong, #0d99ff);
		outline: 1px solid var(--figma-color-border-brand-strong, #0d99ff);
		outline-offset: -2px;
	}
`

export const AccentButton = styled.button`
	${ButtonBaseStyles}

	background-color: var(--figma-color-bg-brand, #0d99ff);
	border-color: transparent;

	color: var(--figma-color-text-onbrand, white);
	font-weight: 500;

	&:focus-visible {
		outline: 1px solid var(--figma-color-border-onbrand-strong, white);
		outline-offset: -3px;
	}
`
export default AccentButton
