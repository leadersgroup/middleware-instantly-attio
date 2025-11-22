const config = require('./config');
const instantlyService = require('./instantly-service');
const attioService = require('./attio-service');

class SyncHandler {
  /**
   * Handle incoming Instantly webhook event
   * Sync to Attio
   */
  async handleInstantlyEvent(event) {
    console.log(`\n[INSTANTLY -> ATTIO] Event: ${event.event_type}`);
    console.log(`Lead: ${event.lead_email || 'N/A'}`);
    console.log(`Campaign: ${event.campaign_name || 'N/A'}`);

    if (!event.lead_email) {
      console.log('No lead email in event, skipping');
      return { success: false, reason: 'No lead email' };
    }

    try {
      // 1. Map Instantly event to Attio status
      const attioStatus = config.fieldMappings.instantlyToAttio[event.event_type] || event.event_type;

      // 2. Find or create person in Attio
      let person = await attioService.findPersonByEmail(event.lead_email);

      if (!person) {
        // Create new person
        person = await attioService.upsertPerson({
          email: event.lead_email,
          firstName: event.first_name || '',
          lastName: event.last_name || '',
          instantlyStatus: attioStatus,
          campaignName: event.campaign_name,
          lastEventDate: event.timestamp,
        });
        console.log(`Created new person in Attio: ${event.lead_email}`);
      } else {
        // Update existing person
        const recordId = person.id?.record_id || person.id;
        await attioService.updatePerson(recordId, {
          instantly_status: attioStatus,
          campaign_name: event.campaign_name,
          last_instantly_event: event.timestamp,
        });
        console.log(`Updated person in Attio: ${event.lead_email}`);
      }

      // 3. Create activity note for significant events
      const significantEvents = [
        'reply_received',
        'lead_interested',
        'lead_not_interested',
        'lead_meeting_booked',
        'lead_meeting_completed',
        'email_bounced',
        'lead_unsubscribed',
      ];

      if (significantEvents.includes(event.event_type)) {
        const recordId = person?.id?.record_id || person?.id || person?.data?.id?.record_id;
        if (recordId) {
          const noteContent = this.formatEventNote(event);
          await attioService.createNote(recordId, noteContent, event.event_type);
        }
      }

      // 4. Create follow-up task for interested leads
      if (event.event_type === 'lead_interested' || event.event_type === 'reply_received') {
        const recordId = person?.id?.record_id || person?.id || person?.data?.id?.record_id;
        if (recordId) {
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 1); // Due tomorrow
          await attioService.createTask(
            recordId,
            `Follow up with ${event.lead_email} - ${event.event_type}`,
            dueDate.toISOString()
          );
        }
      }

      return { success: true, action: 'synced_to_attio', status: attioStatus };
    } catch (error) {
      console.error('Error syncing Instantly event to Attio:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle incoming Attio webhook payload
   * Attio sends: { webhook_id, events: [{event_type, id: {record_id, object_id}, actor}] }
   */
  async handleAttioWebhook(payload) {
    console.log(`\n[ATTIO WEBHOOK] Received webhook: ${payload.webhook_id}`);

    const events = payload.events || [];
    const results = [];

    for (const event of events) {
      const result = await this.handleAttioEvent(event);
      results.push(result);
    }

    return { success: true, processed: results.length, results };
  }

  /**
   * Handle single Attio event
   * Sync to Instantly
   */
  async handleAttioEvent(event) {
    const eventType = event.event_type;
    const recordId = event.id?.record_id;
    const objectId = event.id?.object_id;

    console.log(`\n[ATTIO -> INSTANTLY] Event: ${eventType}`);
    console.log(`Record ID: ${recordId}`);

    if (!recordId) {
      console.log('No record ID in Attio event, skipping');
      return { success: false, reason: 'No record ID' };
    }

    try {
      // Fetch the full record from Attio API
      const record = await attioService.getPersonById(recordId);

      if (!record) {
        console.log('Could not fetch record from Attio');
        return { success: false, reason: 'Failed to fetch record' };
      }

      // Extract email from record
      const emailValues = record.data?.values?.email_addresses || record.values?.email_addresses || [];
      const primaryEmail = emailValues[0]?.email_address;

      if (!primaryEmail) {
        console.log('No email in Attio record, skipping');
        return { success: false, reason: 'No email address' };
      }

      console.log(`Person: ${primaryEmail}`);

      // Extract name
      const name = record.data?.values?.name?.[0]?.full_name ||
                   record.values?.name?.[0]?.full_name || '';

      // Handle different Attio event types
      switch (eventType) {
        case 'record.created':
          // New person added to Attio - log for now
          console.log(`New person created in Attio: ${primaryEmail} (${name})`);
          // TODO: Add to Instantly campaign if configured
          // await instantlyService.addLeadToCampaign(campaignId, { email: primaryEmail, ... });
          return {
            success: true,
            action: 'person_created',
            email: primaryEmail,
            name: name
          };

        case 'record.updated':
          // Check if status changed
          const statusValues = record.data?.values?.status || record.values?.status || [];
          const newStatus = statusValues[0]?.status?.title || statusValues[0]?.option?.title;

          if (newStatus) {
            const instantlyStatus = config.fieldMappings.attioToInstantly[newStatus];
            if (instantlyStatus) {
              await instantlyService.updateLeadStatus(primaryEmail, instantlyStatus);
              console.log(`Updated Instantly lead status: ${instantlyStatus}`);
              return { success: true, action: 'status_updated', status: instantlyStatus };
            }
          }
          console.log(`Record updated but no status mapping found`);
          return { success: true, action: 'record_updated_no_status_change' };

        case 'record.deleted':
          console.log(`Person deleted in Attio: ${primaryEmail}`);
          return { success: true, action: 'person_deleted', email: primaryEmail };

        default:
          console.log(`Unhandled Attio event type: ${eventType}`);
          return { success: true, action: 'unhandled_event_type' };
      }
    } catch (error) {
      console.error('Error syncing Attio event to Instantly:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Format event data into a readable note
   */
  formatEventNote(event) {
    const lines = [
      `**Event:** ${event.event_type}`,
      `**Date:** ${event.timestamp}`,
      `**Campaign:** ${event.campaign_name || 'N/A'}`,
    ];

    if (event.email_account) {
      lines.push(`**Sent From:** ${event.email_account}`);
    }

    if (event.step) {
      lines.push(`**Email Step:** ${event.step} (Variant: ${event.variant || 'A'})`);
    }

    if (event.unibox_url) {
      lines.push(`**View in Instantly:** ${event.unibox_url}`);
    }

    return lines.join('\n');
  }

  /**
   * Manual sync: Push all Instantly leads to Attio
   */
  async syncAllLeadsToAttio(campaignId) {
    console.log(`\n[MANUAL SYNC] Starting full sync for campaign ${campaignId}`);

    try {
      // This would require pagination in production
      const campaign = await instantlyService.getCampaign(campaignId);
      if (!campaign) {
        return { success: false, error: 'Campaign not found' };
      }

      console.log(`Syncing leads from campaign: ${campaign.name}`);

      // Note: Instantly API may have different endpoints for listing leads
      // This is a simplified example
      return { success: true, message: 'Manual sync not fully implemented - use webhooks' };
    } catch (error) {
      console.error('Error in manual sync:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Setup Attio webhook to receive events
   */
  async setupAttioWebhook(publicUrl) {
    const webhookUrl = `${publicUrl}/webhook/attio`;

    try {
      const events = [
        'record.created.people',
        'record.updated.people',
        'record.deleted.people',
      ];

      const webhook = await attioService.createWebhook(webhookUrl, events);
      console.log(`Attio webhook created: ${webhookUrl}`);
      return webhook;
    } catch (error) {
      console.error('Error setting up Attio webhook:', error.message);
      throw error;
    }
  }
}

module.exports = new SyncHandler();
