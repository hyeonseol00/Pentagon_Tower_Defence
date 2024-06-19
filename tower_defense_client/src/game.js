import { Base } from './base.js';
import { Monster } from './monster.js';
import { Tower } from './tower.js';
import { CLIENT_VERSION } from './constants.js';
import { getAuthToken } from './GaApplication.js';

let serverSocket; // 서버 웹소켓 객체
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const NUM_OF_MONSTERS = 5; // 몬스터 개수

let userGold = 0; // 유저 골드
let base; // 기지 객체
let baseHp = 0; // 기지 체력

let towerCost = 50; // 타워 구입 비용 초기화 (원하는 값으로 설정)
let numOfInitialTowers = 3; // 초기 타워 개수 설정
let monsterLevel = 1; // 몬스터 레벨 초기화 (원하는 값으로 설정)
let monsterSpawnInterval = 3000; // 몬스터 생성 주기 초기화 (원하는 값으로 설정)
const monsters = [];
const towers = [];

let score = 0; // 게임 점수
let highScore = 0; // 기존 최고 점수
let isInitGame = false;

// 이미지 로딩 파트 (생략)

let monsterPath;

function generateRandomMonsterPath() {
  // 경로 생성 로직 (생략)
}

function initMap() {
  // 맵 초기화 로직 (생략)
}

function getRandomPositionNearPath(maxDistance) {
  // 랜덤 위치 생성 로직 (생략)
}

function placeInitialTowers() {
  for (let i = 0; i < numOfInitialTowers; i++) {
    const { x, y } = getRandomPositionNearPath(200);
    const tower = new Tower(x, y); // 초기 타워 생성 (타워 비용 필요 없음)
    towers.push(tower);
    tower.draw(ctx, towerImage);

    // 최초 타워 추가 이벤트
    sendEvent(21, {
      newTowerCoordinate: [x, y],
      towerCoordinates: towers,
    });
  }
}

function placeNewTower() {
  if (userGold >= towerCost) {
    const { x, y } = getRandomPositionNearPath(200);
    const tower = new Tower(x, y, towerCost); // 타워 비용을 포함한 새로운 타워 생성
    towers.push(tower);
    tower.draw(ctx, towerImage);

    // 타워 구입 이벤트
    sendEvent(22, {
      newTowerCoordinate: [x, y],
      gold: userGold,
    });
  } else {
    console.log('골드가 부족합니다!');
  }
}

function placeBase() {
  const lastPoint = monsterPath[monsterPath.length - 1];
  base = new Base(lastPoint.x, lastPoint.y, baseHp);
  base.draw(ctx, baseImage);
}

function spawnMonster() {
  monsters.push(new Monster(monsterPath, monsterImages, monsterLevel));
}

function gameLoop() {
  // 게임 루프 로직 (생략)
}

function initGame() {
  // 게임 초기화 로직 (생략)
}

Promise.all([
  // 이미지 로딩 완료 후 서버와 연결 및 게임 초기화 로직 (생략)
]).then(() => {
  /* 서버 접속 코드 (생략) */

  if (!isInitGame) {
    initGame();
  }
});

const sendEvent = (handlerId, payload) => {
  serverSocket.emit('event', {
    userId,
    clientVersion: CLIENT_VERSION,
    handlerId,
    payload,
  });
};

const buyTowerButton = document.createElement('button');
buyTowerButton.textContent = '타워 구입';
buyTowerButton.style.position = 'absolute';
buyTowerButton.style.top = '10px';
buyTowerButton.style.right = '10px';
buyTowerButton.style.padding = '10px 20px';
buyTowerButton.style.fontSize = '16px';
buyTowerButton.style.cursor = 'pointer';

buyTowerButton.addEventListener('click', placeNewTower);

document.body.appendChild(buyTowerButton);

export { sendEvent };
