const axios = require('axios');
const config = require('./config');

class HubSpotService {
  constructor() {
    this.client = axios.create({
      baseURL: config.hubspot.apiUrl,
      headers: {
        'Authorization': `Bearer ${config.hubspot.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
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

      const response = await this.client.patch(`/crm/v3/objects/contacts/${contactId}`, {
        properties: updateProps,
      });
      console.log(`HubSpot: Updated contact ${contactId}`);
      return response.data;
    } catch (error) {
      console.error('HubSpot: Error updating contact:', error.message);
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
   */
  async createTask(contactId, taskContent, dueDate = null) {
    try {
      const properties = {
        hs_task_body: taskContent,
        hs_task_subject: `Follow up: ${taskContent.substring(0, 50)}`,
        hs_task_status: 'NOT_STARTED',
        hs_task_priority: 'MEDIUM',
      };

      if (dueDate) {
        properties.hs_timestamp = new Date(dueDate).getTime();
      }

      const taskResponse = await this.client.post('/crm/v3/objects/tasks', {
        properties,
      });

      const taskId = taskResponse.data.id;

      // Associate task with contact
      await this.client.put(
        `/crm/v3/objects/tasks/${taskId}/associations/contacts/${contactId}/task_to_contact`
      );

      console.log(`HubSpot: Created task for contact ${contactId}`);
      return taskResponse.data;
    } catch (error) {
      console.error('HubSpot: Error creating task:', error.message);
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
   * Get webhooks (subscriptions)
   */
  async getWebhooks() {
    try {
      // HubSpot webhooks are managed via app settings, not API
      // This is a placeholder - webhooks are configured in HubSpot developer portal
      console.log('HubSpot: Webhooks are configured in HubSpot Developer Portal');
      return [];
    } catch (error) {
      console.error('HubSpot: Error getting webhooks:', error.message);
      return [];
    }
  }
}

module.exports = new HubSpotService();
