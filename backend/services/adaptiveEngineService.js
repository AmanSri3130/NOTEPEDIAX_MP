const getEngineConfiguration = () => {
  const baseUrl = process.env.ADAPTIVE_ENGINE_URL?.trim();
  const apiKey = process.env.ADAPTIVE_ENGINE_API_KEY?.trim();

  if (!baseUrl || !apiKey) {
    const error = new Error(
      'Adaptive learning is not configured. Set ADAPTIVE_ENGINE_URL and ADAPTIVE_ENGINE_API_KEY on the backend.'
    );
    error.statusCode = 503;
    throw error;
  }

  return { baseUrl: baseUrl.replace(/\/+$/, ''), apiKey };
};

export const requestAdaptiveEngine = async (path, { method = 'GET', body } = {}) => {
  const { baseUrl, apiKey } = getEngineConfiguration();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      signal: controller.signal,
      headers: {
        'X-Engine-API-Key': apiKey,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    let result;
    try {
      result = await response.json();
    } catch {
      throw Object.assign(
        new Error('Adaptive learning engine returned an invalid response.'),
        { statusCode: 502 }
      );
    }

    if (!response.ok) {
      throw Object.assign(
        new Error(result?.detail || result?.message || 'Adaptive learning engine request failed.'),
        { statusCode: response.status }
      );
    }

    return result;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw Object.assign(new Error('Adaptive learning engine request timed out.'), {
        statusCode: 504,
      });
    }
    if (error.statusCode) throw error;
    throw Object.assign(new Error('Adaptive learning engine is unavailable.'), {
      statusCode: 503,
      cause: error,
    });
  } finally {
    clearTimeout(timeout);
  }
};

export const ensureAdaptiveStudent = async (user) => {
  const studentId = user?._id?.toString();
  if (!studentId) {
    throw Object.assign(new Error('Authenticated Elite student ID is missing.'), {
      statusCode: 401,
    });
  }
  return studentId;
};
