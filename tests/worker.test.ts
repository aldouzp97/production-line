import { test } from "node:test";
import { Item, type ItemSlot } from "../src/item";
import { assertEqual, assertThrows } from "../src/utils";
import { Worker } from "../src/worker";

const ASSEMBLY_STEPS = 4;

function step(worker: Worker, itemInFront: ItemSlot): ItemSlot {
  worker.assembling();
  return worker.tryAct(itemInFront);
}

test("picks up one of each component, in either order", () => {
  for (const [first, second] of [
    [Item.A, Item.B],
    [Item.B, Item.A],
  ] as const) {
    const worker = new Worker(ASSEMBLY_STEPS);

    assertEqual(step(worker, first), null);
    assertEqual(step(worker, second), null);
  }
});

test("leaves products and components it already holds on the belt", () => {
  const worker = new Worker(ASSEMBLY_STEPS);

  assertEqual(step(worker, Item.Product), Item.Product);
  assertEqual(step(worker, Item.A), null);
  assertEqual(step(worker, Item.A), Item.A);
});

test("can place the product on the fourth step after the last pickup, not before", () => {
  const worker = new Worker(ASSEMBLY_STEPS);
  step(worker, Item.A);
  step(worker, Item.B);

  assertEqual(step(worker, null), null);
  assertEqual(step(worker, null), null);
  assertEqual(step(worker, null), null);
  assertEqual(step(worker, null), Item.Product);
});

test("assembly length is configurable", () => {
  const worker = new Worker(1);
  step(worker, Item.A);
  step(worker, Item.B);

  assertEqual(step(worker, null), Item.Product);
});

test("leaves items on the belt while assembling", () => {
  const worker = new Worker(ASSEMBLY_STEPS);
  step(worker, Item.A);
  step(worker, Item.B);

  assertEqual(step(worker, Item.A), Item.A);
  assertEqual(step(worker, Item.B), Item.B);
});

test("waits for an empty slot, and collects nothing while holding a product", () => {
  const worker = new Worker(ASSEMBLY_STEPS);
  step(worker, Item.A);
  step(worker, Item.B);
  step(worker, null);
  step(worker, null);
  step(worker, null);

  assertEqual(step(worker, Item.A), Item.A);
  assertEqual(step(worker, Item.B), Item.B);
  assertEqual(step(worker, null), Item.Product);
});

test("can start collecting again after placing a product", () => {
  const worker = new Worker(1);
  step(worker, Item.A);
  step(worker, Item.B);
  step(worker, null);

  assertEqual(step(worker, Item.A), null);
});

test("rejects invalid assembly lengths", () => {
  assertThrows(() => new Worker(0));
  assertThrows(() => new Worker(1.5));
});
