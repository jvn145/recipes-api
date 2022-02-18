import { Static, Type } from "@sinclair/typebox";

/** Ingredients */

export const Ingredient = Type.Object({
  ingredient_id: Type.Optional(Type.Integer()),
  ingredient_name: Type.String(),
});

export const IngredientList = Type.Array(Ingredient);

export type IngredientType = Static<typeof Ingredient>;
export type IngredientListType = Static<typeof IngredientList>;

/** Recipies */

export const Recipe = Type.Object({
  recipe_id: Type.Optional(Type.Integer()),
  recipe_name: Type.Optional(Type.String()),
});
export const RecipeList = Type.Array(Recipe);

export type RecipeType = Static<typeof Recipe>;
export type RecipeListType = Static<typeof RecipeList>;
