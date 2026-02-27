import { useState } from 'react';
import { userService, type Customer } from '../api/userService';
import { ArrowRight, CheckCircle2, Loader2, User } from 'lucide-react';

export default function Step1Guest({ data, setData, onNext }: any) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Search logic
  const handleSearch = async () => {
    if (!searchTerm) return;
    setIsSearching(true);
    try {
      // Using the search API we defined in Phase 4
      const response = await userService.searchCustomers(searchTerm);
      setSearchResults(response.content || []);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-primary mb-4">
        <User size={24} />
        <h3 className="font-heading text-xl">Guest Selection</h3>
      </div>

      <div className="space-y-4">
        <label className="font-label text-muted uppercase text-xs">Search Registered Guest</label>
        <div className="flex gap-2">
          <input 
            type="text" 
            className="flex-1 p-3 bg-surface rounded-input border border-transparent focus:border-accent outline-none"
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button 
            onClick={handleSearch}
            className="bg-primary text-white px-4 rounded-button hover:bg-opacity-90 transition-all"
          >
            {isSearching ? <Loader2 className="animate-spin" size={20} /> : "Search"}
          </button>
        </div>

        {/* Search Results List */}
        <div className="space-y-2 max-h-48 overflow-y-auto mt-4">
          {searchResults.map((guest) => (
            <div 
              key={guest.customerId}
              onClick={() => setData({ ...data, customerId: guest.customerId, customerName: guest.name })}
              className={`p-3 rounded-card border cursor-pointer transition-all flex justify-between items-center ${
                Number(data.customerId) === guest.customerId 
                ? 'border-accent bg-accent/5' 
                : 'border-surface hover:bg-surface'
              }`}
            >
              <div>
                <p className="font-medium text-sm">{guest.name}</p>
                <p className="text-xs text-muted">{guest.phone}</p>
              </div>
              {Number(data.customerId) === guest.customerId && (
                <CheckCircle2 size={18} className="text-accent" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="pt-6 border-t border-surface">
        <button 
          onClick={onNext}
          disabled={!data.customerId}
          className="w-full bg-primary text-white p-4 rounded-button flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-opacity-90 transition-all"
        >
          Select Dates & Room <ArrowRight size={18} />
        </button>
        {!data.customerId && (
          <p className="text-[10px] text-center text-muted mt-2">
            Please search and select a guest to continue
          </p>
        )}
      </div>
    </div>
  );
}