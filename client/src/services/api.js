import axios from 'axios';

// Point to API Gateway (Port 4000) instead of Backend (5000)
// The gateway proxies /api requests to the backend
const API = axios.create({
    baseURL: 'http://localhost:4000/api',
});

API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token && token !== 'undefined' && token !== 'null') {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export default API;
