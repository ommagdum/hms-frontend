import { useState, useEffect } from "react";
import { X, Save, Loader2, Search } from "lucide-react";
import { customerService, type Customer } from "../api/customerService";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (customer: Customer) => void;
    editData: Customer | null;
    mode: 'edit' | 'select'; // New prop to distinguish between editing and selecting
}

export default function CustomerModal({ isOpen, onClose, onSuccess, editData, mode }: Props) {
    const [formData, setFormData] = useState<Customer>({ name: '', email: '', phone: '', address: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Customer[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    // Customer search functionality
    useEffect(() => {
        if (searchTerm.length < 2) {
            setSearchResults([]);
            return;
        }

        const delayDebounce = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await customerService.searchCustomers({ name: searchTerm });
                if (res.success) setSearchResults(res.data.content);
            } catch (err) {
                console.error("Customer search failed", err);
            } finally {
                setIsSearching(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [searchTerm]);

    useEffect(() => {
        if (editData) setFormData(editData);
        else setFormData({ name: '', email: '', phone: '', address: '' });
        setSearchTerm('');
        setSelectedCustomer(null);
    }, [editData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (mode === 'select') {
                if (selectedCustomer) {
                    onSuccess(selectedCustomer);
                    onClose();
                } else {
                    setError("Please select a customer from the search results.");
                }
            } else {
                // Edit mode
                if (editData?.customerId) {
                    await customerService.updateCustomer(editData.customerId, formData);
                } else {
                    await customerService.createCustomer(formData);
                }
                onSuccess(formData);
                onClose();
            }
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || "Operation failed. Email/Phone must be unique.");
        } finally {
            setLoading(false);
        }
    };

    const handleCustomerSelect = (customer: Customer) => {
        setSelectedCustomer(customer);
        setSearchTerm(customer.name);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-card w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95">
                <div className="p-6 border-b border-surface flex justify-between items-center bg-primary text-white">
                    <h2 className="font-bold text-xl">
                        {mode === 'select' ? 'Select Registered Guest' : (editData ? 'Edit Guest' : 'Add New Guest')}
                    </h2>
                    <button onClick={onClose} className="hover:rotate-90 transition-transform"><X /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}
                    
                    {mode === 'select' ? (
                        // Customer selection mode with dropdown
                        <div>
                            <label className="text-xs font-bold text-muted uppercase mb-2">Search Guest</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted z-10" size={16} />
                                <input 
                                    type="text"
                                    placeholder="Type to search registered guests..."
                                    className="w-full pl-10 pr-4 py-2 bg-surface rounded-lg outline-none border border-surface focus:border-primary"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    onFocus={() => searchTerm.length >= 2 && setSearchResults([])} // Clear results on focus to show fresh search
                                />
                                
                                {/* Dropdown Results */}
                                {searchResults.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-surface rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                                        {searchResults.map((customer) => (
                                            <div
                                                key={customer.customerId}
                                                onClick={() => handleCustomerSelect(customer)}
                                                className="p-3 hover:bg-surface cursor-pointer border-b border-surface/50 last:border-0 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold text-xs">
                                                        {customer.name.charAt(0)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-foreground text-sm">{customer.name}</p>
                                                        <p className="text-xs text-muted">{customer.email} • {customer.phone}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                {/* Selected Customer Display */}
                                {selectedCustomer && (
                                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <p className="text-sm font-semibold text-green-700">✓ Selected: {selectedCustomer.name}</p>
                                        <p className="text-xs text-green-600">{selectedCustomer.email} • {selectedCustomer.phone}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        // Edit/Create mode
                        <>
                    <div>
                        <label className="text-xs font-bold text-muted uppercase mb-2">Full Name</label>
                        <input required className="w-full p-2 bg-surface rounded-lg outline-none border border-surface focus:border-primary" 
                               value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-muted uppercase mb-2">Email</label>
                            <input required type="email" className="w-full p-2 bg-surface rounded-lg outline-none border border-surface focus:border-primary" 
                                   value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-muted uppercase mb-2">Phone</label>
                            <input required className="w-full p-2 bg-surface rounded-lg outline-none border border-surface focus:border-primary" 
                                   value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-muted uppercase mb-2">Address (Optional)</label>
                        <textarea className="w-full p-2 bg-surface rounded-lg outline-none border border-surface focus:border-primary h-20" 
                                  value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                    </div>
                        </>
                    )}
                    
                    <button disabled={loading} className="w-full bg-accent text-white py-3 rounded-button font-bold flex items-center justify-center gap-2 hover:opacity-90">
                        {loading ? <Loader2 className="animate-spin"/> : <Save size={18}/>}
                        {mode === 'select' ? 'Confirm Selection' : (editData ? 'Update Guest' : 'Register Guest')}
                    </button>
                </form>
            </div>
        </div>
    );
}