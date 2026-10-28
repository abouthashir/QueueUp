import { createRoot } from 'react-dom/client';
import '@fontsource-variable/schibsted-grotesk';
import '../index.css';
import ShareCard from './ShareCard';

// Not part of the app: design/share-card.html loads this, and we screenshot it to make public/share.png.
createRoot(document.getElementById('root')!).render(<ShareCard />);
