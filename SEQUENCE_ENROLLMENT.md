# HubSpot Sequence Auto-Enrollment Guide

This guide explains how to automatically enroll HubSpot contacts in email sequences when they interact with your Instantly.ai campaigns.

## What This Does

Instead of using Make.com to enroll contacts in sequences, your Node.js middleware now:

1. **Detects Instantly events** (reply_received, lead_interested, etc.)
2. **Creates/updates the contact** in HubSpot
3. **Automatically enrolls them** in the appropriate HubSpot sequence
4. **Creates tasks** for follow-up
5. **All without Make.com!**

## Setup Instructions

### Step 1: Find Your HubSpot Sequence IDs

Run this command to fetch all your sequences and their IDs:

```bash
node get-hubspot-sequences.js
```

You'll see output like:

```
Found 4 sequence(s):

====================

1. New Lead Sequence
   ID: 8f1a2b3c-4d5e-6f7g-8h9i-0j1k2l3m4n5o

2. Trial Sequence
   ID: 9k8j7i-6h5g-4f3e-2d1c-0b9a8f7e6d5c

3. Customer Onboarding Sequence
   ID: 7c6b5a-4z3y-2x1w-0v9u-8t7s6r5q4p3o

4. Re-engagement Sequence
   ID: 2m1l0k-9j8i-7h6g-5f4e-3d2c-1b0a9z8y7x
```

### Step 2: Add Sequence IDs to .env

Copy the sequence IDs into your `.env` file:

```env
# HubSpot Sequence IDs for auto-enrollment
HUBSPOT_SEQUENCE_NEW_LEAD=8f1a2b3c-4d5e-6f7g-8h9i-0j1k2l3m4n5o
HUBSPOT_SEQUENCE_TRIAL=9k8j7i-6h5g-4f3e-2d1c-0b9a8f7e6d5c
HUBSPOT_SEQUENCE_CUSTOMER=7c6b5a-4z3y-2x1w-0v9u-8t7s6r5q4p3o
HUBSPOT_SEQUENCE_REENGAGE=2m1l0k-9j8i-7h6g-5f4e-3d2c-1b0a9z8y7x
```

### Step 3: Restart Your Server

```bash
npm start
```

## How It Works

### Event → Sequence Mapping

When these Instantly events occur, contacts are enrolled in sequences:

| Instantly Event | HubSpot Sequence | What Happens |
|---|---|---|
| `reply_received` | New Lead Sequence | Contact gets auto-enrolled, receives follow-up emails |
| `lead_interested` | New Lead Sequence | Contact shows interest, gets nurture emails |
| `lead_meeting_booked` | New Lead Sequence | Contact schedules meeting, gets prep emails |
| `email_sent` | New Lead Sequence | Initial email sent, starts sequence |

### Current Flow

```
Instantly Event
  ↓
Webhook received
  ↓
Find/create contact in HubSpot
  ↓
Update contact properties & status
  ↓
Create engagement note
  ↓
Create follow-up task
  ↓
✅ AUTO-ENROLL IN SEQUENCE (No Make.com needed!)
```

## API Methods

### New Methods Added to HubSpot Service

#### Enroll Contact in Sequence

```javascript
await hubspotService.enrollInSequence(contactId, sequenceId);
```

**Parameters:**
- `contactId` (string): HubSpot contact ID
- `sequenceId` (string): HubSpot sequence ID

**Example:**
```javascript
await hubspotService.enrollInSequence('123456', '8f1a2b3c-4d5e-6f7g-8h9i-0j1k2l3m4n5o');
```

#### Unenroll Contact from Sequence

```javascript
await hubspotService.unenrollFromSequence(contactId, sequenceId);
```

**Parameters:**
- `contactId` (string): HubSpot contact ID
- `sequenceId` (string): HubSpot sequence ID

#### Get All Sequences

```javascript
const sequences = await hubspotService.getSequences();
```

**Returns:** Array of sequence objects with properties like `name` and `id`

## Customizing Enrollment Logic

Edit [hubspot-sync-handler.js](hubspot-sync-handler.js) to customize when contacts are enrolled:

```javascript
// In enrollInSequenceBasedOnEvent method
const eventToSequenceKey = {
  'reply_received': 'newLeadSequence',      // ← Change this mapping
  'lead_interested': 'newLeadSequence',
  'lead_meeting_booked': 'newLeadSequence',
  'email_sent': 'newLeadSequence',
  // Add more mappings here
};
```

### Example: Enroll in Trial Sequence When Lifecycle Stage Changes

You could add this to handle HubSpot lifecycle stage changes:

