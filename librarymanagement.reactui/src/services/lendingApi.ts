import axios from 'axios';
export const lendingApi   = axios.create({ baseURL: 'http://localhost:5000/api' });
