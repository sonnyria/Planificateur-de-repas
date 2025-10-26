import React from 'react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectKey: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSelectKey }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="api-key-title"
    >
      <div
        className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="api-key-title" className="text-xl font-bold text-slate-800">
          Clé d'API Gemini requise
        </h2>
        <p className="text-slate-500 my-4 text-sm">
          Pour utiliser la suggestion d'ingrédients basée sur l'IA, vous devez sélectionner une clé d'API Gemini depuis votre projet Google AI Studio.
          L'utilisation de l'API peut être soumise à des frais.
        </p>
        <p className="text-sm mb-5">
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                En savoir plus sur la facturation.
            </a>
        </p>
        <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-colors">
                Annuler
            </button>
            <button type="button" onClick={onSelectKey} className="px-4 py-2 bg-indigo-500 text-white font-bold rounded-lg shadow-md hover:bg-indigo-600 transition-colors">
                Sélectionner une Clé API
            </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
