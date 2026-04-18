import client from './client';

export const quotesApi = {
  list:   ()           => client.get('/quotes').then((r) => r.data),
  create: (data)       => client.post('/quotes', data).then((r) => r.data),
  update: (id, data)   => client.put(`/quotes/${id}`, data).then((r) => r.data),
  remove: (id)         => client.delete(`/quotes/${id}`).then((r) => r.data),
};
