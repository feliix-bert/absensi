'use client';

import { useState, useTransition } from 'react';
import { CheckCircle2, Circle, Trash2, Plus, ListTodo } from 'lucide-react';
import { toggleReminder, addReminder, deleteReminder } from '@/actions/reminders.actions';

interface Reminder {
  id: string;
  title: string;
  is_completed: boolean;
}

export function DashboardReminders({ initialReminders }: { initialReminders: Reminder[] }) {
  const [isPending, startTransition] = useTransition();

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
              <span className={`text-sm flex-1 ${reminder.is_completed ? 'line-through text-neutral-400' : 'text-neutral-700'}`}>
                {reminder.title}
              </span>
              <button 
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

      <form action={async (formData) => { await addReminder(formData); }} className="mt-4 relative">
        <input 
          type="text" 
          name="title" 
          placeholder="Tambah tugas baru..." 
          className="w-full text-sm bg-neutral-50 border border-neutral-100 rounded-xl py-2.5 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-primary-500"
          required
        />
        <button type="submit" disabled={isPending} className="absolute right-2 top-2 text-primary-600 hover:text-primary-700 disabled:opacity-50">
          <Plus size={18} />
        </button>
      </form>
    </div>
  );
}
