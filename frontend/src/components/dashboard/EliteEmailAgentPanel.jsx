import { useEffect, useState } from 'react';
import { AlertCircle, LoaderCircle, Mail, Save, Send, Sparkles, Trash2 } from 'lucide-react';
import api from '../../utils/api';

export default function EliteEmailAgentPanel() {
  const [prompt, setPrompt] = useState('');
  const [draft, setDraft] = useState(null);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const missingInfo = (draft?.missingInfo || []).filter(
    (item) => item !== 'recipient email address' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft?.to || '')
  );

  useEffect(() => {
    let active = true;
    api.get('/email-agent/drafts/pending')
      .then((response) => {
        if (active) setDraft(response.data.data.draft);
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError.response?.data?.message ||
            'Could not load your pending email draft.'
          );
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const generateDraft = async (event) => {
    event.preventDefault();
    setBusy('generate');
    setError('');
    setNotice('');
    try {
      const response = await api.post('/email-agent/drafts', { message: prompt });
      setDraft(response.data.data.draft);
      setPrompt('');
      setNotice('Draft created. Review and edit every field before sending.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not create an email draft.');
    } finally {
      setBusy('');
    }
  };

  const saveDraft = async () => {
    if (!draft) return;
    setBusy('save');
    setError('');
    setNotice('');
    try {
      const response = await api.patch(`/email-agent/drafts/${draft._id}`, {
        to: draft.to,
        subject: draft.subject,
        body: draft.body,
      });
      setDraft(response.data.data.draft);
      setNotice('Draft saved.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not save your draft.');
    } finally {
      setBusy('');
    }
  };

  const sendDraft = async () => {
    if (!draft || busy) return;
    setBusy('send');
    setError('');
    setNotice('');
    try {
      const saved = await api.patch(`/email-agent/drafts/${draft._id}`, {
        to: draft.to,
        subject: draft.subject,
        body: draft.body,
      });
      setDraft(saved.data.data.draft);
      const response = await api.post(`/email-agent/drafts/${draft._id}/send`);
      setDraft(null);
      setNotice(response.data.message || 'Email sent successfully.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not send the email.');
    } finally {
      setBusy('');
    }
  };

  const cancelDraft = async () => {
    if (!draft || busy) return;
    setBusy('cancel');
    setError('');
    setNotice('');
    try {
      await api.delete(`/email-agent/drafts/${draft._id}`);
      setDraft(null);
      setNotice('Draft cancelled.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not cancel the draft.');
    } finally {
      setBusy('');
    }
  };

  return (
    <section className="rounded-3xl border border-brand-border bg-brand-card p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="rounded-2xl bg-brand-primary/10 p-3 text-brand-primary">
          <Mail className="h-5 w-5" />
        </div>
        <div>
          <h2 className="flex items-center gap-2 font-display text-lg font-extrabold text-brand-text">
            Elite Email Agent
            <Sparkles className="h-4 w-4 text-brand-orange" />
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-brand-muted">
            Describe the email you need. Review and edit the generated draft; nothing is sent without your confirmation.
          </p>
        </div>
      </div>

      {!draft && (
        <form onSubmit={generateDraft} className="space-y-3">
          <label htmlFor="email-agent-prompt" className="block text-xs font-bold text-brand-text">
            What should the email say?
          </label>
          <textarea
            id="email-agent-prompt"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            maxLength={4000}
            required
            rows={4}
            placeholder="For example: Write a polite email to teacher@example.com asking for clarification about the physics assignment."
            className="w-full resize-y rounded-2xl border border-brand-border bg-brand-base p-3 text-sm text-brand-text outline-none transition focus:border-brand-primary"
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-[11px] text-brand-dim">{prompt.length}/4000</span>
            <button
              type="submit"
              disabled={busy !== '' || !prompt.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-xs font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy === 'generate' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {busy === 'generate' ? 'Drafting…' : 'Create email draft'}
            </button>
          </div>
        </form>
      )}

      {draft && (
        <div className="space-y-4 border-t border-brand-border pt-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-display text-sm font-extrabold text-brand-text">Review your draft</h3>
            <span className="rounded-full bg-brand-orange/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-orange">
              Pending approval
            </span>
          </div>

          {missingInfo.length > 0 && (
            <div className="flex gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-brand-text">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p>Please review: {missingInfo.join(', ')}.</p>
            </div>
          )}

          <label className="block space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wide text-brand-muted">To</span>
            <input
              type="email"
              maxLength={254}
              value={draft.to || ''}
              onChange={(event) => setDraft({ ...draft, to: event.target.value })}
              placeholder="recipient@example.com"
              className="w-full rounded-xl border border-brand-border bg-brand-base px-3 py-2.5 text-sm text-brand-text outline-none focus:border-brand-primary"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wide text-brand-muted">Subject</span>
            <input
              type="text"
              maxLength={150}
              value={draft.subject || ''}
              onChange={(event) => setDraft({ ...draft, subject: event.target.value })}
              className="w-full rounded-xl border border-brand-border bg-brand-base px-3 py-2.5 text-sm text-brand-text outline-none focus:border-brand-primary"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wide text-brand-muted">Message</span>
            <textarea
              maxLength={20000}
              rows={8}
              value={draft.body || ''}
              onChange={(event) => setDraft({ ...draft, body: event.target.value })}
              className="w-full resize-y rounded-xl border border-brand-border bg-brand-base px-3 py-2.5 text-sm leading-relaxed text-brand-text outline-none focus:border-brand-primary"
            />
          </label>

          <p className="text-[11px] text-brand-dim">
            Sending requires SMTP settings on the backend. Confirm &amp; send will send this exact reviewed draft.
          </p>

          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={cancelDraft}
              disabled={busy !== ''}
              className="inline-flex items-center gap-2 rounded-xl border border-brand-border px-3 py-2.5 text-xs font-bold text-brand-muted transition hover:bg-brand-base disabled:opacity-50"
            >
              {busy === 'cancel' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Cancel draft
            </button>
            <button
              type="button"
              onClick={saveDraft}
              disabled={busy !== ''}
              className="inline-flex items-center gap-2 rounded-xl border border-brand-border px-3 py-2.5 text-xs font-bold text-brand-text transition hover:bg-brand-base disabled:opacity-50"
            >
              {busy === 'save' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save edits
            </button>
            <button
              type="button"
              onClick={sendDraft}
              disabled={busy !== ''}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-3 py-2.5 text-xs font-bold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {busy === 'send' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Confirm &amp; send
            </button>
          </div>
        </div>
      )}

      {error && <p role="alert" className="mt-4 rounded-xl bg-red-500/10 p-3 text-xs text-red-600">{error}</p>}
      {notice && <p role="status" className="mt-4 rounded-xl bg-emerald-500/10 p-3 text-xs text-emerald-700">{notice}</p>}
    </section>
  );
}
