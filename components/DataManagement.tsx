import React, { useRef } from 'react';
import type { Meal, AggregatedIngredient, SelectedMealsConfig } from '../types';
import type { Tab } from '../App';

interface DataManagementProps {
  meals: Meal[];
  selectedMealsConfig: SelectedMealsConfig;
  manualShoppingItems: Omit<AggregatedIngredient, 'fromMeals'>[];
  suppressedItemKeys: string[];
  tabs: Tab[];
  onImport: (data: any) => void;
}

const DataManagement: React.FC<DataManagementProps> = ({ 
    meals, 
    selectedMealsConfig, 
    manualShoppingItems, 
    suppressedItemKeys, 
    tabs,
    onImport
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const dataToExport = {
      meals,
      selectedMealsConfig,
      manualShoppingItems,
      suppressedItemKeys,
      tabsOrder: tabs.map(t => t.id),
    };

    const dataStr = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    const date = new Date().toISOString().slice(0, 10);
    link.download = `planificateur_repas_backup_${date}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text === 'string') {
          const importedData = JSON.parse(text);
          
          // Basic validation to check if it looks like our data
          if (importedData.meals && importedData.tabsOrder) {
             if (window.confirm("Êtes-vous sûr de vouloir importer ces données ? Toutes les données actuelles seront remplacées.")) {
                onImport(importedData);
                alert("Données importées avec succès !");
             }
          } else {
            alert("Le fichier semble invalide ou corrompu.");
          }
        }
      } catch (error) {
        console.error("Erreur lors de l'importation du fichier:", error);
        alert("Erreur lors de la lecture du fichier. Assurez-vous que c'est un fichier de sauvegarde valide.");
      } finally {
        // Reset the input value to allow importing the same file again
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleExport}
          className="flex-1 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition-colors"
        >
          Exporter mes données
        </button>
        <button
          onClick={handleImportClick}
          className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-colors"
        >
          Importer des données
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="application/json"
          className="hidden"
        />
      </div>
    </>
  );
};

export default DataManagement;