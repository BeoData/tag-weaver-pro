import { MP3Metadata, GENRES, MOODS, CAMELOT_KEYS, LANGUAGES } from '@/types/mp3';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Music2, Info, Disc, Sparkles } from 'lucide-react';

interface MetadataEditorProps {
  metadata: MP3Metadata;
  onChange: (metadata: MP3Metadata) => void;
  disabled?: boolean;
}

export function MetadataEditor({ metadata, onChange, disabled }: MetadataEditorProps) {
  const updateField = (field: keyof MP3Metadata, value: string) => {
    onChange({ ...metadata, [field]: value });
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <Tabs defaultValue="basic" className="w-full">
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <TabsList className="grid w-full grid-cols-3 bg-muted h-10 sm:h-11">
            <TabsTrigger value="basic" className="gap-1.5 sm:gap-2 text-[11px] sm:text-sm">
              <Music2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Basic
            </TabsTrigger>
            <TabsTrigger value="advanced" className="gap-1.5 sm:gap-2 text-[11px] sm:text-sm">
              <Disc className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Advanced
            </TabsTrigger>
            <TabsTrigger value="extra" className="gap-1.5 sm:gap-2 text-[11px] sm:text-sm">
              <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Extra
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="p-4">
          <TabsContent value="basic" className="mt-0 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={metadata.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  disabled={disabled}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="artist">Artist</Label>
                <Input
                  id="artist"
                  value={metadata.artist}
                  onChange={(e) => updateField('artist', e.target.value)}
                  disabled={disabled}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="albumArtist">Album Artist</Label>
                <Input
                  id="albumArtist"
                  value={metadata.albumArtist}
                  onChange={(e) => updateField('albumArtist', e.target.value)}
                  disabled={disabled}
                  className="mt-1.5"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="album">Album</Label>
                <Input
                  id="album"
                  value={metadata.album}
                  onChange={(e) => updateField('album', e.target.value)}
                  disabled={disabled}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="genre">Genre</Label>
                <Select
                  value={metadata.genre}
                  onValueChange={(value) => updateField('genre', value)}
                  disabled={disabled}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENRES.map((genre) => (
                      <SelectItem key={genre} value={genre}>
                        {genre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  min="1900"
                  max="2099"
                  value={metadata.year}
                  onChange={(e) => updateField('year', e.target.value)}
                  disabled={disabled}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="trackNumber">Track #</Label>
                <Input
                  id="trackNumber"
                  value={metadata.trackNumber}
                  onChange={(e) => updateField('trackNumber', e.target.value)}
                  disabled={disabled}
                  placeholder="1"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="discNumber">Disc #</Label>
                <Input
                  id="discNumber"
                  value={metadata.discNumber}
                  onChange={(e) => updateField('discNumber', e.target.value)}
                  disabled={disabled}
                  placeholder="1"
                  className="mt-1.5"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="mt-0 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="bpm">BPM</Label>
                  {metadata.bpmDetected && (
                    <Badge variant="outline" className="text-xs text-primary border-primary">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Auto
                    </Badge>
                  )}
                </div>
                <Input
                  id="bpm"
                  type="number"
                  min="40"
                  max="300"
                  value={metadata.bpm}
                  onChange={(e) => updateField('bpm', e.target.value)}
                  disabled={disabled}
                  className="mt-1.5"
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="camelotKey">Key (Camelot)</Label>
                  {metadata.keyDetected && (
                    <Badge variant="outline" className="text-xs text-primary border-primary">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Auto
                    </Badge>
                  )}
                </div>
                <Select
                  value={metadata.camelotKey}
                  onValueChange={(value) => {
                    updateField('camelotKey', value);
                    updateField('key', CAMELOT_KEYS[value] || '');
                  }}
                  disabled={disabled}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select key" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CAMELOT_KEYS).map(([camelot, musical]) => (
                      <SelectItem key={camelot} value={camelot}>
                        <span className="font-mono text-accent">{camelot}</span>
                        <span className="text-muted-foreground ml-2">({musical})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="composer">Composer</Label>
                <Input
                  id="composer"
                  value={metadata.composer}
                  onChange={(e) => updateField('composer', e.target.value)}
                  disabled={disabled}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="producer">Producer</Label>
                <Input
                  id="producer"
                  value={metadata.producer}
                  onChange={(e) => updateField('producer', e.target.value)}
                  disabled={disabled}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="publisher">Publisher / Label</Label>
                <Input
                  id="publisher"
                  value={metadata.publisher}
                  onChange={(e) => updateField('publisher', e.target.value)}
                  disabled={disabled}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="copyright">Copyright</Label>
                <Input
                  id="copyright"
                  value={metadata.copyright}
                  onChange={(e) => updateField('copyright', e.target.value)}
                  disabled={disabled}
                  className="mt-1.5"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="isrc">ISRC</Label>
                <Input
                  id="isrc"
                  value={metadata.isrc}
                  onChange={(e) => updateField('isrc', e.target.value)}
                  disabled={disabled}
                  placeholder="Leave empty if unknown"
                  className="mt-1.5"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="extra" className="mt-0 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="language">Language</Label>
                <Select
                  value={metadata.language}
                  onValueChange={(value) => updateField('language', value)}
                  disabled={disabled}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang} value={lang}>
                        {lang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="mood">Mood</Label>
                <Select
                  value={metadata.mood}
                  onValueChange={(value) => updateField('mood', value)}
                  disabled={disabled}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select mood" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOODS.map((mood) => (
                      <SelectItem key={mood} value={mood}>
                        {mood}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2">
                <Label htmlFor="comment">Comment</Label>
                <Textarea
                  id="comment"
                  value={metadata.comment}
                  onChange={(e) => updateField('comment', e.target.value)}
                  disabled={disabled}
                  placeholder="Professional description of the track"
                  className="mt-1.5 min-h-[80px]"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="lyrics">Lyrics</Label>
                <Textarea
                  id="lyrics"
                  value={metadata.lyrics}
                  onChange={(e) => updateField('lyrics', e.target.value)}
                  disabled={disabled}
                  placeholder="Song lyrics (if available)"
                  className="mt-1.5 min-h-[120px]"
                />
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
