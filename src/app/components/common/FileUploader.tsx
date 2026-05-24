import { Upload, CheckCircle2, AlertCircle, File } from 'lucide-react';
import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '../../../lib/utils';
import { Progress } from '../ui/progress';

interface FileUploaderProps {
  onUpload: (file: File, onProgress?: (progressEvent: any) => void) => Promise<void>;
  accept?: string;
}

export function FileUploader({ onUpload, accept = '.csv' }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      handleUpload(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      handleUpload(selectedFile);
    }
  };

  const handleUpload = async (uploadFile: File) => {
    setIsUploading(true);
    setProgress(0);
    setStatus('idle');
    setErrorMessage('');

    try {
      await onUpload(uploadFile, (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          // Only show up to 99% until the server actually responds with success
          setProgress(percentCompleted === 100 ? 99 : percentCompleted);
        }
      });
      setProgress(100);
      setStatus('idle');
      setFile(null); // Instantly revert to clean idle state ready for the next file
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 bg-card',
          isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
          status === 'error' && 'border-error/50 bg-error/5'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-3">
          {/* Error Banner inside dropzone */}
          {status === 'error' && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold shadow-sm mb-1"
            >
              <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
              <span>Upload Failed</span>
            </motion.div>
          )}

          <Upload 
            className={cn(
              'h-12 w-12 transition-colors duration-200', 
              isDragging ? 'text-primary animate-bounce' : 
              status === 'error' ? 'text-rose-500' : 'text-muted-foreground'
            )} 
          />

          <div className="space-y-1">
            <p className="font-semibold text-base text-foreground">
              {isDragging 
                ? 'Drop to upload' 
                : 'Drop your file here or click to browse'}
            </p>
            <p className="text-xs text-muted-foreground">Supports CSV files</p>
          </div>
        </div>
      </div>

      {isUploading && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground text-center">Uploading... {progress}%</p>
        </div>
      )}

      {status === 'error' && (
        <p className="text-sm text-error text-center font-medium">{errorMessage}</p>
      )}
    </div>
  );
}
