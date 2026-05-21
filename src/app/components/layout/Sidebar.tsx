import { LayoutDashboard, Upload, FileText, AlertCircle, Settings, LogOut, Download, Search } from 'lucide-react';
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

export function Sidebar() {
  const location = useLocation();
  const { email, logout } = useAuthStore();

  return (
    <aside className="h-screen w-60 bg-sidebar/80 backdrop-blur-xl border-r border-sidebar-border flex flex-col shrink-0">
      <div className="p-6">
        <h1 className="font-semibold text-lg text-sidebar-foreground">TradeStream Engine</h1>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground border-l-2 border-sidebar-primary'
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
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
            location.pathname === '/settings'
              ? 'bg-sidebar-primary text-sidebar-primary-foreground'
              : 'text-sidebar-foreground hover:bg-sidebar-accent'
          )}
        >
          <Settings className="h-5 w-5" />
          Settings
        </Link>
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-sidebar-accent">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white text-sm font-medium">
            {email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{email}</p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-md hover:bg-sidebar-border transition-colors"
            title="Logout"
          >
            <LogOut className="h-4 w-4 text-sidebar-foreground" />
          </button>
        </div>
      </div>
    </aside>
  );
}
