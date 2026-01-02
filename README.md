# authentik-gotify-bridge

A bridge between Authentik and Gotify for notifications.

## Prerequisites

- Node.js (v14 or higher)
- yarn

Or, if using Docker:

- Docker
- docker-compose (optional)

## Installation

### Local Installation

```bash
yarn install
```

### Docker

Pull the production image:

```bash
docker pull docker.io/billos/authentik-gotify-bridge:0.0.1
```

Or build locally:

```bash
docker build -t billos/authentik-gotify-bridge:0.0.1 .
```

## Development

### Local Development

Run the application in development mode with automatic restart on file changes:

```bash
yarn dev
```

This will start the application with tsx in watch mode, automatically restarting when changes are detected in the `src` directory.

### Docker Development

Run the development environment with docker-compose:

```bash
docker-compose -f docker-compose.dev.yml up
```

This will:
- Build the development Docker image
- Mount your source code as a volume for hot-reloading
- Run the application with tsx in watch mode

## Building

Build the TypeScript project to JavaScript:

```bash
yarn build
```

The compiled JavaScript files will be placed in the `dist` directory.

## Production

### Local Production

Run the built application:

```bash
yarn start
```

### Docker Production

Using docker-compose:

```bash
docker-compose up -d
```

Or run the Docker container directly:

```bash
docker run -d \
  --name authentik-gotify-bridge \
  -e NODE_ENV=production \
  docker.io/billos/authentik-gotify-bridge:0.0.1
```

## Scripts

- `yarn dev` - Run in development mode with watch mode
- `yarn build` - Compile TypeScript to JavaScript
- `yarn start` - Run the compiled application
- `yarn clean` - Remove the dist directory

## Project Structure

```
├── src/                    # TypeScript source files
│   └── index.ts           # Application entry point
├── dist/                  # Compiled JavaScript files (generated)
├── Dockerfile             # Production Docker image
├── Dockerfile.dev         # Development Docker image
├── docker-compose.yml     # Production docker-compose configuration
├── docker-compose.dev.yml # Development docker-compose configuration
├── .dockerignore          # Docker ignore file
├── tsconfig.json          # TypeScript configuration
└── package.json           # Project dependencies and scripts
```

## Environment Variables

You can configure the application using environment variables. Add them to your docker-compose.yml file or pass them when running Docker:

```yaml
environment:
  - NODE_ENV=production
  # - AUTHENTIK_URL=https://authentik.example.com
  # - GOTIFY_URL=https://gotify.example.com
  # - GOTIFY_TOKEN=your-token-here
```