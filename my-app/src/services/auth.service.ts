import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

const authApi = axios.create({
  baseURL: API_URL,
});

export const loginUser = async (email: string, password: string) => {
  const response = await authApi.post('/auth/login', { email, password });
  return response.data;
};

export const registerUser = async (data: RegisterData) => {
  const response = await authApi.post('/auth/register', data);
  return response.data;
};

export const getMe = async (token: string) => {
  const response = await authApi.get('/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const setAuthToken = (token: string | null) => {
  if (token) {
    authApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete authApi.defaults.headers.common['Authorization'];
  }
};
