'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import * as flags from 'country-flag-icons/react/3x2';

// Popular countries list with their ISO codes
export const COUNTRIES = [
  { name: 'United States', code: 'US', names: ['United States', 'USA', 'America', 'United-States'] },
  { name: 'United Kingdom', code: 'GB', names: ['United Kingdom', 'UK', 'Britain', 'England'] },
  { name: 'France', code: 'FR', names: ['France'] },
  { name: 'Germany', code: 'DE', names: ['Germany', 'Deutschland'] },
  { name: 'Italy', code: 'IT', names: ['Italy', 'Italia'] },
  { name: 'Spain', code: 'ES', names: ['Spain', 'España'] },
  { name: 'Canada', code: 'CA', names: ['Canada'] },
  { name: 'Australia', code: 'AU', names: ['Australia'] },
  { name: 'Japan', code: 'JP', names: ['Japan', 'Nippon'] },
  { name: 'China', code: 'CN', names: ['China', 'PRC'] },
  { name: 'Brazil', code: 'BR', names: ['Brazil', 'Brasil'] },
  { name: 'Mexico', code: 'MX', names: ['Mexico', 'México'] },
  { name: 'India', code: 'IN', names: ['India', 'Bharat'] },
  { name: 'Russia', code: 'RU', names: ['Russia', 'Russian Federation'] },
  { name: 'South Korea', code: 'KR', names: ['South Korea', 'Korea', 'ROK'] },
  { name: 'Netherlands', code: 'NL', names: ['Netherlands', 'Holland'] },
  { name: 'Switzerland', code: 'CH', names: ['Switzerland', 'Suisse', 'Schweiz'] },
  { name: 'Sweden', code: 'SE', names: ['Sweden', 'Sverige'] },
  { name: 'Norway', code: 'NO', names: ['Norway', 'Norge'] },
  { name: 'Denmark', code: 'DK', names: ['Denmark', 'Danmark'] },
  { name: 'Finland', code: 'FI', names: ['Finland', 'Suomi'] },
  { name: 'Poland', code: 'PL', names: ['Poland', 'Polska'] },
  { name: 'Portugal', code: 'PT', names: ['Portugal'] },
  { name: 'Greece', code: 'GR', names: ['Greece', 'Hellas'] },
  { name: 'Turkey', code: 'TR', names: ['Turkey', 'Türkiye'] },
  { name: 'Thailand', code: 'TH', names: ['Thailand'] },
  { name: 'Vietnam', code: 'VN', names: ['Vietnam', 'Viet Nam'] },
  { name: 'Indonesia', code: 'ID', names: ['Indonesia'] },
  { name: 'Philippines', code: 'PH', names: ['Philippines'] },
  { name: 'Malaysia', code: 'MY', names: ['Malaysia'] },
  { name: 'Singapore', code: 'SG', names: ['Singapore'] },
  { name: 'New Zealand', code: 'NZ', names: ['New Zealand'] },
  { name: 'Argentina', code: 'AR', names: ['Argentina'] },
  { name: 'Chile', code: 'CL', names: ['Chile'] },
  { name: 'Colombia', code: 'CO', names: ['Colombia'] },
  { name: 'Peru', code: 'PE', names: ['Peru', 'Perú'] },
  { name: 'South Africa', code: 'ZA', names: ['South Africa'] },
  { name: 'Egypt', code: 'EG', names: ['Egypt'] },
  { name: 'Morocco', code: 'MA', names: ['Morocco', 'Maroc'] },
  { name: 'UAE', code: 'AE', names: ['UAE', 'United Arab Emirates', 'Emirates'] },
  { name: 'Israel', code: 'IL', names: ['Israel'] },
  { name: 'Saudi Arabia', code: 'SA', names: ['Saudi Arabia', 'KSA'] },
  { name: 'Austria', code: 'AT', names: ['Austria', 'Österreich'] },
  { name: 'Belgium', code: 'BE', names: ['Belgium', 'Belgique', 'België'] },
  { name: 'Czech Republic', code: 'CZ', names: ['Czech Republic', 'Czechia'] },
  { name: 'Ireland', code: 'IE', names: ['Ireland', 'Éire'] },
  { name: 'Iceland', code: 'IS', names: ['Iceland', 'Ísland'] },
  { name: 'Croatia', code: 'HR', names: ['Croatia', 'Hrvatska'] },
  { name: 'Hungary', code: 'HU', names: ['Hungary', 'Magyarország'] },
].sort((a, b) => a.name.localeCompare(b.name));

// Helper function to normalize country names for matching
export function normalizeCountryName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[-_\s]/g, '') // Remove dashes, underscores, and spaces
    .trim();
}

// Helper function to find country by name (handles variations)
export function findCountryByName(name: string): typeof COUNTRIES[0] | undefined {
  const normalized = normalizeCountryName(name);
  return COUNTRIES.find(country => 
    country.names.some(n => normalizeCountryName(n) === normalized)
  );
}

// Helper function to get flag emoji from country code
export function getFlagEmoji(countryCode: string): string {
  // Convert country code to flag emoji using regional indicator symbols
  // A = U+1F1E6, B = U+1F1E7, etc.
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

// Helper function to get flag emoji from country name
export function getFlagFromCountryName(countryName: string): string {
  const country = findCountryByName(countryName);
  return country ? getFlagEmoji(country.code) : '🌍';
}

interface CountrySelectorProps {
  value: string;
  onChange: (country: string) => void;
  className?: string;
}

export function CountrySelector({ value, onChange, className }: CountrySelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Find the matching country
  const selectedCountry = useMemo(() => {
    return findCountryByName(value);
  }, [value]);

  // Filter countries based on search
  const filteredCountries = useMemo(() => {
    if (!search) return COUNTRIES;
    const normalized = search.toLowerCase();
    return COUNTRIES.filter(country =>
      country.name.toLowerCase().includes(normalized) ||
      country.names.some(n => n.toLowerCase().includes(normalized))
    );
  }, [search]);

  const FlagIcon = selectedCountry ? (flags as any)[selectedCountry.code] : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          <div className="flex items-center gap-2">
            {FlagIcon && <FlagIcon className="h-4 w-6 rounded-sm" />}
            <span>{selectedCountry?.name || value || "Select country..."}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Search country..." 
            value={search}
            onValueChange={setSearch}
          />
          <CommandList className="max-h-[300px]">
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {filteredCountries.map((country) => {
                const Flag = (flags as any)[country.code];
                return (
                  <CommandItem
                    key={country.code}
                    value={country.name}
                    onSelect={() => {
                      onChange(country.name);
                      setOpen(false);
                      setSearch('');
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === country.name ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {Flag && <Flag className="mr-2 h-4 w-6 rounded-sm" />}
                    {country.name}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

