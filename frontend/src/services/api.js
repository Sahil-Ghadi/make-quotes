import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  async (config) => {
    // We'll get the token from the auth context when making requests
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const quotesAPI = {
  // Get all quotes (public endpoint)
  getAllQuotes: async () => {
    const response = await api.get('/quotes/all');
    return response.data;
  },

  // Get user's quotes (protected)
  getMyQuotes: async (token) => {
    console.log(token);
    const response = await api.get('/quotes/my', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  // Create a new quote (protected)
  createQuote: async (quoteData, token) => {
    const response = await api.post('/quotes', quoteData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  },

  // Update a quote (protected)
  updateQuote: async (quoteId, quoteData, token) => {
    const response = await api.put(`/quotes/${quoteId}`, quoteData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  },

  // Delete a quote (protected)
  deleteQuote: async (quoteId, token) => {
    const response = await api.delete(`/quotes/${quoteId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },
};


