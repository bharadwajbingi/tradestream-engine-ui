import { useLocation } from 'react-router-dom';
import { ThemeToggle } from '../common/ThemeToggle';
import { Menu } from 'lucide-react';
import { Button } from '../ui/button';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/upload': 'Upload File',
  '/files': 'File Records',
  '/errors': 'Error Records',
  '/search': 'Search',
  '/settings': 'Settings',
  '/download': 'Download Data',
};

interface TopbarProps {
  onMenuClick?: () => void;
  isMobile?: boolean;
}

export function Topbar({ onMenuClick, isMobile }: TopbarProps) {
  const location = useLocation();

  return (
    <header className="h-14 bg-sidebar/80 backdrop-blur-xl border-b border-sidebar-border flex items-center justify-between px-4 md:px-6 gap-6 w-full shrink-0">
      <div className="flex items-center gap-3">
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="md:hidden cursor-pointer"
            title="Open Sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <h2 className="font-semibold text-base md:text-lg text-foreground tracking-tight">
          {pageTitles[location.pathname] || 'TradeStream Engine'}
        </h2>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
}

