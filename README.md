# Butler

A desktop app for building and running AI agent workflows. Configure agents, chain them into multi-step workflows, and chat with them — all from a native UI powered by Electron.

## Features

- **Agents** — define agents with a model, system instructions, and API endpoint
- **Workflows** — chain agents into sequential pipelines; each agent's output feeds the next
- **Chat** — interactive sessions with any configured agent, with streaming responses
- **UI generation** — agents can render custom UI components via an embedded MCP server
- **MCP integration** — built-in Model Context Protocol server at `localhost:3005/mcp`

## Tech stack

| Layer | Stack |
| --- | --- |
| Desktop shell | Electron |
| Renderer | React 19, React Router, styled-components |
| AI / streaming | Vercel AI SDK (`ai`), `@ai-sdk/openai-compatible` |
| Agent protocol | `@modelcontextprotocol/sdk`, `@mcp-ui/server` |
| State | `electron-store` (persisted), IPC bridge |

## Getting started

```bash
npm install
npm run dev
```

This starts the Vite dev server (`localhost:5173`) and Electron concurrently.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start renderer + main process in development |
| `npm run dev:renderer` | Start Vite dev server only |
| `npm run dev:main` | Start Electron only (waits for renderer) |
| `npm run build` | Production build + package with electron-builder |
| `npm run build:renderer` | Build renderer only |
| `npm run bundle:mcp-app` | Bundle the MCP UI app |

## Project structure

```text
src/
├── main/                  # Electron main process
│   ├── index.js           # App entry, IPC handlers, workflow runner
│   ├── server.js          # MCP HTTP server (port 3005)
│   ├── mcp/               # MCP server and UI tool definitions
│   ├── orchestration/     # Workflow execution engine
│   └── store/             # Persisted app state
├── preload/               # Electron preload bridge
└── renderer/              # React frontend
    └── src/
        ├── pages/         # Workflows, Agents, Settings
        ├── components/    # App-specific components
        ├── ui/            # Design-system primitives
        └── store/         # Renderer-side state
```

## Agent configuration

Agents are stored in `electron-store` and require:

- **Name** — identifier used in workflows and sessions
- **Model** — model ID passed to the provider
- **API URL** — OpenAI-compatible base URL (e.g. LM Studio at `http://127.0.0.1:1234/v1`)
- **API Key** — bearer token for the provider
- **Instructions** — system prompt

## Workflows

A workflow is a directed graph of agent nodes. At runtime Butler resolves the graph into a linear chain, runs each agent in sequence, and pipes the output of one agent as the input to the next. Workflow progress and output stream back to the UI in real time.
