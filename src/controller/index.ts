import * as PromisingArtist from "@travisspomer/promising-artist"
import type { OperationResult, PluginMethods, UIMethods } from "shared/collab"
import type { JsonTokenDocument, JsonManifest } from "utils/tokens"
import { importTokens } from "./variables"

const _UI = PromisingArtist.collab<PluginMethods, UIMethods>(
	{
		notify(message) {
			figma.notify(message)
		},
		importFiles(files) {
			const results: OperationResult[] = []

			// Parse all of the JSON before we start processing any tokens.
			const parsedFiles: Record<string, JsonTokenDocument> = {}
			let manifest: JsonManifest | undefined
			for (const file of files) {
				try {
					const document = JSON.parse(file.text)
					if ("name" in document && "collections" in document) {
						if (manifest) {
							results.push({ result: "error", text: `More than one manifest file was found—ignoring ${file.name}.` })
						} else {
							results.push({ result: "info", text: `Using token manifest file ${file.name}.` })
							manifest = document
						}
					} else {
						parsedFiles[file.name] = document
					}
				} catch (ex) {
					results.push({ result: "error", text: `Failed to parse JSON: ${file.name}.` })
				}
			}

			results.push(...importTokens(parsedFiles, manifest))

			return results
		},
	},
	PromisingArtist.FigmaPlugin
)

// ------------------------------------------------------------

figma.showUI(__html__, { themeColors: true, width: 420, height: 640 })
