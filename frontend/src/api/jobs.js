import client from './client';

export const jobsApi = {
  list:   ()           => client.get('/jobs').then((r) => r.data),
  create: (data)       => client.post('/jobs', data).then((r) => r.data),
  update: (id, data)   => client.put(`/jobs/${id}`, data).then((r) => r.data),
  remove: (id)         => client.delete(`/jobs/${id}`).then((r) => r.data),
  bulk:   (rows)       => client.post('/jobs/bulk', rows).then((r) => r.data),
};
