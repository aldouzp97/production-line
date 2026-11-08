import assert from "node:assert/strict";
import { test } from "node:test";
import { ConveyerBelt } from "../src/belt";
import { Item } from "../src/item";

test("items move forward one slot per advance and fall off the end", () => {
  const belt = new ConveyerBelt(2);

  assert.equal(belt.advance(Item.A), null);
  assert.equal(belt.itemAt(0), Item.A);

  assert.equal(belt.advance(Item.B), null);
  assert.equal(belt.itemAt(0), Item.B);
  assert.equal(belt.itemAt(1), Item.A);

  assert.equal(belt.advance(null), Item.A);
  assert.equal(belt.itemAt(0), null);
  assert.equal(belt.itemAt(1), Item.B);
});

test("length never changes as the belt advances", () => {
  const belt = new ConveyerBelt(3);

  for (let step = 0; step < 10; step++) {
    belt.advance(Item.A);
  }

  assert.equal(belt.length, 3);
});

test("set replaces the contents of a slot", () => {
  const belt = new ConveyerBelt(3);

  belt.setItemAt(1, Item.Product);

  assert.equal(belt.itemAt(1), Item.Product);
});

test("rejects positions off the belt", () => {
  const belt = new ConveyerBelt(3);

  assert.throws(() => belt.itemAt(-1));
  assert.throws(() => belt.itemAt(3));
  assert.throws(() => belt.setItemAt(3, Item.A));
});

test("rejects invalid belt lengths", () => {
  assert.throws(() => new ConveyerBelt(0));
  assert.throws(() => new ConveyerBelt(2.5));
});
