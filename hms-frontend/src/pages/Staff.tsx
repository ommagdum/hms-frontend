import { useEffect, useState } from 'react';
import { userService, type Staff } from '../api/userService';
import { Search, UserCog, Phone, ShieldCheck, Loader2, IndianRupee, Trash2, Pencil } from 'lucide-react';
import StaffModal from '../components/StaffModal';

export default function StaffPage() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

  useEffect(() => { loadStaff(); }, []);

  const loadStaff = async () => {
    try {
      setLoading(true);
      const data = await userService.getStaff();
      setStaffList(data);
    } catch (error) {
      console.error("Error loading staff", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id: number) => {
    if (!window.confirm("Are you sure you want to remove this staff member?")) return;
    try {
      await userService.deleteStaff(id);
      loadStaff();
    } catch {
      alert("Failed to remove staff member.");
    }
  };

  const filteredStaff = staffList.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-primary">Staff Management</h1>
          <p className="text-muted text-sm italic">Manage hotel staff roles and responsibilities.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-card shadow-sm border border-surface">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input 
            type="text"
            placeholder="Search by name or role..."
            className="w-full pl-10 pr-4 py-2 bg-surface rounded-input focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => { setSelectedStaff(null); setIsModalOpen(true); }}
          className="bg-primary text-white px-6 py-3 rounded-button flex items-center gap-2 w-full md:w-auto hover:bg-primary/90 transition-all"
        >
          <UserCog size={18} /> Add Staff Member
        </button>
      </div>

      <div className="bg-white rounded-card shadow-card overflow-hidden border border-surface">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface/30 border-b border-surface">
              <th className="p-4 text-[10px] font-bold text-muted uppercase tracking-widest">Staff Member</th>
              <th className="p-4 text-[10px] font-bold text-muted uppercase tracking-widest">Role</th>
              <th className="p-4 text-[10px] font-bold text-muted uppercase tracking-widest">Contact</th>
              <th className="p-4 text-[10px] font-bold text-muted uppercase tracking-widest">Salary</th>
              <th className="p-4 text-[10px] font-bold text-muted uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface">
            {loading ? (
               <tr><td colSpan={5} className="p-20 text-center">
                   <Loader2 className="animate-spin mx-auto text-accent" size={32} />
                   <span className="text-sm text-muted italic block mt-2">Loading staff records...</span>
               </td></tr>
            ) : filteredStaff.map((member) => (
              <tr key={member.staffId} className="hover:bg-background transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold border border-primary/20">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{member.name}</p>
                      <p className="text-xs text-muted flex items-center gap-1">
                        <Phone size={12}/> {member.contact}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className="flex items-center gap-1.5 text-sm font-medium text-foreground capitalize">
                    <ShieldCheck size={14} className="text-accent" />
                    {member.role}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <span className="flex items-center justify-end gap-1 text-sm font-semibold text-primary">
                    <IndianRupee size={14} />
                    {member.salary.toLocaleString('en-IN')}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-4">
                    <button 
                      onClick={() => { setSelectedStaff(member); setIsModalOpen(true); }}
                      className="text-xs font-bold uppercase tracking-tighter text-muted hover:text-primary flex items-center gap-1"
                    >
                      <Pencil size={12}/> Edit
                    </button>
                    <button 
                      onClick={() => handleRemove(member.staffId!)}
                      className="text-xs font-bold uppercase tracking-tighter text-destructive hover:opacity-70 flex items-center gap-1"
                    >
                      <Trash2 size={12}/> Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {!loading && filteredStaff.length === 0 && (
          <div className="p-16 text-center text-muted italic">No staff found matching your search.</div>
        )}
      </div>

      <StaffModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={loadStaff}
        editData={selectedStaff}
      />
    </div>
  );
}