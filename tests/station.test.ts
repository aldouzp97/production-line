import { test } from "node:test";
import { ConveyerBelt } from "../src/conveyer-belt";
import { Item } from "../src/item";
import { Station } from "../src/station";
import { assertEqual, assertThrows } from "../src/utils";
import { Worker } from "../src/worker";

const ASSEMBLY_STEPS = 4;

function workerHoldingBothComponents(assemblySteps: number): Worker {
  const worker = new Worker(assemblySteps);
  worker.tryAct(Item.A);
  worker.tryAct(Item.B);
  return worker;
}

test("only one worker acts on the slot per step, top worker first", () => {
  const top = new Worker(ASSEMBLY_STEPS);
  const bottom = new Worker(ASSEMBLY_STEPS);
  const station = new Station(0, [top, bottom]);
  const belt = new ConveyerBelt(1);

  belt.setItemAt(0, Item.A);
  station.progressStep(belt);
  assertEqual(belt.itemAt(0), null);

  // Top already holds an A, so the bottom worker takes this one.
  belt.setItemAt(0, Item.A);
  station.progressStep(belt);
  assertEqual(belt.itemAt(0), null);

  // Both workers now hold an A, so this one stays on the belt.
  belt.setItemAt(0, Item.A);
  station.progressStep(belt);
  assertEqual(belt.itemAt(0), Item.A);
});

test("bottom worker can act while the top worker is assembling", () => {
  const top = workerHoldingBothComponents(ASSEMBLY_STEPS);
  const bottom = new Worker(ASSEMBLY_STEPS);
  const station = new Station(0, [top, bottom]);
  const belt = new ConveyerBelt(1);

  belt.setItemAt(0, Item.A);
  station.progressStep(belt);

  assertEqual(belt.itemAt(0), null);
});

test("assembly progresses for a worker even when the other worker uses the slot", () => {
  const top = new Worker(ASSEMBLY_STEPS);
  const bottom = workerHoldingBothComponents(2);
  const station = new Station(0, [top, bottom]);
  const belt = new ConveyerBelt(1);

  belt.setItemAt(0, Item.A);
  station.progressStep(belt);
  belt.setItemAt(0, Item.B);
  station.progressStep(belt);

  belt.setItemAt(0, null);
  station.progressStep(belt);

  assertEqual(belt.itemAt(0), Item.Product);
});

test("a station can have a single worker", () => {
  const station = new Station(0, [new Worker(ASSEMBLY_STEPS)]);
  const belt = new ConveyerBelt(1);

  belt.setItemAt(0, Item.A);
  station.progressStep(belt);

  assertEqual(belt.itemAt(0), null);
});

test("only touches the slot at its own position", () => {
  const station = new Station(1, [new Worker(ASSEMBLY_STEPS)]);
  const belt = new ConveyerBelt(3);
  belt.setItemAt(0, Item.Product);
  belt.setItemAt(1, Item.B);
  belt.setItemAt(2, Item.Product);

  station.progressStep(belt);

  assertEqual(belt.itemAt(0), Item.Product);
  assertEqual(belt.itemAt(1), null);
  assertEqual(belt.itemAt(2), Item.Product);
});

test("rejects stations with no workers or more than two", () => {
  const worker = () => new Worker(ASSEMBLY_STEPS);

  assertThrows(() => new Station(0, []));
  assertThrows(() => new Station(0, [worker(), worker(), worker()]));
});
