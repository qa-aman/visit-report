'use client';

import { useState, useMemo } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addWeeks, subWeeks, addMonths, subMonths, addDays, subDays, getDay, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List, Grid } from 'lucide-react';
import { TravelPlanEntry } from '@/types';

export type CalendarViewMode = 'day' | 'week' | 'month';

interface CalendarViewProps {
  entries: TravelPlanEntry[];
  currentDate: Date;
  onDateClick: (date: Date) => void;
  onEntryClick: (entry: TravelPlanEntry) => void;
  viewMode: CalendarViewMode;
  onViewModeChange: (mode: CalendarViewMode) => void;
  canEdit?: boolean;
}

export default function CalendarView({
  entries,
  currentDate,
  onDateClick,
  onEntryClick,
  viewMode,
  onViewModeChange,
  canEdit = true,
}: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState(currentDate);

  const navigateDate = (direction: 'prev' | 'next' | 'today') => {
    let newDate = selectedDate;
    if (direction === 'today') {
      newDate = new Date();
    } else if (direction === 'prev') {
      if (viewMode === 'day') newDate = subDays(selectedDate, 1);
      else if (viewMode === 'week') newDate = subWeeks(selectedDate, 1);
      else newDate = subMonths(selectedDate, 1);
    } else {
      if (viewMode === 'day') newDate = addDays(selectedDate, 1);
      else if (viewMode === 'week') newDate = addWeeks(selectedDate, 1);
      else newDate = addMonths(selectedDate, 1);
    }
    setSelectedDate(newDate);
  };

  const getEntriesForDate = (date: Date): TravelPlanEntry[] => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return entries.filter((e) => e.date === dateStr);
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="flex flex-col h-full">
        <div className="grid grid-cols-7 border-b border-gray-200">
          {weekDays.map((day) => (
            <div key={day} className="p-2 text-xs font-medium text-gray-600 text-center">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 flex-1 overflow-auto">
          {days.map((day, idx) => {
            const dayEntries = getEntriesForDate(day);
            const isCurrentMonth = isSameMonth(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            const isSelected = isSameDay(day, selectedDate);

            return (
              <div
                key={idx}
                onClick={() => {
                  setSelectedDate(day);
                  onDateClick(day);
                }}
                className={`min-h-[80px] border-r border-b border-gray-200 p-1 cursor-pointer hover:bg-gray-50 transition-colors ${
                  !isCurrentMonth ? 'bg-gray-50' : 'bg-white'
                } ${isToday ? 'bg-blue-50' : ''} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
              >
                <div className={`text-xs mb-1 ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'} ${isToday ? 'font-bold text-blue-600' : ''}`}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-0.5">
                  {dayEntries.slice(0, 3).map((entry) => (
                    <div
                      key={entry.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEntryClick(entry);
                      }}
                      className={`text-[10px] px-1 py-0.5 rounded truncate cursor-pointer ${
                        entry.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : entry.status === 'in-progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}
                      title={`${entry.customerName} - ${entry.purpose}`}
                    >
                      {entry.plannedCheckIn && `${entry.plannedCheckIn} `}
                      {entry.customerName}
                    </div>
                  ))}
                  {dayEntries.length > 3 && (
                    <div className="text-[10px] text-gray-500 px-1">
                      +{dayEntries.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: endOfWeek(selectedDate, { weekStartsOn: 0 }) });
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="flex flex-col h-full overflow-auto">
        <div className="grid grid-cols-8 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="p-2 text-xs font-medium text-gray-600 border-r border-gray-200"></div>
          {weekDays.map((day) => {
            const isToday = isSameDay(day, new Date());
            return (
              <div
                key={format(day, 'yyyy-MM-dd')}
                className={`p-2 text-center border-r border-gray-200 ${isToday ? 'bg-blue-50' : ''}`}
              >
                <div className="text-xs font-medium text-gray-600">{format(day, 'EEE')}</div>
                <div className={`text-lg font-semibold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                  {format(day, 'd')}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex-1 overflow-auto">
          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-b border-gray-100">
              <div className="p-2 text-xs text-gray-500 border-r border-gray-200">
                {hour.toString().padStart(2, '0')}:00
              </div>
              {weekDays.map((day) => {
                const dayEntries = getEntriesForDate(day).filter((e) => {
                  if (!e.plannedCheckIn) return false;
                  const [h] = e.plannedCheckIn.split(':').map(Number);
                  return h === hour;
                });
                return (
                  <div
                    key={`${format(day, 'yyyy-MM-dd')}-${hour}`}
                    className="min-h-[60px] border-r border-gray-100 p-1"
                    onClick={() => onDateClick(day)}
                  >
                    {dayEntries.map((entry) => (
                      <div
                        key={entry.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEntryClick(entry);
                        }}
                        className={`text-[10px] px-1 py-0.5 rounded mb-1 cursor-pointer truncate ${
                          entry.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : entry.status === 'in-progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}
                        title={`${entry.customerName} - ${entry.purpose}`}
                      >
                        {entry.plannedCheckIn} {entry.customerName}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const dayEntries = getEntriesForDate(selectedDate);

    return (
      <div className="flex flex-col h-full overflow-auto">
        <div className="p-2 text-center border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="text-xs font-medium text-gray-600">{format(selectedDate, 'EEEE')}</div>
          <div className="text-lg font-semibold text-gray-900">{format(selectedDate, 'MMMM d, yyyy')}</div>
        </div>
        <div className="flex-1">
          {hours.map((hour) => {
            const hourEntries = dayEntries.filter((e) => {
              if (!e.plannedCheckIn) return false;
              const [h] = e.plannedCheckIn.split(':').map(Number);
              return h === hour;
            });
            return (
              <div key={hour} className="grid grid-cols-12 border-b border-gray-100 min-h-[80px]">
                <div className="p-2 text-xs text-gray-500 border-r border-gray-200">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                <div
                  className="col-span-11 p-2 cursor-pointer hover:bg-gray-50"
                  onClick={() => onDateClick(selectedDate)}
                >
                  {hourEntries.map((entry) => (
                    <div
                      key={entry.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEntryClick(entry);
                      }}
                      className={`text-xs px-2 py-1 rounded mb-1 cursor-pointer ${
                        entry.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : entry.status === 'in-progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      <div className="font-medium">{entry.customerName}</div>
                      <div className="text-[10px] text-gray-600">
                        {entry.plannedCheckIn} - {entry.plannedCheckOut || 'TBD'}
                      </div>
                      <div className="text-[10px] text-gray-500">{entry.purpose}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateDate('prev')}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigateDate('today')}
            className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => navigateDate('next')}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="ml-4 text-sm font-semibold text-gray-900">
            {viewMode === 'month' && format(selectedDate, 'MMMM yyyy')}
            {viewMode === 'week' && `${format(startOfWeek(selectedDate, { weekStartsOn: 0 }), 'MMM d')} - ${format(endOfWeek(selectedDate, { weekStartsOn: 0 }), 'MMM d, yyyy')}`}
            {viewMode === 'day' && format(selectedDate, 'MMMM d, yyyy')}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onViewModeChange('day')}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              viewMode === 'day' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Day
          </button>
          <button
            onClick={() => onViewModeChange('week')}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              viewMode === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => onViewModeChange('month')}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              viewMode === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Month
          </button>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="flex-1 overflow-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'day' && renderDayView()}
      </div>
    </div>
  );
}

