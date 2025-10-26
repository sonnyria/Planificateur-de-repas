import React, { useState } from 'react';
import type { Meal, SelectedMealsConfig } from '../types';
import { TrashIcon, PencilIcon } from './Icons';
import EditMealModal from './EditMealModal';

interface MealListProps {
  meals: Meal[];
  selectedMealsConfig: SelectedMealsConfig;
  onMealSelect: (id: number) => void;
  onDeleteMeal: (id: number) => void;
  onUpdateMeal: (meal: Meal) => void;
  onUpdateServings: (id: number, servings: number) => void;
}

const MealList: React.FC<MealListProps> = ({ meals, selectedMealsConfig, onMealSelect, onDeleteMeal, onUpdateMeal, onUpdateServings }) => {
  const [expandedMealId, setExpandedMealId] = useState<number | null>(null);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedMealId(expandedMealId === id ? null : id);
  };
  
  if (meals.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Mes Repas</h2>
        <p className="text-slate-500">Aucun repas pour le moment. Ajoutez-en un pour commencer !</p>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-slate-800 mb-4">Mes Repas</h2>
      <p className="text-slate-500 mb-4">Sélectionnez les repas et ajustez le nombre de personnes.</p>
      <ul className="space-y-3">
        {meals.map((meal) => {
          const isSelected = !!selectedMealsConfig[meal.id];
          const isExpanded = expandedMealId === meal.id;
          return (
            <li key={meal.id} className="bg-slate-50 rounded-lg shadow-sm transition-all duration-300">
              <div className="flex items-center p-3">
                <input
                  type="checkbox"
                  id={`meal-${meal.id}`}
                  checked={isSelected}
                  onChange={() => onMealSelect(meal.id)}
                  className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <div 
                  className="flex-grow ml-3 cursor-pointer"
                  onClick={() => toggleExpand(meal.id)}
                >
                  <label htmlFor={`meal-${meal.id}`} className="font-semibold text-slate-800 cursor-pointer">{meal.name}</label>
                  <span className="text-sm text-slate-500 ml-2">({meal.ingredients.length} ingrédients)</span>
                </div>

                {isSelected && (
                  <div className="flex items-center gap-2 mx-2">
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
                )}
                
                <div className="flex-shrink-0 flex items-center gap-1 ml-auto">
                  <button onClick={() => setEditingMeal(meal)} className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-100 rounded-full" aria-label={`Modifier ${meal.name}`}><PencilIcon className="w-5 h-5" /></button>
                  <button onClick={() => onDeleteMeal(meal.id)} className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-full" aria-label={`Supprimer ${meal.name}`}><TrashIcon className="w-5 h-5" /></button>
                </div>
              </div>
              {isExpanded && (
                 <div className="px-4 pb-3 ml-8 border-t border-slate-200">
                    <h4 className="mt-2 text-sm font-semibold text-slate-700">Ingrédients (pour {meal.baseServings} personne{meal.baseServings > 1 ? 's' : ''}) :</h4>
                    <ul className="mt-2 text-sm text-slate-600 list-disc list-inside space-y-1">
                      {meal.ingredients.map((ing, index) => (
                        <li key={index}>{ing.quantity} {ing.unit} {ing.name}</li>
                      ))}
                    </ul>
                  </div>
              )}
            </li>
          );
        })}
      </ul>
      {editingMeal && (
        <EditMealModal
          meal={editingMeal}
          onUpdate={(updatedMeal) => {
            onUpdateMeal(updatedMeal);
            setEditingMeal(null);
          }}
          onClose={() => setEditingMeal(null)}
        />
      )}
    </div>
  );
};

export default MealList;