import React, { useState, FormEvent, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Search, Loader2, X } from 'lucide-react';

interface SearchInputProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const SearchInput: React.FC<SearchInputProps> = ({ 
  onSearch, 
  isLoading 
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  
  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);
  
  // Handle clicks outside the form
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle form submission
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && !isLoading) {
      // Cancel debounce timer if exists
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      onSearch(searchQuery.trim());
    }
  };
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setSearchQuery(newQuery);
    
    // If input is cleared, immediately reset search
    if (!newQuery.trim()) {
      onSearch("");
      return;
    }
    
    // For non-empty queries, debounce but with shorter delay
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      onSearch(newQuery.trim());
    }, 150); // Shorter delay for better responsiveness
  };
  
  // Clear search query and reset results
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Cancel any pending search
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    setSearchQuery("");
    onSearch(""); // Pass empty string to reset search
    
    // Focus the input after clearing
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  return (
    <div className="w-full">
      <form ref={formRef} onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
        <div className={`relative transition-all duration-200 rounded-full ${isFocused ? 'ring-2 ring-primary/70 ring-offset-1' : 'ring-0'}`}>
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Search className="h-4 w-4" />
          </div>
          <Input
            ref={inputRef}
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            placeholder="Search icons"
            className="pl-11 pr-10 h-11 rounded-full bg-white shadow-sm border-slate-200 focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
          />
          {searchQuery && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3.5 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full flex items-center justify-center bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors focus:outline-none"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          {isLoading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none w-4 h-4 flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default SearchInput;
