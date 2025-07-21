import React from "react"
import styled from "styled-components"

interface TextboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
	hasError?: boolean
	"aria-label"?: string
	"aria-labelledby"?: string
	"aria-describedby"?: string
	"aria-invalid"?: boolean
	"aria-errormessage"?: string
}

const StyledTextbox = styled.input<{ hasError?: boolean }>`
	padding: 7px;
	min-height: 32px; // Better touch target

	background-color: var(--figma-color-bg, white);
	border: 1px solid ${props => 
		props.hasError 
			? "var(--figma-color-border-danger, #ff4444)" 
			: "var(--figma-color-border, #e6e6e6)"
	};
	border-radius: 2px;

	color: var(--figma-color-text, #333333);
	fill: var(--figma-color-icon, #333333);
	font: inherit;

	cursor: text;
	user-select: initial;

	&:focus-visible {
		border-color: ${props => 
			props.hasError 
				? "var(--figma-color-border-danger, #ff4444)" 
				: "var(--figma-color-border-selected, #0d99ff)"
		};
		outline: 1px solid ${props => 
			props.hasError 
				? "var(--figma-color-border-danger, #ff4444)" 
				: "var(--figma-color-border-selected, #0d99ff)"
		};
		outline-offset: -2px;
	}

	&:focus::selection {
		color: var(--figma-color-text, #333333);
		background-color: var(--figma-color-bg-onselected, #bde3ff);
	}

	&:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	// Better placeholder contrast
	&::placeholder {
		color: var(--figma-color-text-secondary, #666666);
	}
`

export const Textbox = React.forwardRef<HTMLInputElement, TextboxProps>(
	({ hasError, ...props }, ref) => {
		return (
			<StyledTextbox
				ref={ref}
				hasError={hasError}
				aria-invalid={hasError || props["aria-invalid"]}
				{...props}
			/>
		)
	}
)

Textbox.displayName = "Textbox"

export default Textbox
