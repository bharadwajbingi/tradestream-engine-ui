import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, Sparkles, ArrowRight, Play, CheckCircle2, XCircle, 
  Cpu, Layers, Lock, FileSpreadsheet, RefreshCw, ChevronRight, Menu, X, HelpCircle
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Button } from '../app/components/ui/button';
import { Card } from '../app/components/ui/card';
import { ThemeToggle } from '../app/components/common/ThemeToggle';
import { 
  Accordion, AccordionContent, AccordionItem, AccordionTrigger 
} from '../app/components/ui/accordion';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Simulator state
  const [simStatus, setSimStatus] = useState<'idle' | 'parsing' | 'completed'>('idle');
  const [simProgress, setSimProgress] = useState(0);
  const [simLog, setSimLog] = useState('');

  // Watch scroll to shadow-glaze navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Run Spreadsheet Ingest Simulator animation
  const handleStartSim = () => {
    if (simStatus === 'parsing') return;
    setSimStatus('parsing');
    setSimProgress(0);
    setSimLog('Reading spreadsheet rows...');

    const logs = [
      'Reading spreadsheet rows...',
      'Mapping transaction headers...',
      'Applying validation schema rules...',
      'Validating currency and rates...',
      'Flagging structural anomalies...',
      'Building ledger response tables...',
      'Finalizing cryptographic audit seal...'
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      setSimProgress((prev) => {
        const next = prev + 5;
        // Update logs dynamically as progress advances
        const logIndex = Math.min(
          Math.floor((next / 100) * logs.length),
          logs.length - 1
        );
        if (logIndex !== currentLogIndex) {
          currentLogIndex = logIndex;
          setSimLog(logs[logIndex]);
        }

        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setSimStatus('completed');
          }, 300);
          return 100;
        }
        return next;
      });
    }, 100);
  };

  const handleResetSim = () => {
    setSimStatus('idle');
    setSimProgress(0);
    setSimLog('');
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 relative overflow-x-hidden select-none">
      
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-primary/10 via-transparent to-transparent pointer-events-none -z-10" />
      <div className="absolute top-[250px] -left-[10%] w-[35%] h-[30%] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '6s' }} />
      <div className="absolute top-[400px] -right-[10%] w-[30%] h-[25%] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '8s' }} />

      {/* Brand Header / Navbar */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-background/80 backdrop-blur-xl border-b border-border/80 shadow-sm py-3' 
          : 'bg-transparent py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            onClick={(e) => {
              if (window.location.pathname === '/') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="flex items-center gap-2.5 group"
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white shadow-md shadow-primary/20 relative transition-transform duration-300 group-hover:scale-105">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-transparent group-hover:text-primary transition-colors">
              TradeStream
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#process" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
            <a href="#security" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Security</a>
            <a href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            {isAuthenticated ? (
              <Button 
                onClick={() => navigate('/dashboard')}
                className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/95 hover:to-purple-600/95 text-white shadow-md shadow-primary/10 rounded-xl font-semibold px-5"
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            ) : (
              <Link to="/login" className="text-sm font-semibold hover:text-primary transition-colors px-4 py-2 rounded-xl bg-muted/40 hover:bg-muted/80 transition-all">
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
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
              className="md:hidden border-b border-border bg-background/95 backdrop-blur-xl"
            >
              <div className="px-4 pt-2 pb-6 space-y-4 flex flex-col">
                <a 
                  href="#features" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-semibold text-muted-foreground hover:text-foreground py-2 border-b border-border/40"
                >
                  Features
                </a>
                <a 
                  href="#process" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-semibold text-muted-foreground hover:text-foreground py-2 border-b border-border/40"
                >
                  How It Works
                </a>
                <a 
                  href="#security" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-semibold text-muted-foreground hover:text-foreground py-2 border-b border-border/40"
                >
                  Security
                </a>
                <a 
                  href="#faq" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-semibold text-muted-foreground hover:text-foreground py-2 border-b border-border/40"
                >
                  FAQ
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
      <section className="pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6 md:space-y-8 text-center lg:text-left flex flex-col items-center lg:items-start">
              
              {/* Compliance Pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold tracking-wide animate-pulse">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Now with Bank-Grade TOTP Protection</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] max-w-xl lg:max-w-none">
                Streamline and Secure Your{' '}
                <span className="bg-gradient-to-r from-primary via-indigo-500 to-purple-600 bg-clip-text text-transparent">
                  Trade Ledger Ingestion
                </span>
              </h1>

              {/* Tagline */}
              <p className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
                Process million-row CSV ledgers in seconds. TSE ingests financial ledgers, isolates critical compliance errors, and secures downloadable data blocks with dual-layered Google Authenticator 2FA.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center">
                <Button
                  onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
                  className="h-12 w-full sm:w-auto px-8 rounded-xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/95 hover:to-purple-600/95 text-white font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/35 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 transition-all duration-300 relative overflow-hidden group/btn"
                >
                  <span>{isAuthenticated ? 'Go to Dashboard' : 'Get Started'}</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </Button>
                <a href="#features" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    className="h-12 w-full sm:w-auto px-8 rounded-xl font-semibold flex items-center justify-center gap-2 border-border/80 hover:bg-muted/40 hover:border-primary/30 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <Play className="h-3.5 w-3.5 text-primary animate-pulse" />
                    <span>Explore Platform Demo</span>
                  </Button>
                </a>
              </div>
            </div>

            {/* Right Interactive Simulator Card */}
            <div className="lg:col-span-6 flex justify-center w-full">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="w-full max-w-lg relative"
              >
                {/* Glowing border container */}
                <div className="absolute -inset-1.5 bg-gradient-to-r from-primary to-purple-600 rounded-3xl blur-xl opacity-20" />
                
                <Card className="w-full p-6 sm:p-8 rounded-3xl border border-border/80 bg-card/60 backdrop-blur-2xl shadow-2xl relative select-none">
                  {/* Mock Window Bar */}
                  <div className="flex items-center justify-between pb-5 border-b border-border/60 mb-6">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 bg-red-500/80 rounded-full" />
                      <div className="h-3 w-3 bg-amber-500/80 rounded-full" />
                      <div className="h-3 w-3 bg-emerald-500/80 rounded-full" />
                      <span className="text-[11px] text-muted-foreground font-mono ml-2 font-medium">stream_ingestion_portal.sh</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold font-mono">
                      v2.4.0
                    </span>
                  </div>

                  {/* Simulator Screen Area */}
                  <div className="space-y-6">
                    
                    {simStatus === 'idle' && (
                      <div className="flex flex-col items-center justify-center border-2 border-dashed border-border/60 hover:border-primary/50 transition-colors py-10 px-4 rounded-2xl bg-muted/20 cursor-pointer" onClick={handleStartSim}>
                        <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                          <FileSpreadsheet className="h-6 w-6" />
                        </div>
                        <h4 className="text-sm font-semibold mb-1">trade_ledger_may_2026.csv</h4>
                        <p className="text-xs text-muted-foreground text-center max-w-xs">
                          File contains 4,132 transaction rows. Click below to simulate high-velocity stream processing.
                        </p>
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartSim();
                          }}
                          className="mt-5 h-9 text-xs font-semibold rounded-lg"
                        >
                          Run Sample Parse
                        </Button>
                      </div>
                    )}

                    {simStatus === 'parsing' && (
                      <div className="space-y-6 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <RefreshCw className="h-4.5 w-4.5 text-primary animate-spin" />
                            <span className="text-xs font-semibold font-mono text-primary">INGESTING DATASTREAM...</span>
                          </div>
                          <span className="text-xs font-bold font-mono">{simProgress}%</span>
                        </div>

                        {/* Progress Bar Container */}
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-100 ease-out" 
                            style={{ width: `${simProgress}%` }}
                          />
                        </div>

                        {/* Dynamic Log message */}
                        <div className="bg-muted/40 border border-border/50 rounded-xl p-3.5 min-h-[50px] flex items-center justify-center text-center">
                          <span className="text-xs font-mono text-muted-foreground animate-pulse">
                            &gt; {simLog}
                          </span>
                        </div>
                      </div>
                    )}

                    {simStatus === 'completed' && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-6"
                      >
                        <div className="flex items-center gap-2 justify-center text-emerald-400 text-sm font-semibold">
                          <CheckCircle2 className="h-5 w-5" />
                          <span>Stream Ledger Purified Successfully</span>
                        </div>

                        {/* Counters Block */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 text-center">
                            <span className="text-2xl font-extrabold text-emerald-400 font-mono">4,120</span>
                            <p className="text-[10px] text-muted-foreground font-semibold mt-1 uppercase tracking-wider">Processed (Success)</p>
                          </div>
                          <div className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-4 text-center">
                            <span className="text-2xl font-extrabold text-rose-400 font-mono">12</span>
                            <p className="text-[10px] text-muted-foreground font-semibold mt-1 uppercase tracking-wider">Flagged (Errors)</p>
                          </div>
                        </div>

                        {/* Security notice inside simulator */}
                        <div className="flex gap-3 items-start bg-muted/40 p-3.5 rounded-xl border border-border/40 text-xs">
                          <Lock className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <p className="font-semibold text-foreground">Ledger Authenticator Lock Enabled</p>
                            <p className="text-[11px] text-muted-foreground">
                              Final databases and error logs are sealed. Export requests strictly require Google Authenticator 2FA tokens.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2 justify-center pt-2">
                          <Button 
                            onClick={handleResetSim}
                            variant="ghost"
                            className="h-9 text-xs rounded-lg"
                          >
                            Reset Portal
                          </Button>
                          <Button 
                            onClick={() => navigate('/login')}
                            className="h-9 text-xs rounded-lg bg-gradient-to-r from-primary to-purple-600 font-semibold text-white"
                          >
                            Access Full Portal
                          </Button>
                        </div>
                      </motion.div>
                    )}

                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Matrix Grid */}
      <section id="features" className="py-20 border-y border-border/40 bg-muted/10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3.5">
            <span className="text-[11px] font-bold tracking-widest text-primary uppercase">Powerful Capabilities</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Designed for High-Volume Compliance
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              TradeStream is optimized to process volatile spreadsheet transaction dumps, maintaining perfect audit controls.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Feature 1 */}
            <Card className="p-6 rounded-2xl border border-border/80 bg-card/40 backdrop-blur-md hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300">
                  <Cpu className="h-5.5 w-5.5" />
                </div>
                <h3 className="font-bold text-base">Stream Ingestion</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  High-speed chunk-based parsing validates millions of raw CSV transaction rows with zero CPU thread blockage.
                </p>
              </div>
            </Card>

            {/* Feature 2 */}
            <Card className="p-6 rounded-2xl border border-border/80 bg-card/40 backdrop-blur-md hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300">
                  <FileSpreadsheet className="h-5.5 w-5.5" />
                </div>
                <h3 className="font-bold text-base">Compliance Validation</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Trims spaces and checks currency, rate logic, accounts, and format structures, isolating cell discrepancies instantly.
                </p>
              </div>
            </Card>

            {/* Feature 3 */}
            <Card className="p-6 rounded-2xl border border-border/80 bg-card/40 backdrop-blur-md hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300">
                  <Layers className="h-5.5 w-5.5" />
                </div>
                <h3 className="font-bold text-base">Audit-Trail Isolations</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Separates active transactions, error record logs, and permanent AES-256 historical database tables.
                </p>
              </div>
            </Card>

            {/* Feature 4 */}
            <Card className="p-6 rounded-2xl border border-border/80 bg-card/40 backdrop-blur-md hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300">
                  <Lock className="h-5.5 w-5.5" />
                </div>
                <h3 className="font-bold text-base">2FA Google MFA</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Shields sensitive transactional dataset downloads behind Google Authenticator TOTP verification guards.
                </p>
              </div>
            </Card>

          </div>
        </div>
      </section>

      {/* Stepper Process Flow Section */}
      <section id="process" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3.5">
            <span className="text-[11px] font-bold tracking-widest text-primary uppercase">Simple Integration</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Purify Ledgers in Four Steps
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              A comprehensive system designed to eliminate spreadsheet transaction errors.
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
                Log in securely and upload your raw CSV ledger files directly into our high-speed validation portal.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-4 relative flex flex-col items-center md:items-start text-center md:text-left">
              <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-sm font-bold shadow-inner">
                2
              </div>
              <h3 className="font-bold text-base">Stream & Validate</h3>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-[220px]">
                The streaming engine parses rows, running structural, numeric, and currency normalize checks.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-4 relative flex flex-col items-center md:items-start text-center md:text-left">
              <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-sm font-bold shadow-inner">
                3
              </div>
              <h3 className="font-bold text-base">Rectify Discrepancies</h3>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-[220px]">
                Review identified compliance anomalies instantly. Download target log worksheets to fix errors.
              </p>
            </div>

            {/* Step 4 */}
            <div className="space-y-4 relative flex flex-col items-center md:items-start text-center md:text-left">
              <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-sm font-bold shadow-inner">
                4
              </div>
              <h3 className="font-bold text-base">TOTP Secure Export</h3>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-[220px]">
                Scan Google Authenticator, input dynamic OTP, and securely download your purified datasets.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Assurance Trust Banner */}
      <section id="security" className="py-16 bg-muted/15 border-y border-border/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-8 sm:p-12 rounded-3xl border border-border/80 bg-gradient-to-br from-card to-card/45 backdrop-blur-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4 text-center lg:text-left">
                <span className="text-[11px] font-bold text-primary uppercase tracking-widest flex items-center gap-1.5 justify-center lg:justify-start">
                  <Lock className="h-4 w-4 text-primary animate-pulse" /> Security Compliance Core
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Designed for Rigorous Institutional Ledgers
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
                  TradeStream integrates multi-layered protections. All endpoints enforce token-checked authorization, databases leverage AES-256 ledger archiving, and critical dataset downloading is secured under mandatory Google Authenticator 2FA.
                </p>
              </div>

              <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
                <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-xl border border-border/60 w-full">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  <span className="text-xs font-semibold font-mono">Google OAuth2 SSO</span>
                </div>
                <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-xl border border-border/60 w-full">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  <span className="text-xs font-semibold font-mono">MFA Authenticator (TOTP)</span>
                </div>
                <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-xl border border-border/60 w-full">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  <span className="text-xs font-semibold font-mono">AES-256 Ledger Archival</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Accordion FAQ Section */}
      <section id="faq" className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 space-y-3.5">
            <span className="text-[11px] font-bold tracking-widest text-primary uppercase flex items-center justify-center gap-1">
              <HelpCircle className="h-4 w-4" /> Got Questions?
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight">Frequently Asked Questions</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Everything you need to know about TradeStream Engine.</p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4">
            
            <AccordionItem value="item-1" className="border border-border/80 bg-card/30 backdrop-blur-md rounded-2xl px-5">
              <AccordionTrigger className="text-sm font-semibold hover:no-underline hover:text-primary transition-colors">
                What file formats and sizes are supported?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed pt-1 pb-4">
                TradeStream is built exclusively for comma-separated value (.csv) formats. By dedicating our streaming engine strictly to the CSV standard, we achieve parsing speeds exceeding 50,000 records per second, handling massive datasets without causing server-side memory bottlenecks.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border border-border/80 bg-card/30 backdrop-blur-md rounded-2xl px-5">
              <AccordionTrigger className="text-sm font-semibold hover:no-underline hover:text-primary transition-colors">
                Why is TOTP (Google Authenticator) required for exports?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed pt-1 pb-4">
                To maintain comprehensive institutional audit compliance and transaction integrity. Restricting data extraction exports behind dynamic TOTP verification prevents unauthorized session exports, guaranteeing that only registered, authorized operators can pull clean ledger worksheets or archived pools.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border border-border/80 bg-card/30 backdrop-blur-md rounded-2xl px-5">
              <AccordionTrigger className="text-sm font-semibold hover:no-underline hover:text-primary transition-colors">
                How does the platform isolate data validation errors?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed pt-1 pb-4">
                Our ingestion engine validates row compliance fields. If a cell contains a structural anomaly (such as space paddings, out-of-bounds currency formats, or malformed account IDs), the batch parser isolates the row. Successfully validated records are saved directly to the database, while errors are sent to the compliance board showing exact coordinate details.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border border-border/80 bg-card/30 backdrop-blur-md rounded-2xl px-5">
              <AccordionTrigger className="text-sm font-semibold hover:no-underline hover:text-primary transition-colors">
                Is my connection secure?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed pt-1 pb-4">
                Absolutely. All API routes, redirects, and database processes enforce TLS encryption. Frontend network requests use automatic CORS configuration and interceptors that wipe token logs instantly in the event of local context expiration or base connection errors.
              </AccordionContent>
            </AccordionItem>

          </Accordion>
        </div>
      </section>

      {/* Bottom Conversion Banner */}
      <section className="py-20 relative border-t border-border/40">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent pointer-events-none -z-10" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-8 flex flex-col items-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-[1.2]">
            Ready to Supercharge Your{' '}
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Transaction Operations?
            </span>
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
            Create your account today. Establish Google-MFA protection, upload transaction files, and start purging ledger errors immediately.
          </p>
          <Button
            onClick={() => navigate('/login')}
            className="h-12 px-10 rounded-xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/95 hover:to-purple-600/95 text-white font-semibold shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 transition-all duration-300 relative overflow-hidden group/btn2"
          >
            <span>Get Started</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn2:translate-x-1" />
          </Button>
        </div>
      </section>

      {/* Site Footer */}
      <footer className="bg-muted/10 border-t border-border/60 py-12 text-xs text-muted-foreground select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center text-white">
                <ShieldCheck className="h-4.5 w-4.5" />
              </div>
              <span className="font-bold text-sm text-foreground">TradeStream</span>
            </div>
            <p className="leading-relaxed max-w-[200px]">
              Decentralized high-volume trade processing & transaction integrity suite.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-3 uppercase tracking-wider text-[10px]">Product</h4>
            <ul className="space-y-2.5">
              <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
              <li><a href="#process" className="hover:text-foreground transition-colors">How It Works</a></li>
              <li><Link to="/login" className="hover:text-foreground transition-colors">Launch Ingest</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-3 uppercase tracking-wider text-[10px]">Security</h4>
            <ul className="space-y-2.5">
              <li><a href="#security" className="hover:text-foreground transition-colors">Verification Protocol</a></li>
              <li><span className="text-muted-foreground/60">ISO 27001 Registered</span></li>
              <li><span className="text-muted-foreground/60">2FA MFA Compliant</span></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-3 uppercase tracking-wider text-[10px]">Developers</h4>
            <ul className="space-y-2.5">
              <li><span className="text-muted-foreground/60">API Documentation</span></li>
              <li><span className="text-muted-foreground/60">Ledger Schemas</span></li>
              <li><span className="text-muted-foreground/60">Uptime Status 100%</span></li>
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
