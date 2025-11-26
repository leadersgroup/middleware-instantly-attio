const config = require('./config');
const instantlyService = require('./instantly-service');
const hubspotService = require('./hubspot-service');

// Valid HubSpot lead statuses mapping
// Valid options: IN_PROGRESS, NEW, UNQUALIFIED, ATTEMPTED_TO_CONTACT, CONNECTED, BAD_TIMING, OPEN, OPEN_DEAL
const EVENT_TO_HUBSPOT_STATUS = {
  'reply_received': 'CONNECTED',
  'lead_interested': 'CONNECTED',
  'lead_meeting_booked': 'CONNECTED',
  'lead_meeting_completed': 'CONNECTED',
  'email_sent': 'IN_PROGRESS',
  'email_opened': 'IN_PROGRESS',
  'link_clicked': 'IN_PROGRESS',
  'email_bounced': 'UNQUALIFIED',
  'lead_unsubscribed': 'UNQUALIFIED',
  'lead_not_interested': 'BAD_TIMING',
};

class HubSpotSyncHandler {
  /**
   * Handle incoming Instantly webhook event
   * Sync to HubSpot with enhanced processing
   */
  async handleInstantlyEvent(event) {
    console.log(`\n[INSTANTLY -> HUBSPOT] Event: ${event.event_type}`);
    console.log(`Lead: ${event.lead_email || 'N/A'}`);
    console.log(`Campaign: ${event.campaign_name || 'N/A'}`);
    if (event.reply_text_snippet) {
      console.log(`Reply: ${event.reply_text_snippet}`);
    }

    if (!event.lead_email) {
      console.log('No lead email in event, skipping');
      return { success: false, reason: 'No lead email' };
    }

    try {
      // 1. Map Instantly event to valid HubSpot status
      const hubspotStatus = EVENT_TO_HUBSPOT_STATUS[event.event_type] ||
                           config.fieldMappings?.instantlyToHubspot?.[event.event_type] ||
                           'IN_PROGRESS';

      // 2. Find or create contact in HubSpot
      let contact = await hubspotService.findContactByEmail(event.lead_email);

      if (!contact) {
        // Create new contact with proper status and owner
        contact = await hubspotService.createContact({
          email: event.lead_email,
          firstName: event.first_name || event.firstName || '',
          lastName: event.last_name || event.lastName || '',
          phone: event.phone || '',
          company: event.companyName || '',
          ownerId: config.hubspot.instantlyOwnerId,
        });
        console.log(`Created new contact in HubSpot: ${event.lead_email}`);
      } else {
        // Contact already exists - skip reassignment, keep existing owner
        console.log(`Found existing contact in HubSpot: ${event.lead_email} - keeping existing owner`);
      }

      const contactId = contact?.id;
      if (!contactId) {
        console.log('Failed to get contact ID');
        return { success: false, reason: 'No contact ID' };
      }

      // 3. Update contact - always set source to Instantly
      const hotEvents = ['reply_received', 'lead_interested', 'lead_meeting_booked', 'lead_meeting_completed'];
      const updateProps = {
        lead_source_name: 'Instantly',
        lead_source_type: 'INTEGRATION',
      };

      if (hotEvents.includes(event.event_type)) {
        updateProps.leadStatus = hubspotStatus;
        updateProps.lifecyclestage = 'salesqualifiedlead';
      }

      await hubspotService.updateContact(contactId, updateProps);
      console.log(`Updated HubSpot contact - Status: ${hubspotStatus}, Source: Instantly`);

      // 4. Create detailed note for significant events
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
        const noteContent = this.formatEventNote(event);
        await hubspotService.createNote(contactId, noteContent, event.event_type);
        console.log(`Created engagement note for ${event.event_type}`);
      }

      // 5. Create high-priority task for hot leads with meeting detection
      if (hotEvents.includes(event.event_type)) {
        const replyText = (event.reply_text_snippet || event.reply_text || '').toLowerCase();
        const hasMeetingProposal = replyText.includes('call') ||
                                   replyText.includes('meet') ||
                                   replyText.includes('am') ||
                                   replyText.includes('pm') ||
                                   replyText.includes('schedule');

        const taskSubject = hasMeetingProposal
          ? `🔥 HOT: ${event.first_name || event.firstName || ''} ${event.last_name || event.lastName || ''} - Meeting Request`
          : `📞 Follow up: ${event.lead_email} - ${event.event_type}`;

        const taskBody = this.formatTaskBody(event, hasMeetingProposal);

        const dueDate = new Date();
        dueDate.setHours(dueDate.getHours() + 2); // Due in 2 hours for hot leads

        await hubspotService.createTask(contactId, taskSubject, taskBody, dueDate.toISOString(), config.hubspot.instantlyOwnerId);
        console.log(`Created ${hasMeetingProposal ? 'HIGH PRIORITY' : ''} follow-up task`);
      }

      return {
        success: true,
        action: 'synced_to_hubspot',
        status: hubspotStatus,
        contactId: contactId
      };
    } catch (error) {
      console.error('Error syncing Instantly event to HubSpot:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Format task body with relevant details
   */
  formatTaskBody(event, isMeetingRequest) {
    const lines = [];

    if (isMeetingRequest) {
      lines.push('🔥 HOT LEAD - This contact requested a meeting!\n');
    }

    if (event.reply_text_snippet) {
      lines.push(`Lead's Reply: "${event.reply_text_snippet}"\n`);
    }

    lines.push(`Campaign: ${event.campaign_name || 'N/A'}`);
    lines.push(`Email: ${event.lead_email}`);

    if (event.email_account) {
      lines.push(`Sent From: ${event.email_account}`);
    }

    if (event.unibox_url) {
      lines.push(`Unibox: ${event.unibox_url}`);
    }

    lines.push('\nACTION REQUIRED:');
    if (isMeetingRequest) {
      lines.push('1. Confirm the meeting time');
      lines.push('2. Send calendar invite');
      lines.push('3. Prepare for call');
    } else {
      lines.push('1. Review the lead response');
      lines.push('2. Send personalized follow-up');
    }

    return lines.join('\n');
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
   * Format event data into a readable note with rich formatting
   */
  formatEventNote(event) {
    const isHotLead = ['reply_received', 'lead_interested', 'lead_meeting_booked'].includes(event.event_type);
    const emoji = isHotLead ? '🔥' : '📧';
    const title = isHotLead ? 'HOT LEAD' : 'Campaign Event';

    let html = `<h3>${emoji} ${title} - ${event.event_type}</h3>`;

    html += `<p><strong>Campaign:</strong> ${event.campaign_name || 'N/A'}</p>`;
    html += `<p><strong>Date:</strong> ${new Date(event.timestamp).toLocaleString()}</p>`;

    if (event.email_account) {
      html += `<p><strong>Sent From:</strong> ${event.email_account}</p>`;
    }

    if (event.step) {
      html += `<p><strong>Email Step:</strong> ${event.step} (Variant: ${event.variant || '1'})</p>`;
    }

    if (event.reply_subject) {
      html += `<p><strong>Subject:</strong> ${event.reply_subject}</p>`;
    }

    if (event.unibox_url) {
      html += `<p><strong>View in Instantly:</strong> <a href="${event.unibox_url}">Open Unibox</a></p>`;
    }

    // Include reply content for reply events
    if (event.reply_text_snippet || event.reply_text) {
      html += '<hr>';
      html += '<h4>Lead\'s Reply:</h4>';
      html += `<blockquote style="border-left: 3px solid #0073e6; padding-left: 10px; margin: 10px 0; background: #f0f8ff;">`;
      html += `<strong>${event.reply_text_snippet || ''}</strong>`;
      html += `</blockquote>`;

      if (event.reply_text && event.reply_text !== event.reply_text_snippet) {
        html += '<h4>Full Email Thread:</h4>';
        html += `<pre style="background: #f5f5f5; padding: 10px; white-space: pre-wrap; font-size: 12px;">${event.reply_text}</pre>`;
      }
    }

    html += '<hr>';
    html += '<p><em>Source: Instantly Campaign Webhook</em></p>';

    return html;
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
