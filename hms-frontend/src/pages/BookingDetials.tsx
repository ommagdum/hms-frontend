import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Home, CreditCard, Printer, Ban } from 'lucide-react';
import { bookingService, type Booking } from '../api/bookingService';
import { format, parseISO } from 'date-fns';

export default function BookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        // We'll need to add getBookingById to bookingService
        const res = await bookingService.getBookingById(Number(id));
        if (res.success) setBooking(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) return <div className="p-20 text-center text-muted">Loading voucher...</div>;
  if (!booking) return <div className="p-20 text-center text-red-500">Booking not found.</div>;

  const isCancelled = booking.status === 'CANCELLED';

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-muted hover:text-primary transition-all">
        <ArrowLeft size={16} /> Back to Ledger
      </button>

      <div className="bg-white rounded-3xl border border-surface shadow-2xl overflow-hidden">
        {/* Top Branding Section */}
        <div className={`p-8 text-white ${isCancelled ? 'bg-slate-500' : 'bg-primary'}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] opacity-70">Reservation Voucher</p>
              <h1 className="text-3xl font-bold mt-1">#{booking.bookingId}</h1>
            </div>
            <div className={`px-4 py-2 rounded-full text-xs font-bold uppercase border-2 ${isCancelled ? 'border-red-300 text-red-200' : 'border-green-300 text-green-200'}`}>
              {booking.status}
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <DetailBlock icon={User} label="Primary Guest" value={booking.customerName || `Guest #${booking.customerId}`} />
          <DetailBlock icon={Home} label="Accomodation" value={`Room ${booking.roomNumber}`} subValue={booking.roomType} />
          <DetailBlock icon={Calendar} label="Check-In" value={format(parseISO(booking.checkIn), 'EEEE, MMM dd, yyyy')} />
          <DetailBlock icon={Calendar} label="Check-Out" value={format(parseISO(booking.checkOut), 'EEEE, MMM dd, yyyy')} />
        </div>

        <div className="px-8 pb-8">
          <div className="bg-surface/30 p-6 rounded-2xl flex justify-between items-center border border-surface">
            <div className="flex items-center gap-3">
              <CreditCard className="text-muted" />
              <div>
                <p className="text-[10px] font-black text-muted uppercase">Total Paid</p>
                <p className={`text-2xl font-bold ${isCancelled ? 'line-through text-muted' : 'text-primary'}`}>
                  ₹{booking.totalAmount?.toLocaleString()}
                </p>
              </div>
            </div>
            <button onClick={() => window.print()} className="p-3 bg-white border border-surface rounded-xl hover:bg-surface transition-all">
              <Printer size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailBlock({ icon: Icon, label, value, subValue }: any) {
  return (
    <div className="flex gap-4">
      <div className="p-3 bg-surface rounded-xl h-fit text-primary"><Icon size={20} /></div>
      <div>
        <p className="text-[10px] font-black text-muted uppercase tracking-wider">{label}</p>
        <p className="font-bold text-primary">{value}</p>
        {subValue && <p className="text-xs text-muted font-medium">{subValue}</p>}
      </div>
    </div>
  );
}