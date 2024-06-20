import { baseUnderAttack } from './base.handler.js';
import { gameEnd, gameStart } from './game.handler.js';
import { killMonsterHandler } from './monster.handler.js';
import {
  placeInitialTowerHandler,
  placeTowerHandler,
} from './tower.handler.js';

const handlerMappings = {
  2: gameStart,
  3: gameEnd,
  21: placeInitialTowerHandler,
  22: placeTowerHandler,
  23: killMonsterHandler,
  24: baseUnderAttack,
};

export default handlerMappings;
