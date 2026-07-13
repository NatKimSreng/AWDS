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
    <div className="bg-card-white rounded-xl shadow-sm border border-stone-gray/10 p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => onChangeDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
          className="p-2 rounded-lg hover:bg-stone-gray/10 text-stone-gray"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="font-bold text-stone-charcoal">{monthLabel}</h3>
        <button
          onClick={() => onChangeDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
          className="p-2 rounded-lg hover:bg-stone-gray/10 text-stone-gray"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-stone-gray py-2">
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
              className={`min-h-[64px] p-1 rounded-lg text-left flex flex-col gap-1 transition-colors ${
                isSelected
                  ? 'bg-angkor-orange/10 ring-1 ring-angkor-orange'
                  : isCurrentMonth
                    ? 'hover:bg-stone-gray/5'
                    : 'text-stone-gray/50 hover:bg-stone-gray/5'
              }`}
            >
              <span className={`text-sm font-medium ${isCurrentMonth ? 'text-stone-charcoal' : 'text-stone-gray/50'}`}>
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
