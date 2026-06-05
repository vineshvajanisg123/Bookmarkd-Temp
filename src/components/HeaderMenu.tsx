import { BookOpen, LogOut, User as UserIcon } from "lucide-react";
import { User } from "firebase/auth";

interface HeaderMenuProps {
  onHome: () => void;
  onBegin: () => void;
  onDiscover: () => void;
  onBookshelf: () => void;
  activeScreen: number;
  onLogin?: () => void;
  onLogout?: () => void;
  loggedInUser?: User | null;
}

export default function HeaderMenu({ 
  onHome, 
  onBegin, 
  onDiscover,
  onBookshelf, 
  activeScreen,
  onLogin,
  onLogout,
  loggedInUser
}: HeaderMenuProps) {
  
  // A helper to check if this is a real authenticated visitor vs anonymous trace
  const isRealUser = loggedInUser && !loggedInUser.isAnonymous;

  return (
    <header className="sticky top-0 z-40 bg-[#FAF6F0]/90 backdrop-blur-md border-b border-[#E8E2D8] h-16 flex items-center px-4 sm:px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto flex items-center justify-between w-full">
        {/* Brand Logo & Title on the Left */}
        <div 
          onClick={onHome}
          className="flex items-center gap-2 sm:gap-3 cursor-pointer hover:opacity-90 select-none group shrink-0"
        >
          <div className="w-8 h-8 rounded-full bg-[#365947] flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-xs">
            <BookOpen className="text-white w-4 h-4" />
          </div>
          <div className="flex flex-col justify-center gap-0.5">
            <span className="font-serif font-semibold text-sm md:text-lg tracking-tight text-[#1E1E1B] leading-none">
              Bookmarkd
            </span>
            <span className="block text-[7px] md:text-[8px] uppercase tracking-widest text-[#5E5A55]/75 font-mono leading-none">
              SANCTUARY SYSTEM
            </span>
          </div>
        </div>

        {/* Central Navigation Links */}
        <nav className="flex items-center gap-3 sm:gap-6 md:gap-8 text-[11px] sm:text-xs font-serif text-[#5E5A55]">
          <button 
            onClick={onHome} 
            className={`hover:text-[#365947] cursor-pointer transition-colors pb-0.5 ${
              activeScreen === 1 ? "text-[#365947] font-bold border-b-2 border-[#365947]" : "border-b-2 border-transparent"
            }`}
          >
            Home
          </button>
          <button 
            onClick={onBegin} 
            className={`hover:text-[#365947] cursor-pointer transition-colors pb-0.5 ${
              activeScreen === 2 ? "text-[#365947] font-bold border-b-2 border-[#365947]" : "border-b-2 border-transparent"
            }`}
          >
            My Reading DNA
          </button>
          <button 
            onClick={onDiscover} 
            className={`hover:text-[#365947] cursor-pointer transition-colors pb-0.5 ${
              activeScreen === 6 ? "text-[#365947] font-bold border-b-2 border-[#365947]" : "border-b-2 border-transparent"
            }`}
          >
            Discover New Books
          </button>
          <button 
            onClick={onBookshelf} 
            className={`hover:text-[#365947] cursor-pointer transition-colors pb-0.5 ${
              activeScreen === 7 ? "text-[#365947] font-bold border-b-2 border-[#365947]" : "border-b-2 border-transparent"
            }`}
          >
            My Bookshelf
          </button>
        </nav>

        {/* Authentication Options on the Right */}
        <div className="flex items-center gap-3">
          {loggedInUser && (
            <div className="flex items-center gap-2">
              <div className="hidden md:flex flex-col items-end text-right">
                <span className="text-[10px] font-mono text-brand-muted uppercase leading-none">Sanctuary Account</span>
                <span className="text-xs font-serif font-medium text-brand-text max-w-[120px] truncate leading-tight mt-0.5">
                  {loggedInUser.displayName || loggedInUser.email || "Member"}
                </span>
              </div>
              {loggedInUser.photoURL ? (
                <img 
                  src={loggedInUser.photoURL} 
                  alt={loggedInUser.displayName || "User Avatar"} 
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full border border-brand-accent/30 shadow-xs"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center text-brand-accent shadow-xs">
                  <UserIcon className="w-3.5 h-3.5" />
                </div>
              )}
              <button
                onClick={onLogout}
                className="p-1.5 md:p-2 border border-brand-border hover:border-red-400 hover:text-red-500 rounded-md transition-colors cursor-pointer"
                title="Sign out of Sanctuary"
              >
                <LogOut className="w-4 h-4 shrink-0" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
