import { useState, useEffect } from 'react';
import { X, Loader2, Save } from 'lucide-react';
import { roomService } from '../api/roomService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData: {
    roomId: number;
    roomNumber: string;
    roomType: string;
    price: number;
    status: string;
  } | null;
}

export default function AddRoomModal({ isOpen, onClose, onSuccess, editData }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<{
    roomNumber: string;
    roomType: string;
    price: string;
    status: 'AVAILABLE' | 'MAINTENANCE' | 'OCCUPIED';
    amenities: string;
  }>({
    roomNumber: '',
    roomType: 'DELUXE',
    price: '',
    status: 'AVAILABLE',
    amenities: ''
  });

  useEffect(() => {
    if (editData) {
      setFormData({
        roomNumber: editData.roomNumber,
        roomType: editData.roomType,
        price: String(editData.price),
        status: editData.status as 'AVAILABLE' | 'MAINTENANCE' | 'OCCUPIED',
        amenities: ''
      });
    } else {
      setFormData({ roomNumber: '', roomType: 'DELUXE', price: '', status: 'AVAILABLE', amenities: '' });
    }
  }, [editData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let res;
      
      if (editData?.roomId) {
        res = await roomService.updateRoom(editData.roomId, {
          roomNumber: formData.roomNumber,
          roomType: formData.roomType,
          price: Number(formData.price),
          status: formData.status,
          amenities: formData.amenities
        });
      } else {
        res = await roomService.createRoom({
          roomNumber: formData.roomNumber,
          roomType: formData.roomType,
          price: Number(formData.price),
          status: formData.status,
          amenities: formData.amenities
        });
      }
      
      if (res.success) {
        onSuccess();
        onClose();
        setFormData({ roomNumber: '', roomType: 'DELUXE', price: '', status: 'AVAILABLE', amenities: '' });
      }
    } catch (err) {
      console.error("Failed to save room", err);
      alert("Error saving room. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="h-full w-full max-w-md bg-white rounded-card shadow-2xl animate-in zoom-in-95 overflow-hidden">
        <div className="p-6 border-b border-surface flex justify-between items-center bg-primary text-white">
          <h2 className="text-xl font-heading font-bold">{editData ? 'Edit Room' : 'Add New Room'}</h2>
          <button onClick={onClose} className="hover:rotate-90 transition-transform">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-muted uppercase mb-2">Room Number</label>
            <input 
              required
              className="w-full p-2 bg-surface rounded-lg outline-none border border-surface focus:border-primary"
              placeholder="e.g. 301"
              value={formData.roomNumber}
              onChange={e => setFormData({...formData, roomNumber: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-muted uppercase mb-2">Room Type</label>
            <select 
              className="w-full p-2 bg-surface rounded-lg outline-none border border-surface focus:border-primary font-medium"
              value={formData.roomType}
              onChange={e => setFormData({...formData, roomType: e.target.value})}
            >
              <option value="Single">Single</option>
              <option value="Double">Double</option>
              <option value="Deluxe">Deluxe</option>
              <option value="Suite">Suite</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-muted uppercase mb-2">Price Per Night (₹)</label>
            <input 
              required
              type="number"
              className="w-full p-2 bg-surface rounded-lg outline-none border border-surface focus:border-primary"
              placeholder="e.g. 2500"
              value={formData.price}
              onChange={e => setFormData({...formData, price: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-muted uppercase mb-2">Status</label>
            <select 
              className="w-full p-2 bg-surface rounded-lg outline-none border border-surface focus:border-primary font-medium"
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value as 'AVAILABLE' | 'MAINTENANCE' | 'OCCUPIED'})}
            >
              <option value="AVAILABLE">Available</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="OCCUPIED">Occupied</option>
            </select>
          </div>

          <div className="pt-6">
            <button 
              disabled={loading}
              className="w-full bg-accent text-white py-4 rounded-button font-bold flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {editData ? 'Update Room' : 'Save Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}