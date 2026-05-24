import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { motion } from 'motion/react';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function OAuth2RedirectHandler() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setToken } = useAuthStore();
  const token = searchParams.get('token');
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    if (token) {
      try {
        // Decode user email from the JWT token payload
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        const email = payload.sub || payload.email || 'Google User';
        const name = payload.name || null;

        // Set auth state
        setToken(token, email, name);
        
        toast.success(`Welcome back, ${name || email}!`);
        
        // Brief delay for transition animation
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } catch (err) {
        console.error('Failed to parse OAuth2 token', err);
        toast.error('Authentication failed. Invalid token received.');
        navigate('/login');
      }
    } else {
      toast.error('Authentication failed. No token received.');
      navigate('/login');
    }
  }, [token, setToken, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent" />
      <div className="absolute inset-0 opacity-10 animate-pulse" style={{
        backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
        backgroundSize: '24px 24px'
      }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md p-10 rounded-3xl border border-border/80 bg-card/60 backdrop-blur-2xl shadow-2xl relative z-10 text-center flex flex-col items-center"
      >
        {token ? (
          <>
            <motion.div
              initial={{ rotate: -45, scale: 0.5, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6"
            >
              <ShieldCheck className="h-10 w-10 animate-pulse" />
            </motion.div>
            
            <h2 className="text-2xl font-bold tracking-tight text-foreground mb-3">
              Securing Session
            </h2>
            <p className="text-muted-foreground text-sm max-w-xs leading-relaxed mb-6">
              Verifying Google OAuth2 credentials and establishing a secure authorization channel...
            </p>

            {/* Premium sleek progress indicator */}
            <div className="w-48 h-1 bg-border rounded-full overflow-hidden relative">
              <motion.div
                initial={{ left: '-100%' }}
                animate={{ left: '100%' }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-primary to-purple-500 rounded-full"
              />
            </div>
          </>
        ) : (
          <>
            <div className="h-20 w-20 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive mb-6">
              <AlertCircle className="h-10 w-10" />
            </div>
            
            <h2 className="text-2xl font-bold tracking-tight text-foreground mb-3">
              Authentication Error
            </h2>
            <p className="text-muted-foreground text-sm max-w-xs leading-relaxed mb-6">
              No authorization token was provided by the identity provider. Redirecting you back to login...
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}
