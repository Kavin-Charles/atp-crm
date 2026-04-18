import client from './client';

export const usersApi = {
  list:   ()           => client.get('/users').then((r) => r.data),
  create: (data)       => client.post('/users', data).then((r) => r.data),
  update: (id, data)   => client.put(`/users/${id}`, data).then((r) => r.data),
  remove: (id)         => client.delete(`/users/${id}`).then((r) => r.data),
};
