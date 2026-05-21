import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Card } from '../app/components/ui/card';
import { Button } from '../app/components/ui/button';
import { Sparkles, ShieldCheck } from 'lucide-react';

export default function SignupPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // If they land on signup, redirect them to login after a brief moment or let them read the notice
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent" />
      <div className="absolute inset-0 opacity-10 animate-pulse" style={{
        backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
        backgroundSize: '24px 24px'
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="w-full p-10 rounded-3xl border border-border/80 bg-card/60 backdrop-blur-2xl shadow-2xl relative z-10 text-center flex flex-col items-center">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 shadow-inner">
            <ShieldCheck className="h-8 w-8 animate-pulse" />
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-foreground mb-3">
            Unified Sign-In Enforced
          </h2>
          <p className="text-muted-foreground text-sm max-w-xs leading-relaxed mb-8">
            Registration has been seamlessly consolidated. Sign in with Google to instantly establish or sync your secure corporate account.
          </p>

          <Button
            onClick={() => navigate('/login')}
            className="w-full h-12 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-semibold rounded-xl text-sm flex items-center justify-center shadow-lg shadow-primary/20 transition-all duration-300"
          >
            Go to Google Sign-In
          </Button>

          <div className="mt-6 text-[10px] text-muted-foreground/60 flex items-center gap-1.5 justify-center">
            <Sparkles className="h-3.5 w-3.5 text-purple-400" />
            <span>Automatic provisioning for Google users</span>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
