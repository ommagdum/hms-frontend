import { useEffect, useState } from "react";
import { X, Loader2, Calendar, MapPin } from "lucide-react";
import { customerService } from "../api/customerService";
import { format, parseISO } from "date-fns";

interface Props {
    customer: { customerId: number; name: string } | null;
    onClose: () => void;
}

export default function GuestHistoryModal({ customer, onClose }: Props) {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (customer) {
            const fetchHistory = async () => {
                setLoading(true);
                try {
                    const res = await customerService.getBookingHistory(customer.customerId);
                    // data.content contains the list of BookingDtos
                    if (res.success) setHistory(res.data.content);
                } finally {
                    setLoading(false);
                }
            };
            fetchHistory();
        }
    }, [customer]);

    if (!customer) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-card w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95">
                {/* Header */}
                <div className="p-6 border-b border-surface flex justify-between items-center">
                    <div>
                        <h2 className="font-bold text-xl text-primary">Stay History</h2>
                        <p className="text-sm text-muted">Viewing records for <span className="text-accent font-semibold">{customer.name}</span></p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-surface rounded-full transition-colors"><X /></button>
                </div>

                {/* History List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-background/30">
                    {loading ? (
                        <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-accent" /></div>
                    ) : history.length === 0 ? (
                        <div className="py-20 text-center text-muted italic">This guest has no prior booking records.</div>
                    ) : (
                        history.map((booking) => (
                            <div key={booking.bookingId} className="bg-white p-4 rounded-xl border border-surface shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-primary/5 text-primary rounded-lg"><Calendar size={16}/></div>
                                        <div>
                                            <p className="text-xs font-bold text-muted uppercase tracking-tighter">Reservation #{booking.bookingId}</p>
                                            <p className="text-sm font-bold">{format(parseISO(booking.checkIn), 'MMM dd')} — {format(parseISO(booking.checkOut), 'MMM dd, yyyy')}</p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                                        booking.status === 'CONFIRMED' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                    }`}>
                                        {booking.status}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t border-surface border-dashed">
                                    <div className="flex items-center gap-1 text-xs text-muted font-medium">
                                        <MapPin size={12}/> Room {booking.roomNumber} ({booking.roomType})
                                    </div>
                                    <p className="font-bold text-primary">₹{booking.totalAmount?.toLocaleString()}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}