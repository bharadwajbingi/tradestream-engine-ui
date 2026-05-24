import { FileUploader } from '../app/components/common/FileUploader';
import { Card } from '../app/components/ui/card';
import { fileService } from '../services/fileService';
import { useQueryClient } from '@tanstack/react-query';
import { useFileRecords } from '../hooks/useFileRecords';
import { StatusBadge } from '../app/components/common/StatusBadge';
import { format } from 'date-fns';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../app/components/ui/accordion';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, CheckCircle2, AlertCircle, Download, Copy, Check, FileText } from 'lucide-react';
import { FileLoadMetaData } from '../types';
import { useState } from 'react';

const CSV_COLUMNS = [
  { name: 'transactionId', required: true, type: 'Alphanumeric', format: 'TXN...' },
  { name: 'fileHeaderDate', required: true, type: 'Date', format: 'yyyyMMdd' },
  { name: 'accountNumber', required: true, type: 'Alphanumeric', format: 'ACC...' },
  { name: 'transactionType', required: true, type: 'Numeric', format: 'Integer' },
  { name: 'batchLocation', required: true, type: 'String', format: 'Branch (e.g. MUM)' },
  { name: 'batchNumber', required: true, type: 'Numeric', format: 'Integer' },
  { name: 'updateBatchDate', required: true, type: 'Numeric', format: 'yyyyMMdd' },
  { name: 'relatedFileNumber', required: false, type: 'Numeric', format: 'Integer' },
  { name: 'actionName', required: true, type: 'String', format: 'REV, POST, ADJ' },
  { name: 'relatedFileKey', required: true, type: 'Numeric', format: 'Integer' },
  { name: 'doNotReportFlag', required: true, type: 'Character', format: 'Y / N' },
  { name: 'explanation', required: false, type: 'String', format: 'Max 255 chars' },
  { name: 'minorAssetsClass', required: false, type: 'Numeric', format: 'Integer' },
  { name: 'owningPortfolio', required: true, type: 'Numeric', format: 'Integer' },
  { name: 'posterInitials', required: true, type: 'String', format: 'Initials (e.g. RS)' },
  { name: 'transactionSubtype', required: true, type: 'Numeric', format: 'Integer' },
  { name: 'cashEffect', required: true, type: 'Decimal', format: 'Scale <= 2' },
  { name: 'cashPaidOut', required: false, type: 'Decimal', format: 'Scale <= 2' },
  { name: 'brokerNumber', required: false, type: 'Numeric', format: 'Integer' },
  { name: 'oldBalance', required: true, type: 'Decimal', format: 'Scale <= 2' },
  { name: 'newBalance', required: true, type: 'Decimal', format: 'Scale <= 2' }
];

const CSV_HEADER_STRING = CSV_COLUMNS.map(c => c.name).join(',');
const CSV_SAMPLE_ROW = 'TXN002048,20251104,ACC000002048,74,MUM,606032,20260225,810106,REV,48000174,Y,AUTO-GENERATED TRANSACTION,75,556513,VP,20,45473.65,0.00,45638,2231543,2228081.64';

const LIVE_STATUSES = new Set(['STARTED', 'PROCESSING', 'PENDING']);

