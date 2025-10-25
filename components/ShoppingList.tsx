import React, { useState } from 'react';
import type { AggregatedIngredient, Unit } from '../types';
import { ClipboardIcon, CheckIcon, TrashIcon, PlusIcon } from './Icons';

interface ShoppingListProps {
  items: AggregatedIngredient[];
  onAddItem: (item: Omit<AggregatedIngredient, 'fromMeals'>) => void;
  onDeleteItem: (itemKey: string) => void;
  hasSelectedMeals: boolean;
}

const AddItemForm: React.FC<{ onAddItem: ShoppingListProps['onAddItem'] }> = ({ onAddItem }) => {
    const [name, setName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unit, setUnit] = useState<Unit>('unité');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const numQuantity = parseFloat(quantity);
      if (name && !isNaN(numQuantity) && numQuantity > 0) {
        onAddItem({ name, quantity: numQuantity, unit });
        setName('');
        setQuantity('');
        setUnit('unité');
      }
    };

    return (
      <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t border-slate-200 space-y-2">
        <h3 className="text-md font-semibold text-slate-700">Ajouter un article</h3>
        <div className="grid grid-cols-[2fr,1fr,1fr,auto] gap-2 items-center">
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nom de l'article" className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900" required />
          <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="Qté" min="0" step="any" className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900" required />
          <select value={unit} onChange={e => setUnit(e.target.value as Unit)} className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-indigo-500 text-slate-900">
            <option value="g">Poids (g)</option>
            <option value="ml">Volume (ml)</option>
            <option value="unité">Unité</option>
          </select>
          <button type="submit" aria-label="Ajouter l'article" className="p-2 bg-indigo-500 text-white hover:bg-indigo-600 rounded-lg transition-colors h-full flex justify-center items-center">
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>
      </form>
    );
};

const ShoppingList: React.FC<ShoppingListProps> = ({ items, onAddItem, onDeleteItem, hasSelectedMeals }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyToClipboard = () => {
    const listText = items.map(ing => `- ${ing.name}: ${ing.quantity.toFixed(2).replace(/\.00$/, '')} ${ing.unit}`).join('\n');
    navigator.clipboard.writeText(listText).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-slate-800">Liste de Courses</h2>
        {items.length > 0 && (
          <button 
            onClick={handleCopyToClipboard}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            {copied ? <CheckIcon className="w-4 h-4 text-green-600" /> : <ClipboardIcon className="w-4 h-4" />}
            {copied ? 'Copié !' : 'Copier'}
          </button>
        )}
      </div>
      
      {hasSelectedMeals ? (
        items.length > 0 ? (
          <>
            <ul className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {items.map((ingredient, index) => (
                <li key={index} className="group flex justify-between items-start p-2 bg-slate-50 rounded-md">
                  <div className="flex-grow">
                      <span className="font-semibold text-slate-800">{ingredient.name}</span>
                      <p className="text-xs text-slate-500">Pour : {ingredient.fromMeals.join(', ')}</p>
                  </div>
                  <div className="flex items-center">
                    <span className="flex-shrink-0 ml-2 font-mono text-right text-indigo-600 font-bold">
                        {ingredient.quantity.toFixed(2).replace(/\.00$/, '').replace(/\.([1-9])0$/, '.$1')} {ingredient.unit}
                    </span>
                    <button 
                      onClick={() => onDeleteItem(`${ingredient.name.toLowerCase()}_${ingredient.unit}`)}
                      className="ml-2 p-1 text-slate-400 hover:text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label={`Supprimer ${ingredient.name}`}
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <AddItemForm onAddItem={onAddItem} />
          </>
        ) : (
            <>
             <p className="text-slate-500 text-center py-4">Votre liste de courses est vide.</p>
             <AddItemForm onAddItem={onAddItem} />
            </>
        )
      ) : (
        <p className="text-slate-500 text-center py-4">Sélectionnez un ou plusieurs repas pour voir votre liste de courses.</p>
      )}
    </div>
  );
};

export default ShoppingList;