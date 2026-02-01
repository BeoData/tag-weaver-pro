import React, { useCallback, useState } from 'react';
import { Upload, Music, FileAudio } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileDropZoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

export function FileDropZone({ onFilesSelected, disabled }: FileDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files).filter(
      file => file.type === 'audio/mpeg' || file.name.endsWith('.mp3')
    );

    if (files.length > 0) {
      onFilesSelected(files);
    }
  }, [disabled, onFilesSelected]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(
      file => file.type === 'audio/mpeg' || file.name.endsWith('.mp3')
    );

    if (files.length > 0) {
      onFilesSelected(files);
    }

    // Reset input
    e.target.value = '';
  }, [onFilesSelected]);

  return (
    <div
      className={cn(
        "relative border-2 border-dashed rounded-xl p-4 sm:p-8 transition-all duration-300",
        "flex flex-col items-center justify-center gap-4 min-h-[160px] sm:min-h-[200px]",
        isDragOver
          ? "border-primary bg-primary/10 glow-primary"
          : "border-border bg-card hover:border-primary/50 hover:bg-card/80",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept=".mp3,audio/mpeg"
        multiple
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={disabled}
      />

      <div className={cn(
        "w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all",
        isDragOver ? "bg-primary/20" : "bg-muted"
      )}>
        {isDragOver ? (
          <FileAudio className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
        ) : (
          <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
        )}
      </div>

      <div className="text-center">
        <p className="text-base sm:text-lg font-medium text-foreground">
          {isDragOver ? 'Drop MP3 files here' : 'Drag & drop MP3 files'}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          or click to browse • Supports batch upload
        </p>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Music className="w-4 h-4" />
        <span>MP3 files only</span>
      </div>
    </div>
  );
}
