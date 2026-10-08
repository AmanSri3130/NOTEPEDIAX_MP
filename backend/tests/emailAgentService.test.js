import assert from 'node:assert/strict';
import test from 'node:test';

import {
  assertEmailSendingConfigured,
  generateEmailDraft,
  isValidEmailAddress,
} from '../services/emailAgentService.js';

const withEnv = async (values, action) => {
  const previous = new Map(
    Object.keys(values).map((key) => [key, process.env[key]])
  );
  for (const [key, value] of Object.entries(values)) {
    if (value === null) delete process.env[key];
    else process.env[key] = value;
  }
  try {
    await action();
  } finally {
    for (const [key, value] of previous) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
};

test('generates a validated email plan using the configured Groq key', async () => {
  const originalFetch = globalThis.fetch;
  let requestBody;
  globalThis.fetch = async (_url, options) => {
    requestBody = JSON.parse(options.body);
    return {
      ok: true,
      json: async () => ({
        choices: [{
          message: {
            content: JSON.stringify({
              to: 'teacher@example.com',
              subject: 'Question about the assignment',
              body: 'Hello,\\n\\nCould you clarify the assignment?\\n\\nRegards,\\n[Your Name]',
              missingInfo: [],
            }),
          },
        }],
      }),
    };
  };

  try {
    await withEnv({ GROQ_API_KEY: 'test-provider-key' }, async () => {
      const draft = await generateEmailDraft('Ask teacher@example.com for clarification.');
      assert.equal(draft.to, 'teacher@example.com');
      assert.equal(draft.subject, 'Question about the assignment');
      assert.deepEqual(draft.missingInfo, []);
      assert.match(requestBody.messages[0].content, /Never infer an address/);
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('email sending reports unconfigured SMTP without sending', async () => {
  await withEnv({
    SMTP_HOST: null,
    SMTP_PORT: null,
    SMTP_USER: null,
    SMTP_PASS: null,
    MAIL_FROM: null,
  }, async () => {
    assert.throws(assertEmailSendingConfigured, {
      statusCode: 503,
      message: /Email sending is not configured/,
    });
  });
});

test('validates recipient email addresses', () => {
  assert.equal(isValidEmailAddress('student@example.com'), true);
  assert.equal(isValidEmailAddress('not-an-email'), false);
  assert.equal(isValidEmailAddress(''), false);
});
