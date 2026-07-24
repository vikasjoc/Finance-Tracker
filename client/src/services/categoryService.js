import API from '../utils/axios';

export const categoryService = {
  getAll() {
    return API.get('/categories');
  },

  create(data) {
    return API.post('/categories', data);
  },

  update(id, data) {
    return API.put(`/categories/${id}`, data);
  },

  delete(id) {
    return API.delete(`/categories/${id}`);
  },
};

