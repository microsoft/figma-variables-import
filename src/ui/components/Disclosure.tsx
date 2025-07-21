import React from "react"
import type Preact from "preact"
import styled from "styled-components"

export interface DisclosureProps {
	label: Preact.ComponentChildren
	children: Preact.ComponentChildren
	open?: boolean
	id?: string
	"aria-labelledby"?: string
}

export function Disclosure(props: DisclosureProps) {
	const summaryId = React.useId()
	const contentId = React.useId()
	
	return (
		<StyledDetails open={props.open} id={props.id}>
			<StyledSummary id={summaryId} aria-expanded={props.open}>
				{props.label}
			</StyledSummary>
			<DisclosureContent 
				id={contentId} 
				aria-labelledby={props["aria-labelledby"] || summaryId}
			>
				{props.children}
			</DisclosureContent>
		</StyledDetails>
	)
}
export default Disclosure

const StyledDetails = styled.details`
	// Remove default styling for better control
	&::-webkit-details-marker {
		display: none;
	}
`

const StyledSummary = styled.summary`
		margin: 0 -16px 0 -1em;
		padding: 8px 0;

		color: var(--figma-color-text-brand, #007be5);
		text-decoration: none;

		cursor: pointer;

		& > * {
			display: inline;
		}

		&::before {
			color: transparent;
			transition: color 200ms ease, transform 200ms ease;
		}

		&:hover,
		&:focus-visible {
			text-decoration: underline;

			&::before {
				color: var(--figma-color-icon-secondary, #666666);
			}
		}
	}

	// Add custom marker
	&::before {
		content: "▶";
		display: inline-block;
		margin-right: 8px;
		color: transparent;
		transition: color 200ms ease, transform 200ms ease;
	}
	
	&::-webkit-details-marker {
		display: none;
	}
	
	&[aria-expanded="true"]::before {
		transform: rotate(90deg);
		color: var(--figma-color-icon-secondary, #666666);
	}
`

const DisclosureContent = styled.div`
	padding-top: 8px;
`
