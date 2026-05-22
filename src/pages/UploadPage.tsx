import { FileUploader } from '../app/components/common/FileUploader';
import { Card } from '../app/components/ui/card';
import { fileService } from '../services/fileService';
import { useQueryClient } from '@tanstack/react-query';
import { useFileRecords } from '../hooks/useFileRecords';
import { StatusBadge } from '../app/components/common/StatusBadge';
import { format } from 'date-fns';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../app/components/ui/accordion';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { FileLoadMetaData } from '../types';

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

  const handleUpload = async (file: File) => {
    await fileService.uploadFile(file);
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

          <Card className="p-6 rounded-2xl border border-border">
            <h3 className="font-semibold mb-4">File Format Reference</h3>
            <Accordion type="single" collapsible>
              <AccordionItem value="csv">
                <AccordionTrigger>CSV Format</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  <div className="space-y-2">
                    <p>Required columns:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>transactionId</li>
                      <li>accountNumber</li>
                      <li>amount</li>
                      <li>currency</li>
                      <li>timestamp</li>
                    </ul>
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
