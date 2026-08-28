import { runActor } from '../../../runners/javascript/run-actor.mjs';

await runActor({
  actorRef: 'luminar/gleif-lei-change-monitor',
  inputFile: new URL('../inputs/quick-start.json', import.meta.url),
});
