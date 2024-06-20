import { gameStart, gameEnd } from './game.handler.js';
import {
  addInitialTowerHandler,
  purchaseTowerHandler,
  refundTowerHandler,
  upgradeTowerHandler,
  epicTowerHandler,
} from './tower.handler.js';
import { monsterKilledHandler } from './monster.handler.js';
import { monsterAttackedBaseHandler } from './base.handler.js';

const handlerMappings = {
  2: gameStart,
  3: gameEnd,
  21: addInitialTowerHandler,
  22: purchaseTowerHandler,
  23: monsterKilledHandler,
  24: monsterAttackedBaseHandler,
  25: refundTowerHandler,
  26: upgradeTowerHandler,
  27: epicTowerHandler,
};

export default handlerMappings;
