import { runActor } from '../../../runners/javascript/run-actor.mjs';

await runActor({
  actorRef: 'luminar/booking-hotels-scraper-private-v1',
  inputFile: new URL('../inputs/quick-start.json', import.meta.url),
});