function LiveProcessingBanner({ files }: { files: FileLoadMetaData[] }) {
  const liveFiles = files.filter((f) => LIVE_STATUSES.has(f.status));
  if (liveFiles.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="rounded-xl border border-primary/30 bg-primary/5 p-4 flex items-start gap-3"
      >
        <Loader2 className="h-5 w-5 text-primary animate-spin mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-primary">
            Processing {liveFiles.length === 1 ? '1 file' : `${liveFiles.length} files`}…
          </p>
          <div className="mt-1.5 space-y-1">
            {liveFiles.map((f) => (
              <p key={f.fileId} className="text-xs text-muted-foreground font-mono truncate">
                ↳ {f.filename} — <span className="text-primary/80">{f.status}</span>
              </p>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">
            Live updates enabled · refreshing every 2 s
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function UploadPage() {
  const queryClient = useQueryClient();
  const { data: files } = useFileRecords();
  const sortedFiles = files
    ? [...files].sort((a, b) => new Date(b.uploadTime).getTime() - new Date(a.uploadTime).getTime())
    : [];
  const recentFiles = sortedFiles.slice(0, 5);

  const [copiedHeader, setCopiedHeader] = useState(false);

  const handleCopyHeader = () => {
    navigator.clipboard.writeText(CSV_HEADER_STRING);
    setCopiedHeader(true);
    setTimeout(() => setCopiedHeader(false), 2000);
  };

  const handleDownloadTemplate = () => {
    const fileContent = [CSV_HEADER_STRING, CSV_SAMPLE_ROW].join('\n');
    const blob = new Blob([fileContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'tse_ingestion_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpload = async (file: File, onProgress?: (progressEvent: any) => void) => {
    await fileService.uploadFile(file, onProgress);
    queryClient.invalidateQueries({ queryKey: ['files'] });
    queryClient.invalidateQueries({ queryKey: ['metrics'] });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {/* Live Processing Banner */}
          {files && <LiveProcessingBanner files={files} />}

          <Card className="p-6 rounded-2xl border border-border">
            <h2 className="font-semibold mb-4">Upload Trade File</h2>
            <FileUploader onUpload={handleUpload} accept=".csv" />
          </Card>

          <Card className="p-6 rounded-2xl border border-border space-y-4 text-left">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <FileText className="h-4.5 w-4.5 text-primary" />
                Ingestion File Specifications
              </h3>
              <button
                onClick={handleDownloadTemplate}
                className="inline-flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border border-primary/25"
              >
                <Download className="h-3.5 w-3.5" />
                Download Template
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Files must be valid CSV sheets formatted with exactly <strong>21 financial columns</strong> in the specific sequence defined below.
            </p>

            <Accordion type="single" collapsible className="w-full">
              {/* 1. Header row copyable */}
              <AccordionItem value="headers">
                <AccordionTrigger className="text-xs font-semibold">Standard CSV Header Row</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pt-1 text-left">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                      <span>Header string:</span>
                      <button
                        onClick={handleCopyHeader}
                        className="text-primary hover:underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        {copiedHeader ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-success" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            Copy Header
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-3 bg-slate-950 font-mono text-[10px] rounded-xl overflow-x-auto text-slate-300 border border-slate-900 leading-relaxed text-left">
                      {CSV_HEADER_STRING}
                    </pre>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* 2. Columns table */}
              <AccordionItem value="columns">
                <AccordionTrigger className="text-xs font-semibold">21 Columns Schema Definition</AccordionTrigger>
                <AccordionContent>
                  <div className="pt-2 max-h-[280px] overflow-y-auto border border-border/60 rounded-xl divide-y divide-border/60">
                    {CSV_COLUMNS.map((col, idx) => (
                      <div key={col.name} className="p-2.5 text-xs flex items-center justify-between gap-4 font-mono hover:bg-accent/15 transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-primary w-4 text-right">{idx + 1}.</span>
                          <span className="font-bold text-foreground">{col.name}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-[10px]">
                          <span className="text-muted-foreground">{col.format}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            col.required ? 'bg-rose-500/10 text-rose-500' : 'bg-muted text-muted-foreground'
                          }`}>
                            {col.required ? 'Req' : 'Opt'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>
        </div>

        {/* Recent Uploads with live status */}
        <Card className="p-6 rounded-2xl border border-border">
          <h3 className="font-semibold mb-4">Recent Uploads</h3>
          {recentFiles.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No files uploaded yet</p>
          ) : (
            <div className="space-y-3">
              {recentFiles.map((file) => {
                const isLive = LIVE_STATUSES.has(file.status);
                return (
                  <motion.div
                    key={file.fileId}
                    layout
                    className={`p-4 rounded-lg border transition-colors ${
                      isLive
                        ? 'border-primary/30 bg-primary/5'
                        : 'border-border hover:bg-accent/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {isLive ? (
                          <Loader2 className="h-3.5 w-3.5 text-primary animate-spin shrink-0" />
                        ) : file.status === 'COMPLETED' ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                        ) : file.status === 'COMPLETED_WITH_ERROR' || file.status === 'FAILED' ? (
                          <AlertCircle className="h-3.5 w-3.5 text-error shrink-0" />
                        ) : null}
                        <p className="font-mono text-sm font-medium truncate">{file.filename}</p>
                      </div>
                      <StatusBadge status={file.status} />
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{file.totalRecords > 0 ? `${file.totalRecords.toLocaleString()} records` : 'Pending...'}</span>
                      <span>•</span>
                      <span>{format(new Date(file.uploadTime), 'MMM dd, HH:mm')}</span>
                      {file.processingTimeMs && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-primary/80">Took {(file.processingTimeMs / 1000).toFixed(1)}s</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs mt-2">
                      <span className="text-success">{file.successCount} success</span>
                      <span className="text-error">{file.errorCount} errors</span>
                      <span className="text-amber-500 font-semibold">{file.duplicateCount || 0} duplicates</span>
                    </div>

                    {/* Dynamic Real-time Progress Bar */}
                    {isLive && (
                      <div className="mt-3 space-y-1">
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span>
                            {(file.successCount + file.errorCount + (file.duplicateCount || 0)).toLocaleString()} / {file.totalRecords > 0 ? file.totalRecords.toLocaleString() : '...'} records
                          </span>
                          <span className="font-semibold text-primary">
                            {file.totalRecords > 0 ? `${Math.round(((file.successCount + file.errorCount + (file.duplicateCount || 0)) / file.totalRecords) * 100)}%` : '0%'}
                          </span>
                        </div>
                        <div className="h-1.5 bg-primary/10 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-primary rounded-full"
                            initial={{ width: '0%' }}
                            animate={{ 
                              width: file.totalRecords > 0 
                                ? `${Math.min(100, Math.round(((file.successCount + file.errorCount + (file.duplicateCount || 0)) / file.totalRecords) * 100))}%` 
                                : '10%' 
                            }}
                            transition={{ duration: 0.8, ease: "easeInOut" }}
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
