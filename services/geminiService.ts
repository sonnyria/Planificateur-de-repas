import { GoogleGenAI, Type } from "@google/genai";
import type { Ingredient, Unit } from "../types";

const ALLOWED_UNITS: Unit[] = ['g', 'ml', 'unité'];

export const suggestIngredients = async (mealName: string): Promise<Ingredient[]> => {
  try {
    // Initialise le client AI uniquement lorsque la fonction est appelée.
    // Cela empêche un échec d'initialisation de planter toute l'application au démarrage.
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
        // More user-friendly messages for common configuration errors
        if (error.message.includes('API key not valid') || error.message.includes('provide an API key')) {
            errorMessage = "La clé d'API (API Key) fournie n'est pas valide ou est manquante.\n\nAssurez-vous que la variable d'environnement API_KEY est correctement configurée dans votre environnement de déploiement (par exemple, dans les paramètres du site Netlify).";
        } else if (error instanceof ReferenceError && error.message.includes('process is not defined')) {
            errorMessage = "L'environnement de l'application n'est pas correctement configuré pour accéder aux clés d'API.\n\nCette erreur se produit généralement lorsque l'application est exécutée dans un navigateur sans étape de build pour gérer les variables d'environnement.";
        } else {
            // Generic error for other cases
            errorMessage += `\n\nVeuillez réessayer plus tard. Détails techniques : ${error.message}`;
        }
    } else if (typeof error === 'string') {
        errorMessage += `\n\nVeuillez réessayer plus tard. Détails techniques : ${error}`;
    } else {
        errorMessage += "\n\nVeuillez réessayer plus tard."
    }

    alert(errorMessage);
    return [];
  }
};