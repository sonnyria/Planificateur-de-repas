import React, { useEffect } from 'react';
import DataManagement from './DataManagement';
import type { Meal, AggregatedIngredient, SelectedMealsConfig } from '../types';
import type { Tab } from '../App';

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  meals: Meal[];
  selectedMealsConfig: SelectedMealsConfig;
  manualShoppingItems: Omit<AggregatedIngredient, 'fromMeals'>[];
  suppressedItemKeys: string[];
  tabs: Tab[];
  onImport: (data: any) => void;
  manualApiKey: string;
  onApiKeyChange: (key: string) => void;
}

const DataManagementModal: React.FC<DataManagementModalProps> = ({ isOpen, onClose, ...props }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="data-management-title"
    >
      <div
        className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
            <h2 id="data-management-title" className="text-xl font-bold text-slate-800">
            Gestion des Données
            </h2>
            <button 
                onClick={onClose} 
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
                aria-label="Fermer"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        <p className="text-slate-500 mb-5 text-sm">
          Sauvegardez vos recettes sur votre appareil ou restaurez-les à partir d'un fichier. Utile pour changer de navigateur ou comme sécurité.
        </p>
        <DataManagement {...props} />
      </div>
    </div>
  );
};

export default DataManagementModal;