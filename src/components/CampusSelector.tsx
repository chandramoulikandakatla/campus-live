import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ChevronDown, Check } from 'lucide-react';
import { cities, useStore } from '@/lib/store';

export function CampusSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { selectedCampus, setSelectedCampus } = useStore();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCities = cities.filter((city) =>
    city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 hover:bg-primary/15 transition-colors duration-200"
      >
        <MapPin className="w-4 h-4 text-primary" />
        <span className="font-medium text-sm text-foreground truncate max-w-[120px] md:max-w-none">
          {selectedCampus}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 w-64 bg-card rounded-2xl shadow-xl border border-border overflow-hidden z-50"
          >
            <div className="p-3 border-b border-border">
              <input
                type="text"
                placeholder="Search city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-muted rounded-lg outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="max-h-64 overflow-y-auto scrollbar-thin">
              {filteredCities.map((city) => (
                <button
                  key={city}
                  onClick={() => {
                    setSelectedCampus(city);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-muted transition-colors ${
                    city === selectedCampus ? 'bg-primary/5' : ''
                  }`}
                >
                  <span className={city === selectedCampus ? 'font-medium text-primary' : ''}>
                    {city}
                  </span>
                  {city === selectedCampus && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
