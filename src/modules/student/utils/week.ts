export type WeekEvent = {
  id: string;
  title: string;
  startsAt: Date;
};

export type WeekDay = {
  date: Date;
  events: WeekEvent[];
  isToday: boolean;
};

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function buildCampusWeek(today: Date, events: WeekEvent[]): WeekDay[] {
  const start = startOfDay(today);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const dayKey = date.toDateString();
    return {
      date,
      events: events.filter((event) => startOfDay(event.startsAt).toDateString() === dayKey),
      isToday: index === 0,
    };
  });
}
