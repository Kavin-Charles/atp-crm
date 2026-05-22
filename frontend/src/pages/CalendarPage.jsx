import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { ChevronLeft, ChevronRight, Plus, Pencil, Trash2, X } from 'lucide-react';
import { eventsApi } from '@/api/events';
import { useAuth } from '@/context/AuthContext';
import PageHeader from '@/components/shared/PageHeader';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import FormField from '@/components/shared/FormField';
import Dialog, { DialogBody, DialogFooter } from '@/components/ui/Dialog';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import Spinner from '@/components/ui/Spinner';
import { toast } from 'sonner';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function toDateStr(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function todayStr() {
  const d = new Date();
  return toDateStr(d.getFullYear(), d.getMonth(), d.getDate());
}

export default function CalendarPage() {
  const { can } = useAuth();
  const qc = useQueryClient();
  const isAdmin = can('admin', 'manager');

  const now = new Date();
  const [viewYear, setViewYear]   = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay]   = useState(null); // YYYY-MM-DD
  const [modalOpen, setModalOpen]       = useState(false);
  const [editing, setEditing]           = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: events = [], isLoading } = useQuery({ queryKey: ['events'], queryFn: eventsApi.list });

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Group events by date string
  const byDate = useMemo(() => {
    const map = {};
    events.forEach(e => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return map;
  }, [events]);

  const selectedEvents = selectedDay ? (byDate[selectedDay] || []) : [];

  const saveMutation = useMutation({
    mutationFn: (data) => editing ? eventsApi.update(editing._id, data) : eventsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events'] });
      toast.success(editing ? 'Event updated' : 'Event added');
      closeModal();
    },
    onError: () => toast.error('Failed to save'),
  });

  const deleteMutation = useMutation({
    mutationFn: eventsApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events'] });
      toast.success('Deleted');
      setDeleteTarget(null);
    },
    onError: () => toast.error('Failed to delete'),
  });

  function openCreate(date) {
    setEditing(null);
    reset({ date: date || toDateStr(viewYear, viewMonth, 1), type: 'event' });
    setModalOpen(true);
  }

  function openEdit(ev) {
    setEditing(ev);
    reset({ title: ev.title, date: ev.date, type: ev.type, description: ev.description || '' });
    setModalOpen(true);
  }

  function closeModal() { setModalOpen(false); setEditing(null); reset({}); }

  // Build calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
    setSelectedDay(null);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
    setSelectedDay(null);
  }

  const today = todayStr();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Calendar"
        description="Company holidays and events"
        action={isAdmin && (
          <Button size="sm" onClick={() => openCreate(selectedDay || toDateStr(viewYear, viewMonth, 1))}>
            <Plus className="h-4 w-4 mr-1.5" /> Add Event
          </Button>
        )}
      />

      <div className="flex gap-6">
        {/* Calendar */}
        <div className="card flex-1 overflow-hidden">
          {/* Month nav */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
              <ChevronLeft className="h-5 w-5 text-slate-600" />
            </button>
            <h2 className="text-base font-semibold text-slate-800">{MONTHS[viewMonth]} {viewYear}</h2>
            <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
              <ChevronRight className="h-5 w-5 text-slate-600" />
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16"><Spinner /></div>
          ) : (
            <div className="p-4">
              {/* Day headers */}
              <div className="grid grid-cols-7 mb-1">
                {DAYS.map(d => (
                  <div key={d} className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wide py-2">{d}</div>
                ))}
              </div>
              {/* Day cells */}
              <div className="grid grid-cols-7 gap-px bg-slate-100">
                {cells.map((day, i) => {
                  if (!day) return <div key={`empty-${i}`} className="bg-white min-h-[80px]" />;
                  const dateStr = toDateStr(viewYear, viewMonth, day);
                  const dayEvents = byDate[dateStr] || [];
                  const isToday = dateStr === today;
                  const isSelected = dateStr === selectedDay;
                  const hasHoliday = dayEvents.some(e => e.type === 'holiday');
                  return (
                    <div
                      key={day}
                      onClick={() => setSelectedDay(isSelected ? null : dateStr)}
                      className={`bg-white min-h-[80px] p-1.5 cursor-pointer transition-colors
                        ${isSelected ? 'ring-2 ring-inset ring-brand-900' : 'hover:bg-slate-50'}
                        ${hasHoliday ? 'bg-red-50' : ''}`}
                    >
                      <span className={`text-xs font-semibold inline-flex items-center justify-center w-6 h-6 rounded-full
                        ${isToday ? 'bg-brand-900 text-white' : 'text-slate-700'}`}>
                        {day}
                      </span>
                      <div className="mt-0.5 space-y-0.5">
                        {dayEvents.slice(0, 3).map(ev => (
                          <div
                            key={ev._id}
                            className={`text-xs truncate rounded px-1 py-0.5 leading-tight
                              ${ev.type === 'holiday' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}
                            title={ev.title}
                          >
                            {ev.title}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-xs text-slate-400 pl-1">+{dayEvents.length - 3} more</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="px-6 py-3 border-t border-slate-100 flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-3 h-3 rounded bg-red-100 border border-red-200" /> Holiday
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-3 h-3 rounded bg-blue-100 border border-blue-200" /> Event
            </div>
          </div>
        </div>

        {/* Side panel — selected day events */}
        {selectedDay && (
          <div className="card w-72 flex-shrink-0 h-fit">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">{selectedDay}</p>
                <p className="text-sm font-semibold text-slate-800">
                  {selectedEvents.length === 0 ? 'No events' : `${selectedEvents.length} event${selectedEvents.length > 1 ? 's' : ''}`}
                </p>
              </div>
              <button onClick={() => setSelectedDay(null)} className="p-1 rounded hover:bg-slate-100">
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </div>
            <div className="p-4 space-y-2">
              {selectedEvents.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No events on this day.</p>
              ) : (
                selectedEvents.map(ev => (
                  <div key={ev._id} className={`rounded-lg p-3 ${ev.type === 'holiday' ? 'bg-red-50 border border-red-100' : 'bg-blue-50 border border-blue-100'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={`text-sm font-medium ${ev.type === 'holiday' ? 'text-red-800' : 'text-blue-800'}`}>{ev.title}</p>
                        {ev.description && <p className="text-xs text-slate-500 mt-0.5">{ev.description}</p>}
                        <span className={`text-xs font-medium mt-1 inline-block capitalize ${ev.type === 'holiday' ? 'text-red-600' : 'text-blue-600'}`}>
                          {ev.type}
                        </span>
                      </div>
                      {isAdmin && (
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={() => openEdit(ev)} className="p-1 rounded hover:bg-white/60">
                            <Pencil className="h-3.5 w-3.5 text-slate-500" />
                          </button>
                          <button onClick={() => setDeleteTarget(ev)} className="p-1 rounded hover:bg-white/60">
                            <Trash2 className="h-3.5 w-3.5 text-red-400" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              {isAdmin && (
                <Button size="sm" variant="secondary" className="w-full mt-2" onClick={() => openCreate(selectedDay)}>
                  <Plus className="h-4 w-4 mr-1.5" /> Add to this day
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit modal */}
      <Dialog open={modalOpen} onClose={closeModal} title={editing ? 'Edit Event' : 'Add Event'} size="sm">
        <form onSubmit={handleSubmit(d => saveMutation.mutate(d))}>
          <DialogBody className="space-y-4">
            <FormField label="Title" required error={errors.title}>
              <Input error={errors.title} {...register('title', { required: 'Required' })} />
            </FormField>
            <FormField label="Date" required error={errors.date}>
              <Input type="date" error={errors.date} {...register('date', { required: 'Required' })} />
            </FormField>
            <FormField label="Type" error={errors.type}>
              <Select {...register('type')}>
                <option value="event">Event</option>
                <option value="holiday">Holiday</option>
              </Select>
            </FormField>
            <FormField label="Description" error={errors.description}>
              <Input placeholder="Optional notes..." {...register('description')} />
            </FormField>
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" type="button" onClick={closeModal}>Cancel</Button>
            <Button type="submit" loading={saveMutation.isPending}>{editing ? 'Save' : 'Add'}</Button>
          </DialogFooter>
        </form>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
        loading={deleteMutation.isPending}
        title="Delete Event"
        description={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
      />
    </div>
  );
}
