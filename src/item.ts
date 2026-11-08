export enum Item {
  A = "A",
  B = "B",
  Product = "P",
}

export type ItemSlot = Item | null;

export const COMPONENTS = [Item.A, Item.B] as const;

export type Component = (typeof COMPONENTS)[number];
