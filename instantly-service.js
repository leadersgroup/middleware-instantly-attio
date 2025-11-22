const axios = require('axios');
const config = require('./config');

class InstantlyService {
  constructor() {
    this.client = axios.create({
      baseURL: config.instantly.apiUrl,
      headers: {
        'Authorization': `Bearer ${config.instantly.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
  }

  /**
   * Get lead by email
   */
  async getLeadByEmail(email) {
    try {
      const response = await this.client.get('/leads', {
        params: { email, limit: 1 }
      });
      return response.data.items?.[0] || null;
    } catch (error) {
      console.error('Instantly: Error getting lead:', error.message);
      return null;
    }
  }

  /**
   * Update lead status in Instantly
   */
  async updateLeadStatus(email, status, campaignId = null) {
    try {
      const payload = {
        email,
        status,
      };

      if (campaignId) {
        payload.campaign_id = campaignId;
      }

      const response = await this.client.post('/leads/status', payload);
      console.log(`Instantly: Updated lead ${email} to status: ${status}`);
      return response.data;
    } catch (error) {
      console.error('Instantly: Error updating lead status:', error.message);
      throw error;
    }
  }

  /**
   * Add lead to campaign
   */
  async addLeadToCampaign(campaignId, leadData) {
    try {
      const payload = {
        campaign_id: campaignId,
        leads: [{
          email: leadData.email,
          first_name: leadData.firstName || '',
          last_name: leadData.lastName || '',
          company_name: leadData.company || '',
          custom_variables: leadData.customVariables || {},
        }],
      };

      const response = await this.client.post('/leads', payload);
      console.log(`Instantly: Added lead ${leadData.email} to campaign ${campaignId}`);
      return response.data;
    } catch (error) {
      console.error('Instantly: Error adding lead:', error.message);
      throw error;
    }
  }

  /**
   * Get all campaigns
   */
  async getCampaigns() {
    try {
      const response = await this.client.get('/campaigns');
      return response.data.items || [];
    } catch (error) {
      console.error('Instantly: Error getting campaigns:', error.message);
      return [];
    }
  }

  /**
   * Get campaign by ID
   */
  async getCampaign(campaignId) {
    try {
      const response = await this.client.get(`/campaigns/${campaignId}`);
      return response.data;
    } catch (error) {
      console.error('Instantly: Error getting campaign:', error.message);
      return null;
    }
  }

  /**
   * Pause lead in campaign
   */
  async pauseLead(email, campaignId) {
    try {
      const response = await this.client.post('/leads/pause', {
        email,
        campaign_id: campaignId,
      });
      console.log(`Instantly: Paused lead ${email} in campaign ${campaignId}`);
      return response.data;
    } catch (error) {
      console.error('Instantly: Error pausing lead:', error.message);
      throw error;
    }
  }

  /**
   * Resume lead in campaign
   */
  async resumeLead(email, campaignId) {
    try {
      const response = await this.client.post('/leads/resume', {
        email,
        campaign_id: campaignId,
      });
      console.log(`Instantly: Resumed lead ${email} in campaign ${campaignId}`);
      return response.data;
    } catch (error) {
      console.error('Instantly: Error resuming lead:', error.message);
      throw error;
    }
  }

  /**
   * Delete lead from campaign
   */
  async deleteLead(email, campaignId) {
    try {
      const response = await this.client.delete('/leads', {
        data: {
          email,
          campaign_id: campaignId,
        }
      });
      console.log(`Instantly: Deleted lead ${email} from campaign ${campaignId}`);
      return response.data;
    } catch (error) {
      console.error('Instantly: Error deleting lead:', error.message);
      throw error;
    }
  }
}

module.exports = new InstantlyService();
