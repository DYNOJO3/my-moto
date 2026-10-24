import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initNative } from './native/bridge';

initNative();

createRoot(document.getElementById('root')!).render(<App />);
