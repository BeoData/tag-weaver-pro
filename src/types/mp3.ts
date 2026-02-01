export interface MP3File {
  id: string;
  file: File;
  name: string;
  size: number;
  status: 'pending' | 'analyzing' | 'ready' | 'processing' | 'done' | 'error';
  progress: number;
  metadata: MP3Metadata;
  originalMetadata: MP3Metadata;
  removedFrames: RemovedFrame[];
  coverArt?: CoverArt;
  waveform?: number[];
  error?: string;
}

export interface MP3Metadata {
  // Basic info
  title: string;
  artist: string;
  album: string;
  albumArtist: string;
  trackNumber: string;
  discNumber: string;
  year: string;
  genre: string;

  // Advanced info
  bpm: string;
  key: string;
  camelotKey: string;
  composer: string;
  producer: string;
  publisher: string;
  copyright: string;
  isrc: string;
  language: string;
  mood: string;
  comment: string;
  lyrics: string;

  // Analysis flags
  bpmDetected: boolean;
  keyDetected: boolean;
}

export interface CoverArt {
  original: File | null;
  processed: string | null; // base64 data URL
  width: number;
  height: number;
}

export interface RemovedFrame {
  id: string;
  name: string;
  reason: string;
  value?: string;
}

export interface ProcessingReport {
  fileId: string;
  fileName: string;
  changes: MetadataChange[];
  removedFrames: RemovedFrame[];
  timestamp: Date;
}

export interface MetadataChange {
  field: string;
  oldValue: string;
  newValue: string;
}

export const DEFAULT_METADATA: MP3Metadata = {
  title: '',
  artist: 'Samohrani Samojed',
  album: '',
  albumArtist: 'Samohrani Samojed',
  trackNumber: '',
  discNumber: '',
  year: new Date().getFullYear().toString(),
  genre: '',
  bpm: '',
  key: '',
  camelotKey: '',
  composer: '',
  producer: '',
  publisher: 'Samohrani Samojed',
  copyright: `© ${new Date().getFullYear()} Samohrani Samojed`,
  isrc: '',
  language: '',
  mood: '',
  comment: '',
  lyrics: '',
  bpmDetected: false,
  keyDetected: false,
};

export const GENRES = [
  'Electronic', 'House', 'Techno', 'Trance', 'Drum & Bass',
  'Dubstep', 'Deep House', 'Tech House', 'Progressive House',
  'Minimal', 'Ambient', 'Downtempo', 'Breakbeat', 'Electro',
  'Hip Hop', 'R&B', 'Pop', 'Rock', 'Indie', 'Alternative',
  'Jazz', 'Soul', 'Funk', 'Disco', 'Classical', 'Folk',
  'Country', 'Blues', 'Reggae', 'World', 'Latin', 'Acoustic',
];

export const MOODS = [
  'Energetic', 'Relaxed', 'Melancholic', 'Uplifting', 'Dark',
  'Dreamy', 'Aggressive', 'Peaceful', 'Romantic', 'Mysterious',
  'Euphoric', 'Chill', 'Intense', 'Nostalgic', 'Hopeful',
];

export const CAMELOT_KEYS: Record<string, string> = {
  '1A': 'A♭ minor',
  '1B': 'B major',
  '2A': 'E♭ minor',
  '2B': 'F♯ major',
  '3A': 'B♭ minor',
  '3B': 'D♭ major',
  '4A': 'F minor',
  '4B': 'A♭ major',
  '5A': 'C minor',
  '5B': 'E♭ major',
  '6A': 'G minor',
  '6B': 'B♭ major',
  '7A': 'D minor',
  '7B': 'F major',
  '8A': 'A minor',
  '8B': 'C major',
  '9A': 'E minor',
  '9B': 'G major',
  '10A': 'B minor',
  '10B': 'D major',
  '11A': 'F♯ minor',
  '11B': 'A major',
  '12A': 'D♭ minor',
  '12B': 'E major',
};

export const AI_FRAME_PATTERNS = [
  /suno/i,
  /udio/i,
  /ai\s*(music|generated|model|version)/i,
  /encoder/i,
  /encoding/i,
  /software/i,
  /tool/i,
  /generator/i,
  /replaygain/i,
  /loudness/i,
  /model\s*version/i,
  /created\s*by/i,
  /generated\s*by/i,
];

export const LANGUAGES = [
  'English', 'Serbian', 'Spanish', 'French', 'German',
  'Italian', 'Portuguese', 'Russian', 'Japanese', 'Korean',
  'Chinese', 'Arabic', 'Hindi', 'Dutch', 'Polish',
  'Swedish', 'Norwegian', 'Danish', 'Finnish', 'Greek',
  'Instrumental',
];
