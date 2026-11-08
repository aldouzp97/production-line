import { z } from "zod";
import { MAX_WORKERS } from "./station";

// Defaults follow the brief: three pairs of workers, 100 steps, and a 1/3 chance of each feed outcome.
const DEFAULT_STATIONS = [
  { position: 0, workers: 2 },
  { position: 1, workers: 2 },
  { position: 2, workers: 2 },
];

const stationSchema = z.strictObject({
  position: z.int().nonnegative(),
  workers: z.int().min(1).max(MAX_WORKERS),
});

const feedWeightsSchema = z
  .strictObject({
    empty: z.number().nonnegative(),
    A: z.number().nonnegative(),
    B: z.number().nonnegative(),
  })
  .refine((weights) => weights.empty + weights.A + weights.B > 0, {
    message: "At least one feed weight must be above zero",
  });

const configSchema = z
  .strictObject({
    steps: z.int().nonnegative().default(100),
    beltLength: z.int().positive().default(3),
    assemblySteps: z.int().positive().default(4),
    stations: z.array(stationSchema).default(DEFAULT_STATIONS),
    feedWeights: feedWeightsSchema.default({ empty: 1, A: 1, B: 1 }),
    seed: z.int().optional(),
  })
  .refine(
    (config) => config.stations.every((station) => station.position < config.beltLength),
    { message: "Every station must be on the belt", path: ["stations"] },
  )
  .refine(
    (config) => {
      const positions = config.stations.map((station) => station.position);
      return new Set(positions).size === positions.length;
    },
    { message: "Only one station can be at each position", path: ["stations"] },
  );

export type Config = z.infer<typeof configSchema>;

export function parseConfig(input: unknown): Config {
  const result = configSchema.safeParse(input);

  if (!result.success) {
    throw new Error(`Invalid config:\n${z.prettifyError(result.error)}`);
  }

  return result.data;
}
