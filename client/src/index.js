import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster position="bottom-right" toastOptions={{
        style: { background: '#1f2436', color: '#e8eaf0', border: '1px solid #2a2f45' }
      }} />
    </BrowserRouter>
  </React.StrictMode>
);
