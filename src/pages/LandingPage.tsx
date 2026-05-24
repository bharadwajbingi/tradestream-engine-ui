import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, BookOpen, Terminal, 
  Layers, ChevronRight, Menu, X, LayoutDashboard 
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Button } from '../app/components/ui/button';
import { Card } from '../app/components/ui/card';
import { ThemeToggle } from '../app/components/common/ThemeToggle';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [heroOutOfView, setHeroOutOfView] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      setHeroOutOfView(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 relative overflow-x-hidden select-none">
      
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-primary/10 via-transparent to-transparent pointer-events-none -z-10" />
      <div className="absolute top-[200px] -left-[10%] w-[35%] h-[30%] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[300px] -right-[10%] w-[30%] h-[25%] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Brand Header / Navbar */}
      <header className="fixed top-0 inset-x-0 z-50 h-14 bg-background/95 backdrop-blur-xl border-b border-border/80 shadow-sm flex items-center shrink-0">
        <div className="w-full flex items-center justify-between px-4 md:px-6">
          {/* Logo */}
          <Link 
            to="/" 
            onClick={(e) => {
              if (window.location.pathname === '/') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="flex items-center gap-2 group shrink-0"
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white shadow-md shadow-primary/20 transition-transform duration-200 group-hover:scale-105">
              <ShieldCheck className="h-4.5 w-4.5" />
            </div>
            <span className="font-bold text-base tracking-tight hidden sm:block">TradeStream</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            <Link
              to="/docs/user-guide"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
            >
              <BookOpen className="h-4 w-4" />
              User Guide
            </Link>
            <Link
              to="/docs/api"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
            >
              <Terminal className="h-4 w-4" />
              API Portal
            </Link>
            <a
              href="#process"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('process')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
            >
              <Layers className="h-4 w-4" />
              How It Works
            </a>
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-2 md:mr-8 lg:mr-12">
            <ThemeToggle />
            <div className={`transition-all duration-300 ${heroOutOfView ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1 pointer-events-none'}`}>
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

          {/* Mobile menu toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="absolute top-14 inset-x-0 z-50 md:hidden border-b border-border bg-background/95 backdrop-blur-xl"
            >
              <div className="px-4 pt-2 pb-6 space-y-4 flex flex-col">
                <Link 
                  to="/docs/user-guide" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-semibold text-muted-foreground hover:text-foreground py-2 border-b border-border/40"
                >
                  User Guide
                </Link>
                <Link 
                  to="/docs/api" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-semibold text-muted-foreground hover:text-foreground py-2 border-b border-border/40"
                >
                  API Portal
                </Link>
                <a 
                  href="#process" 
                  onClick={(e) => {
                    setMobileMenuOpen(false);
                    e.preventDefault();
                    document.getElementById('process')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-base font-semibold text-muted-foreground hover:text-foreground py-2 border-b border-border/40"
                >
                  How It Works
                </a>
                <div className="pt-2 flex flex-col gap-3">
                  {isAuthenticated ? (
                    <Button 
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate('/dashboard');
                      }}
                      className="w-full h-11 bg-primary text-white font-semibold rounded-xl"
                    >
                      Go to Dashboard
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate('/login');
                      }}
                      className="w-full h-11 bg-gradient-to-r from-primary to-purple-600 text-white font-semibold rounded-xl shadow-md"
                    >
                      Sign In
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-12 md:pt-40 md:pb-16 text-center max-w-4xl mx-auto px-4 sm:px-6">
        <div className="space-y-6 flex flex-col items-center">
          
          {/* Welcome Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold tracking-wide">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>High-Performance Ingestion Portal</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.15]">
            TradeStream Engine{' '}
            <span className="bg-gradient-to-r from-primary via-indigo-500 to-purple-600 bg-clip-text text-transparent block mt-1">
              Developer & Operations Portal
            </span>
          </h1>

          {/* Tagline */}
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Process high-volume financial trade dumps with robust validation checks, dynamic error quarantine pipelines, and bank-grade TOTP multi-factor security locks.
          </p>

          {/* Hero CTA */}
          <div className="flex items-center gap-4 pt-2">
            {isAuthenticated ? (
              <Button
                onClick={() => navigate('/dashboard')}
                className="h-12 px-8 bg-gradient-to-r from-primary to-purple-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
              >
                <LayoutDashboard className="h-4.5 w-4.5 mr-2" />
                Go to Dashboard
              </Button>
            ) : (
              <Button
                onClick={() => navigate('/login')}
                className="h-12 px-8 bg-gradient-to-r from-primary to-purple-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
              >
                Sign In
              </Button>
            )}
          </div>

        </div>
      </section>

      {/* Documentation Hub Section - Side by Side Docs */}
      <section id="doc-hub" className="py-16 border-t border-border/40 bg-muted/10 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-[11px] font-bold tracking-widest text-primary uppercase">Unified Resource Center</span>
            <h2 className="text-3xl font-extrabold tracking-tight">
              Platform Documentation Hub
            </h2>
            <p className="text-sm text-muted-foreground">
              Select a resource below to access business-facing upload guides or technical integration specifications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            
            {/* Card 1: Client / Operations User Guide */}
            <Card className="p-8 rounded-3xl border border-border bg-card/65 backdrop-blur-md hover:border-primary/45 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group text-left">
              <div className="space-y-5">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground">Client Operations User Guide</h3>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">For Business & Ledger Administrators</p>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Understand how to format, prepare, and upload CSV spreadsheets. Check validation rules across the 21 financial fields, simulate ingestion rows, and download compliant file templates.
                </p>
                <ul className="space-y-2 text-xs text-muted-foreground font-mono bg-muted/30 p-4 rounded-2xl border border-border/40">
                  <li className="flex items-center gap-2">↳ 21 Columns Ingestion Reference</li>
                  <li className="flex items-center gap-2">↳ Interactive CSV Sandbox Simulator</li>
                  <li className="flex items-center gap-2">↳ Downloadable Compliant Template</li>
                  <li className="flex items-center gap-2">↳ Error Isolation & Quarantine Guides</li>
                </ul>
              </div>
              <div className="pt-6">
                <Button
                  onClick={() => navigate('/docs/user-guide')}
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/10"
                >
                  <span>Open Operations Guide</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>

            {/* Card 2: Developer API Reference Docs */}
            <Card className="p-8 rounded-3xl border border-border bg-card/65 backdrop-blur-md hover:border-primary/45 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group text-left">
              <div className="space-y-5">
                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300">
                  <Terminal className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground">Technical API Portal</h3>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">For Engineers & System Integrators</p>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Complete technical specification catalog containing details on token authentication, Spring Batch microservices schemas, copyable curl commands, and active Swagger UI bridges.
                </p>
                <ul className="space-y-2 text-xs text-muted-foreground font-mono bg-muted/30 p-4 rounded-2xl border border-border/40">
                  <li className="flex items-center gap-2">↳ 26 REST API Endpoints Catalog</li>
                  <li className="flex items-center gap-2">↳ Stateless JWT & OAuth2 Security Flow</li>
                  <li className="flex items-center gap-2">↳ Copyable cURL Integration Snippets</li>
                  <li className="flex items-center gap-2">↳ Dynamic Swagger UI Interactive Console</li>
                </ul>
              </div>
              <div className="pt-6">
                <Button
                  onClick={() => navigate('/docs/api')}
                  className="w-full h-11 bg-primary hover:bg-primary/95 text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-primary/20"
                >
                  <span>Open Developer Portal</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>

          </div>
        </div>
      </section>

      {/* Stepper Process Flow Section */}
      <section id="process" className="py-20 border-t border-border/40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3.5">
            <span className="text-[11px] font-bold tracking-widest text-primary uppercase">Seamless Execution</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ingestion In Four Steps
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              A comprehensive system designed to parse, validate, and secure transaction streams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Step 1 */}
            <div className="space-y-4 relative flex flex-col items-center md:items-start text-center md:text-left">
              <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-sm font-bold shadow-inner">
                1
              </div>
              <h3 className="font-bold text-base">Upload CSV Ledgers</h3>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-[220px]">
                Log in and upload raw CSV ledger files directly into our high-speed ingestion portal.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-4 relative flex flex-col items-center md:items-start text-center md:text-left">
              <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-sm font-bold shadow-inner">
                2
              </div>
              <h3 className="font-bold text-base">Stream & Validate</h3>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-[220px]">
                The streaming engine parses rows, running structural, numeric, and validation rule checks.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-4 relative flex flex-col items-center md:items-start text-center md:text-left">
              <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-sm font-bold shadow-inner">
                3
              </div>
              <h3 className="font-bold text-base">Isolate Anomaly Errors</h3>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-[220px]">
                Clean transactions import immediately; non-compliant records are quarantined for review.
              </p>
            </div>

            {/* Step 4 */}
            <div className="space-y-4 relative flex flex-col items-center md:items-start text-center md:text-left">
              <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-sm font-bold shadow-inner">
                4
              </div>
              <h3 className="font-bold text-base">TOTP Secure Export</h3>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-[220px]">
                Verify Google Authenticator, input dynamic OTP, and securely download your clean datasets.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Site Footer */}
      <footer className="bg-muted/10 border-t border-border/60 py-12 text-xs text-muted-foreground select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 text-left">
          <div className="space-y-4">
            <Link 
              to="/" 
              onClick={(e) => {
                if (window.location.pathname === '/') {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="flex items-center gap-2 group cursor-pointer w-fit"
            >
              <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-105">
                <ShieldCheck className="h-4.5 w-4.5" />
              </div>
              <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">TradeStream</span>
            </Link>
            <p className="leading-relaxed max-w-[240px]">
              Decentralized high-volume trade processing & transaction integrity suite.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-3 uppercase tracking-wider text-[10px]">Documentation Links</h4>
            <ul className="space-y-2.5">
              <li><Link to="/docs/user-guide" className="hover:text-foreground transition-colors">Client Operations Guide</Link></li>
              <li><Link to="/docs/api" className="hover:text-foreground transition-colors">Technical API Reference</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-3 uppercase tracking-wider text-[10px]">Portal Security</h4>
            <ul className="space-y-2.5">
              <li><span className="text-muted-foreground/60">2FA MFA Authenticator Enabled</span></li>
              <li><span className="text-muted-foreground/60">AES-256 Historical Ledger Archival</span></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-border/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>&copy; 2026 TradeStream Engine Inc. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-foreground cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Privacy Policy</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
