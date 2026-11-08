import { ItemSlot } from "./item";
import { assertTruthy } from "./utils";

export class Belt {
  private readonly slots: ItemSlot[];

  constructor(length: number) {
    assertTruthy(
      Number.isInteger(length) && length > 0,
      `Belt length must be a positive integer, got ${length}`,
    );

    this.slots = new Array<ItemSlot>(length).fill(null);
  }

  get length(): number {
    return this.slots.length;
  }

  private assertOnBelt(position: number): void {
    assertTruthy(
      Number.isInteger(position) && position >= 0 && position < this.length,
      `Position ${position} is not on a belt of length ${this.length}`,
    );
  }

  // Moves all items on belt one slot forward and returns what item has exited the belt
  advance(incoming: ItemSlot): ItemSlot {
    const outgoing = this.slots.pop() ?? null;
    this.slots.unshift(incoming);
    return outgoing;
  }

  itemAt(position: number): ItemSlot {
    this.assertOnBelt(position);
    return this.slots[position];
  }

  setItemAt(position: number, content: ItemSlot): void {
    this.assertOnBelt(position);
    this.slots[position] = content;
  }
}
