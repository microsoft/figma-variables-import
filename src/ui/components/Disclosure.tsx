import React from "react"
import type Preact from "preact"
import styled from "styled-components"

export interface DisclosureProps {
	label: Preact.ComponentChildren
	children: Preact.ComponentChildren
	open?: boolean
}

export function Disclosure(props: DisclosureProps) {
	return (
		<StyledDetails open={props.open}>
			<summary>{props.label}</summary>
			{props.children}
		</StyledDetails>
	)
}
export default Disclosure

const StyledDetails = styled.details`
	summary {
		margin: 0 -16px 0 -1em;
		padding: 8px 0;

		color: var(--figma-color-text-brand, #007be5);
		text-decoration: none;

		cursor: pointer;

		& > * {
			display: inline;
		}

		&::marker {
			color: transparent;
			transition: color 200ms ease;
		}

		&:hover,
		&:focus-visible {
			text-decoration: underline;

			&::marker {
				color: var(--figma-color-icon-disabled, rgba(0, 0, 0, 0.3));
			}
		}
	}

	&[open] {
		summary::marker {
			color: var(--figma-color-icon-disabled, rgba(0, 0, 0, 0.3));
		}
	}
`
