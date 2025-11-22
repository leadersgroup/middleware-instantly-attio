const axios = require('axios');
const config = require('./config');

class AttioService {
  constructor() {
    this.client = axios.create({
      baseURL: config.attio.apiUrl,
      headers: {
        'Authorization': `Bearer ${config.attio.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
  }

  /**
   * Find person by email
   */
  async findPersonByEmail(email) {
    try {
      const response = await this.client.post('/objects/people/records/query', {
        filter: {
          email_addresses: email,
        },
        limit: 1,
      });
      return response.data.data?.[0] || null;
    } catch (error) {
      console.error('Attio: Error finding person:', error.message);
      if (error.response?.data) {
        console.error('Attio API error details:', JSON.stringify(error.response.data));
      }
      return null;
    }
  }

  /**
   * Create or update person in Attio
   */
  async upsertPerson(personData) {
    try {
      const payload = {
        data: {
          values: {
            email_addresses: personData.email,
          },
        },
      };

      // Add optional fields - use Attio's name format
      if (personData.firstName || personData.lastName) {
        payload.data.values.name = [{
          first_name: personData.firstName || '',
          last_name: personData.lastName || '',
          full_name: `${personData.firstName || ''} ${personData.lastName || ''}`.trim(),
        }];
      }

      // Use assert endpoint for upsert behavior
      const response = await this.client.put('/objects/people/records', {
        data: {
          values: payload.data.values,
        },
        matching_attribute: 'email_addresses',
      });

      console.log(`Attio: Upserted person ${personData.email}`);
      return response.data;
    } catch (error) {
      // If assert fails, try creating
      if (error.response?.status === 404 || error.response?.status === 400) {
        return await this.createPerson(personData);
      }
      console.error('Attio: Error upserting person:', error.message);
      throw error;
    }
  }

  /**
   * Create person in Attio
   */
  async createPerson(personData) {
    try {
      const payload = {
        data: {
          values: {
            email_addresses: personData.email,
          },
        },
      };

      if (personData.firstName || personData.lastName) {
        payload.data.values.name = [{
          first_name: personData.firstName || '',
          last_name: personData.lastName || '',
          full_name: `${personData.firstName || ''} ${personData.lastName || ''}`.trim(),
        }];
      }

      const response = await this.client.post('/objects/people/records', payload);
      console.log(`Attio: Created person ${personData.email}`);
      return response.data;
    } catch (error) {
      console.error('Attio: Error creating person:', error.message);
      if (error.response?.data) {
        console.error('Attio API error details:', JSON.stringify(error.response.data));
      }
      throw error;
    }
  }

  /**
   * Update person attributes
   */
  async updatePerson(recordId, attributes) {
    try {
      const response = await this.client.patch(`/objects/people/records/${recordId}`, {
        data: {
          values: attributes,
        },
      });
      console.log(`Attio: Updated person ${recordId}`);
      return response.data;
    } catch (error) {
      console.error('Attio: Error updating person:', error.message);
      throw error;
    }
  }

  /**
   * Create a note/activity for a person
   */
  async createNote(recordId, noteContent, eventType = null) {
    try {
      const response = await this.client.post('/notes', {
        data: {
          parent_object: 'people',
          parent_record_id: recordId,
          title: eventType ? `Instantly: ${eventType}` : 'Instantly Event',
          content: noteContent,
        },
      });
      console.log(`Attio: Created note for record ${recordId}`);
      return response.data;
    } catch (error) {
      console.error('Attio: Error creating note:', error.message);
      // Don't throw - notes are supplementary
      return null;
    }
  }

  /**
   * Create a task for follow-up
   */
  async createTask(recordId, taskContent, dueDate = null) {
    try {
      const payload = {
        data: {
          content: taskContent,
          linked_records: [{
            target_object: 'people',
            target_record_id: recordId,
          }],
        },
      };

      if (dueDate) {
        payload.data.deadline_at = dueDate;
      }

      const response = await this.client.post('/tasks', payload);
      console.log(`Attio: Created task for record ${recordId}`);
      return response.data;
    } catch (error) {
      console.error('Attio: Error creating task:', error.message);
      return null;
    }
  }

  /**
   * Find company by name or domain
   */
  async findCompany(query) {
    try {
      const response = await this.client.post('/objects/companies/records/query', {
        filter: {
          name: {
            contains: query,
          },
        },
        limit: 1,
      });
      return response.data.data?.[0] || null;
    } catch (error) {
      console.error('Attio: Error finding company:', error.message);
      return null;
    }
  }

  /**
   * Link person to company
   */
  async linkPersonToCompany(personRecordId, companyRecordId) {
    try {
      // This depends on your Attio workspace setup
      // You may need to adjust based on your relationship configuration
      const response = await this.client.post('/relationships', {
        data: {
          from_record: {
            object: 'people',
            record_id: personRecordId,
          },
          to_record: {
            object: 'companies',
            record_id: companyRecordId,
          },
        },
      });
      console.log(`Attio: Linked person ${personRecordId} to company ${companyRecordId}`);
      return response.data;
    } catch (error) {
      console.error('Attio: Error linking person to company:', error.message);
      return null;
    }
  }

  /**
   * Get person record by ID
   */
  async getPersonById(recordId) {
    try {
      const response = await this.client.get(`/objects/people/records/${recordId}`);
      return response.data;
    } catch (error) {
      console.error('Attio: Error getting person by ID:', error.message);
      return null;
    }
  }

  /**
   * Get webhook subscriptions
   */
  async getWebhooks() {
    try {
      const response = await this.client.get('/webhooks');
      return response.data.data || [];
    } catch (error) {
      console.error('Attio: Error getting webhooks:', error.message);
      return [];
    }
  }

  /**
   * Create webhook subscription
   */
  async createWebhook(targetUrl, events) {
    try {
      const response = await this.client.post('/webhooks', {
        data: {
          target_url: targetUrl,
          subscriptions: events.map(event => ({
            event_type: event,
            filter: {},
          })),
        },
      });
      console.log(`Attio: Created webhook subscription`);
      return response.data;
    } catch (error) {
      console.error('Attio: Error creating webhook:', error.message);
      throw error;
    }
  }
}

module.exports = new AttioService();
