import { useMP3Files } from '@/hooks/useMP3Files';
import { Header } from '@/components/Header';
import { FileDropZone } from '@/components/FileDropZone';
import { FileList } from '@/components/FileList';
import { MetadataEditor } from '@/components/MetadataEditor';
import { CoverArtUpload } from '@/components/CoverArtUpload';
import { ProcessingReportView } from '@/components/ProcessingReport';
import { Button } from '@/components/ui/button';
import { Play, Download, FileAudio, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { ProcessingReport } from '@/types/mp3';

const Index = () => {
  const {
    files,
    selectedFile,
    selectedFileId,
    setSelectedFileId,
    addFiles,
    removeFile,
    updateMetadata,
    updateCoverArt,
    processAllFiles,
    reports,
  } = useMP3Files();

  const [isProcessing, setIsProcessing] = useState(false);
  const [currentReport, setCurrentReport] = useState<ProcessingReport | null>(null);

  const readyCount = files.filter(f => f.status === 'ready').length;
  const doneCount = files.filter(f => f.status === 'done').length;
  const isAnyAnalyzing = files.some(f => f.status === 'analyzing');

  const handleProcess = async () => {
    setIsProcessing(true);
    try {
      const newReports = await processAllFiles();
      if (newReports.length > 0) {
        setCurrentReport(newReports[newReports.length - 1]);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadAll = async () => {
    const doneFiles = files.filter(f => f.status === 'done' || f.status === 'ready');

    if (doneFiles.length === 0) {
      alert('No files ready for download');
      return;
    }

    // Dynamic import to avoid SSR issues if any, though not strictly needed for client-side only app
    const { writeTags } = await import('@/lib/tag-writer');

    for (const mp3File of doneFiles) {
      try {
        const taggedBlob = await writeTags(
          mp3File.file,
          mp3File.metadata,
          mp3File.coverArt
        );

        // Create download link
        const url = URL.createObjectURL(taggedBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = mp3File.name; // Uses original name, maybe we want to rename?
        document.body.appendChild(link);
        link.click();

        // Cleanup
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

      } catch (error) {
        console.error(`Failed to download ${mp3File.name}:`, error);
        alert(`Failed to prepare ${mp3File.name} for download.`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        filesCount={files.length}
        readyCount={readyCount}
        doneCount={doneCount}
      />

      <main className="container mx-auto px-4 py-8">
        {files.length === 0 ? (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Upload Your MP3 Files</h2>
              <p className="text-muted-foreground">
                Drag and drop MP3 files to automatically analyze BPM, Key, and clean AI metadata
              </p>
            </div>
            <FileDropZone onFilesSelected={addFiles} />

            <div className="mt-12 grid grid-cols-3 gap-6 text-center">
              <div className="p-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-medium mb-1">Auto Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  BPM & Key detection with Camelot notation
                </p>
              </div>
              <div className="p-4">
                <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-3">
                  <FileAudio className="w-6 h-6 text-success" />
                </div>
                <h3 className="font-medium mb-1">Complete Metadata</h3>
                <p className="text-sm text-muted-foreground">
                  ID3v2.3 & ID3v2.4 with all professional fields
                </p>
              </div>
              <div className="p-4">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-3">
                  <Play className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-medium mb-1">AI Cleaner</h3>
                <p className="text-sm text-muted-foreground">
                  Remove AI & software traces automatically
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-6">
            {/* Left Sidebar - File List */}
            <div className="col-span-3 space-y-4">
              <FileDropZone
                onFilesSelected={addFiles}
                disabled={isAnyAnalyzing || isProcessing}
              />
              <FileList
                files={files}
                selectedFileId={selectedFileId}
                onSelectFile={setSelectedFileId}
                onRemoveFile={removeFile}
              />

              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleProcess}
                  disabled={readyCount === 0 || isProcessing}
                  className="w-full"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Process {readyCount} File{readyCount !== 1 ? 's' : ''}
                </Button>

                {doneCount > 0 && (
                  <Button
                    variant="outline"
                    onClick={handleDownloadAll}
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download All
                  </Button>
                )}
              </div>
            </div>

            {/* Main Content - Metadata Editor */}
            <div className="col-span-6 space-y-4">
              {selectedFile ? (
                <>
                  <div className="bg-card rounded-xl border border-border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-semibold text-lg">{selectedFile.name}</h2>
                        <p className="text-sm text-muted-foreground">
                          {selectedFile.status === 'analyzing' && 'Analyzing...'}
                          {selectedFile.status === 'ready' && 'Ready for processing'}
                          {selectedFile.status === 'processing' && 'Processing...'}
                          {selectedFile.status === 'done' && 'Processing complete'}
                          {selectedFile.status === 'error' && selectedFile.error}
                        </p>
                      </div>
                      {selectedFile.metadata.bpm && selectedFile.metadata.camelotKey && (
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary font-mono">
                              {selectedFile.metadata.bpm}
                            </p>
                            <p className="text-xs text-muted-foreground">BPM</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-accent font-mono">
                              {selectedFile.metadata.camelotKey}
                            </p>
                            <p className="text-xs text-muted-foreground">Key</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <MetadataEditor
                    metadata={selectedFile.metadata}
                    onChange={(metadata) => updateMetadata(selectedFile.id, metadata)}
                    disabled={selectedFile.status === 'analyzing' || selectedFile.status === 'processing'}
                  />
                </>
              ) : (
                <div className="bg-card rounded-xl border border-border p-12 text-center">
                  <FileAudio className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Select a file to edit metadata</p>
                </div>
              )}
            </div>

            {/* Right Sidebar - Cover Art & Report */}
            <div className="col-span-3 space-y-4">
              {selectedFile && (
                <CoverArtUpload
                  coverArt={selectedFile.coverArt}
                  onCoverArtChange={(coverArt) => updateCoverArt(selectedFile.id, coverArt)}
                  disabled={selectedFile.status === 'analyzing' || selectedFile.status === 'processing'}
                />
              )}

              {currentReport && (
                <ProcessingReportView report={currentReport} />
              )}

              {selectedFile?.removedFrames && selectedFile.removedFrames.length > 0 && !currentReport && (
                <div className="bg-card rounded-xl border border-border p-4">
                  <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-warning" />
                    AI Traces Found
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedFile.removedFrames.length} AI/software frame(s) will be removed during processing.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
