import Chance from "chance";
import { COMPONENTS, type Component, type ItemSlot } from "./item";


export type FeedWeights = Record<Component | "empty", number>;

export class Feed {
  private readonly chance: Chance.Chance;
  private readonly outcomes: ItemSlot[] = [null, ...COMPONENTS];
  private readonly outcomeWeights: number[];

  constructor(weights: FeedWeights, seed: number) {
    this.chance = new Chance(seed);
    this.outcomeWeights = [
      weights.empty,
      ...COMPONENTS.map((component) => weights[component]),
    ];
  }

  next(): ItemSlot {
    return this.chance.weighted(this.outcomes, this.outcomeWeights);
  }
}
