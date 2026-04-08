import React, { useEffect } from 'react';
import '../styles/globals.css';

export default function DemoPage() {
  useEffect(() => {
    document.title = 'Démo — Rural Network';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-3xl mx-auto p-8 rounded-3xl shadow-xl bg-gradient-to-br from-green-50 to-white">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Voir la démo ou planifier une session</h2>
        <p className="text-lg text-gray-700 mb-8">Vous pouvez visionner une démo rapide ou demander une planification pour une session guidée.</p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('rn-open-auth', { detail: { mode: 'demo' } }))}
            className="bouton-principal flex-1"
          >
            Voir la démo maintenant
          </button>

          <button
            onClick={() => window.dispatchEvent(new CustomEvent('rn-open-auth', { detail: { mode: 'schedule' } }))}
            className="bouton-principal flex-1 bg-amber-500 hover:bg-amber-600"
          >
            Planifier la démo
          </button>
        </div>

        <div className="mt-8">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('rn-show-public', { detail: { page: 'landing' } }))}
            className="mt-2 px-6 py-3 bg-white border border-gray-200 rounded-lg shadow-sm"
          >
            ← Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
}
