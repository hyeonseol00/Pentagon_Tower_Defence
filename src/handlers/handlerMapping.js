import { moveStageHandler } from './stage.handler.js';

const handlerMappings = {
  2: gameStart,
  3: gameEnd,
  11: moveStageHandler,
  21: addInitialTowerHandler,
  22: purchaseTowerHandler,
  23: monsterKilledHandler,
  24: monsterAttackedBaseHandler
};

export default handlerMappings;
