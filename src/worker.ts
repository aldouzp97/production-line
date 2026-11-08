import { COMPONENTS, Item, type Component, type ItemSlot } from "./item";
import { assertTruthy, isDefined } from "./utils";

const NUMBER_OF_HANDS = 2;

export class Worker {
  private readonly assemblySteps: number;
  private heldItems: Item[] = [];
  private assemblyStepsLeft = 0;
  private assembledCount = 0;

  constructor(assemblySteps: number) {
    assertTruthy(
      Number.isInteger(assemblySteps) && assemblySteps > 0,
      `Assembly steps must be a positive integer, got ${assemblySteps}`,
    );
    this.assemblySteps = assemblySteps;
  }

  get itemsHeld(): readonly Item[] {
    return this.heldItems;
  }

  get totalProductsAssembled(): number {
    return this.assembledCount;
  }

  private get isAssembling(): boolean {
    return this.assemblyStepsLeft > 0;
  }

  private get hasAllComponents(): boolean {
    return COMPONENTS.every((component) => this.heldItems.includes(component));
  }

  private needs(itemInFront: ItemSlot): itemInFront is Component {
    return (
      isDefined(itemInFront) &&
      itemInFront !== Item.Product &&
      !this.heldItems.includes(itemInFront)
    );
  }

  private tryPlaceProduct(itemInFront: ItemSlot): ItemSlot {
    assertTruthy(
      this.heldItems.includes(Item.Product),
      `No assembled product to place.`,
    );

    if (isDefined(itemInFront)) {
      return itemInFront;
    }

    this.heldItems = [];
    return Item.Product;
  }

  private tryPickUp(itemInFront: ItemSlot): ItemSlot {
    if (!this.needs(itemInFront)) {
      return itemInFront;
    }

    this.heldItems.push(itemInFront);
    assertTruthy(
      this.heldItems.length <= NUMBER_OF_HANDS,
      "A worker cannot hold more than two items",
    );

    if (this.hasAllComponents) {
      this.assemblyStepsLeft = this.assemblySteps;
    }

    return null;
  }

  private finishAssembly(): void {
    assertTruthy(
      this.hasAllComponents,
      "Assembly finished without all required components",
    );
    this.heldItems = [Item.Product];
    this.assembledCount += 1;
  }

  // When worker has all required components this will run every "step"
  progressAssembly(): void {
    if (!this.isAssembling) {
      return;
    }

    this.assemblyStepsLeft -= 1;

    if (!this.isAssembling) {
      this.finishAssembly();
    }
  }

  // Returns what the slot should now contain. If the worker did nothing, that's the item already there.
  tryAct(itemInFront: ItemSlot): ItemSlot {
    if (this.isAssembling) {
      return itemInFront;
    }

    if (this.heldItems.includes(Item.Product)) {
      return this.tryPlaceProduct(itemInFront);
    }

    return this.tryPickUp(itemInFront);
  }
}
