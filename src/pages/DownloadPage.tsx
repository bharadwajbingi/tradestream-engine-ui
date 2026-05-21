import { useState, useEffect } from 'react';
import { Download, FileSpreadsheet, ShieldCheck, Database, Calendar, Filter, Archive, CheckCircle, Lock, Loader2, Sparkles } from 'lucide-react';
import { Card } from '../app/components/ui/card';
import { Button } from '../app/components/ui/button';
import { Input } from '../app/components/ui/input';
import { toast } from 'sonner';
import { axiosInstance } from '../services/axios';
import { fileService } from '../services/fileService';
import { FileLoadMetaData } from '../types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../app/components/ui/dialog';

export default function DownloadPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [files, setFiles] = useState<FileLoadMetaData[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // 2FA / Export protection state
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [pendingExport, setPendingExport] = useState<{ type: 'active' | 'archived'; format: 'csv' | 'excel' } | null>(null);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const data = await fileService.getAllFiles();
        setFiles(data || []);
      } catch (err) {
        console.error('Failed to load files for selector dropdown:', err);
      }
    };
    fetchFiles();
  }, []);

  const getValidExportToken = (): string | null => {
    const token = localStorage.getItem('export_token');
    const expiresAt = localStorage.getItem('export_token_expires');
    if (token && expiresAt && Number(expiresAt) > Date.now()) {
      return token;
    }
    // Remove if expired
    localStorage.removeItem('export_token');
    localStorage.removeItem('export_token_expires');
    return null;
  };

  const saveExportToken = (token: string) => {
    localStorage.setItem('export_token', token);
    localStorage.setItem('export_token_expires', String(Date.now() + 4.5 * 60 * 1000)); // 4.5 minutes safety limit
  };

  // Entry point for clicking download button
  const triggerExport = async (type: 'active' | 'archived', format: 'csv' | 'excel') => {
    // 1. Verify if user is protected by 2FA
    try {
      const statusResponse = await axiosInstance.get('/auth/totp/status');
      const is2faActive = statusResponse.data.data?.enabled || false;

      if (!is2faActive) {
        // Direct download
        executeExport(type, format, null);
        return;
      }

      // 2. 2FA is active, check if we have a valid cached export token
      const cachedToken = getValidExportToken();
      if (cachedToken) {
        executeExport(type, format, cachedToken);
        return;
      }

      // 3. Prompt OTP dialog
      setPendingExport({ type, format });
      setOtpCode('');
      setShowOtpDialog(true);
    } catch (err) {
      console.error('Failed to verify export security context', err);
      toast.error('Failed to authenticate export session. Proceeding under legacy JWT...');
      executeExport(type, format, null);
    }
  };

  // Verify code and then run export
  const handleVerifyOtpAndProceed = async () => {
    if (otpCode.length !== 6 || isNaN(Number(otpCode))) {
      toast.error('Please enter a valid 6-digit verification code');
      return;
    }

    setIsVerifyingOtp(true);
    const toastId = toast.loading('Verifying secure export token...');
    try {
      const verifyResponse = await axiosInstance.post('/auth/totp/verify', { code: otpCode });
      const exportToken = verifyResponse.data.data;
      
      saveExportToken(exportToken);
      setShowOtpDialog(false);
      toast.success('TOTP verification successful! Fetching dataset.', { id: toastId });

      if (pendingExport) {
        executeExport(pendingExport.type, pendingExport.format, exportToken);
      }
    } catch (err: any) {
      console.error('Failed to verify TOTP code for export', err);
      toast.error(err.response?.data?.message || 'Invalid authenticator code. Access denied.', { id: toastId });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Perform actual download logic
  const executeExport = async (type: 'active' | 'archived', format: 'csv' | 'excel', token: string | null) => {
    setIsExporting(true);
    const toastId = toast.loading(`Preparing secure ${type.toUpperCase()} ledger dataset...`);

    try {
      const params: any = { format };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (selectedFileId) params.fileId = Number(selectedFileId);

      const headers: any = {};
      if (token) {
        headers['X-Export-Token'] = token;
      }

      // Corrected API routes to match spring boot controllers
      const endpoint = type === 'active' ? '/transactions/export' : '/transactions/archive/export';

      const response = await axiosInstance.get(endpoint, {
        params,
        headers,
        responseType: 'blob',
      });

      // Create downloadable Blob
      const blob = new Blob([response.data], {
        type: response.headers['content-type'] || (format === 'csv' ? 'text/csv' : 'application/vnd.ms-excel'),
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const contentDisposition = response.headers['content-disposition'];
      let filename = `exported_${type}_transactions_${Date.now()}.${format === 'csv' ? 'csv' : 'xls'}`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} ledger exported successfully!`, { id: toastId });
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error(`Export failed. Verification session may have expired.`, { id: toastId });
    } finally {
      setIsExporting(false);
      setPendingExport(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
          Data Export Centre
        </h1>
        <p className="text-muted-foreground text-sm">
          Export targeted transactions from the active main database and historical archives.
        </p>
      </div>

      {/* Interactive Filters Panel */}
      <Card className="p-6 rounded-2xl border border-border bg-card/40 backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-primary animate-pulse" />
          <h3 className="text-sm font-semibold text-foreground">Optional Export Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-primary" /> Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-background/50 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-200"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-primary" /> End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-background/50 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-200"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Database className="h-3.5 w-3.5 text-primary" /> Filter by File Upload
            </label>
            <div className="flex gap-2">
              <select
                value={selectedFileId}
                onChange={(e) => setSelectedFileId(e.target.value)}
                className="w-full bg-background/50 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-200"
              >
                <option value="">All Files</option>
                {files.map((file) => (
                  <option key={file.id || file.fileId} value={file.id || file.fileId}>
                    ID {file.id || file.fileId} - {file.filename} ({file.status})
                  </option>
                ))}
              </select>
              {(startDate || endDate || selectedFileId) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                    setSelectedFileId('');
                  }}
                  className="px-3 border-dashed border-muted-foreground/30 text-muted-foreground hover:text-foreground text-xs h-9 rounded-xl hover:bg-background/80"
                  title="Clear Filters"
                >
                  Reset
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Cards container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Transactions Card */}
        <Card className="p-8 rounded-2xl border border-border flex flex-col justify-between space-y-6 bg-card/50 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all duration-300"></div>
          
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                Active Transactions
                <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  main table
                </span>
              </h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                Retrieve active trade transactions currently in `trade_transaction` under dynamic auth.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <span>Direct secure main table access</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => triggerExport('active', 'csv')}
                disabled={isExporting}
                className="flex items-center justify-center gap-1.5 text-xs rounded-xl font-semibold"
              >
                <Download className="h-3.5 w-3.5" />
                CSV Format
              </Button>
              <Button
                variant="outline"
                onClick={() => triggerExport('active', 'excel')}
                disabled={isExporting}
                className="flex items-center justify-center gap-1.5 text-xs rounded-xl hover:bg-background/80 font-semibold"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                Excel (XLS)
              </Button>
            </div>
          </div>
        </Card>

        {/* Archived Transactions Card */}
        <Card className="p-8 rounded-2xl border border-border flex flex-col justify-between space-y-6 bg-card/50 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-all duration-300"></div>

          <div className="space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
              <Archive className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                Archived Transactions
                <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  trade_archive
                </span>
              </h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                Retrieve historical archived trade transactions stored in `trade_archive`.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-purple-400" />
              <span>Direct secure archive table access</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => triggerExport('archived', 'csv')}
                disabled={isExporting}
                className="bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center gap-1.5 text-xs rounded-xl font-semibold border-none"
              >
                <Download className="h-3.5 w-3.5" />
                CSV Format
              </Button>
              <Button
                variant="outline"
                onClick={() => triggerExport('archived', 'excel')}
                disabled={isExporting}
                className="border-purple-500/30 hover:bg-purple-500/10 text-purple-400 flex items-center justify-center gap-1.5 text-xs rounded-xl font-semibold"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                Excel (XLS)
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Security Context Notice */}
      <Card className="p-6 rounded-2xl border border-border bg-muted/30">
        <h4 className="font-semibold text-sm flex items-center gap-2 text-foreground">
          <ShieldCheck className="h-4 w-4 text-primary animate-pulse" />
          Security Notice & Traceability
        </h4>
        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
          All dataset exports are strictly tracked and audited. When Two-Factor Authentication is active, downloading transaction ledgers requires verification using a Google Authenticator TOTP token which grants a secure 5-minute export authorization.
        </p>
      </Card>

      {/* Radix Dialog for TOTP Verification */}
      <Dialog open={showOtpDialog} onOpenChange={setShowOtpDialog}>
        <DialogContent className="max-w-md rounded-2xl p-6 bg-card border border-border">
          <DialogHeader className="flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-3">
              <Lock className="h-6 w-6 animate-bounce" />
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight">Security Check Required</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground max-w-[320px] mt-1.5">
              Two-factor protection is active. Enter the 6-digit code from Google Authenticator to authorize this ledger download.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-4 flex flex-col items-center">
            <Input
              type="text"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="text-center font-mono tracking-[0.75em] pl-[0.75em] text-2xl h-12 bg-background/50 border border-border rounded-xl max-w-[200px]"
            />
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-2">
            <Button
              variant="ghost"
              onClick={() => {
                setShowOtpDialog(false);
                setPendingExport(null);
              }}
              disabled={isVerifyingOtp}
              className="rounded-xl w-full sm:w-auto text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={handleVerifyOtpAndProceed}
              disabled={isVerifyingOtp || otpCode.length !== 6}
              className="rounded-xl w-full sm:w-auto text-xs bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-semibold shadow-lg shadow-primary/15"
            >
              {isVerifyingOtp ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                  Verify & Download
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
