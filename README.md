# authentik-gotify-bridge

A bridge between Authentik and Gotify for notifications. This service receives webhook notifications from Authentik and forwards them to a Gotify server.

## Prerequisites

- Node.js (v14 or higher)
- yarn
- A running Gotify server
- An Authentik instance configured to send webhook notifications

## Installation

```bash
yarn install
```

## Configuration

Create a `.env` file in the root directory with the following variables:

```bash
# Server configuration
PORT=3000

# Gotify configuration
GOTIFY_URL=https://your-gotify-server.com
GOTIFY_TOKEN=your-gotify-app-token
```

You can use `.env.example` as a template.

## Development

Run the application in development mode with automatic restart on file changes:

```bash
yarn dev
```

This will start the application with tsx in watch mode, automatically restarting when changes are detected in the `src` directory.

## Building

Build the TypeScript project to JavaScript:

```bash
yarn build
```

The compiled JavaScript files will be placed in the `dist` directory.

## Production

Run the built application:

```bash
yarn start
```

## Usage

### Webhook Endpoint

The bridge exposes a POST endpoint at `/webhook` that accepts Authentik notifications with the following JSON payload:

```json
{
  "body": "body of the notification message",
  "severity": "severity level as configured in the trigger",
  "user_email": "notification user's email",
  "user_username": "notification user's username",
  "event_user_email": "event user's email",
  "event_user_username": "event user's username"
}
```

**Content-Type**: `text/json`

### Authentik Configuration

In your Authentik instance:

1. Go to **Events** → **Transports**
2. Create a new **Webhook** transport
3. Set the webhook URL to: `http://your-bridge-server:3000/webhook`
4. Set the Content-Type to `text/json`
5. Create notification rules that use this transport

### Severity Mapping

The bridge maps Authentik severity levels to Gotify priorities:

- `low` → Priority 2
- `normal`/`medium` → Priority 5
- `high` → Priority 8
- `critical` → Priority 10

### Health Check

A health check endpoint is available at `/health` for monitoring purposes.

```bash
curl http://localhost:3000/health
```

## Scripts

- `yarn dev` - Run in development mode with watch mode
- `yarn build` - Compile TypeScript to JavaScript
- `yarn start` - Run the compiled application
- `yarn clean` - Remove the dist directory

## Project Structure

```
├── src/           # TypeScript source files
│   └── index.ts   # Application entry point
├── dist/          # Compiled JavaScript files (generated)
├── .env.example   # Example environment configuration
├── tsconfig.json  # TypeScript configuration
└── package.json   # Project dependencies and scripts
```

## Example

Send a test notification:

```bash
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: text/json" \
  -d '{
    "body": "User login failed",
    "severity": "high",
    "user_email": "user@example.com",
    "user_username": "johndoe",
    "event_user_email": "admin@example.com",
    "event_user_username": "admin"
  }'
```