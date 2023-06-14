import React from "react"
import styled from "styled-components"
import { Content } from "./PluginLayout"

export function Footer() {
	return (
		<Content bottom center>
			<div>This is not a supported product. Hopefully it helps though.</div>
			<div>
				© 2023 Microsoft
				{" • "}
				<StyledLink href="mailto:travis@microsoft.com?subject=Variables Import feedback" target="_blank">
					Feedback
				</StyledLink>
				{" • "}
				<StyledLink href="https://go.microsoft.com/fwlink/?linkid=521839" target="_blank">
					Privacy
				</StyledLink>
				{" • "}
				<StyledLink href="https://go.microsoft.com/fwlink/?linkid=206977" target="_blank">
					Terms of use
				</StyledLink>
			</div>
		</Content>
	)
}
export default Footer

const StyledLink = styled.a`
	color: var(--figma-color-text-brand, #007be5);
	text-decoration: none;
`
