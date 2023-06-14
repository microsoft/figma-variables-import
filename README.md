# Figma Variables Import plugin

This Figma plugin allows you to import design tokens in the [Design Token Community Group](https://design-tokens.github.io/community-group/format/) format as Figma Variables.

This plugin does not contain a spec-compliant parser for the DTCG format and cannot handle every single valid DTCG file—it's just a tool we built for internal use.. Only `color` and `dimension` tokens are supported right now.

## Setup

### Node.js

Install [Node.js](https://nodejs.org/en/download) so you can build this project.

### Install

Then install dependencies.

```bash
npm install
```

### Build

Then you can build.

#### Dev

```bash
npm run build:watch
```

#### Production

```bash
npm run build
```

---

# The legal stuff

© 2023 Microsoft. MIT license.

## Trademarks

This project may contain trademarks or logos for projects, products, or services. Authorized use of Microsoft trademarks or logos is subject to and must follow Microsoft's [Trademark & Brand Guidelines](https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks/usage/general). Use of Microsoft trademarks or logos in modified versions of this project must not cause confusion or imply Microsoft sponsorship. Any use of third-party trademarks or logos are subject to those third-party's policies.
