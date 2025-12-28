const axios = require('axios');
const config = require('./config');

class HubSpotService {
  constructor() {
    const apiKey = config.hubspot.apiKey;
    const isPrivateAppToken = apiKey && apiKey.startsWith('pat-');

    // Configure axios based on authentication type
    const axiosConfig = {
      baseURL: config.hubspot.apiUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    };

    if (isPrivateAppToken) {
      // Private App token uses Bearer auth
      axiosConfig.headers['Authorization'] = `Bearer ${apiKey}`;
    } else {
      // Developer API key uses query parameter
      axiosConfig.params = { hapikey: apiKey };
    }

    this.client = axios.create(axiosConfig);
  }

  /**
   * Find contact by email
   */
  async findContactByEmail(email) {
    try {
      const response = await this.client.post('/crm/v3/objects/contacts/search', {
        filterGroups: [{
          filters: [{
            propertyName: 'email',
            operator: 'EQ',
            value: email,
          }],
        }],
        limit: 1,
      });
      return response.data.results?.[0] || null;
    } catch (error) {
      console.error('HubSpot: Error finding contact:', error.message);
      if (error.response?.data) {
        console.error('HubSpot API error details:', JSON.stringify(error.response.data));
      }
      return null;
    }
  }

  /**
   * Get lifecycle stage value by enum ID
   * HubSpot webhooks send enum IDs, we need to map them to actual values
   */
  async getPropertyEnumValue(propertyName, enumId) {
    try {
      const response = await this.client.get(`/crm/v3/properties/contacts/${propertyName}`);
      const options = response.data.options || [];
      const option = options.find(o => o.value === enumId);
      return option?.label || enumId;
    } catch (error) {
      console.error(`HubSpot: Error getting enum value for ${propertyName}:`, error.message);
      return enumId;
    }
  }

  /**
   * Get contact by ID
   */
  async getContact(contactId) {
    try {
      // Fetch contact with specific properties we need
      const response = await this.client.get(`/crm/v3/objects/contacts/${contactId}`, {
        params: {
          properties: ['firstname', 'lastname', 'email', 'lifecyclestage'],
          limit: 100,
        },
      });
      return response.data || null;
    } catch (error) {
      console.error('HubSpot: Error getting contact:', error.message);
      if (error.response?.data) {
        console.error('HubSpot API error details:', JSON.stringify(error.response.data));
      }
      return null;
    }
  }

  /**
   * Check if contact is enrolled in any HubSpot sequence
   */
  async isContactEnrolledInSequence(contactId) {
    try {
      // Get contact's hs_sequence_ids property which lists enrolled sequences
      const response = await this.client.get(`/crm/v3/objects/contacts/${contactId}`, {
        params: {
          properties: ['hs_sequence_ids'],
        },
      });

      const sequenceIds = response.data?.properties?.hs_sequence_ids?.value;
      const isEnrolled = sequenceIds && Array.isArray(sequenceIds) && sequenceIds.length > 0;

      console.log(`Contact enrollment check - ID: ${contactId}, Enrolled: ${isEnrolled}, Sequences: ${sequenceIds || 'none'}`);
      return isEnrolled;
    } catch (error) {
      console.error('HubSpot: Error checking contact enrollment:', error.message);
      // Default to false on error (assume not enrolled)
      return false;
    }
  }

  /**
   * Create or update contact in HubSpot
   */
  async upsertContact(contactData) {
    try {
      // First try to find existing contact
      const existing = await this.findContactByEmail(contactData.email);

      if (existing) {
        // Update existing contact
        return await this.updateContact(existing.id, contactData);
      } else {
        // Create new contact
        return await this.createContact(contactData);
      }
    } catch (error) {
      console.error('HubSpot: Error upserting contact:', error.message);
      throw error;
    }
  }

  /**
   * Create contact in HubSpot
   */
  async createContact(contactData) {
    try {
      const properties = {
        email: contactData.email,
        hs_marketable_status: 'Marketing contact',
      };

      if (contactData.firstName) {
        properties.firstname = contactData.firstName;
      }
      if (contactData.lastName) {
        properties.lastname = contactData.lastName;
      }
      if (contactData.phone) {
        properties.phone = contactData.phone;
      }
      if (contactData.company) {
        properties.company = contactData.company;
      }
      if (contactData.ownerId) {
        properties.hubspot_owner_id = contactData.ownerId;
      }

      const response = await this.client.post('/crm/v3/objects/contacts', {
        properties,
      });
      console.log(`HubSpot: Created contact ${contactData.email}`);
      return response.data;
    } catch (error) {
      console.error('HubSpot: Error creating contact:', error.message);
      if (error.response?.data) {
        console.error('HubSpot API error details:', JSON.stringify(error.response.data));
      }
      throw error;
    }
  }

