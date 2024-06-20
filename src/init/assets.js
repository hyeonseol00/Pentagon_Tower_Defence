import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import commonDataSchema from '../mongodb/schemas/common-data.schema.js';
import monsterSchema from '../mongodb/schemas/monster.schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basePath = path.join(__dirname, '../../assets');
let gameAssets = {};

const readFileAsync = (filename) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(basePath, filename), 'utf8', (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(JSON.parse(data));
    });
  });
};

export const loadGameAssets = async () => {
  try {
    const [monster, commonData] = await Promise.all([
      monsterSchema.find().exec(),
      commonDataSchema.find().exec(),
    ]);
    gameAssets = { monster, commonData };
    return gameAssets;
  } catch (error) {
    throw new Error('에셋 데이터 로드에 실패했습니다: ' + error.message);
  }
};

export const getGameAssets = () => {
  return gameAssets;
};
