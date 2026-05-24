import { useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Card } from "../app/components/ui/card";
import { Button } from "../app/components/ui/button";
import { ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const cardVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function LoginPage() {
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleGoogleLogin = () => {
    setIsRedirecting(true);
    toast.loading("Redirecting to Google Secure Login...");

    // Redirect to the Spring Boot Google OAuth2 initiation endpoint
    window.location.href = `${BASE_URL}/oauth2/authorization/google`;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Premium background styling */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-3xl" />

      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <motion.div
        variants={cardVariants}
        initial="initial"
        animate="animate"
        className="relative z-10 w-full max-w-md"
      >
        {/* Sleek outer glowing effect */}
        <div className="absolute -inset-1.5 bg-gradient-to-r from-primary to-purple-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200" />

        <Card className="w-full p-10 rounded-3xl border border-border/80 bg-card/60 backdrop-blur-2xl shadow-2xl relative">
          <div className="mb-8 text-center flex flex-col items-center">
            {/* Animated modern logo container */}
            <Link
              to="/"
              className="flex flex-col items-center group cursor-pointer"
            >
              <motion.div
                initial={{ scale: 0.8, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-primary-foreground mb-6 shadow-lg shadow-primary/20 relative transition-transform duration-300 group-hover:scale-105"
              >
                <ShieldCheck className="h-9 w-9 text-white" />
                <div className="absolute -top-1 -right-1 h-4 w-4 bg-emerald-500 rounded-full border-2 border-card flex items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                </div>
              </motion.div>

              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent group-hover:text-primary transition-colors">
                TradeStream Engine
              </h1>
            </Link>
            <p className="text-sm text-muted-foreground mt-2 max-w-[280px] leading-relaxed">
              Decentralized high-volume trade processing & transaction integrity
              suite
            </p>
          </div>

          <div className="space-y-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 text-center flex items-center justify-center gap-2">
              <span className="h-[1px] w-12 bg-border" />
              <span>Identity Assurance Gate</span>
              <span className="h-[1px] w-12 bg-border" />
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <Button
                onClick={handleGoogleLogin}
                disabled={isRedirecting}
                className="w-full h-12 bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 transition-all font-semibold rounded-xl text-sm flex items-center justify-center shadow-sm relative overflow-hidden group hover:border-slate-300"
              >
                {isRedirecting ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-slate-700"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Establishing Secure Route...</span>
                  </div>
                ) : (
                  <>
                    <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        fill="#EA4335"
                      />
                    </svg>
                    <span>Sign in with Google</span>
                  </>
                )}
              </Button>
            </motion.div>
          </div>

          <div className="mt-8 text-center text-xs text-muted-foreground/60 flex items-center justify-center gap-1">
            <Sparkles className="h-3 w-3 text-purple-400" />
            <span>Google Single-Sign-On is fully enforced</span>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
