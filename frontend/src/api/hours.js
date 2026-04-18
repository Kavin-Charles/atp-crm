import client from './client';

export const hoursApi = {
  list:   ()           => client.get('/hours').then((r) => r.data),
  create: (data)       => client.post('/hours', data).then((r) => r.data),
  update: (id, data)   => client.put(`/hours/${id}`, data).then((r) => r.data),
  remove: (id)         => client.delete(`/hours/${id}`).then((r) => r.data),
};