  /**
   * Update contact properties
   */
  async updateContact(contactId, properties) {
    try {
      const updateProps = {};

      if (properties.firstName) updateProps.firstname = properties.firstName;
      if (properties.lastName) updateProps.lastname = properties.lastName;
      if (properties.phone) updateProps.phone = properties.phone;
      if (properties.company) updateProps.company = properties.company;
      if (properties.leadStatus) updateProps.hs_lead_status = properties.leadStatus;
      if (properties.lifecyclestage) updateProps.lifecyclestage = properties.lifecyclestage;
      if (properties.ownerId) updateProps.hubspot_owner_id = properties.ownerId;
      // Marketing source tracking
      if (properties.lead_source_name) {
        updateProps.lead_source_name = properties.lead_source_name;
      }
      if (properties.lead_source_type) {
        updateProps.lead_source_type = properties.lead_source_type;
      }

      const response = await this.client.patch(`/crm/v3/objects/contacts/${contactId}`, {
        properties: updateProps,
      });
      console.log(`HubSpot: Updated contact ${contactId}`);
      return response.data;
    } catch (error) {
      console.error('HubSpot: Error updating contact:', error.message);
      if (error.response?.data) {
        console.error('HubSpot API error details:', JSON.stringify(error.response.data));
      }
      throw error;
    }
  }

  /**
   * Create engagement (note) for a contact
   */
  async createNote(contactId, noteContent, eventType = null) {
    try {
      // Create the note
      const noteResponse = await this.client.post('/crm/v3/objects/notes', {
        properties: {
          hs_note_body: noteContent,
          hs_timestamp: Date.now(),
        },
      });

      const noteId = noteResponse.data.id;

      // Associate note with contact
      await this.client.put(
        `/crm/v3/objects/notes/${noteId}/associations/contacts/${contactId}/note_to_contact`
      );

      console.log(`HubSpot: Created note for contact ${contactId}`);
      return noteResponse.data;
    } catch (error) {
      console.error('HubSpot: Error creating note:', error.message);
      // Don't throw - notes are supplementary
      return null;
    }
  }

  /**
   * Create task for follow-up
   * @param {string} contactId - HubSpot contact ID
   * @param {string} taskSubjectOrContent - Task subject (or content for backwards compatibility)
   * @param {string} taskBodyOrDueDate - Task body (or due date for backwards compatibility)
   * @param {string} dueDate - Due date ISO string (optional)
   * @param {string} ownerId - HubSpot owner ID (optional)
   */
  async createTask(contactId, taskSubjectOrContent, taskBodyOrDueDate = null, dueDate = null, ownerId = null) {
    try {
      let subject, body, due;

      // Handle backwards compatibility: old signature was (contactId, content, dueDate)
      if (dueDate === null && taskBodyOrDueDate && !taskBodyOrDueDate.includes('\n') &&
          (taskBodyOrDueDate.includes('T') || taskBodyOrDueDate.includes('Z'))) {
        // Old signature: taskBodyOrDueDate is a date
        subject = `Follow up: ${taskSubjectOrContent.substring(0, 50)}`;
        body = taskSubjectOrContent;
        due = taskBodyOrDueDate;
      } else {
        // New signature: (contactId, subject, body, dueDate, ownerId)
        subject = taskSubjectOrContent;
        body = taskBodyOrDueDate || '';
        due = dueDate;
      }

      const properties = {
        hs_task_subject: subject,
        hs_task_body: body,
        hs_task_status: 'NOT_STARTED',
        hs_task_priority: subject.includes('🔥') || subject.includes('HOT') ? 'HIGH' : 'MEDIUM',
      };

      if (due) {
        properties.hs_timestamp = new Date(due).getTime();
      }

      if (ownerId) {
        properties.hubspot_owner_id = ownerId;
      }

      const taskResponse = await this.client.post('/crm/v3/objects/tasks', {
        properties,
      });

      const taskId = taskResponse.data.id;

      // Associate task with contact
      await this.client.put(
        `/crm/v3/objects/tasks/${taskId}/associations/contacts/${contactId}/task_to_contact`
      );

      console.log(`HubSpot: Created task for contact ${contactId}: ${subject.substring(0, 50)}`);
      return taskResponse.data;
    } catch (error) {
      console.error('HubSpot: Error creating task:', error.message);
      if (error.response?.data) {
        console.error('HubSpot API error details:', JSON.stringify(error.response.data));
      }
      return null;
    }
  }

  /**
   * Get contact by ID
   */
  async getContactById(contactId) {
    try {
      const response = await this.client.get(`/crm/v3/objects/contacts/${contactId}`, {
        params: {
          properties: 'email,firstname,lastname,phone,company,hs_lead_status',
        },
      });
      return response.data;
    } catch (error) {
      console.error('HubSpot: Error getting contact by ID:', error.message);
      return null;
    }
  }

  /**
   * Find company by name or domain
   */
  async findCompany(query) {
    try {
      const response = await this.client.post('/crm/v3/objects/companies/search', {
        filterGroups: [{
          filters: [{
            propertyName: 'name',
            operator: 'CONTAINS_TOKEN',
            value: query,
          }],
        }],
        limit: 1,
      });
      return response.data.results?.[0] || null;
    } catch (error) {
      console.error('HubSpot: Error finding company:', error.message);
      return null;
    }
  }

