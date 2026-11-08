# Production Line

This is a simulation of a factory conveyor belt where workers combine components A and B into finished products. You can find the coding challenge instructions in `coding-challenge.jpg`.

## Quick start

You'll need pnpm and the Node version in `.nvmrc`.

```sh
pnpm install
pnpm start                       # defaults from the brief, random seed (printed)
pnpm start config.example.json   # custom config; omitted fields use the defaults
pnpm start --verbose             # also logs the belt and workers on every step
pnpm test
pnpm typecheck
```

In the verbose log, `in` is what entered the belt on that step, `S0` is the station at belt position 0, and its workers are listed top first. `[A B:3]` means that worker is assembling with 3 steps left, and `-` is an empty belt slot.

The seed gets printed on every run. If you want to replay a run, add that number as `"seed"` in your config file.

**Note:** Results vary quite a bit from run to run, so I would compare setups by averaging over lots of seeds rather than trusting a single run. With the defaults you should see about 25 finished products and 8 unused components on average over 2,000 seeds.

## Assumptions

The brief leaves a few things open, so these are the assumptions I went with:

- Only component A, component B and finished products can be on the belt.
- In each step the belt moves first, then the workers act on the slot in front of them.
- When two workers face each other at the same slot, the top worker has priority. If the top worker isn't doing anything with the slot, because they're assembling or don't need that item, the bottom worker can use it.
- Each station (a space along the belt) can have one or two workers.
- The belt is 3 slots long by default. The brief doesn't give a length, and 3 is the shortest belt that fits three pairs of workers.
- Only items that come off the end of the belt are counted. Anything still on the belt when the simulation finishes is ignored.
- Workers only pick up a component they aren't already holding, in any order, and they never pick up a finished product off the belt.
- A worker holding a product has to place it before collecting new components, even with a free hand.
- If a worker picks up their last component at step t, they can't touch the belt until t+4. If the slot in front of them is occupied at that point, they wait for an empty one before placing the product.

## Flexibility

Belt length, step count, assembly time, feed weights, seed and station positions can all be changed in the config. The product recipe (A + B) and the workers' priority are fixed.

I could also imagine there being a three-component recipe. However it wouldn't fit in two hands (if workers are humans), so I would treat supporting other recipes as a rewrite rather than an extension.

## With more time

If I had more time, these are the things I would add:

- A command to average results over lots of seeds. The averages in this README came from one-off scripts, so this would let you reproduce them and compare different setups easily.
- Tests for the config. Zod is well tested, but the rules I added on top of it, like stations having to be on the belt and not sharing a position, aren't covered yet.
- More runtime validation within the classes. Some rules, like no two stations sharing a position, are only checked in `config.ts`. I would check these in the classes as well, so they stay valid when created without the config.
- Choosing which side a worker stands on, as described below.

### Choosing a worker's side

A station's config sets how many workers it has, not which side they stand on. This doesn't change the results for a single worker, since top and bottom only matter when two workers want the same slot. A run with only top workers and a run with only bottom workers gave the same results.

If you wanted the config to match the physical layout, for example a station with only a bottom worker, I would replace the `workers` count with two flags:

```json
{ "position": 0, "top": false, "bottom": true }
```

To do this you would need to:

- Change `stationSchema` in `config.ts` to take `top` and `bottom` booleans, both defaulting to `true`, and reject a station where both are `false`.
- Update `createSimulation` to build the worker list from those flags with the top worker first, since the order of the list sets the priority.

`Station`, `Worker` and `Simulation` wouldn't need to change.
