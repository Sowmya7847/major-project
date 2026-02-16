import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api', // Backend URL
});

// Add token to requests
API.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default API;
