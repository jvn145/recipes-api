import { Static, Type } from "@sinclair/typebox";

export const Ingredient = Type.Object({
  ingredient_id: Type.Optional(Type.Integer()),
  ingredient_name: Type.String(),
});

export const IngredientList = Type.Array(Ingredient);

export type IngredientType = Static<typeof Ingredient>;
export type IngredientListType = Static<typeof IngredientList>;
