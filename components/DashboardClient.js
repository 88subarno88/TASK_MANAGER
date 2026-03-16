'use client';
import { useState, useEffect, useCallback } from 'react';
import TaskModal from './TaskModal';
import TaskCard from './TaskCard';

const STATUS_LABELS = { todo: 'To Do', 'in-progress': 'In Progress', review: 'Review', done: 'Done' };
const PRIORITY_ORDER = { urgent: 0, high: 1, medium: 2, low: 3 };

export default function DashboardClient({ user }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, todo: 0, 'in-progress': 0, review: 0, done: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening');
  }, []);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12, sortBy });
      if (statusFilter) params.set('status', statusFilter);
      if (search) params.set('search', search);
      const res = await fetch(`/api/tasks?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTasks(data.data || []);
      setPagination(data.pagination || {});
      // Compute stats
      if (!statusFilter && !search) {
        const s = { total: data.pagination?.total || 0 };
        ['todo', 'in-progress', 'review', 'done'].forEach(st => {
          s[st] = data.data?.filter(t => t.status === st).length || 0;
        });
        // Fetch total for stats
        const allRes = await fetch('/api/tasks?limit=50&page=1');
        if (allRes.ok) {
          const allData = await allRes.json();
          const all = allData.data || [];
          setStats({
            total: allData.pagination?.total || 0,
            todo: all.filter(t => t.status === 'todo').length,
            'in-progress': all.filter(t => t.status === 'in-progress').length,
            review: all.filter(t => t.status === 'review').length,
            done: all.filter(t => t.status === 'done').length,
          });
        }
      }
    } catch {}
    finally { setLoading(false); }
  }, [page, statusFilter, search, sortBy]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  async function handleDelete(id) {
    if (!confirm('Delete this task?')) return;
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    fetchTasks();
  }

  async function handleStatusChange(id, newStatus) {
    await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchTasks();
  }

  function handleEdit(task) { setEditTask(task); setShowModal(true); }
  function handleNew() { setEditTask(null); setShowModal(true); }
  function handleModalClose() { setShowModal(false); setEditTask(null); }
  function handleModalSuccess() { handleModalClose(); fetchTasks(); }

  const statCards = [
    { label: 'Total Tasks', value: stats.total, color: 'text-white', bg: 'bg-white/5', border: 'border-white/10' },
    { label: 'To Do', value: stats.todo, color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
    { label: 'In Progress', value: stats['in-progress'], color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { label: 'Completed', value: stats.done, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  ];

  return (
    <div className="min-h-screen bg-void bg-grid">
      {/* Top ambient */}
      <div className="fixed top-0 right-0 w-[600px] h-[400px] pointer-events-none"
           style={{ background: 'radial-gradient(ellipse at 100% 0%, rgba(0,212,255,0.06) 0%, transparent 70%)' }} />

      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 animate-slide-up">
          <div>
            <p className="text-slate-text text-sm font-mono mb-1">
              <span className="text-cyan/60">// </span>{greeting}
            </p>
            <h1 className="font-display text-3xl font-bold">
              {user?.email?.split('@')[0] || 'User'}<span className="text-cyan">.</span>
            </h1>
            <p className="text-slate-text mt-1 text-sm">
              {stats.total === 0 ? 'No tasks yet — create your first one' : `You have ${stats['in-progress']} tasks in progress`}
            </p>
          </div>
          <button onClick={handleNew}
            className="flex items-center gap-2 px-5 py-2.5 bg-cyan text-void rounded-xl font-display font-semibold text-sm hover:bg-cyan-dim transition-all"
            style={{ boxShadow: '0 0 20px rgba(0,212,255,0.3)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Task
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {statCards.map((s, i) => (
            <div key={s.label}
              className={`animate-slide-up stagger-${i + 1} ${s.bg} border ${s.border} rounded-2xl p-5`}>
              <p className="text-xs font-mono text-slate-text uppercase tracking-widest mb-2">{s.label}</p>
              <p className={`font-display text-3xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6 animate-slide-up stagger-3">
          <div className="relative flex-1 max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-text" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search tasks..."
              className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-muted focus:border-cyan/50 focus:ring-1 focus:ring-cyan/20 transition-all" />
          </div>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan/50 transition-all">
            <option value="">All Status</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan/50 transition-all">
            <option value="createdAt">Newest First</option>
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
            <option value="status">Status</option>
          </select>
        </div>

        {/* Tasks Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-44 rounded-2xl shimmer" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-cyan/10 border border-cyan/20 flex items-center justify-center mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="1.5">
                <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
              </svg>
            </div>
            <p className="font-display text-lg font-bold mb-2">No tasks found</p>
            <p className="text-slate-text text-sm mb-6">{search || statusFilter ? 'Try adjusting your filters' : 'Create your first task to get started'}</p>
            {!search && !statusFilter && (
              <button onClick={handleNew}
                className="px-5 py-2.5 bg-cyan/10 border border-cyan/30 text-cyan rounded-xl text-sm font-medium hover:bg-cyan/20 transition-all">
                Create Task
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {tasks.map((task, i) => (
              <div key={task._id} className={`animate-slide-up stagger-${Math.min(i + 1, 5)}`}>
                <TaskCard task={task} onEdit={handleEdit} onDelete={handleDelete} onStatusChange={handleStatusChange} />
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button onClick={() => setPage(p => p - 1)} disabled={!pagination.hasPrev}
              className="px-4 py-2 rounded-xl bg-surface border border-border text-sm text-slate-text hover:text-white hover:border-cyan/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              Previous
            </button>
            <span className="text-sm text-slate-text font-mono">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button onClick={() => setPage(p => p + 1)} disabled={!pagination.hasNext}
              className="px-4 py-2 rounded-xl bg-surface border border-border text-sm text-slate-text hover:text-white hover:border-cyan/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              Next
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <TaskModal task={editTask} onClose={handleModalClose} onSuccess={handleModalSuccess} />
      )}
    </div>
  );
}
