import { createRoot } from "react-dom/client";
import { Buffer } from 'buffer';

// Polyfill Buffer for music-metadata-browser
declare global {
    interface Window {
        Buffer: typeof Buffer;
    }
}
window.Buffer = Buffer;

// Force enable Context Menu and F12 (DevTools)
window.addEventListener('contextmenu', (e) => e.stopPropagation(), true);
window.addEventListener('keydown', (e) => {
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.stopPropagation();
    }
}, true);

import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
