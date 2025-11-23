const config = require('./config');
const instantlyService = require('./instantly-service');
const hubspotService = require('./hubspot-service');

class HubSpotSyncHandler {
  /**
   * Handle incoming Instantly webhook event
   * Sync to HubSpot
   */
  async handleInstantlyEvent(event) {
    console.log(`\n[INSTANTLY -> HUBSPOT] Event: ${event.event_type}`);
    console.log(`Lead: ${event.lead_email || 'N/A'}`);
    console.log(`Campaign: ${event.campaign_name || 'N/A'}`);

    if (!event.lead_email) {
      console.log('No lead email in event, skipping');
      return { success: false, reason: 'No lead email' };
    }

    try {
      // 1. Map Instantly event to HubSpot status
      const hubspotStatus = config.fieldMappings.instantlyToHubspot[event.event_type] || event.event_type;

      // 2. Find or create contact in HubSpot
      let contact = await hubspotService.findContactByEmail(event.lead_email);

      if (!contact) {
        // Create new contact
        contact = await hubspotService.createContact({
          email: event.lead_email,
          firstName: event.first_name || '',
          lastName: event.last_name || '',
        });
        console.log(`Created new contact in HubSpot: ${event.lead_email}`);
      } else {
        // Update lead status if we have a mapping
        if (hubspotStatus && hubspotStatus !== event.event_type) {
          await hubspotService.updateContact(contact.id, { leadStatus: hubspotStatus });
          console.log(`Updated HubSpot contact status to: ${hubspotStatus}`);
        } else {
          console.log(`Contact already exists in HubSpot: ${event.lead_email}`);
        }
      }

      // 3. Create note for significant events
      const significantEvents = [
        'reply_received',
        'lead_interested',
        'lead_not_interested',
        'lead_meeting_booked',
        'lead_meeting_completed',
        'email_bounced',
        'lead_unsubscribed',
      ];

      const contactId = contact?.id;
      if (significantEvents.includes(event.event_type) && contactId) {
        const noteContent = this.formatEventNote(event);
        await hubspotService.createNote(contactId, noteContent, event.event_type);
      }

      // 4. Create follow-up task for interested leads
      if ((event.event_type === 'lead_interested' || event.event_type === 'reply_received') && contactId) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 1); // Due tomorrow
        await hubspotService.createTask(
          contactId,
          `Follow up with ${event.lead_email} - ${event.event_type}`,
          dueDate.toISOString()
        );
      }

      return { success: true, action: 'synced_to_hubspot', status: hubspotStatus };
    } catch (error) {
      console.error('Error syncing Instantly event to HubSpot:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle incoming HubSpot webhook payload
   * HubSpot sends array of subscription events
   */
  async handleHubSpotWebhook(payload) {
    console.log(`\n[HUBSPOT WEBHOOK] Received webhook`);

    // HubSpot sends an array of events
    const events = Array.isArray(payload) ? payload : [payload];
    const results = [];

    for (const event of events) {
      const result = await this.handleHubSpotEvent(event);
      results.push(result);
    }

    return { success: true, processed: results.length, results };
  }

  /**
   * Handle single HubSpot event
   * Sync to Instantly
   */
  async handleHubSpotEvent(event) {
    const eventType = event.subscriptionType;
    const contactId = event.objectId;

    console.log(`\n[HUBSPOT -> INSTANTLY] Event: ${eventType}`);
    console.log(`Contact ID: ${contactId}`);

    if (!contactId) {
      console.log('No contact ID in HubSpot event, skipping');
      return { success: false, reason: 'No contact ID' };
    }

    try {
      // Fetch the full contact from HubSpot API
      const contact = await hubspotService.getContactById(contactId);

      if (!contact) {
        console.log('Could not fetch contact from HubSpot');
        return { success: false, reason: 'Failed to fetch contact' };
      }

      // Extract email from contact
      const primaryEmail = contact.properties?.email;

      if (!primaryEmail) {
        console.log('No email in HubSpot contact, skipping');
        return { success: false, reason: 'No email address' };
      }

      console.log(`Contact: ${primaryEmail}`);

      // Extract name
      const firstName = contact.properties?.firstname || '';
      const lastName = contact.properties?.lastname || '';
      const fullName = `${firstName} ${lastName}`.trim();

      // Handle different HubSpot event types
      switch (eventType) {
        case 'contact.creation':
          // New contact added to HubSpot
          console.log(`New contact created in HubSpot: ${primaryEmail} (${fullName})`);
          return {
            success: true,
            action: 'contact_created',
            email: primaryEmail,
            name: fullName
          };

        case 'contact.propertyChange':
          // Check if lead status changed
          const changedProperty = event.propertyName;
          const newValue = event.propertyValue;

          if (changedProperty === 'hs_lead_status' && newValue) {
            const instantlyStatus = config.fieldMappings.hubspotToInstantly[newValue];
            if (instantlyStatus) {
              await instantlyService.updateLeadStatus(primaryEmail, instantlyStatus);
              console.log(`Updated Instantly lead status: ${instantlyStatus}`);
              return { success: true, action: 'status_updated', status: instantlyStatus };
            }
          }
          console.log(`Property changed but no status mapping found: ${changedProperty}`);
          return { success: true, action: 'property_changed_no_mapping' };

        case 'contact.deletion':
          console.log(`Contact deleted in HubSpot: ${primaryEmail}`);
          return { success: true, action: 'contact_deleted', email: primaryEmail };

        default:
          console.log(`Unhandled HubSpot event type: ${eventType}`);
          return { success: true, action: 'unhandled_event_type' };
      }
    } catch (error) {
      console.error('Error syncing HubSpot event to Instantly:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Format event data into a readable note
   */
  formatEventNote(event) {
    const lines = [
      `<strong>Event:</strong> ${event.event_type}`,
      `<strong>Date:</strong> ${event.timestamp}`,
      `<strong>Campaign:</strong> ${event.campaign_name || 'N/A'}`,
    ];

    if (event.email_account) {
      lines.push(`<strong>Sent From:</strong> ${event.email_account}`);
    }

    if (event.step) {
      lines.push(`<strong>Email Step:</strong> ${event.step} (Variant: ${event.variant || 'A'})`);
    }

    if (event.unibox_url) {
      lines.push(`<strong>View in Instantly:</strong> <a href="${event.unibox_url}">${event.unibox_url}</a>`);
    }

    return lines.join('<br>');
  }

  /**
   * Manual sync: Push all Instantly leads to HubSpot
   */
  async syncAllLeadsToHubSpot(campaignId) {
    console.log(`\n[MANUAL SYNC] Starting full sync for campaign ${campaignId}`);

    try {
      const campaign = await instantlyService.getCampaign(campaignId);
      if (!campaign) {
        return { success: false, error: 'Campaign not found' };
      }

      console.log(`Syncing leads from campaign: ${campaign.name}`);
      return { success: true, message: 'Manual sync not fully implemented - use webhooks' };
    } catch (error) {
      console.error('Error in manual sync:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new HubSpotSyncHandler();
