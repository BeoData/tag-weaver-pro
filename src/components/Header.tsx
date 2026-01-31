import { Music2, Zap, Shield, Download } from 'lucide-react';

interface HeaderProps {
  filesCount: number;
  readyCount: number;
  doneCount: number;
}

export function Header({ filesCount, readyCount, doneCount }: HeaderProps) {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-pro-cyan flex items-center justify-center">
              <Music2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient-pro">
                MP3 Metadata Editor
              </h1>
              <p className="text-xs text-muted-foreground">
                Professional ID3 Tag Editor & AI Cleaner
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                <span className="text-muted-foreground">{filesCount} files</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-muted-foreground">{readyCount} ready</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success" />
                <span className="text-muted-foreground">{doneCount} done</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Zap className="w-4 h-4 text-accent" />
              <span>Auto BPM/Key</span>
              <Shield className="w-4 h-4 text-success ml-2" />
              <span>AI Cleaner</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