  /**
   * Associate contact with company
   */
  async linkContactToCompany(contactId, companyId) {
    try {
      await this.client.put(
        `/crm/v3/objects/contacts/${contactId}/associations/companies/${companyId}/contact_to_company`
      );
      console.log(`HubSpot: Linked contact ${contactId} to company ${companyId}`);
      return true;
    } catch (error) {
      console.error('HubSpot: Error linking contact to company:', error.message);
      return false;
    }
  }

  /**
   * Update lead status
   */
  async updateLeadStatus(email, status) {
    try {
      const contact = await this.findContactByEmail(email);
      if (!contact) {
        console.log(`HubSpot: Contact not found for ${email}`);
        return null;
      }

      return await this.updateContact(contact.id, { leadStatus: status });
    } catch (error) {
      console.error('HubSpot: Error updating lead status:', error.message);
      return null;
    }
  }

  /**
   * Enroll contact in a sequence
   * @param {string} contactId - HubSpot contact ID
   * @param {string} sequenceId - HubSpot sequence ID
   */
  async enrollInSequence(contactId, sequenceId) {
    try {
      const response = await this.client.put(
        `/crm/v3/objects/contacts/${contactId}/associations/sequences/${sequenceId}/contact_to_sequence`
      );
      console.log(`HubSpot: Enrolled contact ${contactId} in sequence ${sequenceId}`);
      return response.data;
    } catch (error) {
      console.error('HubSpot: Error enrolling contact in sequence:', error.message);
      if (error.response?.data) {
        console.error('HubSpot API error details:', JSON.stringify(error.response.data));
      }
      return null;
    }
  }

  /**
   * Unenroll contact from a sequence
   * @param {string} contactId - HubSpot contact ID
   * @param {string} sequenceId - HubSpot sequence ID
   */
  async unenrollFromSequence(contactId, sequenceId) {
    try {
      const response = await this.client.delete(
        `/crm/v3/objects/contacts/${contactId}/associations/sequences/${sequenceId}/contact_to_sequence`
      );
      console.log(`HubSpot: Unenrolled contact ${contactId} from sequence ${sequenceId}`);
      return response.data;
    } catch (error) {
      console.error('HubSpot: Error unenrolling contact from sequence:', error.message);
      if (error.response?.data) {
        console.error('HubSpot API error details:', JSON.stringify(error.response.data));
      }
      return null;
    }
  }

  /**
   * Get all sequences
   */
  async getSequences() {
    try {
      const response = await this.client.get('/crm/v3/objects/sequences', {
        params: {
          limit: 100,
        },
      });
      return response.data.results || [];
    } catch (error) {
      console.error('HubSpot: Error getting sequences:', error.message);
      return [];
    }
  }

  /**
   * Get webhooks (subscriptions)
   */
  async getWebhooks() {
    try {
      const response = await this.client.get('/crm/v3/extensions/webhooks/subscriptions');
      return response.data.results || [];
    } catch (error) {
      console.error('HubSpot: Error getting webhooks:', error.message);
      if (error.response?.data) {
        console.error('HubSpot API error details:', JSON.stringify(error.response.data));
      }
      return [];
    }
  }

  /**
   * Register webhook endpoint and create subscription for lifecycle stage changes
   * @param {string} webhookUrl - Full URL to receive webhooks (e.g., https://your-server.com/webhook/hubspot)
   */
  async registerWebhookSubscription(webhookUrl) {
    try {
      console.log(`HubSpot: Registering webhook subscription at ${webhookUrl}`);

      // First, set the webhook target URL
      const targetResponse = await this.client.put(
        '/crm/v3/extensions/webhooks/settings',
        {
          targetUrl: webhookUrl,
        }
      );
      console.log('HubSpot: Webhook target URL registered');

      // Then, subscribe to contact property change events for lifecyclestage
      const subscriptionResponse = await this.client.post(
        '/crm/v3/extensions/webhooks/subscriptions',
        {
          subscriptionDetails: {
            subscriptionUrl: webhookUrl,
            throttling: {
              maxConcurrentRequests: 10,
            },
          },
          eventTypes: [
            'contact.propertyChange',
          ],
          propertyName: 'lifecyclestage',
        }
      );

      console.log(`HubSpot: Webhook subscription created for lifecyclestage changes`);
      return subscriptionResponse.data;
    } catch (error) {
      console.error('HubSpot: Error registering webhook subscription:', error.message);
      if (error.response?.data) {
        console.error('HubSpot API error details:', JSON.stringify(error.response.data));
      }
      throw error;
    }
  }

  /**
   * Delete a webhook subscription
   * @param {string} subscriptionId - HubSpot subscription ID
   */
  async deleteWebhookSubscription(subscriptionId) {
    try {
      await this.client.delete(`/crm/v3/extensions/webhooks/subscriptions/${subscriptionId}`);
      console.log(`HubSpot: Webhook subscription ${subscriptionId} deleted`);
      return { success: true };
    } catch (error) {
      console.error('HubSpot: Error deleting webhook subscription:', error.message);
      if (error.response?.data) {
        console.error('HubSpot API error details:', JSON.stringify(error.response.data));
      }
      throw error;
    }
  }
}

module.exports = new HubSpotService();
