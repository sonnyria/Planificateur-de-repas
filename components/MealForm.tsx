import React, { useState, useEffect } from 'react';
import type { Meal, Ingredient, Unit } from '../types';
import { PlusIcon, TrashIcon, SparklesIcon } from './Icons';
import { suggestIngredients } from '../services/geminiService';
import ApiKeyModal from './ApiKeyModal';

interface MealFormProps {
  onAddMeal: (meal: Omit<Meal, 'id'>) => void;
  manualApiKey: string;
}

const MealForm: React.FC<MealFormProps> = ({ onAddMeal, manualApiKey }) => {
  const [mealName, setMealName] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState({ name: '', quantity: '', unit: 'g' as Unit });
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [baseServings, setBaseServings] = useState(1);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  useEffect(() => {
    if (ingredients.length === 0) {
      setBaseServings(1);
    }
  }, [ingredients]);

  const performSuggestion = async () => {
    if (!mealName.trim()) return;
    setIsSuggesting(true);
    try {
      const suggested = await suggestIngredients(mealName, manualApiKey);
      if (suggested && suggested.length > 0) {
        setIngredients(suggested);
        setBaseServings(4);
      } else if(suggested) { // Empty array but not an error
        alert("Désolé, impossible de suggérer des ingrédients pour ce plat. Veuillez les ajouter manuellement.");
      }
    } catch (error) {
      console.error("Failed to suggest ingredients:", error);
      // The service now handles alerts
    } finally {
      setIsSuggesting(false);
    }
  };
  
  const handleSuggestIngredients = async () => {
    if (!mealName.trim()) return;
    
    // If a manual API key is set, use it directly.
    if (manualApiKey) {
        await performSuggestion();
        return;
    }
    
    // Otherwise, fall back to the AI Studio key selection flow.
    // @ts-ignore
    if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        // @ts-ignore
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
            setIsApiKeyModalOpen(true);
            return;
        }
    }
    await performSuggestion();
  };

  const handleSelectKeyAndSuggest = async () => {
    setIsApiKeyModalOpen(false);
    // @ts-ignore
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
       // @ts-ignore
       await window.aistudio.openSelectKey();
       // Assume success and proceed. The user doesn't need to click again.
       await performSuggestion();
    }
  };

  const handleAddIngredient = () => {
    if (currentIngredient.name && currentIngredient.quantity && currentIngredient.unit) {
       const newIngredient: Ingredient = {
            name: currentIngredient.name,
            quantity: parseFloat(currentIngredient.quantity) || 0,
            unit: currentIngredient.unit
       };
       if(newIngredient.quantity > 0 && !ingredients.some(i => i.name.toLowerCase() === newIngredient.name.toLowerCase())) {
         setIngredients([...ingredients, newIngredient]);
         setCurrentIngredient({ name: '', quantity: '', unit: 'g' });
       }
    }
  };

  const handleRemoveIngredient = (ingredientToRemove: string) => {
    setIngredients(ingredients.filter(ing => ing.name !== ingredientToRemove));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mealName && ingredients.length > 0) {
      onAddMeal({ name: mealName, ingredients, baseServings });
      setMealName('');
      setIngredients([]);
      setCurrentIngredient({ name: '', quantity: '', unit: 'g' });
    }
  };
  
  const handleIngredientChange = (field: 'name' | 'quantity', value: string) => {
      setCurrentIngredient(prev => ({ ...prev, [field]: value }));
  };

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setCurrentIngredient(prev => ({ ...prev, unit: e.target.value as Unit }));
  };


  return (
    <>
      <ApiKeyModal
          isOpen={isApiKeyModalOpen}
          onClose={() => setIsApiKeyModalOpen(false)}
          onSelectKey={handleSelectKeyAndSuggest}
      />
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Ajouter une idée de repas</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="mealName" className="block text-sm font-medium text-slate-600 mb-1">Nom du plat</label>
            <div className="flex gap-2">
              <input
                id="mealName"
                type="text"
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                placeholder="Ex: Spaghetti Bolognaise"
                className="flex-grow w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-white text-slate-900"
                required
              />
              <button
                type="button"
                onClick={handleSuggestIngredients}
                disabled={!mealName.trim() || isSuggesting}
                className="flex-shrink-0 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-500 text-white font-semibold rounded-lg shadow-sm hover:bg-indigo-600 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
                aria-label="Suggérer des ingrédients avec l'IA"
              >
                {isSuggesting ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : (
                    <SparklesIcon className="w-5 h-5" />
                )}
                <span className="hidden sm:inline">{isSuggesting ? 'Patientez...' : 'Suggérer'}</span>
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Ingrédients</label>
            <div className="grid grid-cols-1 sm:grid-cols-[2fr,1fr,1fr,auto] gap-2 items-center">
              <input
                type="text" value={currentIngredient.name} onChange={(e) => handleIngredientChange('name', e.target.value)}
                placeholder="Nom (Ex: Tomates)"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900"
              />
              <input
                type="number" value={currentIngredient.quantity} onChange={(e) => handleIngredientChange('quantity', e.target.value)}
                placeholder="Qté" min="0" step="any"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900"
              />
              <select
                value={currentIngredient.unit}
                onChange={handleUnitChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900"
              >
                <option value="g">Poids (g)</option>
                <option value="ml">Volume (ml)</option>
                <option value="unité">Unité</option>
              </select>
              <button type="button" onClick={handleAddIngredient} className="flex-shrink-0 p-2 bg-slate-200 text-slate-600 hover:bg-slate-300 rounded-lg transition-colors h-full">
                <PlusIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          {ingredients.length > 0 && (
            <div className="space-y-2 pt-2">
              <h3 className="text-md font-semibold text-slate-700">Liste des ingrédients (pour {baseServings} personne{baseServings > 1 ? 's' : ''}) :</h3>
              <ul className="max-h-40 overflow-y-auto space-y-2 bg-slate-50 p-3 rounded-lg">
                {ingredients.map((ing, index) => (
                  <li key={index} className="flex items-center justify-between bg-white p-2 rounded-md shadow-sm">
                    <span className="text-slate-800 font-medium">{ing.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600">{ing.quantity} {ing.unit}</span>
                      <button type="button" onClick={() => handleRemoveIngredient(ing.name)} className="p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100 transition-colors">
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="submit"
            disabled={!mealName || ingredients.length === 0}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white font-bold rounded-lg shadow-md hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Ajouter le Repas
          </button>
        </form>
      </div>
    </>
  );
};

export default MealForm;