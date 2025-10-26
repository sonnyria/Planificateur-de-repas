import React, { useRef, useState, useEffect } from 'react';
import type { Meal, AggregatedIngredient, SelectedMealsConfig } from '../types';
import type { Tab } from '../App';

interface DataManagementProps {
  meals: Meal[];
  selectedMealsConfig: SelectedMealsConfig;
  manualShoppingItems: Omit<AggregatedIngredient, 'fromMeals'>[];
  suppressedItemKeys: string[];
  tabs: Tab[];
  onImport: (data: any) => void;
  manualApiKey: string;
  onApiKeyChange: (key: string) => void;
}

const DataManagement: React.FC<DataManagementProps> = ({ 
    meals, 
    selectedMealsConfig, 
    manualShoppingItems, 
    suppressedItemKeys, 
    tabs,
    onImport,
    manualApiKey,
    onApiKeyChange
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [apiKeyInput, setApiKeyInput] = useState(manualApiKey);

  useEffect(() => {
    setApiKeyInput(manualApiKey);
  }, [manualApiKey]);

  const handleExport = () => {
    const dataToExport = {
      meals,
      selectedMealsConfig,
      manualShoppingItems,
      suppressedItemKeys,
      tabsOrder: tabs.map(t => t.id),
      manualApiKey, // Include API key in export
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
          if (importedData.meals && (importedData.tabsOrder || importedData.manualApiKey !== undefined)) {
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

  const handleSaveApiKey = () => {
    onApiKeyChange(apiKeyInput);
    alert("Clé d'API enregistrée !");
  };

  return (
    <div className="space-y-6">
        <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Sauvegarde des données</h3>
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
        </div>

        <div className="pt-6 border-t border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Configuration de l'API Gemini (Avancé)</h3>
            <p className="text-sm text-slate-500 mb-3">Si la suggestion d'ingrédients ne fonctionne pas, vous pouvez entrer votre propre clé API Gemini ici.</p>
            <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                    <label htmlFor="apiKeyInput" className="text-sm font-medium text-slate-600">Votre Clé d'API</label>
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline">
                      Où trouver ma clé ?
                    </a>
                </div>
                <div className="flex gap-2">
                    <input
                        id="apiKeyInput"
                        type="password"
                        value={apiKeyInput}
                        onChange={(e) => setApiKeyInput(e.target.value)}
                        placeholder="Collez votre clé ici"
                        className="flex-grow w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900"
                    />
                    <button onClick={handleSaveApiKey} className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-sm hover:bg-green-600 transition-colors">
                        Enregistrer
                    </button>
                </div>
                <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded-md">
                    ⚠️ Attention : Votre clé sera stockée dans votre navigateur. N'utilisez cette option que si vous comprenez les risques de sécurité.
                </p>
            </div>
        </div>
    </div>
  );
};

export default DataManagement;