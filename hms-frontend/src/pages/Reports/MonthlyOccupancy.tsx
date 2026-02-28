import { useState, useEffect, useCallback } from 'react';
import { Calendar, FileText, Table, Loader2, Home, TrendingUp, Users } from 'lucide-react';
import { reportService, type MonthlyOccupancyData } from '../../api/reportService';

export default function MonthlyOccupancyReport() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);
  const [data, setData] = useState<MonthlyOccupancyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState<'pdf' | 'excel' | null>(null);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const response = await reportService.getMonthlyOccupancy(year, month);
      if (response.success) {
        setData(response.data);
      }
    } catch (error) {
      console.error('Error fetching monthly occupancy report:', error);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleExport = async (format: 'pdf' | 'excel') => {
    setExporting(format);
    try {
      await reportService.exportMonthlyOccupancy(year, month, format);
    } catch (error) {
      console.error(`Error exporting ${format}:`, error);
    } finally {
      setExporting(null);
    }
  };

  const getMonthName = (month: number) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month - 1];
  };

  const getOccupancyColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100';
    if (percentage >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-primary">Monthly Occupancy Report</h1>
          <p className="text-muted text-sm italic">Analyze room occupancy rates and statistics</p>
        </div>
      </div>

      {/* Month/Year Selection */}
      <div className="bg-white p-4 rounded-card shadow-sm border border-surface">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="text-xs font-bold text-muted uppercase mb-2 block">Year</label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full p-2 bg-surface rounded-lg outline-none border border-surface focus:border-primary"
            >
              {Array.from({ length: 5 }, (_, i) => currentYear - i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="text-xs font-bold text-muted uppercase mb-2 block">Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full p-2 bg-surface rounded-lg outline-none border border-surface focus:border-primary"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>{getMonthName(m)}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('pdf')}
              disabled={exporting !== null || !data}
              className="bg-red-600 text-white px-4 py-2 rounded-button flex items-center gap-2 hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {exporting === 'pdf' ? <Loader2 className="animate-spin" size={18} /> : <FileText size={18} />}
              Export PDF
            </button>
            <button
              onClick={() => handleExport('excel')}
              disabled={exporting !== null || !data}
              className="bg-green-600 text-white px-4 py-2 rounded-button flex items-center gap-2 hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {exporting === 'excel' ? <Loader2 className="animate-spin" size={18} /> : <Table size={18} />}
              Export Excel
            </button>
          </div>
        </div>
      </div>

      {/* Occupancy Statistics */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-card shadow-card border border-surface">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">Occupancy Rate</p>
                <p className="text-2xl font-bold text-primary">
                  {data.occupancyPercentage.toFixed(1)}%
                </p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getOccupancyColor(data.occupancyPercentage)}`}>
                <TrendingUp size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-card shadow-card border border-surface">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">Occupied Nights</p>
                <p className="text-2xl font-bold text-primary">{data.occupiedRoomNights}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                <Home size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-card shadow-card border border-surface">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">Available Nights</p>
                <p className="text-2xl font-bold text-primary">{data.totalAvailableRoomNights}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                <Calendar size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-card shadow-card border border-surface">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">Available Rooms</p>
                <p className="text-2xl font-bold text-primary">
                  {Math.round(data.totalAvailableRoomNights / new Date(year, month, 0).getDate())}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                <Users size={24} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Occupancy Visualization */}
      {data && (
        <div className="bg-white rounded-card shadow-card overflow-hidden border border-surface">
          <div className="p-4 border-b border-surface">
            <h2 className="font-semibold text-foreground">Occupancy Breakdown</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Occupied Nights</span>
                  <span className="text-sm font-bold text-primary">{data.occupiedRoomNights}</span>
                </div>
                <div className="w-full bg-surface rounded-full h-4">
                  <div
                    className="bg-primary h-4 rounded-full transition-all duration-500"
                    style={{ width: `${data.occupancyPercentage}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Available Nights</span>
                  <span className="text-sm font-bold text-muted">
                    {data.totalAvailableRoomNights - data.occupiedRoomNights}
                  </span>
                </div>
                <div className="w-full bg-surface rounded-full h-4">
                  <div
                    className="bg-surface/50 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${100 - data.occupancyPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-card shadow-card overflow-hidden border border-surface p-20 text-center">
          <Loader2 className="animate-spin mx-auto text-accent" size={32} />
          <span className="text-sm text-muted italic block mt-2">Loading occupancy data...</span>
        </div>
      )}
    </div>
  );
}
