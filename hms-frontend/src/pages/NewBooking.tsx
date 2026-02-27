import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ArrowRight, AlertTriangle, CheckCircle2, User, Search, Loader2 } from 'lucide-react';
import { roomService, type Room } from '../api/roomService';
import { bookingService } from '../api/bookingService'; 
import { customerService, type Customer } from '../api/customerService';

export default function NewBooking() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [bookingData, setBookingData] = useState({
    customerId: 0, // Now using ID as required by backend
    roomId: '',
    checkIn: '',
    checkOut: ''
  });

  // UI Support State
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerResults, setCustomerResults] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);

  // DEBOUNCED CUSTOMER SEARCH
  useEffect(() => {
    if (customerSearch.length < 2) {
      setCustomerResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsSearchingCustomer(true);
      try {
        const res = await customerService.searchCustomers({ name: customerSearch });
        if (res.success) setCustomerResults(res.data.content);
      } catch (err) {
        console.error("Customer search failed", err);
      } finally {
        setIsSearchingCustomer(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [customerSearch]);

  const findRooms = async () => {
    if (!bookingData.checkIn || !bookingData.checkOut) return;
    setLoading(true);
    setError(null);
    try {
      const res = await roomService.getAvailableRooms(bookingData.checkIn, bookingData.checkOut);
      if (res.success) {
        setAvailableRooms(res.data);
        setStep(2);
      }
    } catch (err) {
      setError("Could not fetch availability.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBooking = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        customerId: bookingData.customerId,
        roomId: Number(bookingData.roomId),
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut
      };

      const res = await bookingService.createBooking(payload as any);
      if (res.success) {
        navigate('/bookings', { state: { message: 'Booking confirmed!' } });
      }
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError("Conflict: Room was just booked. Please select another.");
      } else {
        setError(err.response?.data?.message || "Booking failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4">
      {/* Step Progress */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">New Reservation</h1>
        <div className="flex gap-2">
            {[1, 2].map(i => (
                <div key={i} className={`w-12 h-2 rounded-full ${step >= i ? 'bg-accent' : 'bg-surface'}`} />
            ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 animate-bounce">
          <AlertTriangle size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {step === 1 ? (
        <div className="bg-white p-8 rounded-2xl border border-surface shadow-xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DateInput label="Check-In" value={bookingData.checkIn} onChange={v => setBookingData({...bookingData, checkIn: v})} />
            <DateInput label="Check-Out" value={bookingData.checkOut} onChange={v => setBookingData({...bookingData, checkOut: v})} />
          </div>
          <button 
            disabled={loading || !bookingData.checkIn || !bookingData.checkOut}
            onClick={findRooms}
            className="w-full bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Find Available Rooms"} <ArrowRight size={20} />
          </button>
        </div>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-right-4">
          {/* Room Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableRooms.map(room => (
              <button 
                key={room.roomId}
                onClick={() => setBookingData({...bookingData, roomId: String(room.roomId)})}
                className={`p-5 rounded-xl border-2 text-left transition-all ${
                    bookingData.roomId === String(room.roomId) ? 'border-accent bg-accent/5 ring-2 ring-accent/20' : 'border-surface bg-white'
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

          {/* Customer Selection Card */}
          <div className="bg-white p-8 rounded-2xl border border-surface shadow-xl space-y-6">
            <div className="relative">
                <label className="block text-xs font-black text-muted uppercase mb-2">Assign Registered Guest</label>
                
                {selectedCustomer ? (
                  <div className="flex items-center justify-between p-4 bg-accent/10 border-2 border-accent rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="bg-accent text-white p-2 rounded-full"><User size={20}/></div>
                      <div>
                        <p className="font-bold text-primary">{selectedCustomer.name}</p>
                        <p className="text-xs text-muted">{selectedCustomer.email} • {selectedCustomer.phone}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {setSelectedCustomer(null); setBookingData({...bookingData, customerId: 0})}}
                      className="text-xs font-bold text-accent underline"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                    <input 
                        className="w-full pl-12 pr-4 py-4 rounded-xl border border-surface outline-none focus:ring-2 focus:ring-accent"
                        placeholder="Search guest by name..."
                        value={customerSearch}
                        onChange={e => setCustomerSearch(e.target.value)}
                    />
                    {isSearchingCustomer && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-accent" size={18} />}
                    
                    {/* Search Results Dropdown */}
                    {customerResults.length > 0 && (
                      <div className="absolute z-50 w-full mt-2 bg-white border border-surface shadow-2xl rounded-xl overflow-hidden">
                        {customerResults.map(c => (
                          <div 
                            key={c.customerId} 
                            onClick={() => {
                              setSelectedCustomer(c);
                              setBookingData({...bookingData, customerId: c.customerId});
                              setCustomerResults([]);
                              setCustomerSearch('');
                            }}
                            className="p-4 hover:bg-surface cursor-pointer flex justify-between items-center border-b border-surface last:border-0"
                          >
                            <div>
                              <p className="font-bold text-sm">{c.name}</p>
                              <p className="text-[10px] text-muted">{c.phone}</p>
                            </div>
                            <Plus size={16} className="text-accent" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
            </div>

            <div className="flex gap-4 pt-4">
                <button onClick={() => setStep(1)} className="flex-1 py-4 border border-surface rounded-xl font-bold text-muted hover:bg-surface transition-all">Back</button>
                <button 
                    disabled={loading || !bookingData.roomId || !bookingData.customerId}
                    onClick={handleConfirmBooking}
                    className="flex-[2] bg-accent text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg shadow-accent/20 transition-all disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" /> : "Confirm Reservation"} <CheckCircle2 size={20} />
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DateInput({ label, value, onChange }: any) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-muted uppercase tracking-widest flex items-center gap-2">
                <Calendar size={12} /> {label}
            </label>
            <input 
                type="date"
                min={new Date().toISOString().split('T')[0]} // Block past dates
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full px-4 py-4 rounded-xl border border-surface focus:ring-2 focus:ring-accent outline-none font-bold text-primary"
            />
        </div>
    );
}

function Plus({ size, className }: { size: number, className?: string }) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="M12 5v14"/></svg>
    );
}