import React from "react"
import type Preact from "preact"
import styled from "styled-components"

export interface PluginLayoutProps {
	header?: Preact.ComponentChildren
	children: Preact.ComponentChildren
	footer?: Preact.ComponentChildren
}

export function PluginLayout(props: PluginLayoutProps) {
	return (
		<Root>
			<Header>{props.header}</Header>
			<Body>{props.children}</Body>
			<Footer>{props.footer}</Footer>
		</Root>
	)
}
export default PluginLayout

const Root = styled.div`
	height: 100%;
	display: grid;
	grid-template-rows: auto 1fr auto;
`

const Body = styled.section`
	display: flex;
	flex-direction: column;
	overflow: hidden auto;
`

const Header = styled.header`
	grid-row: 1;
`

const Footer = styled.footer`
	grid-row: -1;

	border-top: 1px solid var(--figma-color-border, #e5e5e5);
`

export interface ContentProps {
	/** The content children to render. */
	children: Preact.ComponentChildren
	/** Horizontally center the content. */
	center?: boolean
	/** Align the content to the right. */
	right?: boolean
	/** Align the content to the bottom. (This should be the last content item in the container.) */
	bottom?: boolean
}

export function Content(props: ContentProps) {
	return (
		<>
			{props.bottom && <Spacer />}
			<StyledContent {...props} />
		</>
	)
}

const StyledContent = styled.div<ContentProps>`
	padding: 16px;
	${props => (props.center ? "text-align: center;" : "")}
	${props => (props.right ? "text-align: right;" : "")}
	${props => (props.bottom ? "justify-self: flex-end;" : "")}
`

const Spacer = styled.div`
	flex: 1;
`
