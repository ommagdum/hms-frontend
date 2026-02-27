import { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, Plus, Ban, Eye, Calendar, Home, Loader2, X,
  XCircle,
  Pencil,
  CheckCircle2
} from 'lucide-react';
import { bookingService, type Booking } from '../api/bookingService';
import { format, isToday, parseISO, isAfter, startOfDay } from 'date-fns';

export default function Bookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    guestName: '',
    roomNumber: '',
    status: ''
  });
  const location = useLocation();
  const [toast, setToast] = useState<string | null>(location.state?.message || null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchEnrichedBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await bookingService.getAllBookings({
        page: 0,
        size: 50,
        guestName: filters.guestName,
        roomNumber: filters.roomNumber,
        status: filters.status
      });
      if (res.success) {
        setBookings(res.data.content || []);
      }
    } catch (err) {
      console.error("Failed to load bookings", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEnrichedBookings();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchEnrichedBookings]);

  const handleCancel = async (id: number) => {
    const confirmed = window.confirm(
        "Are you sure you want to cancel this booking? This will immediately free up the room for other guests."
    );
    if (!confirmed) return;

    try {
        setLoading(true);
        const res = await bookingService.cancelBooking(id);
        if (res.success) {
            setBookings(prev => prev.map(b => 
                b.bookingId === id ? { ...b, status: 'CANCELLED' } : b
            ));
            alert("Booking cancelled successfully.");
        }
    } catch (err: any) {
        alert(`Error: ${err.response?.data?.message || "Failed to cancel booking."}`);
    } finally {
        setLoading(false);
    }
  };

  const clearFilters = () => setFilters({ guestName: '', roomNumber: '', status: '' });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {toast && (
        <div className="fixed top-24 right-8 z-50 animate-in slide-in-from-right-10">
          <div className="bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">
            <CheckCircle2 size={20} />
            <p className="font-bold text-sm">{toast}</p>
          </div>
        </div>
      )}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-primary flex items-center gap-2">
            <Calendar className="text-accent" /> Reservation Ledger
          </h1>
          <p className="text-muted text-sm mt-1">Manage guest stays with real-time backend filtering.</p>
        </div>
        <button 
          onClick={() => navigate('/bookings/new')}
          className="bg-primary text-white px-6 py-3 rounded-button font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg"
        >
          <Plus size={20} /> New Reservation
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-surface shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
          <input 
            type="text"
            placeholder="Search Guest Name..."
            className="w-full pl-10 pr-4 py-2 border border-surface rounded-lg text-sm outline-none focus:ring-2 focus:ring-accent"
            value={filters.guestName}
            onChange={(e) => setFilters({...filters, guestName: e.target.value})}
          />
        </div>
        
        <input 
          type="text"
          placeholder="Room #"
          className="w-full px-4 py-2 border border-surface rounded-lg text-sm outline-none focus:ring-2 focus:ring-accent"
          value={filters.roomNumber}
          onChange={(e) => setFilters({...filters, roomNumber: e.target.value})}
        />

        <select 
          className="w-full px-4 py-2 border border-surface rounded-lg text-sm outline-none focus:ring-2 focus:ring-accent"
          value={filters.status}
          onChange={(e) => setFilters({...filters, status: e.target.value})}
        >
          <option value="">All Statuses</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <button onClick={clearFilters} className="text-xs font-bold text-muted hover:text-primary flex items-center justify-center gap-1 uppercase">
          <X size={14} /> Clear Filters
        </button>
      </div>

      <div className="bg-white rounded-card border border-surface shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface/30 border-b border-surface">
              <tr>
                <th className="p-4 text-[10px] font-bold text-muted uppercase tracking-widest">Guest & Unit</th>
                <th className="p-4 text-[10px] font-bold text-muted uppercase tracking-widest">Stay Period</th>
                <th className="p-4 text-[10px] font-bold text-muted uppercase tracking-widest">Revenue</th>
                <th className="p-4 text-[10px] font-bold text-muted uppercase tracking-widest text-center">Status</th>
                <th className="p-4 text-[10px] font-bold text-muted uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    <Loader2 className="animate-spin text-accent mx-auto mb-2" />
                    <span className="text-sm text-muted italic">Syncing with ledger...</span>
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => {
                  const checkInDate = parseISO(booking.checkIn);
                  const isCancelled = booking.status === 'CANCELLED';
                  const arrivesToday = isToday(checkInDate) && !isCancelled;
                  
                  // DEFINE ISUPCOMING: Future check-in dates (after today)
                  const isUpcoming = isAfter(startOfDay(checkInDate), startOfDay(new Date()));

                  return (
                    <tr key={booking.bookingId} className={`hover:bg-background transition-colors ${arrivesToday ? 'bg-accent/5' : ''}`}>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${arrivesToday ? 'bg-accent text-white' : 'bg-surface text-primary'}`}>
                            {booking.customerName?.charAt(0) || 'G'}
                          </div>
                          <div>
                            <p className="font-bold text-primary text-sm">{booking.customerName}</p>
                            <p className="text-[10px] text-muted flex items-center gap-1 uppercase font-semibold">
                              <Home size={10} /> Room {booking.roomNumber} • {booking.roomType}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="text-xs font-medium space-y-1">
                          <p className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500" /> 
                            {format(checkInDate, 'MMM dd, yyyy')}
                            {arrivesToday && <span className="ml-2 text-[8px] bg-accent text-white px-1.5 py-0.5 rounded animate-pulse">ARRIVING TODAY</span>}
                          </p>
                          <p className="flex items-center gap-2 text-muted">
                            <span className="w-2 h-2 rounded-full bg-red-500" /> 
                            {format(parseISO(booking.checkOut), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </td>

                      <td className="p-4">
                        <p className={`font-bold text-sm ${isCancelled ? 'text-muted line-through opacity-50' : 'text-primary'}`}>
                          ₹{booking.totalAmount?.toLocaleString()}
                        </p>
                        {isCancelled && <p className="text-[9px] text-red-500 font-bold uppercase mt-1">₹0.00 (Refunded)</p>}
                      </td>

                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${isCancelled ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                          {booking.status}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          <button onClick={() => navigate(`/bookings/${booking.bookingId}`)} className="p-2 text-muted hover:text-primary hover:bg-surface rounded-lg transition-all" title="View Details">
                            <Eye size={18} />
                          </button>

                          {/* EDIT Logic */}
                          {!isCancelled && isUpcoming && (
                            <button onClick={() => navigate(`/bookings/edit/${booking.bookingId}`)} className="p-2 text-muted hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit Reservation">
                              <Pencil size={18} />
                            </button>
                          )}

                          {/* CANCEL Logic based on Backend Section 4 */}
                          {!isCancelled && (
                            <button 
                              onClick={() => handleCancel(booking.bookingId!)}
                              className={`p-2 rounded-lg transition-all ${isUpcoming || arrivesToday ? 'text-muted hover:text-red-600 hover:bg-red-50' : 'opacity-30 cursor-not-allowed'}`}
                              disabled={!isUpcoming && !arrivesToday}
                              title={isUpcoming || arrivesToday ? "Cancel Reservation" : "Cannot cancel past stay"}
                            >
                              <Ban size={18} />
                            </button>
                          )}

                          {isCancelled && <span className="p-2 text-red-300"><XCircle size={18} /></span>}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}