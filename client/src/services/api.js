// Set REACT_APP_API_URL at build time, e.g. https://your-backend.onrender.com/api
export const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '');

// Backend origin without the trailing /api, used for file links.
const API_ORIGIN = API_URL.replace(/\/api$/, '');

// Turns a stored file path ("/api/files/<id>" or legacy "uploads/x.pdf")
// into an absolute URL on the backend.
export const fileUrl = (path) => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}/${String(path).replace(/\\/g, '/').replace(/^\/+/, '')}`;
};

const handleUnauthorized = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
  return new Error('Your session has expired. Please log in again.');
};

export const apiRequest = async (endpoint, method = 'GET', body = null, token = null) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  // A 401 on a request that carried a token means the session expired.
  // A 401 with no token (e.g. a failed login attempt) is just "wrong
  // credentials" and must fall through to the normal error handling below
  // so the caller gets a real message instead of undefined.
  if (response.status === 401 && token) {
    throw handleUnauthorized();
  }

  // Check if response is JSON
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    console.error('Non-JSON response:', text.substring(0, 200));
    throw new Error(`Server error: Expected JSON but got ${contentType || 'unknown content type'}`);
  }

  const data = await response.json();

  if (!response.ok) {
    console.error('API error:', response.status, data.message);
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

export const uploadRequest = async (endpoint, formData, token = null) => {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: formData,
  });
  if (response.status === 401 && token) throw handleUnauthorized();
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Upload failed');
  return data;
};

export const resetPassword = async (email) => {
  return apiRequest('/auth/forgot-password', 'POST', { email });
};

export const verifyOTP = async (email, otp) => {
  return apiRequest('/auth/verify-otp', 'POST', { email, otp });
};

export const resetNewPassword = async (resetToken, newPassword) => {
  return apiRequest('/auth/reset-password', 'POST', { resetToken, newPassword });
};

export const getDomains = async () => {
  return apiRequest('/users/domains');
};

export const getMe = async (token) => {
  return apiRequest('/users/me', 'GET', null, token);
};

export const updatePreferences = async (preferredDomains, token) => {
  return apiRequest('/users/preferences', 'PUT', { preferredDomains }, token);
};
