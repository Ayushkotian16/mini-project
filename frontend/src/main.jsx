import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// Hide the global loader once React has mounted
const loader = document.getElementById('app-loader');
if (loader) {
  loader.style.opacity = '0';
  setTimeout(() => loader.remove(), 400);
}
