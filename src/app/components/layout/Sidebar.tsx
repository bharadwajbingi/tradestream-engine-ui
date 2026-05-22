import { LayoutDashboard, Upload, FileText, AlertCircle, Settings, LogOut, Download, Search, X, ShieldCheck } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../../lib/utils';
import { useAuthStore } from '../../../store/authStore';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Upload, label: 'Upload File', path: '/upload' },
  { icon: FileText, label: 'File Records', path: '/files' },
  { icon: AlertCircle, label: 'Error Records', path: '/errors' },
  { icon: Search, label: 'Search', path: '/search' },
  { icon: Download, label: 'Download Data', path: '/download' },
];

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const location = useLocation();
  const { email, name, logout } = useAuthStore();

  return (
    <aside className="h-full w-60 bg-sidebar/95 md:bg-sidebar/80 backdrop-blur-xl border-r border-sidebar-border flex flex-col shrink-0">
      <div className="p-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group cursor-pointer">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white shadow-md shadow-primary/20 relative transition-transform duration-300 group-hover:scale-105">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span className="font-bold text-base tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-transparent group-hover:text-primary transition-colors">
            TradeStream
          </span>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground transition-colors cursor-pointer"
            title="Close Sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto min-h-0">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm shadow-primary/10'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}

        <div className="my-4 border-t border-sidebar-border" />

        <Link
          to="/settings"
          onClick={onClose}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer',
            location.pathname === '/settings'
              ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm shadow-primary/10'
              : 'text-sidebar-foreground hover:bg-sidebar-accent'
          )}
        >
          <Settings className="h-5 w-5" />
          Settings
        </Link>
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-sidebar-accent/40 border border-sidebar-border/60">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white text-sm font-semibold shadow-md shrink-0">
            {(name || email)?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            {name ? (
              <>
                <p className="text-xs font-semibold text-sidebar-foreground truncate">{name}</p>
                <p className="text-[10px] text-sidebar-foreground/60 truncate">{email}</p>
              </>
            ) : (
              <p className="text-xs font-semibold text-sidebar-foreground truncate">{email}</p>
            )}
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-md hover:bg-sidebar-border transition-colors cursor-pointer text-sidebar-foreground shrink-0"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

