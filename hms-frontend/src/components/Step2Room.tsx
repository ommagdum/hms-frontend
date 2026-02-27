import { BedDouble, Info, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { bookingService } from "../api/bookingService";

export default function Step2Room({ data, setData, onNext, onBack }: any) {
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (data.checkIn && data.checkOut) {
      searchRooms();
    }
  }, [data.checkIn, data.checkOut]);

  const searchRooms = async () => {
    setLoading(true);
    try {
      const response = await bookingService.getAvailableRooms(data.checkIn, data.checkOut);
      setAvailableRooms(response.data || []);
    } catch (error) {
      console.error("Failed to Fetch rooms", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-primary mb-4">
        <BedDouble size={24} />
        <h3 className="font-heading text-xl">Room & Dates</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="font-label text-muted">Check-in</label>
          <input 
                type="date" 
                className="w-full p-3 bg-surface rounded-input border border-transparent focus:border-accent outline-none" 
                value={data.checkIn}
                onChange={(e) => setData({...data, checkIn: e.target.value})} />
        </div>
        <div>
          <label className="font-label text-muted">Check-out</label>
          <input 
                type="date"
                className="w-full p-3 bg-surface rounded-input border border-transparent focus:border-accent outline-none"  
                value={data.checkOut}
                onChange={(e) => setData({...data, checkOut: e.target.value})} />
        </div>
      </div>

      <div className="mt-8">
        <h4 className="font-label text-muted mb-4 uppercase tracking-wider text-xs">Available Rooms</h4>
        
        {loading ? (
          <div className="flex justify-center p-8"><Loader2 className="animate-spin text-accent" /></div>
        ) : availableRooms.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto pr-2">
            {availableRooms.map((room) => (
              <div 
                key={room.roomId}
                onClick={() => setData({ ...data, roomId: room.roomId, roomNumber: room.roomNumber, roomPrice: room.price })}
                className={`p-4 rounded-card border-2 cursor-pointer transition-all flex justify-between items-center ${
                  data.roomId === room.roomId 
                  ? 'border-accent bg-accent/5' 
                  : 'border-surface hover:border-accent/50 bg-white'
                }`}
              >
                <div>
                  <p className="font-bold text-primary">Room {room.roomNumber}</p>
                  <p className="text-xs text-muted">{room.roomType}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-accent">₹{room.price}</p>
                  <p className="text-[10px] text-muted">per night</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-surface/30 p-8 rounded-card border border-dashed border-surface text-center">
            <Info className="mx-auto text-muted mb-2" size={20} />
            <p className="text-sm text-muted">Select both dates to see available rooms.</p>
          </div>
        )}
      </div>
      <div className="flex gap-4 pt-6 border-t border-surface">
          <button onClick={onBack} className="flex-1 border border-surface p-4 rounded-button hover:bg-surface transition-colors">Back</button>
          <button 
                onClick={onNext} 
                disabled={!data.roomId}
                className="flex-1 bg-primary text-white p-4 rounded-button hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
                Review Booking
          </button>
      </div>
    </div>
  );
}