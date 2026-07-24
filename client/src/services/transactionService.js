import API from '../utils/axios';

export const transactionService = {
  getAll(params) {
    return API.get('/transactions', { params });
  },

  getStats(params) {
    return API.get('/transactions/stats', { params });
  },

  create(data) {
    return API.post('/transactions', data);
  },

  update(id, data) {
    return API.put(`/transactions/${id}`, data);
  },

  delete(id) {
    return API.delete(`/transactions/${id}`);
  },

  exportCSV(params) {
    return API.get('/transactions/export/csv', {
      params,
      responseType: 'blob',
    });
  },
};

