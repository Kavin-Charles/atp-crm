import client from './client';
export const tasksApi = {
  list:   ()        => client.get('/tasks').then(r => r.data),
  create: (data)    => client.post('/tasks', data).then(r => r.data),
  update: (id, data)=> client.put(`/tasks/${id}`, data).then(r => r.data),
  remove: (id)      => client.delete(`/tasks/${id}`).then(r => r.data),
};
