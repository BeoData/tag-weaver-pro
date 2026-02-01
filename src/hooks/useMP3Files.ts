import { useState, useCallback } from 'react';
import { MP3File, MP3Metadata, CoverArt, DEFAULT_METADATA, ProcessingReport } from '@/types/mp3';
import { parseMP3Metadata } from '@/lib/metadata-parser';
import { analyzeAudioFile, cleanAIMetadata } from '@/lib/audio-analyzer';
import { useToast } from '@/hooks/use-toast';
import { generateUUID } from '@/lib/utils';

export function useMP3Files() {
  const [files, setFiles] = useState<MP3File[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [reports, setReports] = useState<ProcessingReport[]>([]);
  const { toast } = useToast();

  const selectedFile = files.find(f => f.id === selectedFileId);

  const processFile = useCallback(async (mp3File: MP3File) => {
    const fileStart = performance.now();
    console.log(`[File ${mp3File.name}] Processing started at ${fileStart.toFixed(2)}ms`);

    const updateFile = (updates: Partial<MP3File>) => {
      setFiles(prev => prev.map(f =>
        f.id === mp3File.id ? { ...f, ...updates } : f
      ));
    };

    try {
      updateFile({ status: 'analyzing', progress: 10 });

      // Parse metadata
      const parseStart = performance.now();
      const { metadata: parsedMetadata, removedFrames: initialRemovedFrames } = await parseMP3Metadata(mp3File.file);
      console.log(`[File ${mp3File.name}] Metadata parsed in ${(performance.now() - parseStart).toFixed(2)}ms`);

      updateFile({ progress: 30 });

      // Audio analysis and AI cleanup
      let bpm = parsedMetadata.bpm;
      let key = parsedMetadata.key;
      let camelotKey = parsedMetadata.camelotKey;
      let bpmDetected = false;
      let keyDetected = false;
      let waveform: number[] | undefined = undefined;

      try {
        const analyzeStart = performance.now();
        console.log(`[File ${mp3File.name}] Starting full audio analysis...`);

        const analysis = await analyzeAudioFile(mp3File.file, (overallProgress) => {
          updateFile({ progress: overallProgress });
        });

        console.log(`[File ${mp3File.name}] Audio analysis finished in ${(performance.now() - analyzeStart).toFixed(2)}ms`);

        if (analysis.bpm) {
          bpm = analysis.bpm.toString();
          bpmDetected = true;
        }

        // Only override if detected
        if (analysis.key) {
          key = analysis.key;
          camelotKey = analysis.camelot;
          keyDetected = true;
        }
        waveform = analysis.waveform;

      } catch (error) {
        console.warn('Audio analysis failed:', error);
      }

      // Cleanup AI traces
      const { cleaned: cleanedAIMetadata, removedFrames: aiRemovedFrames } = cleanAIMetadata({
        ...parsedMetadata,
        bpm,
        key,
        camelotKey,
        bpmDetected,
        keyDetected,
      });

      const allRemovedFrames = [...initialRemovedFrames, ...aiRemovedFrames];

      const finalMetadata: MP3Metadata = {
        ...cleanedAIMetadata,
        title: cleanedAIMetadata.title || mp3File.name.replace('.mp3', ''),
        bpm: bpmDetected ? bpm : (cleanedAIMetadata.bpm || DEFAULT_METADATA.bpm),
        key: keyDetected ? key : (cleanedAIMetadata.key || DEFAULT_METADATA.key),
        camelotKey: keyDetected ? camelotKey : (cleanedAIMetadata.camelotKey || DEFAULT_METADATA.camelotKey),
        bpmDetected,
        keyDetected,
      };

      updateFile({
        status: 'ready',
        progress: 100,
        metadata: finalMetadata,
        originalMetadata: { ...parsedMetadata },
        removedFrames: allRemovedFrames,
        waveform: waveform // Add waveform to state
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
    } finally {
      console.log(`[File ${mp3File.name}] Total processing time: ${(performance.now() - fileStart).toFixed(2)}ms`);
    }
  }, [toast]);

  const addFiles = useCallback(async (newFiles: File[]) => {
    const mp3Files: MP3File[] = newFiles.map(file => ({
      id: generateUUID(),
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

    // Always select the first of the newly added files
    if (mp3Files.length > 0) {
      setSelectedFileId(mp3Files[0].id);
    }


    console.log(`[Upload] Starting batch of ${mp3Files.length} files at ${performance.now().toFixed(2)}ms`);

    // Process each file
    // OPTIMIZATION: Run in parallel instead of sequential
    // for (const mp3File of mp3Files) {
    //   await processFile(mp3File);
    // }
    await Promise.all(mp3Files.map(processFile));

    console.log(`[Upload] Batch finished at ${performance.now().toFixed(2)}ms`);
  }, [processFile]);

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
    if (readyFiles.length === 0) return [];

    // Set all to processing (initial visual state)
    setFiles(prev => prev.map(f =>
      readyFiles.find(rf => rf.id === f.id)
        ? { ...f, status: 'processing', progress: 0 }
        : f
    ));

    // Parallel processing with simulated delay
    const results = await Promise.all(readyFiles.map(async (file) => {
      // Artificial scanning delay (4-10s)
      const delay = 4000 + Math.random() * 6000;
      await new Promise(r => setTimeout(r, delay));

      // Report Generation Logic
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

      // Mark as done
      setFiles(prev => prev.map(f =>
        f.id === file.id ? { ...f, status: 'done', progress: 100 } : f
      ));

      return report;
    }));

    setReports(prev => [...prev, ...results]);

    toast({
      title: 'Processing complete',
      description: `${results.length} file(s) processed successfully`,
    });

    return results;
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
