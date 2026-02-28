import { useState, useEffect, useCallback } from 'react';
import { Search, User, FileText, Table, Loader2, Calendar, DollarSign, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { reportService, type CustomerBookingData } from '../../api/reportService';
import { userService, type Customer } from '../../api/userService';

export default function CustomerHistoryReport() {
  const [customerId, setCustomerId] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [data, setData] = useState<CustomerBookingData[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState<'pdf' | 'excel' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [customersError, setCustomersError] = useState(false);

  // Load customers for selection
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const customerData = await userService.getCustomers();
        setCustomers(customerData);
        setCustomersError(false);
      } catch (error) {
        console.error('Error loading customers:', error);
        setCustomersError(true);
      }
    };
    loadCustomers();
  }, []);

  const fetchReport = useCallback(async () => {
    if (!customerId) return;
    
    setLoading(true);
    try {
      const response = await reportService.getCustomerHistory(Number(customerId));
      if (response.success) {
        setData(response.data);
      }
    } catch (error) {
      console.error('Error fetching customer history report:', error);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleExport = async (format: 'pdf' | 'excel') => {
    if (!customerId) return;
    
    setExporting(format);
    try {
      await reportService.exportCustomerHistory(Number(customerId), format);
    } catch (error) {
      console.error(`Error exporting ${format}:`, error);
    } finally {
      setExporting(null);
    }
  };

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerId(customer.customerId.toString());
  };

  const handleCustomerIdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customerId) {
      setSelectedCustomer(null); // Clear selected customer when using ID input
      fetchReport();
    }
  };

  const filteredCustomers = Array.isArray(customers) ? customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  ) : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'text-green-600 bg-green-100';
      case 'CANCELLED':
        return 'text-red-600 bg-red-100';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle size={14} />;
      case 'CANCELLED':
        return <XCircle size={14} />;
      default:
        return <Calendar size={14} />;
    }
  };

  const totalAmount = data.reduce((sum, booking) => sum + booking.totalAmount, 0);
  const confirmedBookings = data.filter(b => b.status === 'CONFIRMED').length;
  const cancelledBookings = data.filter(b => b.status === 'CANCELLED').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-primary">Customer Booking History</h1>
          <p className="text-muted text-sm italic">View complete booking history for any customer</p>
        </div>
      </div>

      {/* Customer Selection */}
      <div className="bg-white p-4 rounded-card shadow-sm border border-surface">
        <div className="space-y-4">
          {/* Customer ID Input */}
          <div>
            <label className="text-xs font-bold text-muted uppercase mb-2 block">Enter Customer ID</label>
            <form onSubmit={handleCustomerIdSubmit} className="flex gap-2">
              <input
                type="number"
                placeholder="Enter customer ID..."
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="flex-1 p-2 bg-surface rounded-lg outline-none border border-surface focus:border-primary"
              />
              <button
                type="submit"
                disabled={!customerId}
                className="bg-primary text-white px-4 py-2 rounded-button hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                Search
              </button>
            </form>
          </div>

          {/* Customer List - Only show if not error and has customers */}
          {!customersError && customers.length > 0 && (
            <>
              <div className="relative">
                <label className="text-xs font-bold text-muted uppercase mb-2 block">Or Select from List</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                  <input
                    type="text"
                    placeholder="Search by name, email, or phone..."
                    className="w-full pl-10 pr-4 py-2 bg-surface rounded-input focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Customer List */}
              <div className="max-h-40 overflow-y-auto border border-surface rounded-lg">
                {filteredCustomers.length === 0 ? (
                  <div className="p-4 text-center text-muted italic">No customers found</div>
                ) : (
                  filteredCustomers.map(customer => (
                    <div
                      key={customer.customerId}
                      onClick={() => handleCustomerSelect(customer)}
                      className={`p-3 border-b border-surface cursor-pointer hover:bg-background transition-colors ${
                        selectedCustomer?.customerId === customer.customerId ? 'bg-primary/10 border-primary' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                          {customer.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{customer.name}</p>
                          <p className="text-xs text-muted">ID: {customer.customerId} • {customer.email} • {customer.phone}</p>
                        </div>
                        {selectedCustomer?.customerId === customer.customerId && (
                          <CheckCircle size={16} className="text-primary" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {/* Permission Error Message */}
          {customersError && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-800">Limited Access</h3>
                  <p className="text-sm text-yellow-700">
                    Customer list is not available with your current permissions. Please use the Customer ID input above to search for specific customer booking history.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Export Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('pdf')}
              disabled={exporting !== null || !customerId}
              className="bg-red-600 text-white px-4 py-2 rounded-button flex items-center gap-2 hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {exporting === 'pdf' ? <Loader2 className="animate-spin" size={18} /> : <FileText size={18} />}
              Export PDF
            </button>
            <button
              onClick={() => handleExport('excel')}
              disabled={exporting !== null || !customerId}
              className="bg-green-600 text-white px-4 py-2 rounded-button flex items-center gap-2 hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {exporting === 'excel' ? <Loader2 className="animate-spin" size={18} /> : <Table size={18} />}
              Export Excel
            </button>
          </div>
        </div>
      </div>

      {/* Customer Info & Stats */}
      {customerId && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-card shadow-card border border-surface">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">Total Bookings</p>
                <p className="text-2xl font-bold text-primary">{data.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <User size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-card shadow-card border border-surface">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">Confirmed</p>
                <p className="text-2xl font-bold text-green-600">{confirmedBookings}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                <CheckCircle size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-card shadow-card border border-surface">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">Cancelled</p>
                <p className="text-2xl font-bold text-red-600">{cancelledBookings}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                <XCircle size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-card shadow-card border border-surface">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">Total Amount</p>
                <p className="text-2xl font-bold text-primary">₹{totalAmount.toLocaleString('en-IN')}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                <DollarSign size={24} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking History Table */}
      {customerId && (
        <div className="bg-white rounded-card shadow-card overflow-hidden border border-surface">
          <div className="p-4 border-b border-surface">
            <h2 className="font-semibold text-foreground">
              Booking History for {selectedCustomer ? selectedCustomer.name : `Customer ID: ${customerId}`}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface/30 border-b border-surface">
                  <th className="p-4 text-[10px] font-bold text-muted uppercase tracking-widest">Booking ID</th>
                  <th className="p-4 text-[10px] font-bold text-muted uppercase tracking-widest">Check-in</th>
                  <th className="p-4 text-[10px] font-bold text-muted uppercase tracking-widest">Check-out</th>
                  <th className="p-4 text-[10px] font-bold text-muted uppercase tracking-widest">Room</th>
                  <th className="p-4 text-[10px] font-bold text-muted uppercase tracking-widest text-right">Amount</th>
                  <th className="p-4 text-[10px] font-bold text-muted uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-20 text-center">
                      <Loader2 className="animate-spin mx-auto text-accent" size={32} />
                      <span className="text-sm text-muted italic block mt-2">Loading booking history...</span>
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-16 text-center text-muted italic">
                      No booking history found for this customer
                    </td>
                  </tr>
                ) : (
                  data.map((booking) => (
                    <tr key={booking.bookingId} className="hover:bg-background transition-colors">
                      <td className="p-4">
                        <span className="font-mono text-sm font-medium">#{booking.bookingId}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-muted" />
                          <span>{new Date(booking.checkIn).toLocaleDateString('en-IN')}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-muted" />
                          <span>{new Date(booking.checkOut).toLocaleDateString('en-IN')}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="bg-surface px-2 py-1 rounded text-sm font-medium">
                          {booking.roomNumber}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="font-semibold text-primary">₹{booking.totalAmount.toLocaleString('en-IN')}</span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {getStatusIcon(booking.status)}
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
