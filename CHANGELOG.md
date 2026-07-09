# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2026-07-09

### 🚀 Major Features

#### Advanced AI Detection System
- **Comprehensive Metadata Analysis**: Detects 10+ AI music generators (Suno, Udio, AudioCraft, Mubert, Amper, Dadabots, Jukebox, SoundRaw, Beatoven, Musicfy)
- **Confidence Scoring**: Intelligent scoring system (0-1) based on multiple detection patterns
- **Smart Cleaning**: Automatically removes AI signatures from all metadata fields
- **Audio Characteristic Analysis**: Detects AI artefacts including:
  - Unnaturally high loudness/normalization
  - Hard clipping and brick wall limiting
  - Periodic synthesis artifacts
  - Unnatural silence patterns
- **Detection Results**: Users now see confidence scores and detected AI patterns for each file

### 🔧 Improvements

- Better AI metadata cleaning (no longer just comment field)
- Enhanced detection of generic/default artist and album names
- Improved pattern matching for AI generation tools
- More accurate identification of processing artifacts

### 📝 Technical Changes

- Added `src/lib/ai-detector.ts` - New comprehensive AI detection module
- Updated `src/lib/audio-analyzer.ts` - Integrated new detector
- Enhanced `useMP3Files` hook - Shows AI detection alerts during analysis
- Updated type definitions - Added `aiDetectionResult` to `MP3File` interface

### ✨ UI/UX

- AI detection alerts with confidence percentage
- Toast notifications for detected AI-generated audio
- Detailed pattern information for transparency

### 🐛 Bug Fixes

- More thorough removal of AI traces from metadata
- Better handling of empty/default fields

---

## [1.0.0] - 2026-01-31

### ✨ Initial Release

#### Features
- **ID3 Tag Editing**: Professional metadata management
- **BPM Detection**: Automatic tempo analysis
- **Musical Key Detection**: With Camelot notation support
- **Waveform Visualization**: Canvas-based audio rendering
- **Batch Processing**: Process multiple files at once
- **Cover Artwork Management**: Add/update album art
- **AI Metadata Cleaner** (Basic): Remove known AI traces from comments
- **Export Reports**: CSV and TXT export functionality
- **Modern Web Interface**: React + TypeScript + Tailwind CSS
- **Supabase Integration**: Optional authentication and cloud features

#### Technology Stack
- React 18 + TypeScript
- Vite build tool
- Tailwind CSS + shadcn/ui
- Web Workers for audio analysis
- Web Audio API for analysis
- music-metadata-browser for parsing
- browser-id3-writer for tag writing
- Supabase for backend/auth

---

## Version Numbering

- **MAJOR**: Breaking changes or major feature additions
- **MINOR**: New features, non-breaking
- **PATCH**: Bug fixes and small improvements
