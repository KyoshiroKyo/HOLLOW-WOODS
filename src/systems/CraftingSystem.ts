import itemsData from '../data/items.json';
import { PlayerState } from '../state/PlayerState';

export interface CraftingRecipe {
  id: string;
  resultItemId: string;
  resultCount: number;
  name: string;
  description: string;
  ingredients: { itemId: string; count: number }[];
}

export class CraftingSystem {
  private playerState: PlayerState;
  public recipes: CraftingRecipe[];

  constructor() {
    this.playerState = PlayerState.getInstance();
    this.recipes = itemsData.recipes as CraftingRecipe[];
  }

  public canCraft(recipe: CraftingRecipe): boolean {
    for (const ing of recipe.ingredients) {
      if (this.playerState.getItemCount(ing.itemId) < ing.count) {
        return false;
      }
    }
    return true;
  }

  public craft(recipeId: string): boolean {
    const recipe = this.recipes.find(r => r.id === recipeId);
    if (!recipe || !this.canCraft(recipe)) return false;

    // Trừ nguyên liệu
    for (const ing of recipe.ingredients) {
      this.playerState.removeItem(ing.itemId, ing.count);
    }

    // Thêm thành phẩm vào túi đồ
    this.playerState.addItem(recipe.resultItemId, recipe.resultCount);

    // Kích hoạt cờ chế tạo đầu tiên hoàn tất
    this.playerState.setFlag('craft_complete');

    return true;
  }
}

