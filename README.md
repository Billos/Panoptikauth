# authentik-gotify-bridge

A bridge between Authentik and Gotify for notifications.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

```bash
npm install
```

## Development

Run the application in development mode with automatic restart on file changes:

```bash
npm run dev
```

This will start the application with tsx in watch mode, automatically restarting when changes are detected in the `src` directory.

## Building

Build the TypeScript project to JavaScript:

```bash
npm run build
```

The compiled JavaScript files will be placed in the `dist` directory.

## Production

Run the built application:

```bash
npm run start
```

## Scripts

- `npm run dev` - Run in development mode with watch mode
- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Run the compiled application
- `npm run clean` - Remove the dist directory

## Project Structure

```
├── src/           # TypeScript source files
│   └── index.ts   # Application entry point
├── dist/          # Compiled JavaScript files (generated)
├── tsconfig.json  # TypeScript configuration
└── package.json   # Project dependencies and scripts
```