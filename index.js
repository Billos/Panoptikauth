require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json({ type: ['application/json', 'text/json'] }));

// Gotify configuration from environment variables
const GOTIFY_URL = process.env.GOTIFY_URL;
const GOTIFY_TOKEN = process.env.GOTIFY_TOKEN;

// Validation middleware
function validateConfig(req, res, next) {
  if (!GOTIFY_URL || !GOTIFY_TOKEN) {
    return res.status(500).json({
      error: 'Server configuration error',
      message: 'GOTIFY_URL and GOTIFY_TOKEN must be set in environment variables'
    });
  }
  next();
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'authentik-gotify-bridge' });
});

// Webhook endpoint to receive authentik notifications
app.post('/webhook', validateConfig, async (req, res) => {
  try {
    const {
      body,
      severity,
      user_email,
      user_username,
      event_user_email,
      event_user_username
    } = req.body;

    // Log the received webhook
    console.log('Received webhook from authentik:', {
      body,
      severity,
      user_email,
      user_username,
      event_user_email,
      event_user_username
    });

    // Validate required fields
    if (!body) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Missing required field: body'
      });
    }

    // Build the message for Gotify
    let message = body;
    let title = 'Authentik Notification';

    // Add user context if available
    const userInfo = [];
    if (user_username || user_email) {
      userInfo.push(`User: ${user_username || user_email}`);
    }
    if (event_user_username || event_user_email) {
      userInfo.push(`Event User: ${event_user_username || event_user_email}`);
    }
    
    if (userInfo.length > 0) {
      title = userInfo.join(' | ');
    }

    // Map severity to Gotify priority
    // Gotify priorities: 0-10 (0 = lowest, 10 = highest)
    let priority = 5; // default medium priority
    if (severity) {
      const severityLower = severity.toLowerCase();
      if (severityLower.includes('critical') || severityLower.includes('emergency')) {
        priority = 10;
      } else if (severityLower.includes('alert') || severityLower.includes('high')) {
        priority = 8;
      } else if (severityLower.includes('warning') || severityLower.includes('medium')) {
        priority = 5;
      } else if (severityLower.includes('notice') || severityLower.includes('low')) {
        priority = 3;
      } else if (severityLower.includes('info')) {
        priority = 2;
      }
    }

    // Send notification to Gotify
    const gotifyResponse = await axios.post(
      `${GOTIFY_URL}/message`,
      {
        title,
        message,
        priority
      },
      {
        params: {
          token: GOTIFY_TOKEN
        },
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Successfully forwarded to Gotify:', gotifyResponse.data);

    res.status(200).json({
      success: true,
      message: 'Notification forwarded to Gotify',
      gotify_response: gotifyResponse.data
    });

  } catch (error) {
    console.error('Error processing webhook:', error.message);
    
    if (error.response) {
      // Gotify API error
      console.error('Gotify API error:', error.response.data);
      return res.status(502).json({
        error: 'Gotify API error',
        message: error.response.data || error.message
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`authentik-gotify-bridge listening on port ${PORT}`);
  console.log(`Gotify URL: ${GOTIFY_URL || 'NOT SET'}`);
  console.log(`Gotify Token: ${GOTIFY_TOKEN ? '***SET***' : 'NOT SET'}`);
  if (!GOTIFY_URL || !GOTIFY_TOKEN) {
    console.warn('WARNING: GOTIFY_URL and/or GOTIFY_TOKEN not set! Webhook endpoint will return errors.');
  }
});
