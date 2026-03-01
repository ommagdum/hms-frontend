import { useState, useEffect } from 'react';
import { X, Download, Mail, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { invoiceService } from '../api/invoiceService';
import { customerService, type Customer } from '../api/customerService';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: number;
  bookingDetails?: {
    customerName: string;
    customerId?: number;
    customerEmail: string;
    customerPhone: string;
    roomNumber: string;
    checkIn: string;
    checkOut: string;
    totalAmount: number;
  };
}

export default function InvoiceModal({ isOpen, onClose, bookingId, bookingDetails }: InvoiceModalProps) {
  const [loading, setLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customerData, setCustomerData] = useState<{ email: string; phone: string } | null>(null);

  // Fetch customer data when modal opens
  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!isOpen || !bookingDetails?.customerId) return;
      
      try {
        // Search through all pages to find the customer
        let targetCustomer: Customer | null = null;
        let page = 0;
        
        while (!targetCustomer && page < 10) { // Limit to prevent infinite loop
          const res = await customerService.getCustomers(page);
          const pageCustomers = res.data?.content || []; // ✅ Match customers page: res.data.content
          targetCustomer = pageCustomers.find((c: Customer) => c.customerId === bookingDetails.customerId) || null;
          
          if (targetCustomer) break;
          page++;
        }
        
        if (targetCustomer) {
          setCustomerData({
            email: targetCustomer.email,
            phone: targetCustomer.phone
          });
        }
      } catch (error) {
        console.error('Error fetching customer data:', error);
      }
    };

    fetchCustomerData();
  }, [isOpen, bookingDetails?.customerId]);

  if (!isOpen) return null;

  const handleDownload = async () => {
    setLoading(true);
    setError(null);
    try {
      await invoiceService.downloadInvoice(bookingId);
    } catch (error) {
      console.error('Error downloading invoice:', error);
      setError('Failed to download invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = async () => {
    setLoading(true);
    setError(null);
    try {
      await invoiceService.openInvoiceInNewTab(bookingId);
    } catch (error) {
      console.error('Error opening invoice for print:', error);
      setError('Failed to open invoice for printing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    setEmailLoading(true);
    setError(null);
    setEmailSent(false);
    try {
      const response = await invoiceService.sendInvoiceEmail(bookingId);
      if (response.success) {
        setEmailSent(true);
        setTimeout(() => setEmailSent(false), 3000); // Hide success message after 3 seconds
      }
    } catch (error) {
      console.error('Error sending invoice email:', error);
      setError('Failed to send invoice email. Please try again.');
    } finally {
      setEmailLoading(false);
    }
  };

  const calculateNights = () => {
    if (!bookingDetails?.checkIn || !bookingDetails?.checkOut) return 0;
    const checkIn = new Date(bookingDetails.checkIn);
    const checkOut = new Date(bookingDetails.checkOut);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateTax = () => {
    if (!bookingDetails?.totalAmount) return 0;
    return Math.round(bookingDetails.totalAmount * 0.18);
  };

  const subtotal = bookingDetails?.totalAmount || 0;
  const tax = calculateTax();
  const grandTotal = subtotal + tax;
  const nights = calculateNights();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-card shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-surface p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Invoice</h2>
              <p className="text-sm text-muted">Booking #{bookingId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Invoice Content */}
        <div className="p-6 space-y-6">
          {/* Invoice Header */}
          <div className="bg-surface/30 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-foreground text-lg">Hotel Management System</h3>
                <p className="text-sm text-muted">123 Hotel Street</p>
                <p className="text-sm text-muted">City, State 12345</p>
                <p className="text-sm text-muted">Phone: +1 234 567 8900</p>
                <p className="text-sm text-muted">Email: info@hotel.com</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted">Invoice Number</p>
                <p className="font-bold text-foreground">INV-{bookingId}-{new Date().getFullYear()}</p>
                <p className="text-sm text-muted mt-2">Date: {new Date().toLocaleDateString('en-IN')}</p>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          {bookingDetails && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-surface/30 rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">Customer Information</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-muted">Name:</span> {bookingDetails.customerName}</p>
                  <p><span className="text-muted">Email:</span> {customerData?.email || 'Loading...'}</p>
                  <p><span className="text-muted">Phone:</span> {customerData?.phone || 'Loading...'}</p>
                </div>
              </div>
              <div className="bg-surface/30 rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">Booking Details</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-muted">Room:</span> {bookingDetails.roomNumber}</p>
                  <p><span className="text-muted">Check-in:</span> {new Date(bookingDetails.checkIn).toLocaleDateString('en-IN')}</p>
                  <p><span className="text-muted">Check-out:</span> {new Date(bookingDetails.checkOut).toLocaleDateString('en-IN')}</p>
                  <p><span className="text-muted">Nights:</span> {nights}</p>
                </div>
              </div>
            </div>
          )}

          {/* Invoice Table */}
          <div className="border border-surface rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-surface/30">
                <tr>
                  <th className="text-left p-3 text-sm font-semibold text-foreground">Description</th>
                  <th className="text-right p-3 text-sm font-semibold text-foreground">Qty</th>
                  <th className="text-right p-3 text-sm font-semibold text-foreground">Rate</th>
                  <th className="text-right p-3 text-sm font-semibold text-foreground">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface">
                <tr>
                  <td className="p-3 text-sm">Room Charges ({bookingDetails?.roomNumber || 'N/A'})</td>
                  <td className="p-3 text-sm text-right">{nights}</td>
                  <td className="p-3 text-sm text-right">₹{nights > 0 ? Math.round(subtotal / nights).toLocaleString('en-IN') : 0}</td>
                  <td className="p-3 text-sm text-right font-medium">₹{subtotal.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td className="p-3 text-sm" colSpan={3}>Tax (18%)</td>
                  <td className="p-3 text-sm text-right font-medium">₹{tax.toLocaleString('en-IN')}</td>
                </tr>
                <tr className="bg-primary/5">
                  <td className="p-3 text-sm font-bold" colSpan={3}>Grand Total</td>
                  <td className="p-3 text-sm text-right font-bold text-primary">₹{grandTotal.toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-800">Error</h4>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {emailSent && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle size={20} className="text-green-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-800">Email Sent</h4>
                <p className="text-sm text-green-700">Invoice has been successfully sent to the customer's email address.</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-surface">
            <button
              onClick={handlePrint}
              disabled={loading}
              className="flex-1 bg-primary text-white px-4 py-3 rounded-button flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <FileText size={18} />}
              Print Invoice
            </button>
            <button
              onClick={handleDownload}
              disabled={loading}
              className="flex-1 bg-accent text-accent-foreground px-4 py-3 rounded-button flex items-center justify-center gap-2 hover:bg-accent/90 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
              Download PDF
            </button>
            <button
              onClick={handleSendEmail}
              disabled={emailLoading || !bookingDetails?.customerEmail}
              className="flex-1 bg-green-600 text-white px-4 py-3 rounded-button flex items-center justify-center gap-2 hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {emailLoading ? <Loader2 className="animate-spin" size={18} /> : <Mail size={18} />}
              Send to Customer
            </button>
          </div>

          {/* Note */}
          <div className="text-xs text-muted text-center pt-2 border-t border-surface">
            <p>This invoice was automatically generated. Thank you for your business!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
