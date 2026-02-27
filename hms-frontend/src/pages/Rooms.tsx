import { useEffect, useState } from 'react';
import { Plus, Loader2, Edit, Trash2 } from 'lucide-react';
import { roomService } from '../api/roomService';
import AddRoomModal from '../components/AddRoomModal';
import RoomDetailsModal from '../components/RoomDetailsModal';

export default function Rooms() {
  const [rooms, setRooms] = useState<{
    roomId: number;
    roomNumber: string;
    roomType: string;
    price: number;
    status: string;
  }[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<{
    roomId: number;
    roomNumber: string;
    roomType: string;
    price: number;
    status: string;
  } | null>(null);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const res = await roomService.getAllRooms();
      
      if (res.success) {
        setRooms(res.data.content || []);
      }
    } catch (err) {
      console.error("Error loading rooms", err);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (room: {
    roomId: number;
    roomNumber: string;
    roomType: string;
    price: number;
    status: string;
  }) => {
    setSelectedRoom(room);
    setIsDetailsOpen(true);
  };

  const handleEditRoom = (room: {
    roomId: number;
    roomNumber: string;
    roomType: string;
    price: number;
    status: string;
  }) => {
    setSelectedRoom(room);
    setIsAddModalOpen(true);
  };

  const handleDeleteRoom = async (roomId: number) => {
    if (window.confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
      try {
        await roomService.deleteRoom(roomId);
        loadRooms();
      } catch (err) {
        console.error("Error deleting room", err);
        alert("Failed to delete room. Please try again.");
      }
    }
  };

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
      <Loader2 className="animate-spin text-accent" size={40} />
      <p className="text-muted text-sm font-medium">Loading Serenity Inventory...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-primary">Room Management</h1>
          <p className="text-muted text-sm italic">Monitor and update your hotel inventory in real-time.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary text-white px-6 py-3 rounded-button flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg"
        >
          <Plus size={18} /> Add New Room
        </button>
      </div>

      {/* Grid of Rooms */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {rooms.map((room) => {
            const statusUpper = room.status.toUpperCase();
            
            return (
                <div key={room.roomId} className="bg-white rounded-card border border-surface shadow-card overflow-hidden group">
                <div className={`h-2 ${
                    statusUpper === 'AVAILABLE' ? 'bg-primary' : 
                    statusUpper === 'MAINTENANCE' ? 'bg-amber-500' : 'bg-accent'
                }`} />
                
                <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-xl font-bold font-heading text-primary">Room {room.roomNumber}</h3>
                        <p className="text-[10px] font-bold text-muted uppercase tracking-widest">{room.roomType}</p>
                    </div>
                    <div className="text-right">
                        {/* Changed from room.pricePerNight to room.price */}
                        <p className="text-lg font-bold text-foreground">₹{room.price}</p>
                        <p className="text-[10px] text-muted font-medium">per night</p>
                    </div>
                    </div>

                    <div className="flex gap-2 mt-6">
                    <button 
                        onClick={() => handleEditRoom(room)}
                        className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary/90 transition-all shadow-sm"
                    >
                        <Edit size={14} />
                        Edit
                    </button>
                    <button 
                        onClick={() => handleDeleteRoom(room.roomId)}
                        className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition-all shadow-sm"
                    >
                        <Trash2 size={14} />
                        Delete
                    </button>
                    </div>
                </div>
                </div>
            );
            })}
      </div>

      {/* Modals */}
      <AddRoomModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={loadRooms}
        editData={selectedRoom}
      />
      
      <RoomDetailsModal 
        room={selectedRoom} 
        isOpen={isDetailsOpen} 
        onClose={() => setIsDetailsOpen(false)}
        onEdit={handleEditRoom}
        onDelete={handleDeleteRoom}
      />
    </div>
  );
}