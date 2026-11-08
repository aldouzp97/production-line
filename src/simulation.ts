import type { ConveyerBelt } from "./conveyer-belt";
import type { Feed } from "./feed";
import { COMPONENTS, Item, type Component, type ItemSlot } from "./item";
import type { Station } from "./station";
import { assertTruthy, isDefined } from "./utils";

type ItemCounts = Record<Item, number>;

export interface SimulationResult {
  products: number;
  unusedComponents: Record<Component, number>;
}

function emptyCounts(): ItemCounts {
  return { [Item.A]: 0, [Item.B]: 0, [Item.Product]: 0 };
}

function addTo(counts: ItemCounts, slot: ItemSlot): void {
  if (isDefined(slot)) {
    counts[slot] += 1;
  }
}

function countItems(slots: readonly ItemSlot[]): ItemCounts {
  const counts = emptyCounts();

  for (const slot of slots) {
    addTo(counts, slot);
  }

  return counts;
}

export class Simulation {
  private readonly conveyerBelt: ConveyerBelt;
  private readonly stations: Station[];
  private readonly feed: Feed;
  private readonly enteredBelt = emptyCounts();
  private readonly leftBelt = emptyCounts();

  constructor(belt: ConveyerBelt, stations: Station[], feed: Feed) {
    this.conveyerBelt = belt;
    this.stations = stations;
    this.feed = feed;
  }

  run(steps: number): SimulationResult {
    assertTruthy(
      Number.isInteger(steps) && steps >= 0,
      `Steps must be a non-negative integer, got ${steps}`,
    );

    for (let step = 0; step < steps; step++) {
      this.progressStep();
      this.assertNothingLost();
    }

    return {
      products: this.leftBelt[Item.Product],
      unusedComponents: {
        [Item.A]: this.leftBelt[Item.A],
        [Item.B]: this.leftBelt[Item.B],
      },
    };
  }

  // The belt moves first, then workers act on the slot now in front of them.
  private progressStep(): void {
    const incomingItem = this.feed.next();
    assertTruthy(
      incomingItem !== Item.Product,
      "The feed cannot supply finished products",
    );

    const outgoingItem = this.conveyerBelt.advance(incomingItem);

    addTo(this.enteredBelt, incomingItem);
    addTo(this.leftBelt, outgoingItem);

    for (const station of this.stations) {
      station.progressStep(this.conveyerBelt);
    }
  }

  // Every item fed in must still be on the belt, in a worker's hands, off the end, or assembled.
  private assertNothingLost(): void {
    const onBelt = countItems(this.conveyerBelt.items);
    const held = countItems(
      this.stations.flatMap((station) => station.itemsHeld),
    );

    const assembled = this.stations.reduce(
      (total, station) => total + station.productsAssembled,
      0,
    );

    for (const component of COMPONENTS) {
      const accountedFor =
        onBelt[component] +
        held[component] +
        this.leftBelt[component] +
        assembled;

      assertTruthy(
        accountedFor === this.enteredBelt[component],
        `${component}: accounted for ${accountedFor} but ${this.enteredBelt[component]} were fed in`,
      );
    }

    const products =
      onBelt[Item.Product] + held[Item.Product] + this.leftBelt[Item.Product];

    assertTruthy(
      products === assembled,
      `Products: accounted for ${products} but ${assembled} were assembled`,
    );
  }
}
