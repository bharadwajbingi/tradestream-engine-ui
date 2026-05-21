import { Upload, CheckCircle2, AlertCircle, File } from 'lucide-react';
import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '../../../lib/utils';
import { Progress } from '../ui/progress';

interface FileUploaderProps {
  onUpload: (file: File) => Promise<void>;
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

    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 10, 90));
    }, 200);

    try {
      await onUpload(uploadFile);
      setProgress(100);
      setStatus('success');
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      clearInterval(progressInterval);
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
          'border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200',
          isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
          status === 'error' && 'border-error'
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
          {status === 'success' ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <CheckCircle2 className="h-12 w-12 text-success" />
            </motion.div>
          ) : status === 'error' ? (
            <AlertCircle className="h-12 w-12 text-error" />
          ) : (
            <Upload className={cn('h-12 w-12', isDragging ? 'text-primary' : 'text-muted-foreground')} />
          )}

          {file ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted">
              <File className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{file.name}</span>
              <span className="text-xs text-muted-foreground">({formatFileSize(file.size)})</span>
            </div>
          ) : (
            <>
              <p className="font-medium">Drop your file here or click to browse</p>
              <p className="text-sm text-muted-foreground">Supports CSV files</p>
            </>
          )}
        </div>
      </div>

      {isUploading && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground text-center">Uploading... {progress}%</p>
        </div>
      )}

      {status === 'error' && (
        <p className="text-sm text-error text-center">{errorMessage}</p>
      )}
    </div>
  );
}
