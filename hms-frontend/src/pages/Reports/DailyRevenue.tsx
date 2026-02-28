import { useState, useEffect, useCallback } from 'react';
import { Calendar, FileText, Table, Loader2, TrendingUp, DollarSign } from 'lucide-react';
import { reportService, type DailyRevenueData } from '../../api/reportService';

export default function DailyRevenueReport() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [data, setData] = useState<DailyRevenueData[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState<'pdf' | 'excel' | null>(null);

  // Set default dates to last 30 days
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
  }, []);

  const fetchReport = useCallback(async () => {
    if (!startDate || !endDate) return;
    
    setLoading(true);
    try {
      const response = await reportService.getDailyRevenue(startDate, endDate);
      if (response.success) {
        setData(response.data);
      }
    } catch (error) {
      console.error('Error fetching daily revenue report:', error);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleExport = async (format: 'pdf' | 'excel') => {
    if (!startDate || !endDate) return;
    
    setExporting(format);
    try {
      await reportService.exportDailyRevenue(startDate, endDate, format);
    } catch (error) {
      console.error(`Error exporting ${format}:`, error);
    } finally {
      setExporting(null);
    }
  };

  const totalRevenue = data.reduce((sum, item) => sum + item.totalRevenue, 0);
  const totalBookings = data.reduce((sum, item) => sum + item.totalBookings, 0);
  const averageRevenue = data.length > 0 ? totalRevenue / data.length : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-primary">Daily Revenue Report</h1>
          <p className="text-muted text-sm italic">Analyze daily revenue and booking trends</p>
        </div>
      </div>

      {/* Date Selection */}
      <div className="bg-white p-4 rounded-card shadow-sm border border-surface">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="text-xs font-bold text-muted uppercase mb-2 block">Start Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-surface rounded-input focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
          </div>
          <div className="flex-1">
            <label className="text-xs font-bold text-muted uppercase mb-2 block">End Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-surface rounded-input focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('pdf')}
              disabled={exporting !== null || data.length === 0}
              className="bg-red-600 text-white px-4 py-2 rounded-button flex items-center gap-2 hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {exporting === 'pdf' ? <Loader2 className="animate-spin" size={18} /> : <FileText size={18} />}
              Export PDF
            </button>
            <button
              onClick={() => handleExport('excel')}
              disabled={exporting !== null || data.length === 0}
              className="bg-green-600 text-white px-4 py-2 rounded-button flex items-center gap-2 hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {exporting === 'excel' ? <Loader2 className="animate-spin" size={18} /> : <Table size={18} />}
              Export Excel
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-card shadow-card border border-surface">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Total Revenue</p>
              <p className="text-2xl font-bold text-primary">₹{totalRevenue.toLocaleString('en-IN')}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <DollarSign size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-card shadow-card border border-surface">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Total Bookings</p>
              <p className="text-2xl font-bold text-primary">{totalBookings}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-card shadow-card border border-surface">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Average Daily Revenue</p>
              <p className="text-2xl font-bold text-primary">₹{averageRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
              <Calendar size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-card shadow-card overflow-hidden border border-surface">
        <div className="p-4 border-b border-surface">
          <h2 className="font-semibold text-foreground">Revenue Details</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface/30 border-b border-surface">
                <th className="p-4 text-[10px] font-bold text-muted uppercase tracking-widest">Date</th>
                <th className="p-4 text-[10px] font-bold text-muted uppercase tracking-widest text-right">Revenue</th>
                <th className="p-4 text-[10px] font-bold text-muted uppercase tracking-widest text-right">Bookings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface">
              {loading ? (
                <tr>
                  <td colSpan={3} className="p-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-accent" size={32} />
                    <span className="text-sm text-muted italic block mt-2">Loading revenue data...</span>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-16 text-center text-muted italic">
                    No revenue data found for the selected period
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr key={index} className="hover:bg-background transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-muted" />
                        <span className="font-medium">{new Date(item.date).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-semibold text-primary">₹{item.totalRevenue.toLocaleString('en-IN')}</span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="bg-accent/10 text-accent px-2 py-1 rounded-full text-sm font-medium">
                        {item.totalBookings}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