```javascript
async handleHubSpotEvent(event) {
  // ... existing code ...

  if (event.subscriptionType === 'contact.propertyChange') {
    if (event.propertyName === 'lifecyclestage' && event.propertyValue === 'trial') {
      // Auto-enroll in Trial Sequence
      const sequenceId = config.hubspot.sequences.trialSequence;
      await hubspotService.enrollInSequence(contactId, sequenceId);
    }
  }
}
```

## Troubleshooting

### "Sequence ID not configured" Error

**Problem:** You see this in logs:
```
Sequence ID not configured for: newLeadSequence (reply_received)
Set HUBSPOT_SEQUENCE_NEW_LEAD in .env to enable auto-enrollment
```

**Solution:**
1. Run `node get-hubspot-sequences.js` to get your sequence IDs
2. Add them to `.env`
3. Restart the server

### "Error enrolling contact in sequence"

**Problem:** Enrollment fails even with correct IDs

**Possible causes:**
- HubSpot API key doesn't have permission to enroll contacts
- Sequence ID is incorrect
- Contact is already in that sequence
- HubSpot Starter plan limitations

**Solution:**
1. Verify API key has correct permissions (Settings → Developers → Private Apps)
2. Double-check sequence ID from the dashboard
3. Check HubSpot account plan supports sequences

### Sequences Not Working?

**Check 1:** Is HUBSPOT_API_KEY set?
```bash
echo $HUBSPOT_API_KEY
```

**Check 2:** Are sequences created in HubSpot?
```bash
node get-hubspot-sequences.js
```

**Check 3:** Check middleware logs
```bash
# If running with npm start
npm start
# Look for "Enrolled contact" messages
```

## Advanced: Manual Enrollment

You can manually enroll a contact in a sequence via the API:

```javascript
const hubspotService = require('./hubspot-service');

// Enroll contact 123456 in sequence ABC123
await hubspotService.enrollInSequence('123456', 'ABC123');
```

Or from a server endpoint:

```javascript
app.post('/enroll-in-sequence', async (req, res) => {
  const { contactId, sequenceId } = req.body;

  try {
    const result = await hubspotService.enrollInSequence(contactId, sequenceId);
    res.json({ success: true, result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

## Migration from Make.com

If you were using Make.com scenarios to enroll contacts, you can now:

1. **Disable Make.com scenarios** in your Make.com account
2. **Keep your HubSpot sequences** - they still work the same way
3. **Let the middleware handle enrollment** automatically

This reduces:
- ❌ Make.com operational costs
- ❌ External dependencies
- ❌ Potential sync delays
- ✅ Keeps HubSpot sequences & email templates

## Testing Enrollment

Test the enrollment feature by sending a test webhook:

```bash
curl -X POST http://localhost:3001/test/instantly \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "reply_received",
    "lead_email": "test@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "campaign_name": "Test Campaign"
  }'
```

Check logs for:
```
Enrolled contact [contactId] in sequence ID: [sequenceId]
```

## Sequence Lifecycle Examples

### Example 1: New Lead Path
```
Lead replies to Instantly
  ↓
Contact created in HubSpot
  ↓
Enrolled in "New Lead Sequence"
  ↓
Receives Day 0: "Thanks for Your Interest"
  ↓
Receives Day 3: "Quick Follow-Up"
  ↓
Receives Day 10: "Should I Close Your File"
```

### Example 2: Hot Lead Path
```
Lead replies with meeting interest
  ↓
Contact created in HubSpot
  ↓
🔥 HIGH PRIORITY task created (due in 2 hrs)
  ↓
Enrolled in "New Lead Sequence"
  ↓
Sales rep follows up immediately
  ↓
Contact moved to "Opportunity" stage manually
  ↓
Sales offers trial → Lifecycle stage = "Trial"
```

## Configuration Summary

**Environment Variables:**
```env
HUBSPOT_API_KEY=pat-...              # Your HubSpot API key
HUBSPOT_SEQUENCE_NEW_LEAD=123...     # New Lead Sequence ID
HUBSPOT_SEQUENCE_TRIAL=456...        # Trial Sequence ID
HUBSPOT_SEQUENCE_CUSTOMER=789...     # Customer Onboarding ID
HUBSPOT_SEQUENCE_REENGAGE=012...     # Re-engagement Sequence ID
```

**No Make.com Required!**

All enrollment logic is in your Node.js middleware. The system is self-contained and doesn't depend on external automation platforms.

---

**Questions?** Check [hubspot-service.js](hubspot-service.js) or [hubspot-sync-handler.js](hubspot-sync-handler.js) for implementation details.
