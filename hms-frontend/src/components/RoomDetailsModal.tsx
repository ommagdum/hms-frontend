import { X, ShieldCheck, Tag, Info, Edit, Trash2 } from 'lucide-react';

interface Props {
  room: {
    roomId: number;
    roomNumber: string;
    roomType: string;
    price: number;
    status: string;
    amenities: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (room: {
    roomId: number;
    roomNumber: string;
    roomType: string;
    price: number;
    status: string;
    amenities: string;
  }) => void;
  onDelete?: (roomId: number) => void;
}

export default function RoomDetailsModal({ room, isOpen, onClose, onEdit, onDelete }: Props) {
  if (!isOpen || !room) return null;

  const handleEdit = () => {
    if (onEdit) onEdit(room);
  };

  const handleDelete = () => {
    if (onDelete && room.roomId) {
      if (window.confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
        onDelete(room.roomId);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header with consistent styling */}
        <div className="p-6 border-b border-surface flex justify-between items-center bg-primary text-white">
          <div>
            <h2 className="text-2xl font-heading font-bold">Room {room.roomNumber}</h2>
            <p className="text-xs opacity-80 uppercase tracking-widest font-bold">{room.roomType}</p>
          </div>
          <button onClick={onClose} className="hover:rotate-90 transition-transform">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* FIX: Changed from room.pricePerNight to room.price */}
            <DetailItem icon={Tag} label="Price/Night" value={`₹${room.price}`} />
            <DetailItem icon={ShieldCheck} label="Current Status" value={room.status} isStatus />
          </div>

          <div className="border-t border-surface pt-6">
            <div className="flex items-center gap-2 mb-3 text-primary">
              <Info size={18} />
              <h4 className="font-bold text-sm uppercase">Amenities & Features</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {room.amenities ? room.amenities.split(',').map((a: string) => (
                <span key={a} className="bg-background px-3 py-1 rounded-full text-xs font-medium border border-surface text-muted">
                  {a.trim()}
                </span>
              )) : (
                <p className="text-sm text-muted italic">No specific amenities listed.</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 bg-surface/30 border-t border-surface flex justify-between gap-3">
          <button 
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-sm"
          >
            <Edit size={16} />
            Edit Room
          </button>
          <button 
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-all shadow-sm"
          >
            <Trash2 size={16} />
            Delete Room
          </button>
          <button 
            onClick={onClose}
            className="px-6 py-2 border border-surface text-muted rounded-lg text-sm font-medium hover:bg-surface transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

interface DetailItemProps {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  value: string | number;
  isStatus?: boolean;
}

function DetailItem({ icon: Icon, label, value, isStatus = false }: DetailItemProps) {
  const statusUpper = isStatus ? String(value).toUpperCase() : "";

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-muted uppercase text-[10px] font-bold tracking-widest">
        <Icon size={12} /> {label}
      </div>
      <p className={`text-lg font-bold ${isStatus && statusUpper === 'AVAILABLE' ? 'text-green-600' : 'text-foreground'}`}>
        {value}
      </p>
    </div>
  );
}