'use client';

import { useState, useTransition } from 'react';
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
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [showOptions, setShowOptions] = useState(false);

  const handleToggle = (id: string, isCompleted: boolean) => {
    startTransition(async () => {
      await toggleReminder(id, isCompleted);
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteReminder(id);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isPending) return;

    const formData = new FormData();
    formData.append('title', title);
    
    if (date) {
      let datetime = date;
      if (time) datetime += `T${time}:00`;
      else datetime += `T23:59:59`; // default to end of day
      formData.append('dueDate', datetime);
    }

    startTransition(async () => {
      try {
        const res = await addReminder(formData);
        if (!res?.error) {
          setTitle('');
          setDate('');
          setTime('');
          setShowOptions(false);
        } else {
          console.error(res.error);
        }
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
          <h2 className="text-sm font-semibold text-neutral-800">Pengingat Tugas</h2>
        </div>
        <span className="text-xs font-bold bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">
          {initialReminders.filter(r => !r.is_completed).length}
        </span>
      </div>

      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
        {initialReminders.length === 0 ? (
          <p className="text-xs text-neutral-400 text-center py-4">Belum ada pengingat.</p>
        ) : (
          initialReminders.map((reminder) => (
            <div key={reminder.id} className="flex items-start gap-3 group">
              <button 
                type="button"
                onClick={() => handleToggle(reminder.id, reminder.is_completed)}
                disabled={isPending}
                className="mt-0.5 flex-shrink-0 text-neutral-300 hover:text-primary-500 transition-colors"
              >
                {reminder.is_completed ? (
                  <CheckCircle2 size={16} className="text-primary-500" />
                ) : (
                  <Circle size={16} />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <span className={cn('text-sm block truncate', reminder.is_completed ? 'line-through text-neutral-400' : 'text-neutral-700')}>
                  {reminder.title}
                </span>
                {reminder.due_date && !reminder.is_completed && (
                  <span className="text-[10px] text-neutral-400 flex items-center gap-1 mt-0.5">
                    <Calendar size={10} /> 
                    {new Date(reminder.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {reminder.due_date.includes('T') && new Date(reminder.due_date).getHours() !== 23 && (
                      <span className="flex items-center gap-0.5 ml-1"><Clock size={10} /> {new Date(reminder.due_date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                    )}
                  </span>
                )}
              </div>
              <button 
                type="button"
                onClick={() => handleDelete(reminder.id)}
                disabled={isPending}
                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity"
              >
                <Trash2 size={14} />
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
            placeholder="Tambah tugas baru..." 
            className="w-full text-sm bg-neutral-50 border border-neutral-100 rounded-xl py-2.5 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
            onFocus={() => setShowOptions(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmit(e as unknown as React.FormEvent);
              }
            }}
          />
          <button type="submit" disabled={isPending || !title.trim()} className="absolute right-2 top-2 text-primary-600 hover:text-primary-700 disabled:opacity-50">
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
