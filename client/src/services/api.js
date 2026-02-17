const API_URL = 'http://localhost:5000/api';

export const apiRequest = async (endpoint, method = 'GET', body = null, token = null) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('Authorization header set with token:', token.substring(0, 20) + '...');
  } else {
    console.warn('No token provided to apiRequest for endpoint:', endpoint);
  }

  console.log('Making request to:', `${API_URL}${endpoint}`, 'with method:', method);

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  // Handle authentication errors
  if (response.status === 401) {
    console.error('Unauthorized - clearing token');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    return;
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