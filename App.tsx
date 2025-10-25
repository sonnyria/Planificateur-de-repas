import React, { useState, useEffect, useMemo, useCallback } from 'react';
import MealForm from './components/MealForm';
import MealList from './components/MealList';
import ShoppingList from './components/ShoppingList';
import SelectedMeals from './components/SelectedMeals';
import type { Meal, AggregatedIngredient } from './types';

// This type is expected by MealList and SelectedMeals
export type SelectedMealsConfig = { [mealId: number]: number };

type TabId = 'selected' | 'recipes' | 'shopping';
type Tab = {
  id: TabId;
  label: string;
};

const initialTabs: Tab[] = [
  { id: 'selected', label: 'Repas Sélectionnés' },
  { id: 'recipes', label: 'Mes Recettes' },
  { id: 'shopping', label: 'Liste de Courses' },
];

const App: React.FC = () => {
  const [meals, setMeals] = useState<Meal[]>(() => {
    try {
      const savedMeals = localStorage.getItem('meals');
      return savedMeals ? JSON.parse(savedMeals) : [];
    } catch (error) {
      console.error("Could not parse meals from localStorage", error);
      return [];
    }
  });

  const [selectedMealsConfig, setSelectedMealsConfig] = useState<SelectedMealsConfig>(() => {
    try {
      const savedConfig = localStorage.getItem('selectedMealsConfig');
      return savedConfig ? JSON.parse(savedConfig) : {};
    } catch (error) {
      console.error("Could not parse selectedMealsConfig from localStorage", error);
      return {};
    }
  });
  
  const [manualShoppingItems, setManualShoppingItems] = useState<Omit<AggregatedIngredient, 'fromMeals'>[]>(() => {
    try {
      const savedItems = localStorage.getItem('manualShoppingItems');
      return savedItems ? JSON.parse(savedItems) : [];
    } catch (error) {
      console.error("Could not parse manualShoppingItems from localStorage", error);
      return [];
    }
  });

  const [suppressedItemKeys, setSuppressedItemKeys] = useState<string[]>(() => {
    try {
        const savedKeys = localStorage.getItem('suppressedItemKeys');
        return savedKeys ? JSON.parse(savedKeys) : [];
    } catch (error) {
        console.error("Could not parse suppressedItemKeys from localStorage", error);
        return [];
    }
  });

  const [tabs, setTabs] = useState<Tab[]>(() => {
    try {
      const savedTabsOrder = localStorage.getItem('tabsOrder');
      if (savedTabsOrder) {
        const orderedIds = JSON.parse(savedTabsOrder) as TabId[];
        // Re-order initialTabs based on saved IDs to preserve labels and handle potential new tabs
        return initialTabs.sort((a, b) => orderedIds.indexOf(a.id) - orderedIds.indexOf(b.id));
      }
      return initialTabs;
    } catch (error) {
      console.error("Could not parse tabsOrder from localStorage", error);
      return initialTabs;
    }
  });

  const hasSelectedMeals = Object.keys(selectedMealsConfig).length > 0;
  const [activeTab, setActiveTab] = useState<TabId>(hasSelectedMeals ? tabs[0].id : 'recipes');

  useEffect(() => {
    localStorage.setItem('meals', JSON.stringify(meals));
  }, [meals]);

  useEffect(() => {
    localStorage.setItem('selectedMealsConfig', JSON.stringify(selectedMealsConfig));
  }, [selectedMealsConfig]);
  
  useEffect(() => {
    localStorage.setItem('manualShoppingItems', JSON.stringify(manualShoppingItems));
  }, [manualShoppingItems]);
  
  useEffect(() => {
    localStorage.setItem('suppressedItemKeys', JSON.stringify(suppressedItemKeys));
  }, [suppressedItemKeys]);

  useEffect(() => {
    localStorage.setItem('tabsOrder', JSON.stringify(tabs.map(t => t.id)));
  }, [tabs]);

  useEffect(() => {
    // If there are no more selected meals, reset the list of suppressed items
    if (!hasSelectedMeals) {
        setSuppressedItemKeys([]);
        if (activeTab === 'selected' || activeTab === 'shopping') {
            setActiveTab('recipes');
        }
    }
  }, [hasSelectedMeals, activeTab]);

  const handleDragStart = (e: React.DragEvent<HTMLButtonElement | HTMLOptionElement>, tabId: TabId) => {
    e.dataTransfer.setData('tabId', tabId);
  };

  const handleDragOver = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (e: React.DragEvent<HTMLButtonElement>, targetTabId: TabId) => {
    e.preventDefault();
    const draggedTabId = e.dataTransfer.getData('tabId') as TabId;
    
    if (draggedTabId && draggedTabId !== targetTabId) {
      const draggedIndex = tabs.findIndex(t => t.id === draggedTabId);
      const targetIndex = tabs.findIndex(t => t.id === targetTabId);
      
      const newTabs = [...tabs];
      const [draggedItem] = newTabs.splice(draggedIndex, 1);
      newTabs.splice(targetIndex, 0, draggedItem);
      
      setTabs(newTabs);
    }
  };


  const handleAddMeal = (meal: Omit<Meal, 'id'>) => {
    setMeals(prevMeals => [
      ...prevMeals,
      { ...meal, id: Date.now() }
    ]);
  };
  
  const handleDeselectMeal = (id: number) => {
     setSelectedMealsConfig(prevConfig => {
        const newConfig = { ...prevConfig };
        delete newConfig[id];
        return newConfig;
    });
  };

  const handleDeleteMeal = (id: number) => {
    setMeals(prevMeals => prevMeals.filter(meal => meal.id !== id));
    handleDeselectMeal(id);
  };
  
  const handleUpdateMeal = (updatedMeal: Meal) => {
    setMeals(prevMeals => prevMeals.map(meal => meal.id === updatedMeal.id ? updatedMeal : meal));
  };
  
  const handleMealSelect = (id: number) => {
    setSelectedMealsConfig(prevConfig => {
      const newConfig = { ...prevConfig };
      if (newConfig[id]) {
        delete newConfig[id];
      } else {
        newConfig[id] = 4; // Default to 4 servings
      }
      return newConfig;
    });
  };

  const handleUpdateServings = (id: number, servings: number) => {
    if (servings > 0) {
        setSelectedMealsConfig(prevConfig => ({
            ...prevConfig,
            [id]: servings
        }));
    }
  };

  const aggregatedIngredients = useMemo<AggregatedIngredient[]>(() => {
    const ingredientMap = new Map<string, AggregatedIngredient>();

    meals.forEach(meal => {
      const servings = selectedMealsConfig[meal.id];
      if (servings > 0) {
        meal.ingredients.forEach(ingredient => {
          const key = `${ingredient.name.toLowerCase()}_${ingredient.unit}`;
          const quantity = (ingredient.quantity / meal.baseServings) * servings;
          
          if (ingredientMap.has(key)) {
            const existing = ingredientMap.get(key)!;
            existing.quantity += quantity;
            if (!existing.fromMeals.includes(meal.name)) {
              existing.fromMeals.push(meal.name);
            }
          } else {
            ingredientMap.set(key, {
              ...ingredient,
              quantity,
              fromMeals: [meal.name]
            });
          }
        });
      }
    });

    manualShoppingItems.forEach(item => {
        const key = `${item.name.toLowerCase()}_${item.unit}`;
        if (ingredientMap.has(key)) {
            const existing = ingredientMap.get(key)!;
            existing.quantity += item.quantity;
            if(!existing.fromMeals.includes("Ajout manuel")) {
                existing.fromMeals.push("Ajout manuel");
            }
        } else {
            ingredientMap.set(key, {
                ...item,
                fromMeals: ["Ajout manuel"]
            });
        }
    });

    const allItems = Array.from(ingredientMap.values());
    const finalItems = allItems.filter(item => {
        const key = `${item.name.toLowerCase()}_${item.unit}`;
        return !suppressedItemKeys.includes(key);
    });

    return finalItems.sort((a, b) => a.name.localeCompare(b.name));
  }, [meals, selectedMealsConfig, manualShoppingItems, suppressedItemKeys]);
  
  const handleAddShoppingItem = useCallback((item: Omit<AggregatedIngredient, 'fromMeals'>) => {
      setManualShoppingItems(prev => {
        const existingItemIndex = prev.findIndex(i => i.name.toLowerCase() === item.name.toLowerCase() && i.unit === item.unit);
        if (existingItemIndex > -1) {
            const newItems = [...prev];
            newItems[existingItemIndex].quantity += item.quantity;
            return newItems;
        }
        return [...prev, item];
      });
  }, []);

  const handleDeleteShoppingItem = useCallback((itemKey: string) => {
    // Add to suppressed list for aggregated ingredients from recipes
    setSuppressedItemKeys(prev => [...new Set([...prev, itemKey])]);
    
    // Also remove from manual items list in case it was a manual item
    setManualShoppingItems(prev => {
        return prev.filter(item => `${item.name.toLowerCase()}_${item.unit}` !== itemKey);
    });
  }, []);
  
  const selectedMealsCount = Object.keys(selectedMealsConfig).length;

  return (
    <div className="bg-slate-100 min-h-screen font-sans text-slate-800">
      <header className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold leading-tight text-slate-900">
                  Planificateur de Repas
              </h1>
          </div>
      </header>
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="sm:hidden">
            <label htmlFor="tabs" className="sr-only">Select a tab</label>
            <select 
              id="tabs" 
              name="tabs" 
              onChange={(e) => setActiveTab(e.target.value as TabId)} 
              value={activeTab} 
              className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 bg-white text-slate-900"
            >
              {tabs.map(tab => {
                const isDisabled = (tab.id === 'selected' || tab.id === 'shopping') && !hasSelectedMeals;
                return (
                  <option key={tab.id} value={tab.id} disabled={isDisabled}>
                    {tab.label} {tab.id === 'selected' && hasSelectedMeals ? `(${selectedMealsCount})` : ''}
                  </option>
                );
              })}
            </select>
        </div>
        <div className="hidden sm:block">
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {tabs.map(tab => {
                      const isActive = activeTab === tab.id;
                      const isDisabled = (tab.id === 'selected' || tab.id === 'shopping') && !hasSelectedMeals;
                      
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          disabled={isDisabled}
                          draggable={!isDisabled}
                          onDragStart={(e) => handleDragStart(e, tab.id)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, tab.id)}
                          className={`
                            ${isActive ? 'bg-indigo-600 text-white' : 'border-transparent text-gray-500 hover:text-gray-700'} 
                            whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm rounded-t-lg transition-colors duration-200
                            disabled:text-gray-400 disabled:hover:border-transparent disabled:cursor-not-allowed disabled:bg-transparent
                          `}
                        >
                          {tab.label}
                          {tab.id === 'selected' && hasSelectedMeals ? <span className={`${isActive ? 'bg-indigo-400 text-white' : 'bg-indigo-100 text-indigo-600'} ml-3 py-0.5 px-2.5 rounded-full text-xs font-medium`}>{selectedMealsCount}</span> : null}
                        </button>
                      );
                    })}
                </nav>
            </div>
        </div>

        <div className="mt-8">
            {activeTab === 'selected' && (
                <SelectedMeals
                    meals={meals}
                    selectedMealsConfig={selectedMealsConfig}
                    onUpdateServings={handleUpdateServings}
                    onDeselectMeal={handleDeselectMeal}
                />
            )}
            {activeTab === 'recipes' && (
                <div className="space-y-8">
                    <MealForm onAddMeal={handleAddMeal} />
                    <MealList
                        meals={meals}
                        selectedMealsConfig={selectedMealsConfig}
                        onMealSelect={handleMealSelect}
                        onDeleteMeal={handleDeleteMeal}
                        onUpdateMeal={handleUpdateMeal}
                        onUpdateServings={handleUpdateServings}
                    />
                </div>
            )}
            {activeTab === 'shopping' && (
                 <ShoppingList
                    items={aggregatedIngredients}
                    onAddItem={handleAddShoppingItem}
                    onDeleteItem={handleDeleteShoppingItem}
                    hasSelectedMeals={hasSelectedMeals}
                />
            )}
        </div>
      </main>
    </div>
  );
};

export default App;