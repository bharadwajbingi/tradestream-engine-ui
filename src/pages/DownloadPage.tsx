import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, FileSpreadsheet, ShieldCheck, Database, Calendar, Filter, Archive, CheckCircle, Lock, Loader2, Sparkles, Clock, AlertTriangle } from 'lucide-react';
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

interface ExportJob {
  id: string;
  status: string;
  createdAt: string;
  downloaded: boolean;
  exportType?: string;
  errorMessage?: string;
}

export default function DownloadPage() {
  const navigate = useNavigate();
  const [isExporting, setIsExporting] = useState(false);
  const [files, setFiles] = useState<FileLoadMetaData[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const [pendingExport, setPendingExport] = useState<{ type: 'active' | 'archived'; format: 'csv' } | null>(null);
  const [pendingDownloadJobId, setPendingDownloadJobId] = useState<string | null>(null);
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const [jobs, setJobs] = useState<ExportJob[]>([]);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/transactions/export/jobs');
      setJobs(response.data);
    } catch (err) {
      console.error('Failed to fetch export jobs', err);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    const hasPreparing = jobs.some(j => j.status === 'PENDING' || j.status === 'PROCESSING');
    
    if (hasPreparing) {
      if (!pollIntervalRef.current) {
        pollIntervalRef.current = setInterval(() => {
          fetchJobs();
        }, 3000);
      }
    } else {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [jobs, fetchJobs]);

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

  const triggerExport = async (type: 'active' | 'archived', format: 'csv' = 'csv') => {
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      toast.error('Start date cannot be greater than end date');
      return;
    }

    try {
      const statusResponse = await axiosInstance.get('/auth/totp/status');
      const is2faActive = statusResponse.data.data?.enabled || false;

      if (!is2faActive) {
        toast.warning('Two-factor authentication (2FA) is required. Please set up your authenticator app in Settings before downloading transaction ledger files.');
        navigate('/settings');
        return;
      }

      setPendingExport({ type, format });
      setOtpCode('');
      setShowOtpDialog(true);
    } catch (err) {
      console.error('Failed to verify export security context', err);
      toast.error('Could not verify export security. Please log in again or retry.');
    }
  };

  const triggerDownload = (jobId: string) => {
    setPendingDownloadJobId(jobId);
    setOtpCode('');
    setShowOtpDialog(true);
  };

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
      
      setShowOtpDialog(false);
      toast.success('TOTP verification successful!', { id: toastId });

      if (pendingExport) {
        executeExport(pendingExport.type, pendingExport.format, exportToken);
      } else if (pendingDownloadJobId) {
        executeDownload(pendingDownloadJobId, exportToken);
      }
    } catch (err: any) {
      console.error('Failed to verify TOTP code', err);
      toast.error(err.response?.data?.message || 'Invalid authenticator code. Access denied.', { id: toastId });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const executeExport = async (type: 'active' | 'archived', format: 'csv', token: string | null) => {
    setIsExporting(true);
    try {
      const params: any = { format };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (selectedFileId) params.fileId = Number(selectedFileId);

      const headers: any = {};
      if (token) {
        headers['X-Export-Token'] = token;
      }

      const endpoint = type === 'active' ? '/transactions/export' : '/transactions/archive/export';
      await axiosInstance.get(endpoint, { params, headers });
      
      toast.success('Export job queued successfully.');
      setPendingExport(null);
      fetchJobs();
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error('Failed to queue export job.');
    } finally {
      setIsExporting(false);
    }
  };

  const executeDownload = async (jobId: string, token: string | null) => {
    try {
      const headers: any = {};
      if (token) {
        headers['X-Export-Token'] = token;
      }

      const downloadRes = await axiosInstance.get(`/transactions/export/download/${jobId}`, { headers });
      const s3Url = downloadRes.data.downloadUrl;
      
      setPendingDownloadJobId(null);
      
      toast.info('Note: This download link will expire in 24 hours.', { duration: 10000 });
      
      if (s3Url) {
        const link = document.createElement('a');
        link.href = s3Url;
        link.setAttribute('target', '_blank');
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
      
      fetchJobs();
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to get download link.');
      setPendingDownloadJobId(null);
    }
  };

  const isExpired = (createdAt: string) => {
    const created = new Date(createdAt).getTime();
    const now = new Date().getTime();
    return now - created > 24 * 60 * 60 * 1000;
  };

  const formatDateIST = (dateString: string) => {
    // Append 'Z' if missing so JS knows the date string is in UTC
    const utcString = dateString.endsWith('Z') ? dateString : `${dateString}Z`;
    return new Date(utcString).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  // Sort jobs oldest first to assign sequential numbers, then map names
  const jobsWithNames = [...jobs]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .reduce((acc: (ExportJob & { displayName: string })[], job) => {
      const isArchive = job.exportType === 'ARCHIVE';
      const label = isArchive ? 'Archive Table Data' : 'Trade Data Main Table';
      
      const count = acc.filter(j => 
        isArchive ? j.exportType === 'ARCHIVE' : j.exportType !== 'ARCHIVE'
      ).length + 1;
      
      acc.push({
        ...job,
        displayName: `${label} #${count}`
      });
      return acc;
    }, []);

  // Show latest first in the UI lists
  const orderedJobs = [...jobsWithNames].reverse();

  const preparingJobs = orderedJobs.filter(j => j.status === 'PENDING' || j.status === 'PROCESSING');
  const readyJobs = orderedJobs.filter(j => j.status === 'COMPLETED');
  const failedJobs = orderedJobs.filter(j => j.status === 'FAILED');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
          Data Export Centre
        </h1>
        <p className="text-muted-foreground text-sm">
          Export targeted transactions from the active main database and historical archives.
        </p>
      </div>

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
              max={endDate || undefined}
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
              min={startDate || undefined}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            
            <div className="w-full">
              <Button
                onClick={() => triggerExport('active', 'csv')}
                disabled={isExporting}
                className="w-full flex items-center justify-center gap-1.5 text-xs rounded-xl font-semibold bg-gradient-to-r from-primary to-purple-600 hover:from-primary/95 hover:to-purple-600/95 shadow-md shadow-primary/10"
              >
                <Download className="h-3.5 w-3.5" />
                Queue Export (CSV)
              </Button>
            </div>
          </div>
        </Card>

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

            <div className="w-full">
              <Button
                onClick={() => triggerExport('archived', 'csv')}
                disabled={isExporting}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-600/95 hover:to-indigo-600/95 text-white flex items-center justify-center gap-1.5 text-xs rounded-xl font-semibold border-none shadow-md shadow-purple-500/10"
              >
                <Download className="h-3.5 w-3.5" />
                Queue Archive Export (CSV)
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-6 pt-6">
        {preparingJobs.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <Clock className="h-4 w-4 text-blue-500 animate-pulse" />
              Preparing Exports
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {preparingJobs.map(job => (
                <div key={job.id} className="p-4 rounded-xl border border-border bg-card/50 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-mono text-muted-foreground">ID: {job.id.substring(0,8)}...</p>
                    <p className="text-sm font-medium mt-1">Preparing {job.displayName}...</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Estimated time: ~10-15s</p>
                  </div>
                  <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                </div>
              ))}
            </div>
          </div>
        )}

        {readyJobs.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              Ready & History
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {readyJobs.map(job => {
                const expired = isExpired(job.createdAt);
                
                return (
                  <div key={job.id} className={`p-4 rounded-xl border flex flex-col gap-3 ${expired ? 'border-muted bg-muted/10 opacity-75' : 'border-border bg-card/40'}`}>
                    <div>
                      <div className="flex justify-between items-start">
                        <p className="text-xs font-mono text-muted-foreground">ID: {job.id.substring(0,8)}...</p>
                        {expired ? (
                          <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">Expired</span>
                        ) : (
                          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Active for 24h</span>
                        )}
                      </div>
                      <p className="text-sm font-medium mt-1 text-foreground">{job.displayName} Ready</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDateIST(job.createdAt)} (IST)
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => !expired && triggerDownload(job.id)}
                      disabled={expired}
                      variant={expired ? "secondary" : "default"}
                      className="w-full rounded-lg text-xs"
                    >
                      <Download className="h-3.5 w-3.5 mr-1.5" /> {expired ? 'File Removed (Expired)' : 'Download Now'}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {failedJobs.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Failed Downloads
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {failedJobs.map(job => (
                <div key={job.id} className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 flex flex-col gap-1">
                  <p className="text-xs font-mono text-red-600/80 dark:text-red-400/80">ID: {job.id.substring(0,8)}...</p>
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">Export Failed</p>
                  <p className="text-xs text-red-600/70 dark:text-red-400/70 line-clamp-2 mt-1">
                    {job.errorMessage || 'Unknown error occurred'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Dialog open={showOtpDialog} onOpenChange={setShowOtpDialog}>
        <DialogContent className="max-w-md rounded-2xl p-6 bg-card border border-border">
          <DialogHeader className="flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-3">
              <Lock className="h-6 w-6 animate-bounce" />
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight">Security Check Required</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground max-w-[320px] mt-1.5">
              Two-factor protection is active. Enter the 6-digit code from Google Authenticator to authorize this ledger access.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-4 flex flex-col items-center">
            <Input
              type="text"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && otpCode.length === 6 && !isVerifyingOtp) {
                  handleVerifyOtpAndProceed();
                }
              }}
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
                setPendingDownloadJobId(null);
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
                  Verify & Proceed
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
