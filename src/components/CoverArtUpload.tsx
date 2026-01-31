import React, { useCallback, useState, useRef } from 'react';
import { ImagePlus, X, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { processImage } from '@/lib/image-processor';
import { CoverArt } from '@/types/mp3';

interface CoverArtUploadProps {
  coverArt: CoverArt | undefined;
  onCoverArtChange: (coverArt: CoverArt | undefined) => void;
  disabled?: boolean;
}

export function CoverArtUpload({ coverArt, onCoverArtChange, disabled }: CoverArtUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    
    setIsProcessing(true);
    try {
      const { dataUrl, width, height } = await processImage(file);
      onCoverArtChange({
        original: file,
        processed: dataUrl,
        width,
        height,
      });
    } catch (error) {
      console.error('Error processing image:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [onCoverArtChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled || isProcessing) return;
    
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [disabled, isProcessing, handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  }, [handleFile]);

  const handleRemove = useCallback(() => {
    onCoverArtChange(undefined);
  }, [onCoverArtChange]);

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
        <h3 className="font-medium text-sm text-foreground">Cover Art</h3>
        {coverArt?.processed && (
          <div className="flex items-center gap-1 text-xs text-success">
            <Check className="w-3 h-3" />
            <span>3000×3000 JPEG</span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        {coverArt?.processed ? (
          <div className="relative group">
            <img
              src={coverArt.processed}
              alt="Cover art preview"
              className="w-full aspect-square object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRemove}
                disabled={disabled}
              >
                <X className="w-4 h-4 mr-2" />
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "border-2 border-dashed rounded-lg aspect-square flex flex-col items-center justify-center gap-3 cursor-pointer transition-all",
              isDragOver
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50",
              (disabled || isProcessing) && "opacity-50 cursor-not-allowed"
            )}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !disabled && !isProcessing && inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
              disabled={disabled || isProcessing}
            />
            
            {isProcessing ? (
              <>
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Processing...</p>
              </>
            ) : (
              <>
                <ImagePlus className="w-8 h-8 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">Upload cover art</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Auto-converts to 3000×3000 JPEG
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
