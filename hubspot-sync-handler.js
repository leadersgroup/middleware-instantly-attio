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
      let isNewContact = false;

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
        isNewContact = true;
      } else {
        // Contact already exists - skip reassignment, keep existing owner
        console.log(`Found existing contact in HubSpot: ${event.lead_email} - keeping existing owner`);
      }

      const contactId = contact?.id;
      if (!contactId) {
        console.log('Failed to get contact ID');
        return { success: false, reason: 'No contact ID' };
      }

      // 3. Update contact - only set lifecycle stage on first contact creation
      const updateProps = {
        lead_source_name: 'Instantly',
        lead_source_type: 'INTEGRATION',
      };

      // Only update lifecycle stage for new contacts (first time)
      if (isNewContact) {
        updateProps.lifecyclestage = 'lead';
      }

      await hubspotService.updateContact(contactId, updateProps);
      if (isNewContact) {
        console.log(`Updated HubSpot contact - Lifecycle: lead, Source: Instantly`);
      } else {
        console.log(`Updated HubSpot contact - Source: Instantly (lifecycle unchanged)`);
      }

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

      // 5. Submit to Wix form for sequence enrollment
      // Only submit form if contact lifecycle is "lead"
      let shouldSubmitForm = false;
      try {
        // Re-fetch contact to get lifecycle (available via search API)
        const contactDetails = await hubspotService.findContactByEmail(event.lead_email);
        const lifecycleStage = contactDetails?.properties?.lifecyclestage?.value ||
                              contactDetails?.properties?.lifecyclestage;

        console.log(`Contact lifecycle stage: ${lifecycleStage || 'not set'}`);

        // Only submit form if lifecycle is exactly "lead"
        if (lifecycleStage && lifecycleStage.toLowerCase() === 'lead') {
          console.log(`Submitting form - contact is in lead stage`);
          shouldSubmitForm = true;
        } else {
          console.log(`Skipping form submission - contact is not in lead stage`);
        }
      } catch (error) {
        console.log(`Could not read lifecycle status, skipping form submission: ${error.message}`);
        shouldSubmitForm = false;
      }

      if (shouldSubmitForm) {
        try {
          await this.submitToWixForm(event.first_name || event.firstName || '',
                                     event.last_name || event.lastName || '',
                                     event.lead_email);
          console.log(`Submitted contact to Wix form for sequence enrollment`);
        } catch (error) {
          console.error('Error submitting to Wix form:', error.message);
          // Don't fail the sync if Wix form submission fails
        }
      }

      return {
        success: true,
        action: 'synced_to_hubspot',
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
   * Submit new contact to HubSpot form for sequence enrollment
   * The 50deeds.com homepage "Sign up for our newsletter" form triggers HubSpot automation
   * Portal ID: 244433136, Form ID: f5425444-6422-4049-8d12-9b736221a33a
   */
  async submitToWixForm(firstName, lastName, email) {
    try {
      const axios = require('axios');

      // HubSpot Forms API endpoint
      const portalId = '244433136';
      const formId = 'f5425444-6422-4049-8d12-9b736221a33a';

      const response = await axios.post(
        `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formId}`,
        {
          fields: [
            {
              name: 'firstname',
              value: firstName,
            },
            {
              name: 'lastname',
              value: lastName,
            },
            {
              name: 'email',
              value: email,
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      console.log(`HubSpot form submitted for ${email}`);
      return response.data;
    } catch (error) {
      console.error('Error submitting to HubSpot form:', error.message);
      throw error;
    }
  }

  /**
   * Handle incoming HubSpot webhook event
   * Listen for lifecycle stage changes to trigger form submissions for sequence enrollment
   */
  async handleHubSpotWebhook(event) {
    console.log(`\n[HUBSPOT WEBHOOK] Processing event`);

    try {
      // HubSpot webhooks come with an array of changes
      if (!event || !Array.isArray(event)) {
        console.log('Invalid HubSpot webhook payload');
        return { success: false, reason: 'Invalid payload' };
      }

      const results = [];

      for (const eventItem of event) {
        const { objectId, changeSource, changes, propertyName } = eventItem;

        if (!objectId) {
          console.log('No contact ID in webhook');
          continue;
        }

        console.log(`Contact ID: ${objectId}`);

        let lifecycleChange = null;

        // Try first format: look for lifecyclestage in changes array
        if (changes && Array.isArray(changes)) {
          lifecycleChange = changes.find(c => c.propertyName === 'lifecyclestage');
        }

        // Fallback: check if the event itself has propertyName = lifecyclestage (newer HubSpot format)
        if (!lifecycleChange && propertyName === 'lifecyclestage') {
          lifecycleChange = eventItem;
        }

        if (!lifecycleChange) {
          console.log('No lifecycle stage change detected');
          continue;
        }

        let newLifecycleStage = lifecycleChange.newValue;
        const oldLifecycleStage = lifecycleChange.oldValue;

        // If newValue is missing, try to get it from the webhook propertyValue (enum ID) or fetch from API
        if (!newLifecycleStage) {
          // Check if webhook has propertyValue which is an enum ID for the lifecyclestage
          if (lifecycleChange?.propertyValue) {
            console.log('Webhook has propertyValue, converting enum ID to label...');
            newLifecycleStage = await hubspotService.getPropertyEnumValue('lifecyclestage', lifecycleChange.propertyValue);
          }

          // If still no value, fetch contact to get current lifecycle stage
          if (!newLifecycleStage) {
            console.log('No value from webhook, fetching contact details...');
            const contact = await hubspotService.getContact(objectId);
            console.log('All properties returned:', Object.keys(contact?.properties || {}));

            // Try different property access patterns
            newLifecycleStage = contact?.properties?.lifecyclestage?.value ||
                                contact?.properties?.lifecyclestage ||
                                contact?.lifecyclestage;
          }
          console.log('Extracted lifecyclestage value:', newLifecycleStage);
        }

        console.log(`Lifecycle changed from ${oldLifecycleStage} to ${newLifecycleStage}`);

        // Define form mappings for different lifecycle stages
        const lifecycleFormMap = {
          'trial': {
            formId: '5099b1d0-f5d2-474f-8fe6-2b390bbf4adb',
            action: 'submitted_to_trial_form',
            description: 'trial form for sequence enrollment',
          },
          'customer': {
            formId: 'ffd80a09-deb0-48ca-97a5-c8f73b06d011',
            action: 'submitted_to_customer_onboarding_form',
            description: 'customer onboarding hidden form',
          },
          'other-not now': {
            formId: '8638c979-ffd7-4c84-8b33-309d2a131e5b',
            action: 'submitted_to_reengage_form',
            description: 'reengage hidden form for sequence enrollment',
          },
        };

        const stageLower = newLifecycleStage?.toLowerCase?.();
        const formConfig = lifecycleFormMap[stageLower];

        if (formConfig) {
          console.log(`Detected ${stageLower} lifecycle stage change - submitting to ${formConfig.description}`);

          try {
            // Get contact details
            const contact = await hubspotService.getContact(objectId);

            if (!contact) {
              console.log('Failed to get contact details');
              results.push({
                contactId: objectId,
                success: false,
                reason: 'Contact not found',
              });
              continue;
            }

            // Extract properties - handle both response formats
            const firstName = contact.properties?.firstname?.value || contact.properties?.firstname || '';
            const lastName = contact.properties?.lastname?.value || contact.properties?.lastname || '';
            const email = contact.properties?.email?.value || contact.properties?.email || '';

            console.log(`Contact properties - Email: ${email}, First: ${firstName}, Last: ${lastName}`);

            if (!email) {
              console.log('Contact has no email address');
              results.push({
                contactId: objectId,
                success: false,
                reason: 'No email address',
              });
              continue;
            }

            // Submit to appropriate form
            await this.submitToHubSpotForm(firstName, lastName, email, formConfig.formId);

            console.log(`Submitted contact ${email} to ${formConfig.description}`);

            results.push({
              contactId: objectId,
              success: true,
              action: formConfig.action,
              email: email,
            });
          } catch (error) {
            console.error(`Error processing ${stageLower} lifecycle change:`, error.message);
            results.push({
              contactId: objectId,
              success: false,
              error: error.message,
            });
          }
        }
      }

      return {
        success: results.length > 0,
        processed: results.length,
        results: results,
      };
    } catch (error) {
      console.error('Error handling HubSpot webhook:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Submit contact to HubSpot form for sequence enrollment
   * Portal ID: 244433136
   * Supports multiple forms for different lifecycle stages:
   * - Trial Form: 5099b1d0-f5d2-474f-8fe6-2b390bbf4adb
   * - Customer Onboarding Form: ffd80a09-deb0-48ca-97a5-c8f73b06d011
   * - Reengage Form: 8638c979-ffd7-4c84-8b33-309d2a131e5b
   */
  async submitToHubSpotForm(firstName, lastName, email, formId) {
    try {
      const axios = require('axios');

      const portalId = '244433136';

      const response = await axios.post(
        `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formId}`,
        {
          fields: [
            {
              name: 'firstname',
              value: firstName,
            },
            {
              name: 'lastname',
              value: lastName,
            },
            {
              name: 'email',
              value: email,
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      console.log(`Form ${formId} submitted for ${email}`);
      return response.data;
    } catch (error) {
      console.error(`Error submitting to form ${formId}:`, error.message);
      throw error;
    }
  }

  /**
   * Submit contact to trial form for sequence enrollment
   * @deprecated Use submitToHubSpotForm instead
   */
  async submitToTrialForm(firstName, lastName, email) {
    return this.submitToHubSpotForm(firstName, lastName, email, '5099b1d0-f5d2-474f-8fe6-2b390bbf4adb');
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
