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
				<StyledLink 
					href="mailto:travis@microsoft.com?subject=Variables Import feedback" 
					aria-label="Send feedback via email"
				>
					Feedback
				</StyledLink>
				{" • "}
				<StyledLink 
					href="https://github.com/microsoft/figma-variables-import" 
					target="_blank"
					rel="noopener noreferrer"
					aria-label="View source code on GitHub (opens in new tab)"
				>
					GitHub
				</StyledLink>
				{" • "}
				<StyledLink 
					href="https://go.microsoft.com/fwlink/?linkid=521839" 
					target="_blank"
					rel="noopener noreferrer"
					aria-label="Microsoft Privacy Statement (opens in new tab)"
				>
					Privacy
				</StyledLink>
				{" • "}
				<StyledLink 
					href="https://go.microsoft.com/fwlink/?linkid=206977" 
					target="_blank"
					rel="noopener noreferrer"
					aria-label="Microsoft Terms of Use (opens in new tab)"
				>
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
