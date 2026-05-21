import { useLocation } from 'react-router-dom';
import { ThemeToggle } from '../common/ThemeToggle';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/upload': 'Upload File',
  '/files': 'File Records',
  '/errors': 'Error Records',
  '/search': 'Search',
  '/settings': 'Settings',
  '/download': 'Download Data',
};

export function Topbar() {
  const location = useLocation();

  return (
    <header className="h-14 bg-sidebar/80 backdrop-blur-xl border-b border-sidebar-border flex items-center justify-between px-6 gap-6 w-full">
      <h2 className="font-semibold text-lg text-foreground">
        {pageTitles[location.pathname] || 'TradeStream Engine'}
      </h2>

      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
}
