const API_BASE_URL = '/api';

function getToken() {
    return localStorage.getItem('token');
}

function setToken(token) {
    localStorage.setItem('token', token);
}

function removeToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}

function getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

function setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
}

function checkAuth(roleRequired) {
    const token = getToken();
    const user = getUser();

    if (!token || !user) {
        window.location.href = '/login.html';
        return;
    }

    if (roleRequired && user.role !== roleRequired) {
        alert('Akses Ditolak!');
        window.location.href = user.role === 'admin' ? '/admin/dashboard.html' : '/anggota/dashboard.html';
    }
}

function logout() {
    removeToken();
    window.location.href = '/login.html';
}

async function apiFetch(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = getToken();
    console.log(`[API Request] ${options.method || 'GET'} ${url}`, options.body ? JSON.parse(options.body) : '');

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                // Token expired or forbidden
                removeToken();
                window.location.href = '/login.html';
            }
            throw new Error(data.message || 'Terjadi kesalahan');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

function showToast(message, type = 'success') {
    // Simple alert for now, can be replaced with a proper toast component
    // alert(message);
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        const div = document.createElement('div');
        div.id = 'toast-container';
        div.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-2';
        document.body.appendChild(div);
    }
    
    const toast = document.createElement('div');
    toast.className = `px-4 py-2 rounded shadow-lg text-white font-semibold transition-opacity duration-300 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`;
    toast.textContent = message;
    
    document.getElementById('toast-container').appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
