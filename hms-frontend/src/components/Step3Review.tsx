import { differenceInDays, parseISO } from 'date-fns';
import { bookingService } from '../api/bookingService';
import { FileText, Info, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Step3Review({ data, onBack }: any) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate nights and prices
  const nights = (data.checkIn && data.checkOut) 
    ? differenceInDays(parseISO(data.checkOut), parseISO(data.checkIn)) 
    : 0;
  
  const subtotal = nights * data.roomPrice;
  const tax = subtotal * 0.18;
  const grandTotal = subtotal + tax;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        customerId: Number(data.customerId),
        roomId: Number(data.roomId),
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        status: 'CONFIRMED'
      };
      
      const response = await bookingService.createBooking(payload);
      
      if (response.success) {
        // Navigate to confirmation with invoice data
        navigate('/bookings', { state: { message: "Booking created successfully!" } });
      }
    } catch (error) {
      alert("Booking failed. Please check if the room is still available.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-primary mb-4">
        <FileText size={24} />
        <h3 className="font-heading text-xl">Review & Invoice Summary</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-surface/30 p-6 rounded-card border border-surface">
        {/* Guest & Stay Details */}
        <div className="space-y-4">
          <h4 className="font-label text-muted text-xs uppercase tracking-widest">Stay Details</h4>
          <div className="space-y-2">
            <p className="text-sm"><strong>Guest ID:</strong> #{data.customerId}</p>
            <p className="text-sm"><strong>Room:</strong> {data.roomNumber} ({nights} nights)</p>
            <p className="text-sm"><strong>Dates:</strong> {data.checkIn} to {data.checkOut}</p>
          </div>
        </div>

        {/* Pricing Breakdown */}
        <div className="space-y-4">
          <h4 className="font-label text-muted text-xs uppercase tracking-widest text-right">Pricing</h4>
          <div className="space-y-2 text-right">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Subtotal:</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">GST (18%):</span>
              <span>₹{tax.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between border-t border-surface pt-2 mt-2 font-bold text-lg text-primary">
              <span>Total:</span>
              <span>₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 p-4 rounded-button flex items-start gap-3">
        <Info className="text-amber-600 shrink-0" size={20} />
        <p className="text-xs text-amber-800">
          By clicking confirm, you are reserving Room {data.roomNumber}. This action will update the room status to "OCCUPIED" for the selected dates.
        </p>
      </div>

      <div className="flex gap-4 pt-4">
        <button 
          onClick={onBack} 
          disabled={isSubmitting}
          className="flex-1 border border-surface p-4 rounded-button hover:bg-surface transition-all"
        >
          Back
        </button>
        <button 
          onClick={handleConfirm} 
          disabled={isSubmitting || nights <= 0}
          className="flex-1 bg-accent text-white p-4 rounded-button font-bold hover:bg-opacity-90 disabled:bg-muted shadow-lg shadow-accent/20 transition-all flex justify-center items-center gap-2"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Confirm & Book Now"}
        </button>
      </div>
    </div>
  );
}