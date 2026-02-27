import { useEffect, useState } from "react";
import { customerService, type Customer } from "../api/customerService";
import { Mail, Phone, Search, UserPlus, Pencil, Trash2, History, Loader2 } from "lucide-react";
import CustomerModal from "../components/CustomerModal";
import GuestHistoryModal from "../components/GuestHistoryModal";

export default function Customers() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [historyCustomer, setHistoryCustomer] = useState<{customerId: number, name: string} | null>(null);

    useEffect(() => { loadCustomers(); }, []);

    const loadCustomers = async () => {
        setLoading(true);
        try {
            const res = await customerService.getCustomers();
            setCustomers(res.data.content);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Delete this guest? This may fail if they have active bookings.")) return;
        try {
            await customerService.deleteCustomer(id);
            loadCustomers();
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            alert(error.response?.data?.message || "Cannot delete customer with history.");
        }
    };

    const filteredCustomers = customers.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-heading font-bold text-primary">Guest Management</h1>
                    <p className="text-muted text-sm italic">Manage guest profiles and reservation history.</p>
                </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-card shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18}/>
                    <input 
                        type="text" 
                        placeholder="Search by name or phone..."
                        className=" w-full pl-10 pr-4 py-2 bg-surface rounded-input outline-none focus:ring-2 focus:ring-primary/10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button 
                    onClick={() => { setSelectedCustomer(null); setIsModalOpen(true); }}
                    className="bg-primary text-white px-6 py-3 rounded-button flex items-center gap-2 w-full md:w-auto hover:bg-primary/90 transition-colors"
                >
                    <UserPlus size={18}/> Add Guest
                </button>
            </div>

            <div className="bg-white rounded-card shadow-card overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-surface/30 border-b border-surface">
                            <th className="p-4 text-[10px] font-bold text-muted uppercase tracking-widest">Guest Details</th>
                            <th className="p-4 text-[10px] font-bold text-muted uppercase tracking-widest">Contact Info</th>
                            <th className="p-4 text-[10px] font-bold text-muted uppercase tracking-widest">ID</th>
                            <th className="p-4 text-[10px] font-bold text-muted uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface">
                        {loading ? (
                            <tr><td colSpan={4} className="p-20 text-center">
                                <Loader2 className="animate-spin mx-auto text-accent" size={32} />
                                <span className="text-sm text-muted italic block mt-2">Loading guest records...</span>
                            </td></tr>
                        ) : (
                            filteredCustomers.map((customer) => (
                                <tr key={customer.customerId} className="hover:bg-background transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold">
                                                {customer.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-foreground">{customer.name}</p>
                                                <p className="text-xs text-muted flex items-center gap-1"><Mail size={12}/>{customer.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-sm text-muted flex items-center gap-1"><Phone size={12}/>{customer.phone}</span>
                                    </td>
                                    <td className="p-4 text-sm font-mono text-muted">#{customer.customerId}</td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => { setSelectedCustomer(customer); setIsModalOpen(true); }}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit Guest"
                                            >
                                                <Pencil size={16}/>
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(customer.customerId!)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Delete Guest"
                                            >
                                                <Trash2 size={16}/>
                                            </button>
                                            <button 
                                                onClick={() => setHistoryCustomer({ customerId: customer.customerId!, name: customer.name })}
                                                className="p-2 text-accent hover:bg-accent/5 rounded-lg" 
                                                title="View History"
                                            >
                                                <History size={16}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr> 
                            ))
                        )}
                    </tbody>
                </table>
                {!loading && filteredCustomers.length === 0 && (
                    <div className="p-12 text-center text-muted italic">No guests found matching your search.</div>
                )}
            </div>

            <CustomerModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={loadCustomers}
                editData={selectedCustomer}
            />
            <GuestHistoryModal
                customer={historyCustomer} 
                onClose={() => setHistoryCustomer(null)} 
            />
        </div>
    );
}