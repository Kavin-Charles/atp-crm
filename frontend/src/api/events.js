import client from './client';
export const eventsApi = {
  list:   ()        => client.get('/events').then(r => r.data),
  create: (data)    => client.post('/events', data).then(r => r.data),
  update: (id, data)=> client.put(`/events/${id}`, data).then(r => r.data),
  remove: (id)      => client.delete(`/events/${id}`).then(r => r.data),
};
