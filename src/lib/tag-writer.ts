
import { ID3Writer } from 'browser-id3-writer';
import { MP3Metadata, CoverArt } from '@/types/mp3';

export async function writeTags(
    file: File,
    metadata: MP3Metadata,
    coverArt?: CoverArt
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            try {
                const arrayBuffer = reader.result as ArrayBuffer;
                const writer = new ID3Writer(arrayBuffer);

                // Text Frames
                if (metadata.title) writer.setFrame('TIT2', metadata.title);
                if (metadata.artist) writer.setFrame('TPE1', [metadata.artist]); // Array of strings
                if (metadata.album) writer.setFrame('TALB', metadata.album);
                if (metadata.albumArtist) writer.setFrame('TPE2', metadata.albumArtist);
                if (metadata.genre) writer.setFrame('TCON', [metadata.genre]);
                if (metadata.year) writer.setFrame('TYER', metadata.year);
                if (metadata.publisher) writer.setFrame('TPUB', metadata.publisher);
                if (metadata.copyright) writer.setFrame('TCOP', metadata.copyright);
                if (metadata.bpm) writer.setFrame('TBPM', metadata.bpm);
                if (metadata.key) writer.setFrame('TKEY', metadata.key);
                if (metadata.comment) writer.setFrame('COMM', {
                    description: '',
                    text: metadata.comment,
                    language: 'eng'
                });

                // Cover Art
                // Cover Art
                if (coverArt && coverArt.original) {
                    const coverReader = new FileReader();
                    coverReader.onload = () => {
                        const coverBuffer = coverReader.result as ArrayBuffer;
                        writer.setFrame('APIC', {
                            type: 3, // front cover
                            data: coverBuffer,
                            description: 'Cover'
                        });

                        finish();
                    };
                    coverReader.onerror = reject;
                    coverReader.readAsArrayBuffer(coverArt.original);
                    return; // Return early, finish will be called in callback
                }

                finish();

                function finish() {
                    writer.addTag();
                    const taggedBlob = writer.getBlob();
                    resolve(taggedBlob);
                }



            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}
