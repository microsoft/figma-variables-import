const webpack = require("webpack")
const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")

module.exports = (env, argv) => ({
	mode: argv.mode === "production" ? "production" : "development",

	entry: {
		controller: "./src/controller/index.ts",
		ui: "./src/ui/index.tsx",
	},

	output: {
		filename: "[name].js",
		path: path.resolve(__dirname, "build"),
		pathinfo: false,
		clean: true,
	},

	devtool: argv.mode === "production" ? false : "inline-source-map",

	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: [
					{
						loader: "ts-loader",
						options: {
							happyPackMode: true,
						},
					},
				],
				exclude: /node_modules/,
			},
			{
				test: /\.(css|scss)$/,
				use: ["style-loader", "css-loader", "sass-loader"],
				exclude: /node_modules/,
			},
			{
				test: /\.svg$/i,
				issuer: /\.[jt]sx?$/,
				use: ["@svgr/webpack"],
			},
			{
				test: /\.(ttf|woff2|jpe?g|png|gif|avif|av1|webp)$/,
				type: "asset/inline",
				exclude: /node_modules/,
			},
		],
	},

	plugins: [
		new webpack.NoEmitOnErrorsPlugin(),

		new HtmlWebpackPlugin({
			inject: false, // Don't inject a <script> tag because index.html already includes one
			cache: false,
			template: "./src/ui/index.html",
			filename: "ui.html",
			chunks: ["ui"],
		}),
	],

	resolve: {
		extensions: [".tsx", ".ts", ".jsx", ".js"],
		modules: ["src", "node_modules"],

		alias: {
			react: "preact/compat",
			"react-dom/test-utils": "preact/test-utils",
			"react-dom": "preact/compat", // Must be below test-utils
			"react/jsx-runtime": "preact/jsx-runtime",
		},
	},

	experiments: {
		topLevelAwait: true,
	},

	performance: { hints: false },
})
