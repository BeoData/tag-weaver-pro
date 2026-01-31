import * as mm from 'music-metadata-browser';
import { MP3Metadata, DEFAULT_METADATA, AI_FRAME_PATTERNS, RemovedFrame } from '@/types/mp3';

export async function parseMP3Metadata(file: File): Promise<{
  metadata: MP3Metadata;
  removedFrames: RemovedFrame[];
}> {
  try {
    const parsedMetadata = await mm.parseBlob(file);
    const common = parsedMetadata.common;
    const native = parsedMetadata.native;
    
    const removedFrames: RemovedFrame[] = [];
    
    // Check for AI-related frames in native tags
    for (const [format, tags] of Object.entries(native)) {
      for (const tag of tags) {
        const tagValue = String(tag.value || '');
        const tagId = tag.id;
        
        for (const pattern of AI_FRAME_PATTERNS) {
          if (pattern.test(tagId) || pattern.test(tagValue)) {
            removedFrames.push({
              id: tagId,
              name: tagId,
              reason: `Matches AI/software pattern: ${pattern.source}`,
              value: tagValue.substring(0, 100),
            });
            break;
          }
        }
      }
    }

    // Extract BPM from various possible locations
    let bpm = '';
    if (common.bpm) {
      bpm = String(common.bpm);
    }

    // Extract key
    let key = '';
    let camelotKey = '';
    if (common.key) {
      key = common.key;
      // Try to convert to Camelot
      camelotKey = musicalKeyToCamelot(key);
    }

    const metadata: MP3Metadata = {
      title: common.title || extractTitleFromFilename(file.name),
      artist: common.artist || DEFAULT_METADATA.artist,
      album: common.album || '',
      albumArtist: common.albumartist || common.artist || DEFAULT_METADATA.albumArtist,
      trackNumber: common.track?.no ? String(common.track.no) : '',
      discNumber: common.disk?.no ? String(common.disk.no) : '',
      year: common.year ? String(common.year) : DEFAULT_METADATA.year,
      genre: common.genre?.[0] || '',
      bpm,
      key,
      camelotKey,
      composer: common.composer?.[0] || '',
      producer: '', // Not standard in music-metadata
      publisher: common.label?.[0] || DEFAULT_METADATA.publisher,
      copyright: common.copyright || DEFAULT_METADATA.copyright,
      isrc: common.isrc?.[0] || '',
      language: common.language || '',
      mood: common.mood || '',
      comment: common.comment?.[0] || '',
      lyrics: typeof common.lyrics === 'string' ? common.lyrics : common.lyrics?.[0] || '',
      bpmDetected: false,
      keyDetected: false,
    };

    return { metadata, removedFrames };
  } catch (error) {
    console.error('Error parsing MP3 metadata:', error);
    return {
      metadata: {
        ...DEFAULT_METADATA,
        title: extractTitleFromFilename(file.name),
      },
      removedFrames: [],
    };
  }
}

function extractTitleFromFilename(filename: string): string {
  // Remove extension
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  // Replace underscores and dashes with spaces
  const cleaned = nameWithoutExt.replace(/[_-]/g, ' ');
  // Capitalize properly
  return toTitleCase(cleaned);
}

export function toTitleCase(str: string): string {
  const minorWords = ['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'nor', 'of', 'on', 'or', 'so', 'the', 'to', 'up', 'yet'];
  
  return str
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      if (index === 0 || !minorWords.includes(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word;
    })
    .join(' ');
}

function musicalKeyToCamelot(key: string): string {
  const keyMap: Record<string, string> = {
    'a♭m': '1A', 'abm': '1A', 'g#m': '1A',
    'b': '1B',
    'e♭m': '2A', 'ebm': '2A', 'd#m': '2A',
    'f#': '2B', 'gb': '2B',
    'b♭m': '3A', 'bbm': '3A', 'a#m': '3A',
    'db': '3B', 'c#': '3B',
    'fm': '4A',
    'ab': '4B', 'g#': '4B',
    'cm': '5A',
    'eb': '5B', 'd#': '5B',
    'gm': '6A',
    'bb': '6B', 'a#': '6B',
    'dm': '7A',
    'f': '7B',
    'am': '8A',
    'c': '8B',
    'em': '9A',
    'g': '9B',
    'bm': '10A',
    'd': '10B',
    'f#m': '11A', 'gbm': '11A',
    'a': '11B',
    'c#m': '12A', 'dbm': '12A',
    'e': '12B',
  };

  const normalized = key.toLowerCase().replace(/\s*(major|minor|maj|min)\s*/gi, (match) => {
    return match.toLowerCase().includes('min') ? 'm' : '';
  }).replace(/\s/g, '');

  return keyMap[normalized] || '';
}

export function camelotToMusicalKey(camelot: string): string {
  const keyMap: Record<string, string> = {
    '1A': 'A♭ minor', '1B': 'B major',
    '2A': 'E♭ minor', '2B': 'F♯ major',
    '3A': 'B♭ minor', '3B': 'D♭ major',
    '4A': 'F minor', '4B': 'A♭ major',
    '5A': 'C minor', '5B': 'E♭ major',
    '6A': 'G minor', '6B': 'B♭ major',
    '7A': 'D minor', '7B': 'F major',
    '8A': 'A minor', '8B': 'C major',
    '9A': 'E minor', '9B': 'G major',
    '10A': 'B minor', '10B': 'D major',
    '11A': 'F♯ minor', '11B': 'A major',
    '12A': 'C♯ minor', '12B': 'E major',
  };

  return keyMap[camelot.toUpperCase()] || '';
}
