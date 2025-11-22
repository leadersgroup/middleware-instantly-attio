require('dotenv').config();

module.exports = {
  server: {
    port: process.env.PORT || 3001,
    env: process.env.NODE_ENV || 'development',
  },

  instantly: {
    apiKey: process.env.INSTANTLY_API_KEY,
    apiUrl: process.env.INSTANTLY_API_URL || 'https://api.instantly.ai/api/v2',
    webhookSecret: process.env.INSTANTLY_WEBHOOK_SECRET,
  },

  attio: {
    apiKey: process.env.ATTIO_API_KEY,
    apiUrl: process.env.ATTIO_API_URL || 'https://api.attio.com/v2',
    webhookSecret: process.env.ATTIO_WEBHOOK_SECRET,
  },

  sync: {
    enabled: process.env.SYNC_ENABLED !== 'false',
    logLevel: process.env.LOG_LEVEL || 'info',
  },

  // Field mappings between Instantly and Attio
  fieldMappings: {
    // Instantly event types -> Attio status values
    instantlyToAttio: {
      'email_sent': 'Contacted',
      'email_opened': 'Engaged',
      'reply_received': 'Replied',
      'lead_interested': 'Interested',
      'lead_not_interested': 'Not Interested',
      'lead_meeting_booked': 'Meeting Scheduled',
      'lead_meeting_completed': 'Meeting Completed',
      'email_bounced': 'Bounced',
      'lead_unsubscribed': 'Unsubscribed',
      'lead_closed': 'Closed',
    },

    // Attio status -> Instantly lead status
    attioToInstantly: {
      'Interested': 'Interested',
      'Not Interested': 'Not Interested',
      'Meeting Scheduled': 'Meeting Booked',
      'Closed Won': 'Closed',
      'Closed Lost': 'Not Interested',
    },
  },
};
