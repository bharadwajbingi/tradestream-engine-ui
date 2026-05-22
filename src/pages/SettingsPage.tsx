import { Card } from '../app/components/ui/card';
import { Label } from '../app/components/ui/label';
import { Button } from '../app/components/ui/button';
import { Input } from '../app/components/ui/input';
import { RadioGroup, RadioGroupItem } from '../app/components/ui/radio-group';
import { useAuthStore } from '../store/authStore';
import { useState, useEffect } from 'react';
import { CheckCircle2, ShieldCheck, ShieldAlert, QrCode, Copy, Check, Loader2, Lock, Trash2 } from 'lucide-react';
import { axiosInstance, BASE_URL } from '../services/axios';
import { toast } from 'sonner';

interface TotpSetupResponse {
  qrCodeUrl: string;
  secret: string;
}

export default function SettingsPage() {
  const { email, name: storeName, setName } = useAuthStore();
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('dark');
  
  // Profile Name States
  const [userName, setUserName] = useState(storeName || '');
  const [isSavingName, setIsSavingName] = useState(false);
  
  // Sync name local state when storeName updates from localstorage/API
  useEffect(() => {
    if (storeName) {
      setUserName((current) => current || storeName);
    }
  }, [storeName]);
  
  // TOTP States
  const [isTotpEnabled, setIsTotpEnabled] = useState(false);
  const [totpStep, setTotpStep] = useState<'loading' | 'disabled' | 'setup' | 'enabled' | 'disable_confirm'>('loading');
  const [setupData, setSetupData] = useState<TotpSetupResponse | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    const initialTheme = stored || 'dark';
    setTheme(initialTheme);

    // Apply exact class alignment to document node to avoid plain white flashes on mount
    if (initialTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    } else {
      document.documentElement.classList.toggle('dark', initialTheme === 'dark');
    }

    fetchTotpStatus();
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await axiosInstance.get('/user/profile');
      const fetchedName = response.data.data?.name || '';
      setName(fetchedName);
      setUserName(fetchedName);
    } catch (err) {
      console.error('Failed to fetch user profile details', err);
    }
  };

  const handleSaveName = async () => {
    if (!userName.trim()) {
      toast.error('Name cannot be empty.');
      return;
    }

    setIsSavingName(true);
    const toastId = toast.loading('Updating profile name...');
    try {
      await axiosInstance.put('/user/profile', { name: userName.trim() });
      setName(userName.trim());
      toast.success('Profile name updated successfully!', { id: toastId });
    } catch (err: any) {
      console.error('Failed to update name', err);
      toast.error(err.response?.data?.message || 'Failed to update profile name', { id: toastId });
    } finally {
      setIsSavingName(false);
    }
  };

  const fetchTotpStatus = async () => {
    try {
      const response = await axiosInstance.get('/auth/totp/status');
      // Format is response.data.data.enabled
      const enabled = response.data.data?.enabled || false;
      setIsTotpEnabled(enabled);
      setTotpStep(enabled ? 'enabled' : 'disabled');
    } catch (err) {
      console.error('Failed to fetch TOTP status', err);
      setTotpStep('disabled');
    }
  };

  const handleInitiateSetup = async () => {
    setIsProcessing(true);
    const toastId = toast.loading('Initiating 2FA Setup...');
    try {
      const response = await axiosInstance.post('/auth/totp/setup');
      setSetupData(response.data.data);
      setTotpStep('setup');
      setVerificationCode('');
      toast.success('Scan the QR code to proceed.', { id: toastId });
    } catch (err: any) {
      console.error('Failed to initiate TOTP setup', err);
      toast.error(err.response?.data?.message || 'Failed to initiate 2FA setup', { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyAndEnable = async () => {
    if (verificationCode.length !== 6 || isNaN(Number(verificationCode))) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }
    
    setIsProcessing(true);
    const toastId = toast.loading('Verifying and enabling 2FA...');
    try {
      await axiosInstance.post('/auth/totp/enable', { code: verificationCode });
      setIsTotpEnabled(true);
      setTotpStep('enabled');
      setSetupData(null);
      toast.success('Two-factor authentication (2FA) is now ACTIVE!', { id: toastId });
    } catch (err: any) {
      console.error('Failed to enable TOTP', err);
      toast.error(err.response?.data?.message || 'Invalid verification code. Please try again.', { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDisableTotp = async () => {
    if (verificationCode.length !== 6 || isNaN(Number(verificationCode))) {
      toast.error('Please enter a valid 6-digit verification code to confirm');
      return;
    }

    setIsProcessing(true);
    const toastId = toast.loading('Disabling 2FA...');
    try {
      await axiosInstance.delete('/auth/totp/disable', {
        params: { code: verificationCode }
      });
      setIsTotpEnabled(false);
      setTotpStep('disabled');
      setVerificationCode('');
      toast.success('Two-factor authentication has been disabled.', { id: toastId });
    } catch (err: any) {
      console.error('Failed to disable TOTP', err);
      toast.error(err.response?.data?.message || 'Failed to disable 2FA. Invalid code.', { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopySecret = () => {
    if (!setupData?.secret) return;
    navigator.clipboard.writeText(setupData.secret);
    setCopied(true);
    toast.success('Secret key copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    if (newTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    } else {
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
          System Preferences
        </h1>
        <p className="text-muted-foreground text-sm">
          Manage your personal workspace environment and authorization keys.
        </p>
      </div>

      {/* Profile Card */}
      <Card className="p-6 rounded-2xl border border-border bg-gradient-to-br from-card to-card/50">
        <div className="flex items-center justify-between mb-4 border-b border-border/60 pb-4">
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2">
              User Profile
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage your profile details and corporate identity.
            </p>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg shrink-0">
              {userName?.charAt(0).toUpperCase() || email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Corporate Identity</p>
              <h4 className="text-lg font-semibold">{userName || 'Google User'}</h4>
              <p className="text-xs text-muted-foreground font-mono">{email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Email Address</Label>
              <Input
                type="text"
                value={email || ''}
                readOnly
                className="bg-muted/40 cursor-not-allowed border-border/40 select-all font-mono text-sm h-11 rounded-xl"
              />
              <p className="text-[10px] text-muted-foreground">Your authenticated email address is locked.</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Full Name</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name"
                  className="bg-background/50 border-border/60 text-sm h-11 rounded-xl focus:border-primary"
                />
                <Button
                  onClick={handleSaveName}
                  disabled={isSavingName || !userName.trim() || userName.trim() === storeName}
                  className="h-11 px-5 rounded-xl shrink-0 font-medium"
                >
                  {isSavingName ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground">This name is used across audit trail exports and notifications.</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Two-Factor Authentication (2FA) Security Panel */}
      <Card className="p-6 rounded-2xl border border-border bg-gradient-to-br from-card to-card/50">
        <div className="flex items-center justify-between mb-4 border-b border-border/60 pb-4">
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Two-Factor Authentication (2FA)
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Secure critical spreadsheet downloads and archive database extraction API queries.
            </p>
          </div>
          <div>
            {isTotpEnabled ? (
              <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="h-3.5 w-3.5" />
                Active
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <ShieldAlert className="h-3.5 w-3.5" />
                Inactive
              </span>
            )}
          </div>
        </div>

        {/* Step Machine renderer */}
        {totpStep === 'loading' && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-xs text-muted-foreground mt-2">Checking device registry status...</p>
          </div>
        )}

        {totpStep === 'disabled' && (
          <div className="space-y-4 py-2">
            <div className="flex gap-4 items-start rounded-xl bg-muted/40 p-4 border border-border/40">
              <QrCode className="h-10 w-10 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-semibold">Google Authenticator / Microsoft Authenticator</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Enabling 2FA shields highly-sensitive trade ledger transactions by requiring a 6-digit verification code from your authenticator app prior to executing exports.
                </p>
              </div>
            </div>
            <Button onClick={handleInitiateSetup} disabled={isProcessing} className="rounded-xl w-full sm:w-auto">
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Set Up Authenticator App
            </Button>
          </div>
        )}

        {totpStep === 'setup' && setupData && (
          <div className="space-y-6 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* QR Code column */}
              <div className="flex flex-col items-center p-4 bg-white rounded-2xl border border-slate-200 shadow-inner shrink-0 w-full max-w-[240px] mx-auto">
                <img
                  src={setupData.qrCodeUrl}
                  alt="Scan 2FA QR Code"
                  className="w-full h-auto object-contain"
                />
                <span className="text-[10px] text-slate-500 font-semibold uppercase mt-2 select-none tracking-wider">
                  Scan in Authenticator App
                </span>
              </div>

              {/* Instructions and Input column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Step 1</span>
                  <h4 className="text-sm font-semibold">Register Device Secret</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Scan the QR code with Google Authenticator or manual-key enter this secret string:
                  </p>
                  
                  {/* Copy key code */}
                  <div className="flex gap-2 items-center bg-muted/60 p-2.5 rounded-xl border border-border select-all font-mono text-xs mt-1.5 justify-between w-full max-w-sm">
                    <span className="font-semibold text-foreground tracking-wide break-all select-all select-text">{setupData.secret}</span>
                    <button
                      onClick={handleCopySecret}
                      className="text-muted-foreground hover:text-foreground shrink-0 transition-colors"
                      title="Copy Key"
                    >
                      {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Step 2</span>
                  <h4 className="text-sm font-semibold">Verify Dynamic Verification Code</h4>
                  <p className="text-xs text-muted-foreground">
                    Confirm alignment by providing your current 6-digit authenticator code:
                  </p>
                  <div className="flex gap-3 max-w-[280px] mt-1.5">
                    <Input
                      type="text"
                      maxLength={6}
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className="text-center font-mono tracking-widest text-lg h-11 bg-background/50 rounded-xl"
                    />
                    <Button
                      onClick={handleVerifyAndEnable}
                      disabled={isProcessing || verificationCode.length !== 6}
                      className="h-11 px-5 rounded-xl shrink-0"
                    >
                      {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-border/50 pt-4">
              <Button
                variant="ghost"
                onClick={() => {
                  setSetupData(null);
                  setTotpStep('disabled');
                }}
                disabled={isProcessing}
                className="rounded-xl text-xs"
              >
                Cancel Setup
              </Button>
            </div>
          </div>
        )}

        {totpStep === 'enabled' && (
          <div className="space-y-4 py-2">
            <div className="flex gap-4 items-start rounded-xl bg-emerald-500/5 p-4 border border-emerald-500/10">
              <CheckCircle2 className="h-10 w-10 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">Advanced Protection Shield Active</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your corporate profile is secured. Any downloads or data transfers originating from the main table, archives, or error logs will strictly require a transient Google Authenticator TOTP token check.
                </p>
              </div>
            </div>
            
            <Button
              variant="outline"
              onClick={() => {
                setTotpStep('disable_confirm');
                setVerificationCode('');
              }}
              className="border-rose-500/20 text-rose-400 hover:bg-rose-500/10 hover:text-rose-400 rounded-xl text-xs"
            >
              Disable Two-Factor Authentication
            </Button>
          </div>
        )}

        {totpStep === 'disable_confirm' && (
          <div className="space-y-4 py-2 border border-rose-500/20 rounded-xl p-4 bg-rose-500/5">
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-rose-400">Confirm Deactivation Request</h4>
              <p className="text-xs text-muted-foreground">
                To disable advanced export protections, enter the 6-digit code currently shown on your app:
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 max-w-sm mt-2">
              <Input
                type="text"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="text-center font-mono tracking-widest text-lg h-10 bg-background/50 rounded-xl sm:max-w-[150px]"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleDisableTotp}
                  disabled={isProcessing || verificationCode.length !== 6}
                  className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-10 px-4 text-xs font-semibold"
                >
                  {isProcessing ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : <Trash2 className="h-3.5 w-3.5 mr-1.5" />}
                  Deactivate Protection
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setTotpStep('enabled')}
                  disabled={isProcessing}
                  className="rounded-xl h-10 text-xs"
                >
                  Keep Active
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Appearance Settings Card */}
      <Card className="p-6 rounded-2xl border border-border">
        <h3 className="font-semibold mb-4">Appearance</h3>
        <div className="space-y-3">
          <Label>Theme</Label>
          <RadioGroup value={theme} onValueChange={handleThemeChange}>
            <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
              <RadioGroupItem value="light" id="light" />
              <Label htmlFor="light" className="flex-1 cursor-pointer">
                Light
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
              <RadioGroupItem value="dark" id="dark" />
              <Label htmlFor="dark" className="flex-1 cursor-pointer">
                Dark
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
              <RadioGroupItem value="system" id="system" />
              <Label htmlFor="system" className="flex-1 cursor-pointer">
                System
              </Label>
            </div>
          </RadioGroup>
        </div>
      </Card>

      {/* Connection Context Notice */}
      <Card className="p-6 rounded-2xl border border-border">
        <h3 className="font-semibold mb-4">Connection</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">API Base URL</p>
            <p className="text-sm text-muted-foreground font-mono">{BASE_URL}</p>
          </div>
          <div className="flex items-center gap-2 text-success">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-medium">Connected</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
