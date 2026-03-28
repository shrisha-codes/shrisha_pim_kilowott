import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.error || err.message || 'Something went wrong';
    return Promise.reject(new Error(msg));
  }
);

export const productApi = {
  getAll: (params) => api.get('/products', { params }).then((r) => r.data),
  getOne: (id) => api.get(`/products/${id}`).then((r) => r.data),
  create: (data) => api.post('/products', data).then((r) => r.data),
  update: (id, data) => api.put(`/products/${id}`, data).then((r) => r.data),
  delete: (id) => api.delete(`/products/${id}`).then((r) => r.data),
};

export const syncApi = {
  pull: () => api.post('/sync/pull').then((r) => r.data),
  push: (id) => api.post(`/sync/push/${id}`).then((r) => r.data),
  pushAll: () => api.post('/sync/push-all').then((r) => r.data),
};
