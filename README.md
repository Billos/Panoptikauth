# authentik-gotify-bridge

A bridge between Authentik and Gotify for notifications. This service receives webhook notifications from Authentik and forwards them to a Gotify server.

## Prerequisites

- Node.js (v14 or higher)
- yarn
- A running Gotify server
- An Authentik instance configured to send webhook notifications

Or, if using Docker:

- Docker
- docker-compose (optional)

## Installation

### Local Installation

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
  "event_user_username": "event user's username",
  "client_ip": "IP address of the connection (optional)",
  "context": {
    "geo": {
      "city": "City name (optional)",
      "country": "Country name (optional)",
      "lat": 37.7749,
      "long": -122.4194
    }
  }
}
```

**Content-Type**: `text/json`

**Note**: The `client_ip` and `context.geo` fields are optional and will be included in the notification message if provided by Authentik. These fields can be configured in Authentik's webhook property mappings to include IP address and geolocation information for connection events.

### Authentik Configuration

In your Authentik instance:

1. Go to **Events** → **Transports**
2. Create a new **Webhook** transport
3. Set the webhook URL to: `http://your-bridge-server:3000/webhook`
4. Set the Content-Type to `text/json`
5. (Optional) Configure property mappings to include IP and location data:
   - Add `client_ip` field: `return request.context['notification'].event.client_ip`
   - Add geolocation data in `context.geo` using fields like `city`, `country`, `lat`, `long`
   - Refer to [Authentik's event actions documentation](https://docs.goauthentik.io/sys-mgmt/events/event-actions/) for detailed configuration
6. Create notification rules that use this transport

#### IP and Location Information

The bridge now supports displaying IP address and geolocation information in notifications. When Authentik is configured to send `client_ip` and `context.geo` data in the webhook payload, this information will be included in the Gotify message:

- **IP Address**: Shows the connection's IP address
- **Location**: Displays city and country
- **Coordinates**: Shows latitude and longitude (if available)

This is particularly useful for monitoring login events and failed login attempts from different locations.

### Severity Mapping

The bridge maps Authentik severity levels to Gotify priorities:

- `low` → Priority 2
- `normal`/`medium` → Priority 5
- `high` → Priority 8
- `critical` → Priority 10

### Health Check

A health check endpoint is available at `/health` for monitoring purposes.

````bash
curl http://localhost:3000/health
### Docker Production

Using docker-compose:

```bash
docker-compose up -d
````

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

Send a test notification with IP and location information:

```bash
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: text/json" \
  -d '{
    "body": "login: {\"auth_method\": \"password\", \"auth_method_args\": {\"known_device\": false}}",
    "severity": "info",
    "event_user_email": "user@example.com",
    "event_user_username": "testuser",
    "client_ip": "203.0.113.42",
    "context": {
      "geo": {
        "city": "San Francisco",
        "country": "United States",
        "lat": 37.7749,
        "long": -122.4194
      }
    }
  }'
```

## Project Structure

```
├── src/                    # TypeScript source files
│   ├── index.ts           # Application entry point
│   ├── types.ts           # Type definitions
│   ├── parsers.ts         # Event parsing logic
│   ├── formatters.ts      # Message formatting logic
│   └── gotify.ts          # Gotify API client
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

## TODO

Update version in package.json when releasing
