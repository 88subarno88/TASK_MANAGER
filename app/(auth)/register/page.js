'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function PasswordStrength({ password }) {
  const checks = [
    { label: '8+ characters', ok: password.length >= 8 },
    { label: 'Uppercase', ok: /[A-Z]/.test(password) },
    { label: 'Lowercase', ok: /[a-z]/.test(password) },
    { label: 'Number', ok: /\d/.test(password) },
  ];
  const score = checks.filter(c => c.ok).length;
  const colors = ['', 'bg-red-500', 'bg-amber-500', 'bg-yellow-400', 'bg-emerald-500'];
  if (!password) return null;
  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[1,2,3,4].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? colors[score] : 'bg-muted'}`} />
        ))}
      </div>
      <div className="flex gap-3 flex-wrap">
        {checks.map(c => (
          <span key={c.label} className={`text-xs flex items-center gap-1 ${c.ok ? 'text-emerald-400' : 'text-slate-text'}`}>
            <span>{c.ok ? '✓' : '○'}</span>{c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error?.message || 'Registration failed'); return; }
      router.push('/dashboard');
      router.refresh();
    } catch { setError('Something went wrong. Please try again.'); }
    finally { setLoading(false); }
  }

  return (
    <div className="animate-slide-up stagger-2">
      <div className="bg-surface border border-border rounded-2xl p-8 shadow-2xl"
           style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,212,255,0.05) inset' }}>
        <h1 className="font-display text-2xl font-bold mb-1">Create account</h1>
        <p className="text-slate-text text-sm mb-8">Your tasks, encrypted and yours alone</p>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm animate-fade-in flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-light mb-2">Full name</label>
            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Jane Doe" required
              className="w-full bg-panel border border-border rounded-xl px-4 py-3 text-white placeholder-muted focus:border-cyan/50 focus:ring-1 focus:ring-cyan/20 transition-all text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-light mb-2">Email address</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="you@example.com" required
              className="w-full bg-panel border border-border rounded-xl px-4 py-3 text-white placeholder-muted focus:border-cyan/50 focus:ring-1 focus:ring-cyan/20 transition-all text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-light mb-2">Password</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Min. 8 characters" required
                className="w-full bg-panel border border-border rounded-xl px-4 py-3 pr-12 text-white placeholder-muted focus:border-cyan/50 focus:ring-1 focus:ring-cyan/20 transition-all text-sm" />
              <button type="button" onClick={() => setShowPass(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-text hover:text-white transition-colors">
                {showPass
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
            <PasswordStrength password={form.password} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-light mb-2">Confirm password</label>
            <input type="password" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
              placeholder="Repeat password" required
              className={`w-full bg-panel border rounded-xl px-4 py-3 text-white placeholder-muted focus:ring-1 transition-all text-sm
                ${form.confirm && form.confirm !== form.password ? 'border-red-500/50 focus:ring-red-500/20' : 'border-border focus:border-cyan/50 focus:ring-cyan/20'}`} />
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-cyan/5 border border-cyan/10">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            <span className="text-xs text-cyan/70 font-mono">AES-256-GCM encrypted before transmission</span>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3 px-6 rounded-xl font-display font-semibold text-sm bg-cyan text-void hover:bg-cyan-dim transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ boxShadow: loading ? 'none' : '0 0 20px rgba(0,212,255,0.3)' }}>
            {loading
              ? <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
                  Creating account...
                </span>
              : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-text mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-cyan hover:text-cyan-dim transition-colors font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
