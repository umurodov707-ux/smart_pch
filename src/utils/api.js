/**
 * MARKAZLASHGAN API MIJOZI
 * Har bir sahifada getAuthHeaders() ni takrorlash o'rniga shu yerdan foydalaniladi.
 * - JWT tokenni avtomatik biriktiradi
 * - CSRF uchun X-Requested-With qo'shadi
 * - 401 kelganda sessiyani tozalab, login sahifasiga qaytaradi
 * - Xatolarni bir xil formatga keltiradi
 */

export class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

function getToken() {
  return localStorage.getItem('jwtToken');
}

function handleUnauthorized() {
  localStorage.removeItem('jwtToken');
  localStorage.removeItem('currentUser');
  if (window.location.pathname !== '/login') {
    window.location.assign('/login');
  }
}

async function request(path, { method = 'GET', body, headers = {}, signal } = {}) {
  const token = getToken();

  const finalHeaders = {
    'X-Requested-With': 'XMLHttpRequest',
    ...headers,
  };

  let payload;
  if (body instanceof FormData) {
    payload = body; // Content-Type'ni brauzer o'zi qo'yadi (boundary bilan)
  } else if (body !== undefined) {
    finalHeaders['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  if (token) finalHeaders['Authorization'] = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(path, { method, headers: finalHeaders, body: payload, signal });
  } catch (e) {
    if (e.name === 'AbortError') throw e;
    throw new ApiError('Server bilan bog‘lanib bo‘lmadi', 0, null);
  }

  if (response.status === 401) {
    handleUnauthorized();
    throw new ApiError('Sessiya tugadi, qayta kiring', 401, null);
  }

  // 204 No Content
  if (response.status === 204) return null;

  const contentType = response.headers.get('content-type') || '';
  let data = null;
  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch (e) {
      data = null;
    }
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const message =
      (data && typeof data === 'object' && data.message) ||
      (typeof data === 'string' && data.slice(0, 200)) ||
      `Xatolik (${response.status})`;
    throw new ApiError(message, response.status, data);
  }

  return data;
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
  delete: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
};

export default api;
