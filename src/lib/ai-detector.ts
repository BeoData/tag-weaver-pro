/**
 * Advanced AI-Generated Audio Detection
 * Detects common patterns and signatures of AI-generated music
 * from metadata and audio characteristics
 */

import { MP3Metadata, RemovedFrame } from '@/types/mp3';

export interface AIDetectionResult {
  isLikelyAI: boolean;
  confidence: number; // 0-1
  detectedPatterns: string[];
  removedFrames: RemovedFrame[];
  cleaned: MP3Metadata;
}

// Known AI music generator signatures
const AI_GENERATOR_SIGNATURES = {
  suno: {
    names: ['suno', 'suno.ai'],
    patterns: [/suno/i, /suno\.ai/i],
  },
  udio: {
    names: ['udio', 'udio.ai'],
    patterns: [/udio/i, /udio\.ai/i],
  },
  musicfy: {
    names: ['musicfy', 'musicfy.ai'],
    patterns: [/musicfy/i],
  },
  audiocraft: {
    names: ['audiocraft', 'meta audiocraft'],
    patterns: [/audiocraft/i, /meta.*audiocraft/i],
  },
  mubert: {
    names: ['mubert'],
    patterns: [/mubert/i],
  },
  amper: {
    names: ['amper', 'amper music'],
    patterns: [/amper/i],
  },
  dadabots: {
    names: ['dadabots'],
    patterns: [/dadabots/i],
  },
  jukebox: {
    names: ['jukebox', 'openai jukebox'],
    patterns: [/jukebox/i, /openai.*jukebox/i],
  },
  soundraw: {
    names: ['soundraw'],
    patterns: [/soundraw/i],
  },
  beatoven: {
    names: ['beatoven'],
    patterns: [/beatoven/i],
  },
};

// Suspicious metadata patterns that indicate AI generation
const SUSPICIOUS_PATTERNS = {
  encoder: /encoder|encoding|encoded/i,
  model: /model\s*(v|version|id)?\s*\d+/i,
  generated: /generated\s*by|created\s*by|made\s*by/i,
  ai_markers: /ai\s*(music|generated|model|audio|track|song)/i,
  replaygain: /replaygain|loudness|normali[sz]e/i,
  processing_tools: /audacity|ffmpeg|sox|lame|encoder/i,
};

// Default artist/album names often used by AI generators
const DEFAULT_AI_NAMES = [
  'artist',
  'unknown artist',
  'composer',
  'unnamed',
  'untitled',
  'track',
  'song',
  'samohrani samojed', // Default from this app
];

export function detectAIGenerated(metadata: MP3Metadata): AIDetectionResult {
  const detectedPatterns: string[] = [];
  const removedFrames: RemovedFrame[] = [];
  let aiScore = 0;
  const maxScore = 10;

  // 1. Check all metadata fields for AI signatures
  const metadataToCheck = {
    comment: metadata.comment,
    artist: metadata.artist,
    album: metadata.album,
    albumArtist: metadata.albumArtist,
    publisher: metadata.publisher,
    copyright: metadata.copyright,
    genre: metadata.genre,
  };

  for (const [field, value] of Object.entries(metadataToCheck)) {
    if (!value || typeof value !== 'string') continue;

    // Check for known AI generators
    for (const [generator, config] of Object.entries(AI_GENERATOR_SIGNATURES)) {
      for (const pattern of config.patterns) {
        if (pattern.test(value)) {
          detectedPatterns.push(`Found ${generator} signature in ${field}`);
          aiScore += 3;
          removedFrames.push({
            id: field.toUpperCase(),
            name: field,
            reason: `Contains ${generator.toUpperCase()} AI signature`,
            value: value.substring(0, 100),
          });
        }
      }
    }

    // Check for suspicious processing patterns
    for (const [patternName, pattern] of Object.entries(SUSPICIOUS_PATTERNS)) {
      if (pattern.test(value)) {
        detectedPatterns.push(`Suspicious ${patternName} pattern in ${field}`);
        aiScore += 1.5;
      }
    }
  }

  // 2. Check for generic/default artist names (common in AI generators)
  const artistLower = metadata.artist.toLowerCase();
  const albumLower = metadata.album.toLowerCase();

  for (const defaultName of DEFAULT_AI_NAMES) {
    if (artistLower === defaultName || artistLower.includes(defaultName)) {
      detectedPatterns.push('Generic default artist name');
      aiScore += 1.5;
    }
    if (albumLower === defaultName || albumLower.includes(defaultName)) {
      detectedPatterns.push('Generic default album name');
      aiScore += 1;
    }
  }

  // 3. Check for suspiciously uniform metadata (AI often generates similar patterns)
  if (metadata.bpm && metadata.key) {
    // AI-generated music often has very "round" BPM values (120, 130, etc)
    const bpmNum = parseInt(metadata.bpm, 10);
    if (bpmNum % 10 === 0 && (bpmNum === 120 || bpmNum === 130 || bpmNum === 140)) {
      detectedPatterns.push('Very common default BPM value');
      aiScore += 0.5;
    }
  }

  // 4. Check for multiple AI-related fields populated together
  let aiFieldCount = 0;
  for (const [generator] of Object.entries(AI_GENERATOR_SIGNATURES)) {
    for (const value of Object.values(metadataToCheck)) {
      if (value && typeof value === 'string') {
        for (const pattern of AI_GENERATOR_SIGNATURES[generator as keyof typeof AI_GENERATOR_SIGNATURES].patterns) {
          if (pattern.test(value)) {
            aiFieldCount++;
          }
        }
      }
    }
  }

  if (aiFieldCount > 1) {
    detectedPatterns.push('Multiple AI signatures across different fields');
    aiScore += 2;
  }

  // Calculate confidence (0-1)
  const confidence = Math.min(aiScore / maxScore, 1);
  const isLikelyAI = confidence >= 0.5;

  // Clean metadata
  const cleaned = cleanMetadata(metadata, removedFrames, isLikelyAI);

  return {
    isLikelyAI,
    confidence: parseFloat(confidence.toFixed(2)),
    detectedPatterns,
    removedFrames,
    cleaned,
  };
}

