import { MP3Metadata, RemovedFrame, AI_FRAME_PATTERNS } from '@/types/mp3';

import AudioWorker from './audio-analyzer.worker?worker';

export async function analyzeAudioFile(
  file: File,
  onProgress?: (progress: number) => void
): Promise<{
  bpm: number;
  key: string;
  camelot: string;
}> {
  return new Promise((resolve, reject) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;

        if (onProgress) onProgress(10); // Decode starting
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        if (onProgress) onProgress(20); // Decode done

        // Use Web Worker for heavy lifting
        const worker = new AudioWorker();

        worker.onmessage = (event) => {
          const { type, bpm, key, camelot, error, value } = event.data;

          if (type === 'progress') {
            // Worker progress is from 0-100, map to 20-90 range
            if (onProgress && value) {
              onProgress(20 + (value * 0.7));
            }
            return;
          }

          if (type === 'result') {
            worker.terminate();
            audioContext.close();
            if (onProgress) onProgress(100);
            resolve({ bpm, key, camelot });
            return;
          }

          if (error) {
            worker.terminate();
            audioContext.close();
            reject(new Error(error));
          }
        };

        worker.onerror = (error) => {
          worker.terminate();
          audioContext.close();
          reject(error);
        };

        // Transfer channel data to worker
        // We need to copy into a transferrable ArrayBuffer to really save main thread time
        const channelData = audioBuffer.getChannelData(0);
        const transferrableBuffer = new Float32Array(channelData).buffer;

        worker.postMessage({
          channelData: new Float32Array(transferrableBuffer),
          sampleRate: audioBuffer.sampleRate
        }, [transferrableBuffer]); // Transfer ownership

      } catch (error) {
        audioContext.close();
        reject(error);
      }
    };

    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

export function cleanAIMetadata(metadata: MP3Metadata): {
  cleaned: MP3Metadata;
  removedFrames: RemovedFrame[];
} {
  const removedFrames: RemovedFrame[] = [];
  const cleaned = { ...metadata };

  // Check comment for AI references
  if (cleaned.comment) {
    for (const pattern of AI_FRAME_PATTERNS) {
      if (pattern.test(cleaned.comment)) {
        removedFrames.push({
          id: 'COMM',
          name: 'Comment',
          reason: 'Contains AI/software reference',
          value: cleaned.comment.substring(0, 50),
        });
        cleaned.comment = '';
        break;
      }
    }
  }

  return { cleaned, removedFrames };
}
