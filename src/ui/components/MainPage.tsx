import React from "react"
import styled from "styled-components"
import { type JsonFile, type OperationResult, PluginContext } from "shared/collab"
import { Disclosure } from "./Disclosure"
import { FileDropZone } from "./FileDropZone"
import { Import } from "./Icons"
import { Content } from "./PluginLayout"

export function MainPage() {
	const Plugin = React.useContext(PluginContext)
	const [results, setResults] = React.useState<OperationResult[]>([])

	return (
		<>
			<Content>
				<h2>Import token JSON files</h2>
				<p>Hello! I am here to help you turn token JSON into Figma variables.</p>
				<p>Drag some files into the box below:</p>
				<ul>
					<li>
						JSON files in the{" "}
						<a href="https://design-tokens.github.io/community-group/format/" target="_blank" rel="noopener noreferrer">
							Design Tokens Community Group format
						</a>
					</li>
					<li>Optionally, one manifest JSON file</li>
				</ul>
				<Disclosure label="More about manifest files">
					<p>The manifest files I support are a thing I just made up. They should look like this:</p>
					<NarrowTabsPre>
						<code>{`{
	"name": "Web tokens",
	"collections": {
		"Global": {
			"modes": {
				"Default": [ "global.json" ]
			}
		},
		"Alias": {
			"modes": {
				"Light": [ "light.json" ],
				"Dark": [ "dark.json" ]
			}
		}
	}
}`}</code>
					</NarrowTabsPre>
				</Disclosure>
				<p>The files never leave your computer.</p>
			</Content>
			<Content>
				<FileDropZone 
					accept="application/json" 
					onFileChosen={onFileChosen}
					aria-label="Drop JSON files here to import tokens"
					aria-describedby="drop-zone-help"
				>
					<Horizontal>
						<Import aria-hidden="true" />
						<div id="drop-zone-help">Drop files here or click to browse</div>
					</Horizontal>
				</FileDropZone>
			</Content>
			<Content>
				{results.length > 0 && <h2 id="results-heading">Results</h2>}
				<ResultsList role="list" aria-labelledby={results.length > 0 ? "results-heading" : undefined}>
					{results.map((result, i) => (
						<Result key={i} role="listitem">
							<ResultIcon aria-hidden="true">{result.result === "error" ? "❌" : "✓"}</ResultIcon>
							<ResultText>
								{result.result === "error" && <ScreenReaderOnly>Error: </ScreenReaderOnly>}
								{result.result === "success" && <ScreenReaderOnly>Success: </ScreenReaderOnly>}
								{result.text}
							</ResultText>
						</Result>
					))}
				</ResultsList>
			</Content>
		</>
	)

	async function onFileChosen(files: FileList) {
		const fileList: JsonFile[] = []
		const newResults: OperationResult[] = []

		try {
			setResults([{ result: "info", text: "Processing files..." }])
			
			// Announce to screen readers
			const announcement = document.createElement("div")
			announcement.setAttribute("role", "status")
			announcement.setAttribute("aria-live", "polite")
			announcement.className = "sr-only"
			announcement.textContent = "Processing files, please wait."
			document.body.appendChild(announcement)
			setTimeout(() => document.body.removeChild(announcement), 1000)

			for (const file of files) {
				try {
					const fileContents = await file.text()
					fileList.push({ name: file.name, text: fileContents })
				} catch (ex) {
					newResults.push({ result: "error", text: `Failed to read the contents of ${file.name}.` })
				}
			}

			if (fileList.length) newResults.push(...(await Plugin.importFiles(fileList)))

			setResults(newResults)
		} catch (ex) {
			console.error(ex)
			newResults.push({
				result: "error",
				text: `Failed to import the token files: ${
					(ex && ((typeof ex === "object" && "message" in ex && ex.message) || (typeof ex === "string" && ex))) ||
					"no further details available"
				}`,
			})
			setResults(newResults)
		}
	}
}
export default MainPage

const Horizontal = styled.div`
	display: flex;
	gap: 1em;
	align-items: center;
	justify-content: center;
`

const NarrowTabsPre = styled.pre`
	tab-size: 2;
	cursor: text;
	user-select: text;
`

const ResultsList = styled.ul`
	padding: 0;
	user-select: text;
`

const Result = styled.li`
	margin: 0.5em 0;
	display: grid;
	grid-template-columns: 2em 1fr;
`

const ResultIcon = styled.div`
	user-select: none;
`

const ResultText = styled.div``

const ScreenReaderOnly = styled.span`
	position: absolute;
	width: 1px;
	height: 1px;
	padding: 0;
	margin: -1px;
	overflow: hidden;
	clip: rect(0, 0, 0, 0);
	white-space: nowrap;
	border: 0;
`