function cleanMetadata(
  metadata: MP3Metadata,
  removedFrames: RemovedFrame[],
  isLikelyAI: boolean
): MP3Metadata {
  const cleaned = { ...metadata };

  // Remove known AI signatures from all fields
  for (const [generator, config] of Object.entries(AI_GENERATOR_SIGNATURES)) {
    for (const pattern of config.patterns) {
      if (cleaned.comment && pattern.test(cleaned.comment)) {
        cleaned.comment = cleaned.comment
          .replace(pattern, '')
          .trim()
          .replace(/\s+/g, ' ');
      }
      if (cleaned.artist && pattern.test(cleaned.artist)) {
        cleaned.artist = cleaned.artist
          .replace(pattern, '')
          .trim()
          .replace(/\s+/g, ' ');
      }
      if (cleaned.publisher && pattern.test(cleaned.publisher)) {
        cleaned.publisher = cleaned.publisher
          .replace(pattern, '')
          .trim()
          .replace(/\s+/g, ' ');
      }
      if (cleaned.copyright && pattern.test(cleaned.copyright)) {
        cleaned.copyright = cleaned.copyright
          .replace(pattern, '')
          .trim()
          .replace(/\s+/g, ' ');
      }
    }
  }

  // Remove suspicious processing information from comment
  if (cleaned.comment) {
    for (const pattern of Object.values(SUSPICIOUS_PATTERNS)) {
      cleaned.comment = cleaned.comment
        .replace(pattern, '')
        .trim()
        .replace(/\s+/g, ' ');
    }
  }

  // If strongly AI-detected, clear generic fields
  if (isLikelyAI) {
    if (DEFAULT_AI_NAMES.includes(cleaned.artist.toLowerCase())) {
      removedFrames.push({
        id: 'ARTIST',
        name: 'Artist',
        reason: 'Generic default AI artist name',
        value: cleaned.artist,
      });
      cleaned.artist = '';
    }
    if (cleaned.album && DEFAULT_AI_NAMES.includes(cleaned.album.toLowerCase())) {
      removedFrames.push({
        id: 'ALBUM',
        name: 'Album',
        reason: 'Generic default AI album name',
        value: cleaned.album,
      });
      cleaned.album = '';
    }
  }

  return cleaned;
}

// Analyze audio characteristics that might indicate AI generation
export async function analyzeAudioCharacteristics(
  audioBuffer: AudioBuffer
): Promise<{
  isLikelyAI: boolean;
  indicators: string[];
}> {
  const indicators: string[] = [];
  const channelData = audioBuffer.getChannelData(0);

  // Check for unnaturally perfect characteristics
  
  // 1. Check for too-uniform dynamics
  const rms = calculateRMS(channelData);
  if (rms > 0.95) {
    indicators.push('Unnaturally high overall loudness (normalized)');
  }

  // 2. Check for clipping (hard limiting / brick wall)
  const maxSample = Math.max(...Array.from(channelData).map(Math.abs));
  if (maxSample > 0.99) {
    indicators.push('Hard clipping detected (brick wall limiting)');
  }

  // 3. Check for periodic artifacts (common in some AI models)
  const periodicity = detectPeriodicArtifacts(channelData);
  if (periodicity > 0.7) {
    indicators.push('Periodic artifacts detected (possible AI synthesis)');
  }

  // 4. Check for unnatural silence patterns
  const silencePatterns = detectUnusualSilencePatterns(channelData);
  if (silencePatterns) {
    indicators.push('Unusual silence patterns detected');
  }

  return {
    isLikelyAI: indicators.length >= 2,
    indicators,
  };
}

function calculateRMS(data: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += data[i] * data[i];
  }
  return Math.sqrt(sum / data.length);
}

function detectPeriodicArtifacts(data: Float32Array): number {
  // Simple periodicity detection using autocorrelation
  // Check if there are unnaturally repeating patterns
  const sampleSize = Math.min(data.length, 44100); // 1 second at 44.1kHz
  const period = 2048; // Check for ~46ms periodicity (common in AI models)

  let correlation = 0;
  let count = 0;

  for (let i = 0; i < sampleSize - period; i += 512) {
    let dot = 0;
    for (let j = 0; j < period; j++) {
      dot += Math.abs(data[i + j] * data[i + j + period]);
    }
    correlation += dot / period;
    count++;
  }

  return count > 0 ? correlation / count : 0;
}

function detectUnusualSilencePatterns(data: Float32Array): boolean {
  // Check for unnatural silence (complete absence of noise floor)
  const threshold = 0.001; // -60dB
  let silenceSegments = 0;
  let segmentLength = 0;
  const minSegmentLength = 4410; // ~100ms at 44.1kHz

  for (let i = 0; i < data.length; i++) {
    if (Math.abs(data[i]) < threshold) {
      segmentLength++;
    } else {
      if (segmentLength > minSegmentLength) {
        silenceSegments++;
      }
      segmentLength = 0;
    }
  }

  // More than 3 unnatural silence segments is suspicious
  return silenceSegments > 3;
}
