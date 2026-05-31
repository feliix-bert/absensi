'use client';

import { useState, useTransition, useOptimistic } from 'react';
import { CheckCircle2, Circle, Trash2, Plus, ListTodo, Calendar, Clock } from 'lucide-react';
import { toggleReminder, addReminder, deleteReminder } from '@/actions/reminders.actions';
import { cn } from '@/lib/utils';

interface Reminder {
  id: string;
  title: string;
  is_completed: boolean;
  due_date?: string | null;
}

export function DashboardReminders({ initialReminders }: { initialReminders: Reminder[] }) {
  const [isPending, startTransition] = useTransition();
  const [optimisticReminders, addOptimisticReminder] = useOptimistic(
    initialReminders,
    (state: Reminder[], action: { type: 'add' | 'toggle' | 'delete', reminder?: Reminder, id?: string }) => {
      switch (action.type) {
        case 'add':
          return [action.reminder!, ...state];
        case 'toggle':
          return state.map(r => r.id === action.id ? { ...r, is_completed: !r.is_completed } : r);
        case 'delete':
          return state.filter(r => r.id !== action.id);
        default:
          return state;
      }
    }
  );

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [showOptions, setShowOptions] = useState(false);

  const handleToggle = (id: string, isCompleted: boolean) => {
    startTransition(async () => {
      addOptimisticReminder({ type: 'toggle', id });
      await toggleReminder(id, isCompleted);
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      addOptimisticReminder({ type: 'delete', id });
      await deleteReminder(id);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let datetime: string | null = null;
    if (date) {
      datetime = date;
      if (time) datetime += `T${time}:00`;
      else datetime += `T23:59:59`;
    }

    const optimisticReminder: Reminder = {
      id: crypto.randomUUID(),
      title: title.trim(),
      is_completed: false,
      due_date: datetime
    };

    const formData = new FormData();
    formData.append('title', title);
    if (datetime) formData.append('dueDate', datetime);

    startTransition(async () => {
      addOptimisticReminder({ type: 'add', reminder: optimisticReminder });
      setTitle('');
      setDate('');
      setTime('');
      setShowOptions(false);
      
      try {
        await addReminder(formData);
      } catch (err) {
        console.error(err);
      }
    });
  };

  return (
    <div className="card-modern p-5 sticky top-[280px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ListTodo size={18} className="text-primary-600" />
          <h2 className="text-sm font-semibold text-neutral-800">Task Reminders</h2>
        </div>
        <span className="text-xs font-bold bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">
          {optimisticReminders.filter(r => !r.is_completed).length}
        </span>
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {optimisticReminders.length === 0 ? (
          <p className="text-xs text-neutral-400 text-center py-4">No reminders yet.</p>
        ) : (
          optimisticReminders.map((reminder) => (
            <div key={reminder.id} className="flex items-start gap-3 group p-2 -mx-2 rounded-xl hover:bg-neutral-50 transition-colors">
              <button 
                type="button"
                onClick={() => handleToggle(reminder.id, reminder.is_completed)}
                disabled={isPending}
                className="mt-0.5 p-1 -ml-1 flex-shrink-0 text-neutral-300 hover:text-primary-500 transition-colors"
              >
                {reminder.is_completed ? (
                  <CheckCircle2 size={18} className="text-primary-500" />
                ) : (
                  <Circle size={18} />
                )}
              </button>
              <div className="flex-1 min-w-0 pt-0.5">
                <span className={cn('text-sm block truncate', reminder.is_completed ? 'line-through text-neutral-400' : 'text-neutral-700 font-medium')}>
                  {reminder.title}
                </span>
                {reminder.due_date && !reminder.is_completed && (
                  <span className="text-[10px] text-neutral-400 flex items-center gap-1 mt-0.5">
                    <Calendar size={10} /> 
                    {new Date(reminder.due_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {reminder.due_date.includes('T') && new Date(reminder.due_date).getHours() !== 23 && (
                      <span className="flex items-center gap-0.5 ml-1"><Clock size={10} /> {new Date(reminder.due_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                    )}
                  </span>
                )}
              </div>
              <button 
                type="button"
                onClick={() => handleDelete(reminder.id)}
                disabled={isPending}
                className="p-1.5 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2">
        <div className="relative">
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add new task..." 
              className="w-full text-sm bg-neutral-50 border border-neutral-100 rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              required
              onFocus={() => setShowOptions(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSubmit(e as unknown as React.FormEvent);
                }
              }}
            />
            <button type="submit" disabled={isPending || !title.trim()} className="absolute right-2 top-1.5 bottom-1.5 px-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 hover:text-primary-700 disabled:opacity-50 transition-colors flex items-center justify-center">
              <Plus size={18} />
            </button>
        </div>
        
        {showOptions && (
          <div className="flex gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="relative flex-1">
              <Calendar size={12} className="absolute left-2.5 top-2.5 text-neutral-400" />
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs bg-neutral-50 border border-neutral-100 rounded-lg py-2 pl-7 pr-2 focus:outline-none focus:ring-1 focus:ring-primary-500 text-neutral-600"
              />
            </div>
            <div className="relative w-24">
              <Clock size={12} className="absolute left-2.5 top-2.5 text-neutral-400" />
              <input 
                type="time" 
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full text-xs bg-neutral-50 border border-neutral-100 rounded-lg py-2 pl-7 pr-2 focus:outline-none focus:ring-1 focus:ring-primary-500 text-neutral-600"
              />
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
