const axios = require('axios');

const config = require('./config');
const HUBSPOT_TOKEN = config.hubspot.apiKey;
const OWNER_ID = config.hubspot.instantlyOwnerId || '160932693'; // Default to Matt if not configured

const client = axios.create({
  baseURL: 'https://api.hubapi.com',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${HUBSPOT_TOKEN}`
  },
  timeout: 30000,
});

// Instantly webhook data - reply_received event
const webhookData = {
  "step": 1,
  "email": "qshen828@gmail.com",
  "variant": 1,
  "email_id": "019ab465-0036-7b51-9914-3353686e7dc1",
  "is_first": true,
  "lastName": "shen",
  "firstName": "qing",
  "timestamp": "2025-11-24T05:45:10.314Z",
  "workspace": "086e295d-72ec-481b-8e54-260d8708afbf",
  "event_type": "reply_received",
  "lead_email": "qshen828@gmail.com",
  "reply_text": "Sure, how about 11/26 9am ET?\n\nLee\n\n> On Nov 24, 2025, at 12:40 AM, Jeff Jones <jeff.jones@50deeds.org> wrote:\n> \n> Hi qing,\n> \n> I noticed that many trust and estate attorneys face challenges with timely deed preparation and recording. One of our clients, a law firm in California, reduced their processing time by 30% using our services. This allowed them to focus more on client relationships and less on paperwork.\n> \n> Can we schedule a quick call to discuss how we can help ?\n> \n> Regards,\n> \n> --\n\n",
  "unibox_url": "https://app.instantly.ai/app/unibox?thread_search=thread:f1-hOO2qn_kLHAkEVkqlFR2MTZ&selected_wks=086e295d-72ec-481b-8e54-260d8708afbf",
  "campaign_id": "f1631d04-7c81-4444-84bb-73a3a0c3a44b",
  "campaign_name": "Reachout to Trust Attorney",
  "email_account": "jeff.jones@50deeds.org",
  "reply_subject": "Re: Your thoughts?",
  "reply_text_snippet": "Sure, how about 11/26 9am ET?\nLee"
};

// Valid HubSpot lead statuses: IN_PROGRESS, NEW, UNQUALIFIED, ATTEMPTED_TO_CONTACT, CONNECTED, BAD_TIMING, OPEN, OPEN_DEAL
// Map Instantly events to HubSpot statuses
const EVENT_TO_STATUS = {
  'lead_interested': 'OPEN',
  'reply_received': 'CONNECTED',
  'lead_meeting_booked': 'OPEN_DEAL',
  'email_sent': 'IN_PROGRESS',
  'email_opened': 'IN_PROGRESS',
  'link_clicked': 'IN_PROGRESS',
  'email_bounced': 'UNQUALIFIED',
  'lead_unsubscribed': 'UNQUALIFIED',
  'lead_not_interested': 'BAD_TIMING',
};

async function findContactByEmail(email) {
  try {
    const response = await client.post('/crm/v3/objects/contacts/search', {
      filterGroups: [{
        filters: [{
          propertyName: 'email',
          operator: 'EQ',
          value: email,
        }],
      }],
      properties: ['email', 'firstname', 'lastname', 'phone', 'company', 'hs_lead_status', 'hubspot_owner_id'],
      limit: 1,
    });
    return response.data.results?.[0] || null;
  } catch (error) {
    console.error('Error finding contact:', error.response?.data || error.message);
    return null;
  }
}

async function createContact(data) {
  try {
    const response = await client.post('/crm/v3/objects/contacts', {
      properties: {
        email: data.email,
        firstname: data.firstName,
        lastname: data.lastName,
        hs_lead_status: 'CONNECTED',
        hubspot_owner_id: OWNER_ID,
      }
    });
    console.log(`Created new contact: ${data.email}`);
    return response.data;
  } catch (error) {
    console.error('Error creating contact:', error.response?.data || error.message);
    return null;
  }
}

async function updateContact(contactId, properties) {
  try {
    const response = await client.patch(`/crm/v3/objects/contacts/${contactId}`, {
      properties
    });
    console.log(`Updated contact ${contactId}`);
    return response.data;
  } catch (error) {
    console.error('Error updating contact:', error.response?.data || error.message);
    return null;
  }
}

async function createNote(contactId, noteBody) {
  try {
    const noteResponse = await client.post('/crm/v3/objects/notes', {
      properties: {
        hs_note_body: noteBody,
        hs_timestamp: Date.now(),
      },
    });

    const noteId = noteResponse.data.id;

    await client.put(
      `/crm/v3/objects/notes/${noteId}/associations/contacts/${contactId}/note_to_contact`
    );

    console.log(`Created note for contact ${contactId}`);
    return noteResponse.data;
  } catch (error) {
    console.error('Error creating note:', error.response?.data || error.message);
    return null;
  }
}

async function createTask(contactId, taskSubject, taskBody, dueDate) {
  try {
    const taskResponse = await client.post('/crm/v3/objects/tasks', {
      properties: {
        hs_task_subject: taskSubject,
        hs_task_body: taskBody,
        hs_task_status: 'NOT_STARTED',
        hs_task_priority: 'HIGH',
        hs_timestamp: new Date(dueDate).getTime(),
        hubspot_owner_id: OWNER_ID,
      },
    });

    const taskId = taskResponse.data.id;

    await client.put(
      `/crm/v3/objects/tasks/${taskId}/associations/contacts/${contactId}/task_to_contact`
    );

    console.log(`Created task for contact ${contactId}: ${taskSubject}`);
    return taskResponse.data;
  } catch (error) {
    console.error('Error creating task:', error.response?.data || error.message);
    return null;
  }
}

async function processWebhook() {
  console.log('Processing Instantly Webhook Data');
  console.log('=================================');
  console.log(`Event Type: ${webhookData.event_type}`);
  console.log(`Lead Email: ${webhookData.lead_email}`);
  console.log(`Lead Name: ${webhookData.firstName} ${webhookData.lastName}`);
  console.log(`Campaign: ${webhookData.campaign_name}`);
  console.log(`Email Account: ${webhookData.email_account || 'N/A'}`);
  console.log(`Reply: ${webhookData.reply_text_snippet}`);
  console.log(`Unibox URL: ${webhookData.unibox_url || 'N/A'}`);
  console.log('');

  // 1. Find or create contact
  let contact = await findContactByEmail(webhookData.lead_email);

  if (!contact) {
    console.log('Contact not found, creating new contact...');
    contact = await createContact({
      email: webhookData.lead_email,
      firstName: webhookData.firstName,
      lastName: webhookData.lastName,
    });
  } else {
    console.log(`Found existing contact: ${contact.id}`);
  }

  if (!contact) {
    console.error('Failed to find or create contact');
    return;
  }

  const contactId = contact.id;

  // 2. Update contact status based on event type
  const newStatus = EVENT_TO_STATUS[webhookData.event_type] || 'IN_PROGRESS';
  console.log(`\nUpdating contact status to ${newStatus}...`);
  await updateContact(contactId, {
    hs_lead_status: newStatus,
    hubspot_owner_id: OWNER_ID,
    lifecyclestage: 'salesqualifiedlead',
  });

  // 3. Create detailed note with the reply
  console.log('\nCreating engagement note...');

  const uniboxLink = webhookData.unibox_url
    ? `<p><strong>View in Instantly:</strong> <a href="${webhookData.unibox_url}">Open Unibox</a></p>`
    : '';

  const noteBody = `
<h3>🔥 HOT LEAD - Reply Received</h3>
<p><strong>Event:</strong> ${webhookData.event_type}</p>
<p><strong>Campaign:</strong> ${webhookData.campaign_name}</p>
<p><strong>Email Step:</strong> ${webhookData.step} (Variant: ${webhookData.variant})</p>
<p><strong>Email Account:</strong> ${webhookData.email_account || 'N/A'}</p>
<p><strong>Subject:</strong> ${webhookData.reply_subject || 'N/A'}</p>
<p><strong>Received:</strong> ${new Date(webhookData.timestamp).toLocaleString()}</p>
${uniboxLink}

<hr>

<h4>Lead's Reply:</h4>
<blockquote style="border-left: 3px solid #0073e6; padding-left: 10px; margin: 10px 0; background: #f0f8ff;">
<strong>${webhookData.reply_text_snippet}</strong>
</blockquote>

<h4>Full Email Thread:</h4>
<pre style="background: #f5f5f5; padding: 10px; white-space: pre-wrap; font-size: 12px;">${webhookData.reply_text}</pre>

<hr>
<p><em>Source: Instantly Campaign Webhook</em></p>
  `.trim();

  await createNote(contactId, noteBody);

  // 4. Check if they proposed a meeting and create task
  const replyLower = webhookData.reply_text_snippet.toLowerCase();
  const proposedMeeting = replyLower.includes('9am') || replyLower.includes('call') ||
                          replyLower.includes('meet') || replyLower.includes('schedule');

  if (proposedMeeting) {
    console.log('\nDetected meeting proposal - Creating follow-up task...');

    // Parse the proposed meeting time: 11/26 9am ET
    const proposedDate = new Date('2025-11-26T09:00:00-05:00'); // 9am ET

    const taskSubject = `📞 CALL: ${webhookData.firstName} ${webhookData.lastName} - 11/26 9am ET`;
    const taskBody = `
🔥 HOT LEAD - Meeting Request!

PROPOSED TIME: November 26, 2025 at 9:00 AM ET

Lead's Reply: "${webhookData.reply_text_snippet}"

---
Campaign: ${webhookData.campaign_name}
Email: ${webhookData.lead_email}
Sent From: ${webhookData.email_account || 'N/A'}
${webhookData.unibox_url ? `Unibox: ${webhookData.unibox_url}` : ''}

ACTION REQUIRED:
1. Confirm the meeting time with the lead
2. Send calendar invite
3. Prepare for call
    `.trim();

    await createTask(contactId, taskSubject, taskBody, proposedDate);
  }

  // 5. Summary
  console.log('\n=================================');
  console.log('PROCESSING COMPLETE');
  console.log('=================================');
  console.log(`Contact ID: ${contactId}`);
  console.log(`Status: ${newStatus}`);
  console.log(`Lifecycle Stage: Sales Qualified Lead`);
  console.log(`Owner: ${OWNER_ID} (sales1@50deeds.com)`);
  console.log(`Note: Created with full reply`);
  if (proposedMeeting) {
    console.log(`Task: Created for proposed meeting`);
  }
  console.log('');
  console.log(`HubSpot Contact: https://app.hubspot.com/contacts/your-portal/contact/${contactId}`);
  if (webhookData.unibox_url) {
    console.log(`Instantly Unibox: ${webhookData.unibox_url}`);
  }
}

processWebhook();
