import client from './client';

export const dataApi = {
  collections:    ()           => client.get('/data/collections').then((r) => r.data),
  collection:     (name)       => client.get(`/data/${name}`).then((r) => r.data),
};
