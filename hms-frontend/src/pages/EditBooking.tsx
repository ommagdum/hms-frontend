import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Save, AlertTriangle, ArrowLeft, Loader2, Home, User, CheckCircle2 } from 'lucide-react';
import { roomService, type Room } from '../api/roomService';
import { bookingService, type Booking } from '../api/bookingService';

export default function EditBooking() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  
  const [formData, setFormData] = useState({
    customerId: 0,
    customerName: '',
    roomId: '',
    checkIn: '',
    checkOut: ''
  });

  useEffect(() => {
    const loadBooking = async () => {
      try {
        const res = await bookingService.getBookingById(Number(id));
        if (res.success) {
          const b = res.data;
          setFormData({
            customerId: b.customerId,
            customerName: b.customerName || `Guest #${b.customerId}`,
            roomId: String(b.roomId),
            checkIn: b.checkIn,
            checkOut: b.checkOut
          });
          
          // Pre-fetch available rooms for these dates to show options
          const roomsRes = await roomService.getAvailableRooms(b.checkIn, b.checkOut);
          if (roomsRes.success) setAvailableRooms(roomsRes.data);
        }
      } catch (err) {
        setError("Failed to load booking details.");
      } finally {
        setLoading(false);
      }
    };
    loadBooking();
  }, [id]);

  // 2. RE-VALIDATE: If user changes dates, we must check availability again
  const recheckAvailability = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await roomService.getAvailableRooms(formData.checkIn, formData.checkOut);
      if (res.success) {
        setAvailableRooms(res.data);
      }
    } catch (err) {
      setError("Dates are invalid or room is no longer available.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
      setSubmitting(true);
      setError(null);
      try {
        // payload matches Backend Doc Section 2 precisely
        const payload = {
          customerId: formData.customerId,
          roomId: Number(formData.roomId),
          checkIn: formData.checkIn,
          checkOut: formData.checkOut
          // We do NOT send totalAmount or bookingId here
        };

        const res = await bookingService.updateBooking(Number(id), payload);
        
        if (res.success) {
          // Option A: Navigate with state (to show a message on the list page)
          navigate('/bookings', { 
              state: { message: `Reservation for ${formData.customerName} updated!` } 
          });
        }
      } catch (err: any) {
        // Handle the 409 Conflict mentioned in Section 2 of your doc
        if (err.response?.status === 409) {
          setError("Conflict: That room was just taken for those dates. Please choose another room.");
        } else {
          setError(err.response?.data?.message || "Update failed. Please check your dates.");
        }
      } finally {
        setSubmitting(false);
      }
  };

  if (loading && !formData.checkIn) {
    return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-accent" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4 animate-in fade-in slide-in-from-bottom-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-muted hover:text-primary">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Edit Reservation #{id}</h1>
        <div className="bg-accent/10 text-accent px-4 py-1 rounded-full text-xs font-bold uppercase">
           {formData.customerName}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
          <AlertTriangle size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Date Adjustment Section */}
      <div className="bg-white p-8 rounded-2xl border border-surface shadow-xl grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        <div className="space-y-2">
            <label className="text-[10px] font-black text-muted uppercase tracking-widest">Check-In</label>
            <input 
                type="date"
                className="w-full p-3 rounded-lg border border-surface"
                value={formData.checkIn}
                onChange={e => setFormData({...formData, checkIn: e.target.value})}
            />
        </div>
        <div className="space-y-2">
            <label className="text-[10px] font-black text-muted uppercase tracking-widest">Check-Out</label>
            <input 
                type="date"
                className="w-full p-3 rounded-lg border border-surface"
                value={formData.checkOut}
                onChange={e => setFormData({...formData, checkOut: e.target.value})}
            />
        </div>
        <button 
            onClick={recheckAvailability}
            className="h-12 bg-surface text-primary font-bold rounded-lg hover:bg-surface/70 transition-all text-sm"
        >
            Update Availability
        </button>
      </div>

      {/* Room Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availableRooms.map(room => (
          <button 
            key={room.roomId}
            onClick={() => setFormData({...formData, roomId: String(room.roomId)})}
            className={`p-5 rounded-xl border-2 text-left transition-all ${
                formData.roomId === String(room.roomId) ? 'border-accent bg-accent/5' : 'border-surface bg-white'
            }`}
          >
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-[10px] font-black text-muted uppercase">Room {room.roomNumber}</p>
                    <h3 className="text-lg font-bold text-primary">{room.roomType}</h3>
                </div>
                <p className="font-bold text-accent">₹{room.price}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <button onClick={() => navigate(-1)} className="px-8 py-4 font-bold text-muted hover:text-primary">Cancel</button>
        <button 
            disabled={submitting}
            onClick={handleUpdate}
            className="px-12 py-4 bg-primary text-white rounded-xl font-bold flex items-center gap-2 hover:shadow-lg disabled:opacity-50"
        >
            {submitting ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            Save Changes
        </button>
      </div>
    </div>
  );
}