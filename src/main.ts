import { RandomFeed } from "./feed";

function main(): void {
  console.log("Production line simulation");

  const feed = new RandomFeed({ empty: 1, A: 1, B: 1 }, 1);

  for(let i=0; i < 10; i++) {
    console.log(`Item ${i} is ${feed.next()}`);
  }
}

main();
