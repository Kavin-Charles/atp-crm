import client from './client';

export const authApi = {
  login:          (data) => client.post('/auth/login', data).then((r) => r.data),
  logout:         ()     => client.post('/auth/logout').then((r) => r.data),
  me:             ()     => client.get('/auth/me').then((r) => r.data),
  changePassword: (data) => client.put('/auth/change-password', data).then((r) => r.data),
};
