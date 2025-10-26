import { GoogleGenAI, Type } from "@google/genai";
import type { Ingredient, Unit } from "../types";

const ALLOWED_UNITS: Unit[] = ['g', 'ml', 'unité'];

export const suggestIngredients = async (mealName: string): Promise<Ingredient[] | null> => {
  try {
    // Initialise le client AI uniquement lorsque la fonction est appelée.
    // Cela garantit que la clé API la plus récente (sélectionnée via le modal) est utilisée.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `Liste les ingrédients essentiels pour préparer un plat de "${mealName}" pour 4 personnes. Inclus des quantités et des unités réalistes. Retourne la réponse sous la forme d'un tableau JSON d'objets. Chaque objet doit avoir les clés "name" (string), "quantity" (number), et "unit" (string). L'unité doit être l'une des suivantes : 'g' (pour le poids), 'ml' (pour le volume), ou 'unité' (pour les pièces). Par exemple, pour "Spaghetti Bolognaise", retourne [{"name": "viande hachée", "quantity": 500, "unit": "g"}, {"name": "spaghetti", "quantity": 400, "unit": "g"}, {"name": "oignon", "quantity": 1, "unit": "unité"}]. Ne retourne que le tableau JSON, sans texte supplémentaire ni démarqueurs de code.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING, description: "Nom de l'ingrédient" },
                quantity: { type: Type.NUMBER, description: "Quantité de l'ingrédient" },
                unit: { type: Type.STRING, description: "Unité de mesure ('g', 'ml', ou 'unité')" }
            },
            required: ["name", "quantity", "unit"],
          },
        },
      },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
        console.warn("Gemini API returned an empty response.");
        return [];
    }
    
    const ingredients = JSON.parse(jsonText);

    if (Array.isArray(ingredients) && ingredients.every(i => 
        typeof i.name === 'string' && 
        typeof i.quantity === 'number' && 
        typeof i.unit === 'string' &&
        ALLOWED_UNITS.includes(i.unit as Unit)
    )) {
      return ingredients as Ingredient[];
    } else {
      console.error("Gemini API did not return a valid Ingredient array:", ingredients);
      return [];
    }

  } catch (error) {
    console.error("Error fetching ingredient suggestions:", error);
    let errorMessage = "Une erreur est survenue lors de la suggestion d'ingrédients.";
    
    if (error instanceof Error) {
        if (error.message.includes('API key not valid') || error.message.includes('provide an API key')) {
            errorMessage = "La clé d'API (API Key) est manquante.\n\nVeuillez utiliser le bouton 'Suggérer' pour ouvrir la boîte de dialogue et sélectionner une clé API valide.";
        } else if (error.message.includes('Requested entity was not found')) {
            errorMessage = "La clé d'API sélectionnée semble invalide ou n'a pas les autorisations nécessaires.\n\nVeuillez réessayer en sélectionnant une autre clé API.";
        } else if (error instanceof ReferenceError && error.message.includes('process is not defined')) {
            errorMessage = "L'environnement de l'application n'est pas correctement configuré pour accéder aux clés d'API.";
        } else {
            errorMessage += `\n\nVeuillez réessayer plus tard. Détails techniques : ${error.message}`;
        }
    } else if (typeof error === 'string') {
        errorMessage += `\n\nVeuillez réessayer plus tard. Détails techniques : ${error}`;
    } else {
        errorMessage += "\n\nVeuillez réessayer plus tard."
    }

    alert(errorMessage);
    return null; // Return null to indicate an error occurred
  }
};
