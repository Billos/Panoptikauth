/**
 * Authentik-Gotify Bridge
 * Entry point for the application
 */

import express, { Request, Response } from 'express';
import FormData from 'form-data';
import https from 'https';
import http from 'http';

const app = express();

// Configuration from environment variables
const PORT = process.env.PORT || 3000;
const GOTIFY_URL = process.env.GOTIFY_URL || 'https://push.example.de';
const GOTIFY_TOKEN = process.env.GOTIFY_TOKEN || '';

// Interface for Authentik notification payload
interface AuthentikNotification {
  body: string;
  severity: string;
  user_email: string;
  user_username: string;
  event_user_email: string;
  event_user_username: string;
}

// Middleware to parse text/json content type
app.use(express.text({ type: 'text/json' }));

// POST endpoint to receive Authentik notifications
app.post('/webhook', async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Received notification from Authentik');
    console.log('Content-Type:', req.get('content-type'));
    
    // Parse the JSON from text body
    let notification: AuthentikNotification;
    try {
      notification = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch (parseError) {
      console.error('Failed to parse notification:', parseError);
      res.status(400).json({ error: 'Invalid JSON payload' });
      return;
    }

    console.log('Parsed notification:', notification);

    // Validate required fields
    if (!notification.body) {
      res.status(400).json({ error: 'Missing required field: body' });
      return;
    }

    // Check if Gotify URL and token are configured
    if (!GOTIFY_TOKEN) {
      console.error('GOTIFY_TOKEN environment variable not set');
      res.status(500).json({ error: 'Gotify token not configured' });
      return;
    }

    // Prepare message for Gotify
    const title = `Notification from ${notification.event_user_username || 'System'}`;
    const message = `${notification.body}\n\n` +
      `User: ${notification.user_username} (${notification.user_email})\n` +
      `Event User: ${notification.event_user_username} (${notification.event_user_email})`;
    
    // Map severity to priority (1-10, where 10 is highest)
    const priorityMap: { [key: string]: number } = {
      'low': 2,
      'normal': 5,
      'medium': 5,
      'high': 8,
      'critical': 10
    };
    const priority = priorityMap[notification.severity?.toLowerCase()] || 5;

    // Send to Gotify
    await sendToGotify(title, message, priority);

    console.log('Notification forwarded to Gotify successfully');
    res.status(200).json({ success: true, message: 'Notification forwarded to Gotify' });
  } catch (error) {
    console.error('Error processing notification:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', service: 'authentik-gotify-bridge' });
});

/**
 * Send notification to Gotify using multipart/form-data
 */
function sendToGotify(title: string, message: string, priority: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append('title', title);
    form.append('message', message);
    form.append('priority', priority.toString());

    const url = new URL(`${GOTIFY_URL}/message`);
    url.searchParams.set('token', GOTIFY_TOKEN);

    const protocol = url.protocol === 'https:' ? https : http;
    
    const options = {
      method: 'POST',
      headers: form.getHeaders()
    };

    console.log(`Sending to Gotify: ${url.origin}/message`);
    
    const request = protocol.request(url.toString(), options, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        if (response.statusCode && response.statusCode >= 200 && response.statusCode < 300) {
          console.log('Gotify response:', data);
          resolve();
        } else {
          console.error(`Gotify error (${response.statusCode}):`, data);
          reject(new Error(`Gotify returned status ${response.statusCode}`));
        }
      });
    });

    request.on('error', (error) => {
      console.error('Error sending to Gotify:', error);
      reject(error);
    });

    form.pipe(request);
  });
}

function main(): void {
  console.log('Authentik-Gotify Bridge starting...');
  console.log('Environment:', process.env.NODE_ENV || 'development');
  console.log('Gotify URL:', GOTIFY_URL);
  console.log('Gotify Token configured:', GOTIFY_TOKEN ? 'Yes' : 'No');

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    console.log(`Webhook endpoint: http://localhost:${PORT}/webhook`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });
}

main();
