export type Unit = 'g' | 'ml' | 'unité';

export interface Ingredient {
  name: string;
  quantity: number;
  unit: Unit;
}

export interface Meal {
  id: number;
  name: string;
  ingredients: Ingredient[];
  baseServings: number;
}

export interface AggregatedIngredient {
  name: string;
  quantity: number;
  unit: string;
  fromMeals: string[];
}
