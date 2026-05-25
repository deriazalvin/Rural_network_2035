import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/globals.css';
import App from './App.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import { I18nProvider } from './contexts/I18nContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <I18nProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </I18nProvider>
  </React.StrictMode>
);
