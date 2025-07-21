import styled, { css } from "styled-components"

export const ButtonBaseStyles = css`
	// WCAG 2.2 AA requires minimum 44px touch target
	min-height: 44px;
	height: 44px;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	max-width: 200px;
	padding: 0 11px;

	background-color: transparent;
	border-radius: 6px;
	border: 1px solid var(--figma-color-border-strong, #2c2c2c);

	color: var(--figma-color-text, #0d0d0d); // Solid color for better contrast
	font: inherit;
	text-align: center;

	cursor: pointer;
	
	&:hover {
		opacity: 0.9;
	}
	
	&:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	user-select: none;
	
	// Smooth transitions for better UX
	transition: opacity 0.2s ease, border-color 0.2s ease;
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
