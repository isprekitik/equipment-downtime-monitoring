const API_URL = 'http://localhost:5000/api';

export async function api(path, options = {}) {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      method: options.method || 'GET',

      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },

      ...options,
    });

    let data;

    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      throw new Error(
        data?.message ||
        `Request failed: ${response.status}`
      );
    }

    return data;

  } catch (error) {
    console.error(
      'API ERROR:',
      error
    );

    throw new Error(
      error.message === 'Failed to fetch'
        ? 'Cannot connect to backend server.'
        : error.message
    );
  }
}