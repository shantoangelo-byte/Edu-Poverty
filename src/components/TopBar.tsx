import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import type { AppSection, UserProfile } from '../types';

interface TopBarProps {
  activeSection: AppSection;
  onNavigate: (section: AppSection) => void;
  user: UserProfile | null;
  onPrimaryAction: () => void;
}

const NAV_ITEMS: { id: AppSection; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'services', label: 'Services' },
  { id: 'dashboard', label: 'My Workspace' },
  { id: 'impact', label: 'Impact' },
  { id: 'admin', label: 'Admin' },
];

export function TopBar({ activeSection, onNavigate, user, onPrimaryAction }: TopBarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F4]/95 backdrop-blur-sm border-b border-[#E7E5E0]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => {
            onNavigate('overview');
            setMobileOpen(false);
          }}
          className="font-display text-xl font-semibold tracking-tight text-[#1C1917] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#14532D] cursor-pointer"
        >
          EduPoverty
        </button>

        {/* Zone 2: 5 concise single-line nav links */}
        <nav className="hidden md:flex items-center gap-7" aria-label="Primary Navigation">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`text-sm font-medium whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#14532D] ${
                  isActive
                    ? 'text-[#14532D] border-[#14532D]'
                    : 'text-[#57534E] border-transparent hover:text-[#1C1917] hover:border-[#D6D3CD]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onPrimaryAction}
            className="hidden md:inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-[#14532D] rounded-lg hover:bg-[#166534] transition-colors whitespace-nowrap shrink-0 min-h-[40px] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#14532D]"
          >
            {user ? 'Sign Out' : 'Join Platform'}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg border border-[#E7E5E0] text-[#1C1917] bg-white hover:bg-[#F3F0EA] cursor-pointer"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#E7E5E0] bg-white px-4 py-4 space-y-2">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onNavigate(item.id);
                  setMobileOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#14532D]/10 text-[#14532D]'
                    : 'text-[#44403C] hover:bg-[#FAF8F4]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
          <div className="pt-2 border-t border-[#E7E5E0]">
            <button
              type="button"
              onClick={() => {
                onPrimaryAction();
                setMobileOpen(false);
              }}
              className="w-full px-4 py-2.5 text-sm font-medium text-white bg-[#14532D] rounded-lg hover:bg-[#166534] transition-colors cursor-pointer"
            >
              {user ? 'Sign Out' : 'Join Platform'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
