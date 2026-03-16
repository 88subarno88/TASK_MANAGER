'use client';
import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';

const STATUSES = ['todo', 'in-progress', 'review', 'done'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const STATUS_LABELS = { todo: 'To Do', 'in-progress': 'In Progress', review: 'Review', done: 'Done' };
const PRIORITY_ICONS = { low: '↓', medium: '→', high: '↑', urgent: '⚡' };

export default function TaskModal({ task, onClose, onSuccess }) {
  const isEdit = !!task;
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'todo',
    priority: task?.priority || 'medium',
    dueDate: task?.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
    tags: task?.tags?.join(', ') || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const overlayRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => { titleRef.current?.focus(); }, []);

  function handleOverlayClick(e) {
    if (e.target === overlayRef.current) onClose();
  }

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.title.trim()) { setError('Title is required'); return; }
    setLoading(true);
    try {
      const tags = form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
      // Send the clean payload (HTTPS handles the encryption in transit)
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        status: form.status,
        priority: form.priority,
        dueDate: form.dueDate || null,
        tags,
      };

      const url = isEdit ? `/api/tasks/${task._id}` : '/api/tasks';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error?.message || 'Failed to save task'); return; }
      onSuccess();
    } catch { setError('Something went wrong'); }
    finally { setLoading(false); }
  }

  return (
    <div ref={overlayRef} onClick={handleOverlayClick}
      className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-lg shadow-2xl animate-slide-up"
           style={{ boxShadow: '0 30px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,212,255,0.08) inset' }}>
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="font-display text-lg font-bold">{isEdit ? 'Edit Task' : 'New Task'}</h2>
            <p className="text-xs text-slate-text font-mono mt-0.5">
              <span className="text-cyan/60">// </span>{isEdit ? `Editing: ${task.title?.substring(0, 30)}...` : 'Secured via HTTPS E2E'}
            </p>
          </div>
          <button onClick={onClose}
            className="p-2 rounded-xl text-slate-text hover:text-white hover:bg-panel transition-all">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-light mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input ref={titleRef} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="What needs to be done?" required maxLength={200}
              className="w-full bg-panel border border-border rounded-xl px-4 py-3 text-white placeholder-muted focus:border-cyan/50 focus:ring-1 focus:ring-cyan/20 transition-all text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-light mb-2">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Add more context..." rows={3} maxLength={2000}
              className="w-full bg-panel border border-border rounded-xl px-4 py-3 text-white placeholder-muted focus:border-cyan/50 focus:ring-1 focus:ring-cyan/20 transition-all text-sm resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-light mb-2">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full bg-panel border border-border rounded-xl px-4 py-3 text-white focus:border-cyan/50 transition-all text-sm">
                {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-light mb-2">Priority</label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                className="w-full bg-panel border border-border rounded-xl px-4 py-3 text-white focus:border-cyan/50 transition-all text-sm">
                {PRIORITIES.map(p => <option key={p} value={p}>{PRIORITY_ICONS[p]} {p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-light mb-2">Due Date</label>
              <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                className="w-full bg-panel border border-border rounded-xl px-4 py-3 text-white focus:border-cyan/50 transition-all text-sm [color-scheme:dark]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-light mb-2">Tags</label>
              <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                placeholder="design, api, bug" 
                className="w-full bg-panel border border-border rounded-xl px-4 py-3 text-white placeholder-muted focus:border-cyan/50 focus:ring-1 focus:ring-cyan/20 transition-all text-sm" />
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-cyan/5 border border-cyan/10">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            <span className="text-xs text-cyan/60 font-mono">Secured via TLS/HTTPS End-to-End Encryption</span>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-border text-sm text-slate-text hover:text-white hover:border-muted transition-all font-medium">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 rounded-xl bg-cyan text-void font-display font-semibold text-sm hover:bg-cyan-dim transition-all disabled:opacity-50"
              style={{ boxShadow: '0 0 15px rgba(0,212,255,0.25)' }}>
              {loading
                ? <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
                    Saving...
                  </span>
                : isEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
