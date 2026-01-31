// Web Worker for Audio Analysis
// Handles heavy CPU tasks: BPM detection and Key detection

self.onmessage = (e) => {
    const { channelData, sampleRate } = e.data;

    if (!channelData || !sampleRate) {
        self.postMessage({ error: 'Missing audio data' });
        return;
    }

    try {
        // Report progress
        self.postMessage({ type: 'progress', value: 10, stage: 'BPM Detection' });
        const bpm = detectBPM(channelData, sampleRate);

        self.postMessage({ type: 'progress', value: 50, stage: 'Key Detection' });
        const { key, camelot } = detectKey(channelData, sampleRate);

        self.postMessage({ type: 'result', bpm, key, camelot });
    } catch (error) {
        self.postMessage({ error: String(error) });
    }
};

// --- BPM Detection Logic ---

function detectBPM(channelData: Float32Array, sampleRate: number): number {
    // Downsample for faster processing
    // Target ~4000Hz for efficient processing while keeping enough detail for beats
    const targetSampleRate = 4410;
    const downsampleFactor = Math.floor(sampleRate / targetSampleRate);
    const downsampledLength = Math.floor(channelData.length / downsampleFactor);
    const downsampled = new Float32Array(downsampledLength);

    for (let i = 0; i < downsampledLength; i++) {
        let sum = 0;
        const offset = i * downsampleFactor;
        for (let j = 0; j < downsampleFactor; j++) {
            // Simple average downsampling
            if (offset + j < channelData.length) {
                sum += Math.abs(channelData[offset + j]);
            }
        }
        downsampled[i] = sum / downsampleFactor;
    }

    // Find peaks
    const peaks: number[] = [];
    // Dynamic threshold based on local interactions
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
    // Tolerance in samples (approx 5-10ms)
    const tolerance = 5;

    for (const interval of intervals) {
        // Group intervals
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
    // dominantInterval is in downsampled samples
    // samples per second = targetSampleRate (approx)
    // beats per second = targetSampleRate / dominantInterval
    // beats per minute = 60 * beats per second

    if (dominantInterval === 0) return 120;

    const secondsPerBeat = (dominantInterval * downsampleFactor) / sampleRate;
    let bpm = Math.round(60 / secondsPerBeat);

    // Normalize to reasonable range 60-180
    while (bpm < 70) bpm *= 2;
    while (bpm > 180) bpm /= 2;

    return Math.round(bpm);
}

function getThreshold(data: Float32Array): number {
    // Quick copy to sort
    const sorted = new Float32Array(data);
    sorted.sort();
    return sorted[Math.floor(sorted.length * 0.85)];
}

// --- Key Detection Logic ---

function detectKey(channelData: Float32Array, sampleRate: number): { key: string; camelot: string } {
    // Use a portion of the audio for analysis
    const analyzeLength = Math.min(channelData.length, sampleRate * 30); // 30 seconds max
    const segment = channelData.slice(0, analyzeLength);

    // Perform FFT
    // Process in chunks
    const fftSize = 4096;
    const chromaProfile = new Float32Array(12).fill(0);

    // Pre-calculate window function (Hanning)
    const windowTable = new Float32Array(fftSize);
    for (let i = 0; i < fftSize; i++) {
        windowTable[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (fftSize - 1)));
    }

    // Pre-calculate bit reversal table if needed, or do it inline

    const hopSize = fftSize / 2; // 50% overlap
    const numFrames = Math.floor((segment.length - fftSize) / hopSize);

    for (let i = 0; i < numFrames; i++) {
        // Progress reporting inside the heavy loop if needed, but postMessage overhead might be high
        // if (i % 100 === 0) self.postMessage({ type: 'progress', value: 50 + (i/numFrames)*50 });

        const offset = i * hopSize;
        const frame = new Float32Array(fftSize);

        // Apply window function
        for (let j = 0; j < fftSize; j++) {
            if (offset + j < segment.length) {
                frame[j] = segment[offset + j] * windowTable[j];
            }
        }

        const spectrum = computeFFT(frame);

        // Map frequencies to pitch classes
        // Only process relevant frequency range for musical notes
        for (let bin = 1; bin < spectrum.length / 2; bin++) {
            const freq = (bin * sampleRate) / fftSize;
            if (freq < 60 || freq > 2000) continue;

            const pitchClass = frequencyToPitchClass(freq);
            // Accumulate magnitude
            chromaProfile[pitchClass] += spectrum[bin];
        }
    }

    // Find best matching key
    const keys = detectKeyFromChroma(chromaProfile);

    return keys;
}

// Cooley-Tukey FFT (In-place, Radix-2)
// Input: real valued signal
// Output: magnitude spectrum (first half)
function computeFFT(inputReal: Float32Array): Float32Array {
    const n = inputReal.length;
    const m = Math.log2(n);

    // Bit Reversal
    // Create complex array: real in even indices, imag in odd
    // Or separate arrays. Let's use two arrays for clarity vs speed tradeoff
    const real = new Float32Array(inputReal);
    const imag = new Float32Array(n).fill(0);

    // Perform bit reversal
    let j = 0;
    for (let i = 0; i < n - 1; i++) {
        if (i < j) {
            const tr = real[j]; real[j] = real[i]; real[i] = tr;
            const ti = imag[j]; imag[j] = imag[i]; imag[i] = ti;
        }
        let k = n >> 1;
        while (k <= j) {
            j -= k;
            k >>= 1;
        }
        j += k;
    }

    // FFT Computation
    for (let l = 1; l <= m; l++) {
        const le = 1 << l;
        const le2 = le >> 1;
        const ur = 1.0;
        const ui = 0.0;

        // Trigonometric recurrence
        // sr = cos(PI / le2), si = -sin(PI / le2)
        const arg = Math.PI / le2;
        const sr = Math.cos(arg);
        const si = -Math.sin(arg);

        let wr = 1.0;
        let wi = 0.0;

        for (let j = 0; j < le2; j++) {
            for (let i = j; i < n; i += le) {
                const ip = i + le2;
                const tr = real[ip] * wr - imag[ip] * wi;
                const ti = real[ip] * wi + imag[ip] * wr;

                real[ip] = real[i] - tr;
                imag[ip] = imag[i] - ti;
                real[i] = real[i] + tr;
                imag[i] = imag[i] + ti;
            }
            const tr = wr;
            wr = tr * sr - wi * si;
            wi = tr * si + wi * sr;
        }
    }

    // Calculate magnitudes
    const magnitudes = new Float32Array(n / 2);
    for (let i = 0; i < n / 2; i++) {
        magnitudes[i] = Math.sqrt(real[i] * real[i] + imag[i] * imag[i]);
    }

    return magnitudes;
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
