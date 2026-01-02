# authentik-gotify-bridge

A simple bridge service that receives webhook notifications from [authentik](https://goauthentik.io/) and forwards them to a [Gotify](https://gotify.net/) server.

## Features

- Receives POST webhooks from authentik
- Parses authentik notification payloads
- Forwards notifications to Gotify with appropriate priority mapping
- Configurable via environment variables
- Health check endpoint

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Billos/authentik-gotify-bridge.git
cd authentik-gotify-bridge
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and set your Gotify server URL and token:
```env
GOTIFY_URL=http://your-gotify-server:port
GOTIFY_TOKEN=your-gotify-app-token
PORT=3000
```

## Usage

Start the server:
```bash
npm start
```

The service will listen on the configured port (default: 3000).

## Endpoints

### POST /webhook

Receives webhook notifications from authentik.

**Expected payload:**
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

**Content-Type:** `text/json` or `application/json`

**Response:**
- `200`: Successfully forwarded to Gotify
- `400`: Bad request (missing required fields)
- `500`: Server configuration error
- `502`: Gotify API error

### GET /health

Health check endpoint.

**Response:**
```json
{
    "status": "ok",
    "service": "authentik-gotify-bridge"
}
```

## Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `GOTIFY_URL` | Your Gotify server URL (e.g., `http://gotify:80`) | Yes | - |
| `GOTIFY_TOKEN` | Your Gotify application token | Yes | - |
| `PORT` | Port for the bridge service to listen on | No | 3000 |

### Severity to Priority Mapping

The bridge maps authentik severity levels to Gotify priorities (0-10):

- `critical`, `emergency` → Priority 10 (highest)
- `alert`, `high` → Priority 8
- `warning`, `medium` → Priority 5 (default)
- `notice`, `low` → Priority 3
- `info` → Priority 2

## Authentik Configuration

1. In authentik, go to **System** → **Transports**
2. Create a new **Webhook** transport
3. Set the webhook URL to: `http://your-bridge-server:3000/webhook`
4. Configure the webhook to use POST method
5. The Content-Type will automatically be set to `text/json`

Then create or configure a notification rule to use this transport.

## Docker (Optional)

You can also run this service in Docker. Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t authentik-gotify-bridge .
docker run -d \
  -p 3000:3000 \
  -e GOTIFY_URL=http://your-gotify-server:port \
  -e GOTIFY_TOKEN=your-token \
  --name authentik-gotify-bridge \
  authentik-gotify-bridge
```

## License

See [LICENSE](LICENSE) file.