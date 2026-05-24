# Proxity AI

A terminal-style AI chatbot that performs real-time web searches using Tavily and synthesizes answers via the OpenAI Agents SDK. Features a retro CRT aesthetic with scanlines, glow effects, and a full chat history system.

## Demo

https://github.com/user-attachments/assets/cd4954bf-c99c-4bbb-b6e7-2761dd6eb39c

## Features

- **Live Web Search**: Queries the Tavily global web index for up-to-date information.
- **AI Agent Responses**: Answers synthesized by an OpenAI Agents SDK agent using retrieved web context.
- **Terminal / CRT UI**: Retro terminal aesthetic with scanlines, flicker, and glow effects — all toggleable.
- **Chat History**: Persistent session storage with query history saved in localStorage.
- **Boot Overlay**: Animated boot sequence on startup.
- **Sidebar Controls**: Toggle CRT/glow modes, view query history, and purge stored sessions.
- **Responsive Design**: Works across desktop and mobile.

## Tech Stack

### Frontend
- **Framework**: React 19, TypeScript
- **Build Tool**: Vite
- **Styling**: Vanilla CSS (custom CRT/terminal theme)
- **State**: React hooks + localStorage

### Backend
- **Runtime**: Bun / Node.js
- **Server**: Express 5
- **AI**: OpenAI Agents SDK (`@openai/agents`)
- **Web Search**: Tavily (`@tavily/core`)

## Getting Started

### Prerequisites

- **Node.js** (v18 or higher) or **Bun**
- **npm**, **yarn**, **pnpm**, or **bun**
- An **OpenAI API key**
- A **Tavily API key**

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ayushx35/Proxity-AI
cd Proxity-AI
```

2. Set up the **backend**:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:
```env
OPENAI_API_KEY=your_openai_api_key
TAVILLI_API_KEY=your_tavily_api_key
```

3. Set up the **frontend**:
```bash
cd "../frontend 2"
npm install
```

### Running Locally

Start the **backend** (runs on port 3000):
```bash
cd backend
bun run index.ts
```

Start the **frontend** dev server (runs on port 5173):
```bash
cd "frontend 2"
npm run dev
```

Open your browser and navigate to `http://localhost:5173`.

### Build

To create a production build of the frontend:
```bash
cd "frontend 2"
npm run build
```

## Project Structure

```
Proxity-AI/
├── backend/
│   ├── index.ts          # Express server + Tavily search + OpenAI Agent
│   ├── prompt.ts         # System prompt for the AI agent
│   ├── package.json
│   └── tsconfig.json
└── frontend 2/
    ├── src/
    │   ├── components/
    │   │   ├── BootOverlay.tsx   # Animated boot screen
    │   │   ├── Sidebar.tsx       # Controls, history, settings
    │   │   └── MessageItem.tsx   # Chat message renderer
    │   ├── App.tsx               # Main app logic & chat orchestration
    │   ├── App.css               # Terminal/CRT styles
    │   ├── index.css             # Global styles
    │   └── main.tsx              # Application entry point
    ├── index.html
    └── vite.config.ts
```

## Contributing

Contributions are welcome! Please feel free to open a Pull Request or create an issue.

## License

This project is licensed under the terms of the MIT license.
