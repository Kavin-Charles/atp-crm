import client from './client';

export const statsApi = {
  get: () => client.get('/stats').then((r) => r.data),
};
