// Stage-1 smoke tests for POST /api/doubt. Run with the dev server up:  npm run test:api
const URL = process.env.API_URL || 'http://localhost:3000/api/doubt';

async function call(label, body) {
  const res = await fetch(URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const ct = res.headers.get('content-type') || '';
  let text = '';
  if (res.body) {
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let chunks = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks++;
      text += dec.decode(value, { stream: true });
    }
    console.log(`\n[${label}] status=${res.status} model=${res.headers.get('x-model-used') || '-'} chunks=${chunks} type=${ct.split(';')[0]}`);
  }
  console.log(text.slice(0, 300).replace(/\n/g, ' ⏎ '));
}

await call('streaming math', { messages: [{ role: 'user', content: 'Solve 2x + 3 = 11 step by step.' }], subject: 'Math', level: 'Simple' });
await call('fast model (definition)', { messages: [{ role: 'user', content: 'What is photosynthesis?' }], subject: 'Biology' });
await call('empty messages', { messages: [] });
await call('whitespace only', { messages: [{ role: 'user', content: '   ' }] });
await call('html stripped', { messages: [{ role: 'user', content: '<script>alert(1)</script>Say hi in 3 words' }] });
await call('bad image', { messages: [{ role: 'user', content: 'hi' }], imageBase64: 'data:text/plain;base64,AAAA' });
await call('follow-up memory', {
  messages: [
    { role: 'user', content: 'My favourite number is 42. Remember it.' },
    { role: 'assistant', content: 'Got it, 42.' },
    { role: 'user', content: 'What is my favourite number?' },
  ],
});

console.log('\nRate-limit test (25 quick requests)...');
let limited = 0;
for (let i = 0; i < 25; i++) {
  const r = await fetch(URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [] }) });
  if (r.status === 429) limited++;
}
console.log(`429 responses: ${limited} (expected > 0)`);
