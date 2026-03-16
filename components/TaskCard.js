'use client';
import { useState } from 'react';
import { format, formatDistanceToNow, isPast } from 'date-fns';

const STATUS_CONFIG = {
  'todo': { label: 'To Do', cls: 'status-todo' },
  'in-progress': { label: 'In Progress', cls: 'status-in-progress' },
  'review': { label: 'Review', cls: 'status-review' },
  'done': { label: 'Done', cls: 'status-done' },
};

const PRIORITY_CONFIG = {
  low: { label: 'Low', cls: 'priority-low', icon: '↓' },
  medium: { label: 'Medium', cls: 'priority-medium', icon: '→' },
  high: { label: 'High', cls: 'priority-high', icon: '↑' },
  urgent: { label: 'Urgent', cls: 'priority-urgent', icon: '⚡' },
};

const NEXT_STATUS = { 'todo': 'in-progress', 'in-progress': 'review', 'review': 'done', 'done': 'todo' };

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const [changing, setChanging] = useState(false);
  const status = STATUS_CONFIG[task.status] || STATUS_CONFIG.todo;
  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'done';

  async function handleStatusClick(e) {
    e.stopPropagation();
    if (changing) return;
    setChanging(true);
    await onStatusChange(task._id, NEXT_STATUS[task.status]);
    setChanging(false);
  }

  return (
    <div className="group bg-surface border border-border rounded-2xl p-5 hover:border-cyan/20 transition-all duration-200 cursor-pointer
                    hover:shadow-lg relative overflow-hidden"
         style={{ '--hover-glow': 'rgba(0,212,255,0.03)' }}
         onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(135deg, #0d1326 0%, #0e1929 100%)'}
         onMouseLeave={e => e.currentTarget.style.background = ''}
         onClick={() => onEdit(task)}>
      
      {/* Priority accent line */}
      <div className={`absolute top-0 left-0 w-1 h-full rounded-l-2xl ${
        task.priority === 'urgent' ? 'bg-red-400' :
        task.priority === 'high' ? 'bg-amber-400' :
        task.priority === 'medium' ? 'bg-blue-400' : 'bg-emerald-400'
      }`} />

      <div className="pl-2">
        {/* Header row */}
        <div className="flex items-start justify-between mb-3">
          <button onClick={handleStatusClick}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${status.cls} ${changing ? 'opacity-50' : 'hover:opacity-80'}`}>
            {changing
              ? <svg className="animate-spin" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
              : null}
            {status.label}
          </button>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={e => { e.stopPropagation(); onEdit(task); }}
              className="p-1.5 rounded-lg text-slate-text hover:text-cyan hover:bg-cyan/10 transition-all">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button onClick={e => { e.stopPropagation(); onDelete(task._id); }}
              className="p-1.5 rounded-lg text-slate-text hover:text-red-400 hover:bg-red-500/10 transition-all">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className={`font-display font-semibold text-sm mb-2 line-clamp-2 leading-relaxed ${task.status === 'done' ? 'line-through text-slate-text' : 'text-white'}`}>
          {task.title}
        </h3>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-slate-text line-clamp-2 mb-3 leading-relaxed">{task.description}</p>
        )}

        {/* Tags */}
        {task.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {task.tags.slice(0, 3).map(tag => (
              <span key={tag} className="px-2 py-0.5 rounded-md bg-muted/50 text-slate-text text-xs font-mono">
                #{tag}
              </span>
            ))}
            {task.tags.length > 3 && <span className="text-xs text-muted">+{task.tags.length - 3}</span>}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <span className={`text-xs font-medium ${priority.cls}`}>
            {priority.icon} {priority.label}
          </span>
          <div className="flex items-center gap-3">
            {task.dueDate && (
              <span className={`text-xs font-mono ${isOverdue ? 'text-red-400' : 'text-slate-text'}`}>
                {isOverdue ? '⚠ ' : ''}{format(new Date(task.dueDate), 'MMM d')}
              </span>
            )}
            <span className="text-xs text-muted font-mono">
              {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
