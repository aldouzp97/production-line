import { test } from "node:test";
import { ConveyerBelt } from "../src/conveyer-belt";
import { RandomFeed, type Feed } from "../src/feed";
import { Item, type ItemSlot } from "../src/item";
import { Simulation } from "../src/simulation";
import { Station } from "../src/station";
import { assertEqual, assertThrows } from "../src/utils";
import { Worker } from "../src/worker";

const ASSEMBLY_STEPS = 4;

// Plays back a fixed sequence, then supplies empty slots.
function scriptedFeed(items: ItemSlot[]): Feed {
  let index = 0;
  return { next: () => items[index++] ?? null };
}

function singleWorkerSimulation(items: ItemSlot[]): Simulation {
  const station = new Station(0, [new Worker(ASSEMBLY_STEPS)]);
  return new Simulation(new ConveyerBelt(1), [station], scriptedFeed(items));
}

function specSimulation(seed: number): Simulation {
  const stations = [0, 1, 2].map(
    (position) =>
      new Station(position, [new Worker(ASSEMBLY_STEPS), new Worker(ASSEMBLY_STEPS)]),
  );
  return new Simulation(
    new ConveyerBelt(3),
    stations,
    new RandomFeed({ empty: 1, A: 1, B: 1 }, seed),
  );
}

test("with no stations, every component goes off the end unused", () => {
  const feed = scriptedFeed([Item.A, Item.B, Item.A]);
  const simulation = new Simulation(new ConveyerBelt(1), [], feed);

  const result = simulation.run(4);

  assertEqual(result.products, 0);
  assertEqual(result.unusedComponents.A, 2);
  assertEqual(result.unusedComponents.B, 1);
});

test("items still on the belt when the run ends are not counted", () => {
  const feed = scriptedFeed([Item.A]);
  const simulation = new Simulation(new ConveyerBelt(3), [], feed);

  assertEqual(simulation.run(3).unusedComponents.A, 0);
  assertEqual(simulation.run(1).unusedComponents.A, 1);
});

test("a finished product comes off the end after assembly, not before", () => {
  // Steps 1-2 pick up A and B, 3-5 assemble, 6 places, and 7 moves it off the belt.
  const simulation = singleWorkerSimulation([Item.A, Item.B]);

  assertEqual(simulation.run(6).products, 0);
  assertEqual(simulation.run(1).products, 1);
});

test("components a worker picks up are not counted as unused", () => {
  const simulation = singleWorkerSimulation([Item.A, Item.A]);

  const result = simulation.run(3);

  // The first A is picked up. The second is already held, so it goes off the end.
  assertEqual(result.unusedComponents.A, 1);
});

test("the same seed gives the same result", () => {
  const first = specSimulation(7).run(100);
  const second = specSimulation(7).run(100);

  assertEqual(first.products, second.products);
  assertEqual(first.unusedComponents.A, second.unusedComponents.A);
  assertEqual(first.unusedComponents.B, second.unusedComponents.B);
});

test("rejects a feed that supplies finished products", () => {
  const simulation = singleWorkerSimulation([Item.Product]);

  assertThrows(() => simulation.run(1));
});

test("rejects invalid step counts", () => {
  const simulation = singleWorkerSimulation([]);

  assertThrows(() => simulation.run(-1));
  assertThrows(() => simulation.run(1.5));
});
