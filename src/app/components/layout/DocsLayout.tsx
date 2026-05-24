import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../../../lib/utils';
import { useAuthStore } from '../../../store/authStore';
import { ThemeToggle } from '../common/ThemeToggle';
import { Button } from '../ui/button';
import {
  ShieldCheck, BookOpen, Terminal, Menu, X,
  ChevronRight, Home, ExternalLink, LayoutDashboard
} from 'lucide-react';

// Documentation sidebar sections
const DOC_SECTIONS = [
  {
    title: 'Getting Started',
    items: [
      { label: 'User Guide', path: '/docs/user-guide', icon: BookOpen },
    ]
  },
  {
    title: 'Developer Reference',
    items: [
      { label: 'API Portal', path: '/docs/api', icon: Terminal },
    ]
  }
];

export function DocsLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isApiPage = location.pathname === '/docs/api';

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">

      {/* ─── Top Navigation Bar (like Stripe / GitHub docs) ─── */}
      <header className="sticky top-0 z-50 h-14 bg-background/90 backdrop-blur-xl border-b border-border/70 shadow-sm flex items-center shrink-0">
        <div className="w-full flex items-center justify-between px-4 md:px-6">

          {/* Left: Logo + breadcrumb */}
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group shrink-0">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white shadow-md shadow-primary/20 transition-transform duration-200 group-hover:scale-105">
                <ShieldCheck className="h-4.5 w-4.5" />
              </div>
              <span className="font-bold text-base tracking-tight hidden sm:block">TradeStream</span>
            </Link>

            {/* Breadcrumb divider */}
            <ChevronRight className="h-4 w-4 text-muted-foreground/50 hidden sm:block" />

            {/* Section breadcrumb */}
            <span className="text-sm font-semibold text-foreground hidden sm:block">
              {isApiPage ? 'Developer API Portal' : 'Documentation'}
            </span>
          </div>

          {/* Center: Doc type tabs (desktop) */}
          <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            <Link
              to="/docs/user-guide"
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                !isApiPage
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              )}
            >
              <BookOpen className="h-4 w-4" />
              User Guide
            </Link>
            <Link
              to="/docs/api"
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                isApiPage
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              )}
            >
              <Terminal className="h-4 w-4" />
              API Portal
            </Link>
            <Link
              to="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
          </nav>

          {/* Right: Theme + Auth Button */}
          <div className="flex items-center gap-2 md:mr-8 lg:mr-12">
            <ThemeToggle />
            {isAuthenticated ? (
              <Button
                onClick={() => navigate('/dashboard')}
                size="sm"
                className="h-8 px-3 bg-gradient-to-r from-primary to-purple-600 text-white text-xs font-semibold rounded-lg shadow-sm shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-px transition-all"
              >
                <LayoutDashboard className="h-3.5 w-3.5 mr-1.5" />
                Dashboard
              </Button>
            ) : (
              <Button
                onClick={() => navigate('/login')}
                size="sm"
                className="h-8 px-3 bg-gradient-to-r from-primary to-purple-600 text-white text-xs font-semibold rounded-lg shadow-sm shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-px transition-all"
              >
                Sign In
              </Button>
            )}
          </div>

        </div>
      </header>

      {/* ─── Body: Sidebar + Content ─── */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ─── Left Docs Sidebar (like Stripe/GitHub docs) ─── */}
        <aside className={cn(
          'fixed top-14 left-0 z-40 h-[calc(100vh-3.5rem)] w-64 shrink-0 flex-col',
          'bg-muted/30 backdrop-blur-md border-r border-border/60 overflow-y-auto',
          'transition-transform duration-300 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}>
          <div className="p-4 pt-6 space-y-6">
            {/* Quick nav tabs (mobile visible) */}
            <div className="md:hidden space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 px-3 mb-2">Documentation</p>
              <Link
                to="/docs/user-guide"
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-1.5 text-sm font-medium transition-all focus:outline-none focus-visible:ring-1 focus-visible:ring-primary border-l-2 rounded-r-lg rounded-l-none',
                  !isApiPage 
                    ? 'bg-primary/5 text-primary border-primary font-semibold' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/40 border-transparent'
                )}
              >
                <BookOpen className="h-4 w-4 shrink-0" />
                User Guide
              </Link>
              <Link
                to="/docs/api"
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-1.5 text-sm font-medium transition-all focus:outline-none focus-visible:ring-1 focus-visible:ring-primary border-l-2 rounded-r-lg rounded-l-none',
                  isApiPage 
                    ? 'bg-primary/5 text-primary border-primary font-semibold' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/40 border-transparent'
                )}
              >
                <Terminal className="h-4 w-4 shrink-0" />
                API Portal
              </Link>
              <div className="border-t border-border/50 my-3" />
            </div>

            {/* Sidebar sections */}
            {DOC_SECTIONS.map((section) => (
              <div key={section.title} className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 px-3 pb-1">
                  {section.title}
                </p>
                {section.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.label + item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        'flex items-center gap-2.5 px-3 py-1.5 text-sm transition-all border-l-2 rounded-r-lg rounded-l-none focus:outline-none focus-visible:ring-1 focus-visible:ring-primary',
                        isActive
                          ? 'bg-primary/5 text-primary border-primary font-semibold'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/40 border-transparent font-medium'
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            ))}

            {/* Divider */}
            <div className="border-t border-border/50" />

            {/* Back to Home */}
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 px-3 pb-1">
                Navigation
              </p>
              <Link
                to="/"
                className="flex items-center gap-2.5 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 border-l-2 border-transparent rounded-r-lg rounded-l-none focus:outline-none focus-visible:ring-1 focus-visible:ring-primary transition-all"
              >
                <Home className="h-4 w-4 shrink-0" />
                Back to Home
              </Link>
              {isAuthenticated && (
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2.5 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 border-l-2 border-transparent rounded-r-lg rounded-l-none focus:outline-none focus-visible:ring-1 focus-visible:ring-primary transition-all"
                >
                  <LayoutDashboard className="h-4 w-4 shrink-0" />
                  Go to Dashboard
                </Link>
              )}
            </div>

            {/* Swagger external link if on API page */}
            {isApiPage && (
              <div className="p-3 bg-primary/5 border border-primary/15 rounded-xl space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary/80">Live Console</p>
                <a
                  href={`${window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                    ? 'http://localhost:8080'
                    : 'https://tradestreamengine.duckdns.org'}/swagger-ui/index.html`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs font-medium text-primary hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open Swagger UI
                </a>
              </div>
            )}
          </div>
        </aside>

        {/* ─── Main Content ─── */}
        <main className="flex-1 md:pl-64 overflow-y-auto min-w-0">
          <div className="min-h-full">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
}
