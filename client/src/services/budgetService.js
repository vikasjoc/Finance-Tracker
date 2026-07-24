import API from '../utils/axios';

export const budgetService = {
  getAll(params) {
    return API.get('/budgets', { params });
  },

  getSummary() {
    return API.get('/budgets/summary');
  },

  create(data) {
    return API.post('/budgets', data);
  },

  update(id, data) {
    return API.put(`/budgets/${id}`, data);
  },

  delete(id) {
    return API.delete(`/budgets/${id}`);
  },
};

