import { useEffect, useState } from 'react';
import { format, addDays, startOfDay, parseISO, isWithinInterval } from 'date-fns';
import { bookingService, type BookingRangeResponse } from '../api/bookingService';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function RoomCalendar() {
  const [viewDate, setViewDate] = useState(new Date());
  const [occupancy, setOccupancy] = useState<BookingRangeResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const days = Array.from({ length: 7 }, (_, i) => addDays(viewDate, i));

  useEffect(() => {
    const loadOccupancy = async () => {
      setLoading(true);
      const start = format(days[0], 'yyyy-MM-dd');
      const end = format(addDays(days[6], 1), 'yyyy-MM-dd'); // End is exclusive
      
      const res = await bookingService.getBookingsInRange(start, end);
      if (res.success) setOccupancy(res.data);
      setLoading(false);
    };
    loadOccupancy();
  }, [viewDate]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-heading font-bold text-primary">Occupancy Timeline</h1>
        <div className="flex gap-2 bg-white p-1 rounded-lg border border-surface">
          <button onClick={() => setViewDate(addDays(viewDate, -7))} className="p-2 hover:bg-background rounded-md"><ChevronLeft size={20}/></button>
          <span className="px-4 py-2 font-bold text-sm">{format(days[0], 'MMM dd')} - {format(days[6], 'MMM dd')}</span>
          <button onClick={() => setViewDate(addDays(viewDate, 7))} className="p-2 hover:bg-background rounded-md"><ChevronRight size={20}/></button>
        </div>
      </div>

      <div className="bg-white rounded-card border border-surface overflow-hidden shadow-sm">
        {/* Header Row */}
        <div className="grid grid-cols-8 bg-surface/30 border-b border-surface">
          <div className="p-4 font-bold text-[10px] uppercase text-muted border-r border-surface">Room</div>
          {days.map(day => (
            <div key={day.toString()} className="p-4 text-center border-r border-surface last:border-0">
              <p className="text-[10px] font-bold text-muted uppercase">{format(day, 'EEE')}</p>
              <p className="text-sm font-bold">{format(day, 'dd')}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-accent" /></div>
        ) : (
          occupancy.map(room => (
            <div key={room.roomId} className="grid grid-cols-8 border-b border-surface last:border-0">
              <div className="p-4 border-r border-surface bg-surface/10">
                <p className="font-bold text-sm">#{room.roomNumber}</p>
              </div>
              
              {days.map(day => {
                const booking = room.bookings.find(b => 
                  isWithinInterval(startOfDay(day), {
                    start: parseISO(b.checkIn),
                    end: addDays(parseISO(b.checkOut), -1)
                  })
                );

                return (
                  <div key={day.toString()} className="p-2 border-r border-surface last:border-0 relative group">
                    {booking ? (
                      <div className="h-full w-full bg-accent/20 border-l-4 border-accent rounded-sm p-1 overflow-hidden">
                        <p className="text-[9px] font-bold text-accent truncate">{booking.guestName}</p>
                        {/* Tooltip */}
                        <div className="absolute hidden group-hover:block z-50 bg-primary text-white p-2 rounded text-[10px] -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
                          {booking.guestName} ({booking.checkIn} to {booking.checkOut})
                        </div>
                      </div>
                    ) : (
                      <div className="h-full w-full bg-green-50/50 rounded-sm border border-dashed border-green-200" />
                    )}
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
}