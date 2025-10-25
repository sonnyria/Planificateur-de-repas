import React, { useState } from 'react';
import type { Meal, Ingredient, Unit } from '../types';
import { PlusIcon, TrashIcon } from './Icons';

interface MealFormProps {
  onAddMeal: (meal: Omit<Meal, 'id'>) => void;
}

const MealForm: React.FC<MealFormProps> = ({ onAddMeal }) => {
  const [mealName, setMealName] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState({ name: '', quantity: '', unit: 'g' as Unit });

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
      onAddMeal({ name: mealName, ingredients, baseServings: 1 }); // Base recipe is now for 1 person
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
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-slate-800 mb-4">Ajouter une idée de repas</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="mealName" className="block text-sm font-medium text-slate-600 mb-1">Nom du plat</label>
          <input
            id="mealName"
            type="text"
            value={mealName}
            onChange={(e) => setMealName(e.target.value)}
            placeholder="Ex: Spaghetti Bolognaise"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-white text-slate-900"
            required
          />
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
            <h3 className="text-md font-semibold text-slate-700">Liste des ingrédients (pour 1 personne) :</h3>
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
  );
};

export default MealForm;