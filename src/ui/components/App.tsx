import React from "react"
import styled from "styled-components"
import * as PromisingArtist from "@travisspomer/promising-artist"
import { PluginContext } from "shared/collab"
import type { PluginMethods, UIMethods } from "shared/collab"
import { Footer } from "./Footer"
import { PluginLayout } from "./PluginLayout"
import { MainPage } from "./MainPage"

export function App() {
	const Plugin = PromisingArtist.useCollab<UIMethods, PluginMethods>({}, PromisingArtist.FigmaPluginUI)

	return (
		<PluginContext.Provider value={Plugin}>
			<Container>
				<PluginLayout footer={<Footer />}>
					<MainPage />
				</PluginLayout>
			</Container>
		</PluginContext.Provider>
	)
}
export default App

const Container = styled.div`
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
`
