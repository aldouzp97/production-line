import Chance from "chance";
import { readFileSync } from "node:fs";
import { parseConfig, type Config } from "./config";
import { ConveyerBelt } from "./conveyer-belt";
import { RandomFeed } from "./feed";
import { Item } from "./item";
import { Simulation } from "./simulation";
import { Station } from "./station";
import { isDefined } from "./utils";
import { Worker } from "./worker";

function readConfig(): Config {
  const configPath = process.argv[2];
  return parseConfig(
    isDefined(configPath) ? JSON.parse(readFileSync(configPath, "utf8")) : {},
  );
}

function createSimulation(config: Config, seed: number): Simulation {
  const belt = new ConveyerBelt(config.beltLength);
  const stations = config.stations.map(
    ({ position, workers }) =>
      new Station(
        position,
        Array.from({ length: workers }, () => new Worker(config.assemblySteps)),
      ),
  );
  const feed = new RandomFeed(config.feedWeights, seed);

  return new Simulation(belt, stations, feed);
}

function main(): void {
  const config = readConfig();
  const seed = config.seed ?? new Chance().natural();
  const result = createSimulation(config, seed).run(config.steps);

  console.log(`Seed: ${seed}`);
  console.log(`Finished products: ${result.products}`);
  console.log(`Unused component A: ${result.unusedComponents[Item.A]}`);
  console.log(`Unused component B: ${result.unusedComponents[Item.B]}`);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
}
