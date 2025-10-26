import React, { useState } from 'react';
import type { Meal, SelectedMealsConfig } from '../types';
import { TrashIcon, ClipboardIcon, CheckIcon, ShareIcon } from './Icons';

interface SelectedMealsProps {
  meals: Meal[];
  selectedMealsConfig: SelectedMealsConfig;
  onUpdateServings: (id: number, servings: number) => void;
  onDeselectMeal: (id: number) => void;
}

const SelectedMeals: React.FC<SelectedMealsProps> = ({ meals, selectedMealsConfig, onUpdateServings, onDeselectMeal }) => {
  const [copied, setCopied] = useState(false);
  const isShareSupported = typeof navigator.share === 'function';
  const selectedMeals = meals.filter(meal => selectedMealsConfig[meal.id]);

  const getListAsText = () => {
    return selectedMeals.map(meal => `- ${meal.name} (${selectedMealsConfig[meal.id]} pers.)`).join('\n');
  }

  const handleCopyToClipboard = () => {
    const listText = getListAsText();
    navigator.clipboard.writeText(listText).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShare = async () => {
    const listText = getListAsText();
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Mes repas sélectionnés',
                text: listText,
            });
        } catch (error) {
            console.error('Erreur lors du partage:', error);
        }
    }
  };

  if (selectedMeals.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Repas Sélectionnés</h2>
        <p className="text-slate-500">Aucun repas sélectionné.</p>
        <p className="text-slate-500 mt-1">Allez dans l'onglet "Mes Recettes" pour en choisir.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-slate-800">Repas Sélectionnés</h2>
        {selectedMeals.length > 0 && (
            <div className="flex items-center gap-2">
                <button 
                    onClick={handleCopyToClipboard}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                >
                    {copied ? <CheckIcon className="w-4 h-4 text-green-600" /> : <ClipboardIcon className="w-4 h-4" />}
                    {copied ? 'Copié !' : 'Copier'}
                </button>
                 {isShareSupported && (
                    <button 
                        onClick={handleShare}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        <ShareIcon className="w-4 h-4" />
                        Partager
                    </button>
                )}
            </div>
        )}
      </div>
      <ul className="space-y-3">
        {selectedMeals.map((meal) => (
          <li key={meal.id} className="bg-slate-50 rounded-lg shadow-sm p-3 flex items-center justify-between">
            <div>
                <p className="font-semibold text-slate-800">{meal.name}</p>
                 <p className="text-sm text-slate-500">({meal.ingredients.length} ingrédients)</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                  <input
                      type="number"
                      min="1"
                      value={selectedMealsConfig[meal.id]}
                      onChange={(e) => onUpdateServings(meal.id, parseInt(e.target.value, 10) || 1)}
                      className="w-16 text-center border border-slate-300 rounded-md py-1 text-slate-900 bg-white"
                      aria-label={`Nombre de personnes pour ${meal.name}`}
                  />
                  <span className="text-sm text-slate-600">pers.</span>
              </div>
              <button 
                onClick={() => onDeselectMeal(meal.id)} 
                className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-full" 
                aria-label={`Retirer ${meal.name} de la sélection`}
              >
                  <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SelectedMeals;