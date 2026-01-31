import { MP3Metadata, RemovedFrame, AI_FRAME_PATTERNS } from '@/types/mp3';

// Simple BPM detection using peak detection
export async function detectBPM(audioBuffer: AudioBuffer): Promise<number> {
  const channelData = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  
  // Downsample for faster processing
  const downsampleFactor = Math.floor(sampleRate / 4410);
  const downsampled: number[] = [];
  
  for (let i = 0; i < channelData.length; i += downsampleFactor) {
    let sum = 0;
    for (let j = 0; j < downsampleFactor && i + j < channelData.length; j++) {
      sum += Math.abs(channelData[i + j]);
    }
    downsampled.push(sum / downsampleFactor);
  }
  
  // Find peaks
  const peaks: number[] = [];
  const threshold = getThreshold(downsampled);
  
  for (let i = 1; i < downsampled.length - 1; i++) {
    if (downsampled[i] > threshold &&
        downsampled[i] > downsampled[i - 1] &&
        downsampled[i] > downsampled[i + 1]) {
      peaks.push(i);
    }
  }
  
  // Calculate intervals between peaks
  const intervals: number[] = [];
  for (let i = 1; i < peaks.length; i++) {
    intervals.push(peaks[i] - peaks[i - 1]);
  }
  
  if (intervals.length === 0) return 120; // Default
  
  // Find most common interval
  const intervalCounts = new Map<number, number>();
  const tolerance = 5;
  
  for (const interval of intervals) {
    const rounded = Math.round(interval / tolerance) * tolerance;
    intervalCounts.set(rounded, (intervalCounts.get(rounded) || 0) + 1);
  }
  
  let maxCount = 0;
  let dominantInterval = 0;
  
  for (const [interval, count] of intervalCounts) {
    if (count > maxCount) {
      maxCount = count;
      dominantInterval = interval;
    }
  }
  
  // Convert to BPM
  const samplesPerBeat = dominantInterval * downsampleFactor;
  const secondsPerBeat = samplesPerBeat / sampleRate;
  let bpm = Math.round(60 / secondsPerBeat);
  
  // Normalize to reasonable range
  while (bpm < 60) bpm *= 2;
  while (bpm > 200) bpm /= 2;
  
  return Math.round(bpm);
}

function getThreshold(data: number[]): number {
  const sorted = [...data].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length * 0.85)];
}

// Simplified key detection using FFT analysis
export async function detectKey(audioBuffer: AudioBuffer): Promise<{ key: string; camelot: string }> {
  const channelData = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  
  // Use a portion of the audio for analysis
  const analyzeLength = Math.min(channelData.length, sampleRate * 30); // 30 seconds max
  const segment = channelData.slice(0, analyzeLength);
  
  // Perform FFT
  const fftSize = 4096;
  const chromaProfile = new Float32Array(12).fill(0);
  
  for (let i = 0; i < segment.length - fftSize; i += fftSize) {
    const frame = segment.slice(i, i + fftSize);
    const spectrum = simpleFFT(frame);
    
    // Map frequencies to pitch classes
    for (let bin = 1; bin < spectrum.length / 2; bin++) {
      const freq = (bin * sampleRate) / fftSize;
      if (freq < 60 || freq > 2000) continue;
      
      const pitchClass = frequencyToPitchClass(freq);
      chromaProfile[pitchClass] += spectrum[bin];
    }
  }
  
  // Find best matching key
  const keys = detectKeyFromChroma(chromaProfile);
  
  return keys;
}

function simpleFFT(data: Float32Array): Float32Array {
  const n = data.length;
  const result = new Float32Array(n);
  
  for (let k = 0; k < n / 2; k++) {
    let real = 0;
    let imag = 0;
    
    for (let t = 0; t < n; t++) {
      const angle = (2 * Math.PI * k * t) / n;
      real += data[t] * Math.cos(angle);
      imag -= data[t] * Math.sin(angle);
    }
    
    result[k] = Math.sqrt(real * real + imag * imag);
  }
  
  return result;
}

function frequencyToPitchClass(freq: number): number {
  const semitone = 12 * Math.log2(freq / 440) + 69;
  return Math.round(semitone) % 12;
}

function detectKeyFromChroma(chroma: Float32Array): { key: string; camelot: string } {
  // Major and minor key profiles (Krumhansl-Schmuckler)
  const majorProfile = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
  const minorProfile = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];
  
  const keyNames = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
  const camelotMajor = ['8B', '3B', '10B', '5B', '12B', '7B', '2B', '9B', '4B', '11B', '6B', '1B'];
  const camelotMinor = ['5A', '12A', '7A', '2A', '9A', '4A', '11A', '6A', '1A', '8A', '3A', '10A'];
  
  let bestKey = '';
  let bestCamelot = '';
  let bestCorrelation = -Infinity;
  
  for (let root = 0; root < 12; root++) {
    // Rotate chroma to this root
    const rotated = new Float32Array(12);
    for (let i = 0; i < 12; i++) {
      rotated[i] = chroma[(i + root) % 12];
    }
    
    // Check major
    const majorCorr = correlation(rotated, majorProfile);
    if (majorCorr > bestCorrelation) {
      bestCorrelation = majorCorr;
      bestKey = `${keyNames[root]} major`;
      bestCamelot = camelotMajor[root];
    }
    
    // Check minor
    const minorCorr = correlation(rotated, minorProfile);
    if (minorCorr > bestCorrelation) {
      bestCorrelation = minorCorr;
      bestKey = `${keyNames[root]} minor`;
      bestCamelot = camelotMinor[root];
    }
  }
  
  return { key: bestKey, camelot: bestCamelot };
}

function correlation(a: Float32Array, b: number[]): number {
  const n = a.length;
  let sum = 0;
  let sumA = 0;
  let sumB = 0;
  let sumA2 = 0;
  let sumB2 = 0;
  
  for (let i = 0; i < n; i++) {
    sum += a[i] * b[i];
    sumA += a[i];
    sumB += b[i];
    sumA2 += a[i] * a[i];
    sumB2 += b[i] * b[i];
  }
  
  const meanA = sumA / n;
  const meanB = sumB / n;
  const stdA = Math.sqrt(sumA2 / n - meanA * meanA);
  const stdB = Math.sqrt(sumB2 / n - meanB * meanB);
  
  if (stdA === 0 || stdB === 0) return 0;
  
  return (sum / n - meanA * meanB) / (stdA * stdB);
}

export async function analyzeAudioFile(file: File): Promise<{
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
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        const bpm = await detectBPM(audioBuffer);
        const { key, camelot } = await detectKey(audioBuffer);
        
        audioContext.close();
        resolve({ bpm, key, camelot });
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
