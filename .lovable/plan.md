

# MP3 Metadata Editor & AI Cleaner

Profesionalna web aplikacija za obradu MP3 metapodataka sa automatskom analizom i čišćenjem AI tragova.

---

## Dizajn i Izgled

**Tamna, profesionalna tema** inspirisana Pro Audio softverom (poput Serato, Rekordbox). Čist interfejs sa:
- Tamno siva/crna pozadina sa svetlim akcentima
- Profesionalne tipografije
- Jasne sekcije za svaki deo workflow-a

---

## Ključne Funkcionalnosti

### 1. Upload i Batch Obrada
- Drag & drop zona za upload više MP3 fajlova odjednom
- Progress bar za svaki fajl
- Lista svih uploadovanih fajlova sa statusom obrade

### 2. Automatska Audio Analiza
- **BPM detekcija** - automatsko prepoznavanje tempa
- **Key detekcija** - prikaz u dva formata:
  - Camelot notacija (8A, 11B...)
  - Muzički ključ (A minor, F major...)
- Svi automatski rezultati se mogu ručno korigovati

### 3. Metadata Editor
Sva polja su editabilna sa profesionalnim default vrednostima:

**Osnovni podaci:**
- Title, Artist, Album, Album Artist
- Track Number, Disc Number
- Year / Original Release Date
- Genre (precizni muzički žanrovi)

**Napredni podaci:**
- BPM (auto-detektovan)
- Key (Camelot + muzički format)
- Composer, Producer
- Publisher / Label
- Copyright, ISRC
- Language, Mood
- Comment (profesionalan opis)

**Default vrednosti:**
- Artist/Copyright/Label: "Samohrani Samojed" (može se promeniti)
- Profesionalna kapitalizacija (Spotify/Beatport standard)

### 4. Cover Art Management
- Upload slike za cover
- Automatska konverzija: 3000×3000 px, JPEG, RGB
- Uklanjanje EXIF podataka
- Preview pre primene

### 5. AI Metadata Cleaner
Automatsko uklanjanje:
- Encoder/Software tagova (Suno, AI, model, version...)
- Custom/proprietary ID3 frame-ova
- AI referenci u Comment poljima
- URL-ova ka AI servisima
- ReplayGain i sličnih tragova
- Svih nestandardnih frame-ova

### 6. Izveštaji
- **Pre-obrade:** prikaz trenutnih tagova
- **Posle obrade:** tabelarni pregled svih izmena
- Lista uklonjenih AI/softverskih frame-ova
- Mogućnost download-a izveštaja

---

## Tehnički Aspekti (za korisnika nevidljivi)

- Audio ostaje netaknut (bez re-enkodovanja)
- ID3v2.3 + ID3v2.4 podrška
- UTF-16 encoding za kompatibilnost
- Uklanjanje duplikata ID3 frame-ova

---

## Korisnički Nalozi (opciono)

- **Bez naloga:** Osnovna funkcionalnost odmah dostupna
- **Sa nalogom:** Čuvanje istorije obrada, custom presets, batch šabloni

---

## Workflow Korisnika

1. Upload MP3 fajlova (pojedinačno ili batch)
2. Automatska analiza (BPM, Key)
3. Pregled i korekcija svih metadata polja
4. Upload cover art slike
5. Pokretanje obrade + AI čišćenja
6. Pregled izveštaja sa svim izmenama
7. Download obrađenih fajlova

