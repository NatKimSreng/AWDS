import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SimpleCalendarProps {
 currentDate: Date;
 onChangeDate: (date: Date) => void;
 selectedDate?: Date | null;
 onSelectDate?: (date: Date) => void;
 dayContent?: (date: Date) => React.ReactNode;
}

function startOfMonth(date: Date): Date {
 return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date): Date {
 return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function addDays(date: Date, days: number): Date {
 const result = new Date(date);
 result.setDate(result.getDate() + days);
 return result;
}

function isSameDay(a: Date, b: Date): boolean {
 return (
 a.getFullYear() === b.getFullYear() &&
 a.getMonth() === b.getMonth() &&
 a.getDate() === b.getDate()
 );
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function SimpleCalendar({
 currentDate,
 onChangeDate,
 selectedDate,
 onSelectDate,
 dayContent,
}: SimpleCalendarProps) {
 const start = startOfMonth(currentDate);
 const end = endOfMonth(currentDate);
 const startDayOfWeek = start.getDay();
 const daysInMonth = end.getDate();

 const days: Date[] = [];
 for (let i = 0; i < startDayOfWeek; i++) {
 days.push(addDays(start, i - startDayOfWeek));
 }
 for (let i = 1; i <= daysInMonth; i++) {
 days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
 }
 const remaining = 42 - days.length;
 for (let i = 1; i <= remaining; i++) {
 days.push(addDays(end, i));
 }

 const monthLabel = currentDate.toLocaleDateString('en-US', {
 month: 'long',
 year: 'numeric',
 });

 return (
 <div className="bg-surface-raised rounded-md border border-border p-4">
 <div className="flex items-center justify-between mb-4">
 <button
 onClick={() => onChangeDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
 className="p-2 rounded-md hover:bg-surface-elevated text-text-secondary"
 >
 <ChevronLeft className="w-5 h-5" />
 </button>
 <h3 className="font-bold text-text-primary">{monthLabel}</h3>
 <button
 onClick={() => onChangeDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
 className="p-2 rounded-md hover:bg-surface-elevated text-text-secondary"
 >
 <ChevronRight className="w-5 h-5" />
 </button>
 </div>

 <div className="grid grid-cols-7 gap-1">
 {WEEKDAYS.map((day) => (
 <div key={day} className="text-center text-xs font-medium text-text-secondary py-2">
 {day}
 </div>
 ))}

 {days.map((date, index) => {
 const isCurrentMonth = date.getMonth() === currentDate.getMonth();
 const isSelected = selectedDate && isSameDay(date, selectedDate);

 return (
 <button
 key={index}
 onClick={() => onSelectDate?.(date)}
 className={`min-h-[64px] p-1 rounded-md text-left flex flex-col gap-1 transition-colors ${
 isSelected
 ? 'bg-accent/10 ring-1 ring-accent'
 : isCurrentMonth
 ? 'hover:bg-surface-elevated'
 : 'text-text-secondary/50 hover:bg-surface-elevated'
 }`}
 >
 <span className={`text-sm font-medium ${isCurrentMonth ? 'text-text-primary' : 'text-text-secondary/50'}`}>
 {date.getDate()}
 </span>
 {dayContent && dayContent(date)}
 </button>
 );
 })}
 </div>
 </div>
 );
}
