import { createRoot } from 'react-dom/client';
import LandingApp from './LandingApp';
import '../styles/index.css';

createRoot(document.getElementById('landing-root')!).render(<LandingApp />);
