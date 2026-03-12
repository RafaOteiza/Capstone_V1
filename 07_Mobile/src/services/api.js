import axios from 'axios';

// NOTA: Para Android Emulator usa 10.0.2.2, para dispositivo físico usa tu IP local (10.10.1.110)
const API_URL = 'http://10.10.1.110:4000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const setAuthToken = (token) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
};

export default api;
