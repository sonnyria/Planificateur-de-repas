import React from 'react';
import type { Meal } from '../types';
import { TrashIcon } from './Icons';
import type { SelectedMealsConfig } from '../App';

interface SelectedMealsProps {
  meals: Meal[];
  selectedMealsConfig: SelectedMealsConfig;
  onUpdateServings: (id: number, servings: number) => void;
  onDeselectMeal: (id: number) => void;
}

const SelectedMeals: React.FC<SelectedMealsProps> = ({ meals, selectedMealsConfig, onUpdateServings, onDeselectMeal }) => {
  const selectedMeals = meals.filter(meal => selectedMealsConfig[meal.id]);

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
      <h2 className="text-2xl font-bold text-slate-800 mb-4">Repas Sélectionnés</h2>
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