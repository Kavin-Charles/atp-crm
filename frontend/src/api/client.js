import axios from 'axios';

const client = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !err.config?.url?.includes('/auth/me')) {
      window.location.href = '/login';
    }
    return Promise.reject(err.response?.data?.error || err.message || 'Request failed');
  }
);

export default client;
