import { useState, useEffect } from "react";
import { X, Save, Loader2, UserCog } from "lucide-react";
import { staffService, type Staff, type StaffDto } from "../api/staffService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData: StaffDto | null;
}

export default function StaffModal({ isOpen, onClose, onSuccess, editData }: Props) {
  const [formData, setFormData] = useState<Omit<Staff, 'staffId'>>({ 
    name: '', 
    role: 'RECEPTIONIST', 
    contact: '', 
    salary: 0, 
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name,
        role: editData.role,
        contact: editData.contact,
        salary: editData.salary,
        username: editData.username,
        password: ''
      });
    } else {
      setFormData({ 
        name: '', 
        role: 'RECEPTIONIST', 
        contact: '', 
        salary: 0, 
        username: '',
        password: ''
      });
    }
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editData?.staffId) {
        // For updates, only include password if it's provided
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await staffService.updateStaff(editData.staffId, updateData);
      } else {
        // For creation, password is required
        await staffService.createStaff(formData);
      }
      onSuccess();
      onClose();
    } catch {
      alert("Error saving staff member. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-card w-full max-w-md shadow-2xl animate-in zoom-in-95">
        <div className="p-6 border-b border-surface flex justify-between items-center bg-primary text-white">
          <h2 className="font-bold text-xl flex items-center gap-2">
            <UserCog size={20}/> {editData ? 'Edit Staff' : 'Add Staff'}
          </h2>
          <button onClick={onClose} className="hover:rotate-90 transition-transform"><X /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-muted uppercase mb-2">Full Name</label>
            <input required className="w-full p-2 bg-surface rounded-lg outline-none border border-surface focus:border-primary" 
                   value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div>
            <label className="text-xs font-bold text-muted uppercase mb-2">Username</label>
            <input required className="w-full p-2 bg-surface rounded-lg outline-none border border-surface focus:border-primary" 
                   value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
          </div>
          {!editData && (
            <div>
              <label className="text-xs font-bold text-muted uppercase mb-2">Password</label>
              <input required type="password" className="w-full p-2 bg-surface rounded-lg outline-none border border-surface focus:border-primary" 
                     value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
          )}
          {editData && (
            <div>
              <label className="text-xs font-bold text-muted uppercase mb-2">New Password (leave empty to keep current)</label>
              <input type="password" className="w-full p-2 bg-surface rounded-lg outline-none border border-surface focus:border-primary" 
                     value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
          )}
          <div>
            <label className="text-xs font-bold text-muted uppercase mb-2">Role</label>
            <select required className="w-full p-2 bg-surface rounded-lg outline-none border border-surface focus:border-primary" 
                    value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as 'ADMIN' | 'MANAGER' | 'RECEPTIONIST'})}>
              <option value="RECEPTIONIST">RECEPTIONIST</option>
              <option value="MANAGER">MANAGER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-muted uppercase mb-2">Contact Number</label>
            <input required className="w-full p-2 bg-surface rounded-lg outline-none border border-surface focus:border-primary" 
                   value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} />
          </div>
          <div>
            <label className="text-xs font-bold text-muted uppercase mb-2">Monthly Salary (₹)</label>
            <input required type="number" step="0.01" className="w-full p-2 bg-surface rounded-lg outline-none border border-surface focus:border-primary" 
                   value={formData.salary} onChange={e => setFormData({...formData, salary: Number(e.target.value)})} />
          </div>
          <button disabled={loading} className="w-full bg-accent text-white py-3 rounded-button font-bold flex items-center justify-center gap-2 mt-4 transition-opacity disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin"/> : <Save size={18}/>}
            {editData ? 'Update Record' : 'Create Record'}
          </button>
        </form>
      </div>
    </div>
  );
}