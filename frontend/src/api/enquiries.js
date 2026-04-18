import client from './client';

export const enquiriesApi = {
  list:   ()           => client.get('/enquiries').then((r) => r.data),
  create: (data)       => client.post('/enquiries', data).then((r) => r.data),
  update: (id, data)   => client.put(`/enquiries/${id}`, data).then((r) => r.data),
  remove: (id)         => client.delete(`/enquiries/${id}`).then((r) => r.data),
  bulk:   (rows)       => client.post('/enquiries/bulk', rows).then((r) => r.data),
};
