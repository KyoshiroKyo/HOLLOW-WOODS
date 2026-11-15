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
    if (!recipe || !Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) {
      return false;
    }
    for (const ing of recipe.ingredients) {
      if (!ing.itemId || ing.count <= 0) {
        return false;
      }
      if (this.playerState.getItemCount(ing.itemId) < ing.count) {
        return false;
      }
    }
    return true;
  }

  public craft(recipeId: string): boolean {
    if (!recipeId) return false;
    const recipe = this.recipes.find(r => r.id === recipeId);
    if (!recipe || recipe.resultCount <= 0 || !this.canCraft(recipe)) {
      return false;
    }

    // Trừ nguyên liệu chính xác và chống âm số lượng (Atomic Ingredient Deduction)
    const deducted: { itemId: string; count: number }[] = [];
    for (const ing of recipe.ingredients) {
      if (!this.playerState.removeItem(ing.itemId, ing.count)) {
        for (const rollback of deducted) {
          this.playerState.addItem(rollback.itemId, rollback.count);
        }
        return false;
      }
      deducted.push({ itemId: ing.itemId, count: ing.count });
    }

    // Thêm thành phẩm vào túi đồ
    this.playerState.addItem(recipe.resultItemId, recipe.resultCount);

    // Ghi nhận cờ riêng theo đúng công thức (setFlag chống phát lặp sự kiện)
    this.playerState.setFlag(`crafted_${recipe.id}`);

    // Chỉ hoàn thành nhiệm vụ Dầu Đèn Q03 khi chế tạo đúng công thức craft_lantern_oil
    if (recipe.id === 'craft_lantern_oil') {
      this.playerState.setFlag('craft_lantern_oil_complete');
    }

    return true;
  }
}

