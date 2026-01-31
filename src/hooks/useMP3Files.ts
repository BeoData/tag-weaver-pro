import { useState, useCallback } from 'react';
import { MP3File, MP3Metadata, CoverArt, DEFAULT_METADATA, ProcessingReport } from '@/types/mp3';
import { parseMP3Metadata } from '@/lib/metadata-parser';
import { analyzeAudioFile, cleanAIMetadata } from '@/lib/audio-analyzer';
import { useToast } from '@/hooks/use-toast';

export function useMP3Files() {
  const [files, setFiles] = useState<MP3File[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [reports, setReports] = useState<ProcessingReport[]>([]);
  const { toast } = useToast();

  const selectedFile = files.find(f => f.id === selectedFileId);

  const addFiles = useCallback(async (newFiles: File[]) => {
    const mp3Files: MP3File[] = newFiles.map(file => ({
      id: crypto.randomUUID(),
      file,
      name: file.name,
      size: file.size,
      status: 'pending',
      progress: 0,
      metadata: { ...DEFAULT_METADATA },
      originalMetadata: { ...DEFAULT_METADATA },
      removedFrames: [],
    }));

    setFiles(prev => [...prev, ...mp3Files]);

    // Select first file if none selected
    if (!selectedFileId && mp3Files.length > 0) {
      setSelectedFileId(mp3Files[0].id);
    }

    // Process each file
    for (const mp3File of mp3Files) {
      await processFile(mp3File);
    }
  }, [selectedFileId]);

  const processFile = async (mp3File: MP3File) => {
    const updateFile = (updates: Partial<MP3File>) => {
      setFiles(prev => prev.map(f => 
        f.id === mp3File.id ? { ...f, ...updates } : f
      ));
    };

    try {
      updateFile({ status: 'analyzing', progress: 10 });

      // Parse existing metadata
      const { metadata: parsedMetadata, removedFrames } = await parseMP3Metadata(mp3File.file);
      updateFile({ progress: 30 });

      // Analyze audio for BPM and Key
      let bpm = parsedMetadata.bpm;
      let key = parsedMetadata.key;
      let camelotKey = parsedMetadata.camelotKey;
      let bpmDetected = false;
      let keyDetected = false;

      try {
        const analysis = await analyzeAudioFile(mp3File.file);
        
        if (!bpm && analysis.bpm) {
          bpm = String(analysis.bpm);
          bpmDetected = true;
        }
        
        if (!key && analysis.key) {
          key = analysis.key;
          camelotKey = analysis.camelot;
          keyDetected = true;
        }
      } catch (error) {
        console.warn('Audio analysis failed:', error);
      }

      updateFile({ progress: 70 });

      // Clean AI metadata
      const { cleaned: cleanedMetadata, removedFrames: aiRemovedFrames } = cleanAIMetadata({
        ...parsedMetadata,
        bpm,
        key,
        camelotKey,
        bpmDetected,
        keyDetected,
      });

      const allRemovedFrames = [...removedFrames, ...aiRemovedFrames];

      const finalMetadata: MP3Metadata = {
        ...cleanedMetadata,
        // Apply defaults where empty
        artist: cleanedMetadata.artist || DEFAULT_METADATA.artist,
        albumArtist: cleanedMetadata.albumArtist || DEFAULT_METADATA.albumArtist,
        publisher: cleanedMetadata.publisher || DEFAULT_METADATA.publisher,
        copyright: cleanedMetadata.copyright || DEFAULT_METADATA.copyright,
      };

      updateFile({
        status: 'ready',
        progress: 100,
        metadata: finalMetadata,
        originalMetadata: { ...parsedMetadata },
        removedFrames: allRemovedFrames,
      });

      toast({
        title: 'File analyzed',
        description: `${mp3File.name} ready for editing`,
      });

    } catch (error) {
      console.error('Error processing file:', error);
      updateFile({
        status: 'error',
        error: 'Failed to process file',
      });

      toast({
        title: 'Error',
        description: `Failed to process ${mp3File.name}`,
        variant: 'destructive',
      });
    }
  };

  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    if (selectedFileId === id) {
      setFiles(prev => {
        const remaining = prev.filter(f => f.id !== id);
        setSelectedFileId(remaining.length > 0 ? remaining[0].id : null);
        return prev;
      });
    }
  }, [selectedFileId]);

  const updateMetadata = useCallback((id: string, metadata: MP3Metadata) => {
    setFiles(prev => prev.map(f =>
      f.id === id ? { ...f, metadata } : f
    ));
  }, []);

  const updateCoverArt = useCallback((id: string, coverArt: CoverArt | undefined) => {
    setFiles(prev => prev.map(f =>
      f.id === id ? { ...f, coverArt } : f
    ));
  }, []);

  const processAllFiles = useCallback(async () => {
    const readyFiles = files.filter(f => f.status === 'ready');
    const newReports: ProcessingReport[] = [];

    for (const file of readyFiles) {
      setFiles(prev => prev.map(f =>
        f.id === file.id ? { ...f, status: 'processing', progress: 50 } : f
      ));

      // Generate report
      const changes = [];
      const original = file.originalMetadata;
      const current = file.metadata;

      const fields = Object.keys(DEFAULT_METADATA) as (keyof MP3Metadata)[];
      for (const field of fields) {
        if (field === 'bpmDetected' || field === 'keyDetected') continue;
        if (original[field] !== current[field]) {
          changes.push({
            field: field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1'),
            oldValue: String(original[field] || ''),
            newValue: String(current[field] || ''),
          });
        }
      }

      const report: ProcessingReport = {
        fileId: file.id,
        fileName: file.name,
        changes,
        removedFrames: file.removedFrames,
        timestamp: new Date(),
      };

      newReports.push(report);

      setFiles(prev => prev.map(f =>
        f.id === file.id ? { ...f, status: 'done', progress: 100 } : f
      ));
    }

    setReports(prev => [...prev, ...newReports]);

    toast({
      title: 'Processing complete',
      description: `${readyFiles.length} file(s) processed successfully`,
    });

    return newReports;
  }, [files, toast]);

  return {
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
  };
}
