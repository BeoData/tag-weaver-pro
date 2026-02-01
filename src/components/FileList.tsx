import { MP3File } from '@/types/mp3';
import { FileAudio, CheckCircle, Loader2, AlertCircle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

interface FileListProps {
  files: MP3File[];
  selectedFileId: string | null;
  onSelectFile: (id: string) => void;
  onRemoveFile: (id: string) => void;
}

export function FileList({ files, selectedFileId, onSelectFile, onRemoveFile }: FileListProps) {
  const { user, getTierLimits } = useAuth();
  const limits = getTierLimits();

  if (files.length === 0) return null;

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
        <h3 className="font-medium text-sm text-foreground">
          Files ({files.length}{limits.maxFiles !== Infinity ? `/${limits.maxFiles}` : ''})
        </h3>
        <Badge variant={user?.tier || 'free'} className="text-[10px] h-4">
          {user?.tier.toUpperCase() || 'FREE'}
        </Badge>
      </div>

      <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
        {files.map((file) => (
          <div
            key={file.id}
            className={cn(
              "flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors",
              selectedFileId === file.id
                ? "bg-primary/10 border-l-2 border-l-primary"
                : "hover:bg-muted/50"
            )}
            onClick={() => onSelectFile(file.id)}
          >
            <StatusIcon status={file.status} />

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {file.name}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{formatFileSize(file.size)}</span>
                {file.metadata.bpm && (
                  <>
                    <span>•</span>
                    <span className="text-primary">{file.metadata.bpm} BPM</span>
                  </>
                )}
                {file.metadata.camelotKey && (
                  <>
                    <span>•</span>
                    <span className="text-accent">{file.metadata.camelotKey}</span>
                  </>
                )}
              </div>

              {(file.status === 'analyzing' || file.status === 'processing') && (
                <Progress value={file.progress} className="mt-2 h-1" />
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveFile(file.id);
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: MP3File['status'] }) {
  switch (status) {
    case 'pending':
      return <FileAudio className="w-5 h-5 text-muted-foreground" />;
    case 'analyzing':
    case 'processing':
      return <Loader2 className="w-5 h-5 text-primary animate-spin" />;
    case 'ready':
      return <FileAudio className="w-5 h-5 text-primary" />;
    case 'done':
      return <CheckCircle className="w-5 h-5 text-success" />;
    case 'error':
      return <AlertCircle className="w-5 h-5 text-destructive" />;
    default:
      return <FileAudio className="w-5 h-5 text-muted-foreground" />;
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
