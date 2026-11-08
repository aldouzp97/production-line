import type { ConveyerBelt } from "./conveyer-belt";
import { Item } from "./item";
import { assertTruthy } from "./utils";
import type { Worker } from "./worker";

const MAX_WORKERS = 2;

export class Station {
  private readonly beltPosition: number;
  private readonly workers: Worker[];

  // Workers are in priority order - top worker will always go first if both workers are able to act.
  constructor(beltPosition: number, workers: Worker[]) {
    assertTruthy(
      workers.length > 0 && workers.length <= MAX_WORKERS,
      `A station needs at least 1 worker. There can only be up to ${MAX_WORKERS} per station. Got ${workers.length}`,
    );

    this.beltPosition = beltPosition;
    this.workers = workers;
  }

  get itemsHeld(): Item[] {
    return this.workers.flatMap((worker) => [...worker.itemsHeld]);
  }

  get productsAssembled(): number {
    return this.workers.reduce(
      (total, worker) => total + worker.totalProductsAssembled,
      0,
    );
  }

  progressStep(belt: ConveyerBelt): void {
    for (const worker of this.workers) {
      worker.progressAssembly();
    }

    const itemInFront = belt.itemAt(this.beltPosition);

    for (const worker of this.workers) {
      const slotContents = worker.tryAct(itemInFront);

      // unchanged slot means worker has done nothing to the conveyer belt slot
      if (slotContents !== itemInFront) {
        belt.setItemAt(this.beltPosition, slotContents);
        return;
      }
    }
  }
}
