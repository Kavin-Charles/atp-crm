import client from './client';

export const attendanceApi = {
  getCurrent: () => client.get('/attendance/current').then(r => r.data),
  list: (params) => client.get('/attendance', { params }).then(r => r.data),
};
