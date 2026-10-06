import Groq from 'groq-sdk';
import { LIMITS } from './config';

let client = null;

/** Lazily creates the Groq client. The key is read from the server env only. */
export function getGroq() {
  if (!process.env.GROQ_API_KEY) return null;
  if (!client) {
    client = new Groq({
      apiKey: process.env.GROQ_API_KEY,
      timeout: LIMITS.requestTimeoutMs,
      maxRetries: 0, // we do our own single retry with backoff below
    });
  }
  return client;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function isRetryable(err) {
  const s = err?.status;
  return s === 429 || (typeof s === 'number' && s >= 500) || err?.name === 'APIConnectionError';
}

/**
 * Opens a streaming completion. Retries ONCE (with backoff) on 429 / 5xx /
 * connection failures. Retrying is only safe here because nothing has been
 * sent to the client yet when `create` rejects.
 */
export async function createStreamWithRetry(groq, params, signal) {
  try {
    return await groq.chat.completions.create(params, { signal });
  } catch (err) {
    if (signal?.aborted || !isRetryable(err)) throw err;
    const retryAfter = Number(err?.headers?.['retry-after']);
    const delay = Math.min(Number.isFinite(retryAfter) ? retryAfter * 1000 : 900, 3000);
    await sleep(delay);
    return groq.chat.completions.create(params, { signal });
  }
}

/** Maps any SDK/network error to a clean, user-facing response. Never leaks details. */
export function toUserError(err) {
  const status = err?.status;
  if (status === 401 || status === 403) {
    return { status: 500, code: 'config', message: 'The AI service is not configured correctly. Please contact support.' };
  }
  if (status === 429) {
    return { status: 429, code: 'busy', message: 'Server is busy, please try again in a few seconds.' };
  }
  if (err?.name === 'APIConnectionTimeoutError' || err?.name === 'TimeoutError') {
    return { status: 504, code: 'timeout', message: 'The AI took too long to respond. Please try again.' };
  }
  if (status === 400 || status === 413 || status === 422) {
    return { status: 400, code: 'bad_request', message: 'The AI could not process this request. Try shortening it or removing the image.' };
  }
  if (typeof status === 'number' && status >= 500) {
    return { status: 503, code: 'upstream', message: 'The AI service is temporarily unavailable. Please try again shortly.' };
  }
  return { status: 500, code: 'unknown', message: 'Something went wrong. Please try again.' };
}
