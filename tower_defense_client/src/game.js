import { Base } from './base.js';
import { Monster } from './monster.js';
import { Tower } from './tower.js';
import './Socket.js';
import { connectServer, sendEvent } from './Socket.js';
import { id } from './user.js';

let serverSocket; // 서버 웹소켓 객체
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const NUM_OF_MONSTERS = 5; // 몬스터 개수

// ----- 서버 데이터 -----
let userGold = 0; // 유저 골드
let base; // 기지 객체
let baseHp = 100; // 기지 체력

const towerCost = 1000; // 타워 구입 비용
const upgradeCost = 2000; // 타워 업그레이드 비용

let numOfInitialTowers = 3; // 초기 타워 개수

// ---- 유저 데이터 -----
let monsterLevel = 1; // 몬스터 레벨
let monsterSpawnInterval = 1000; // 몬스터 생성 주기
const monsters = [];
const towers = [];

let score = 0; // 게임 점수
let highScore = 0; // 기존 최고 점수
let isInitGame = false;
let isUpgrading = false; // 업그레이드 모드 상태

// 이미지 로딩 파트
const backgroundImage = new Image();
backgroundImage.src = 'images/bg.webp';

const towerImage = new Image();
towerImage.src = 'images/tower.png';

// const upgradedTowerImage = new Image();
// upgradedTowerImage.src = 'images/upgraded_tower.png'; // 업그레이드된 타워 이미지

const baseImage = new Image();
baseImage.src = 'images/base.png';

const pathImage = new Image();
pathImage.src = 'images/path.png';

const monsterImages = [];
for (let i = 1; i <= NUM_OF_MONSTERS; i++) {
  const img = new Image();
  img.src = `images/monster${i}.png`;
  monsterImages.push(img);
}

let monsterPath;

function generateRandomMonsterPath() {
  const path = [];
  let currentX = 0;
  let currentY = Math.floor(Math.random() * 21) + 500; // 500 ~ 520 범위의 y 시작

  path.push({ x: currentX, y: currentY });

  while (currentX < canvas.width) {
    currentX += Math.floor(Math.random() * 100) + 50; // 50 ~ 150 범위의 x 증가
    if (currentX > canvas.width) {
      currentX = canvas.width;
    }

    currentY += Math.floor(Math.random() * 200) - 100; // -100 ~ 100 범위의 y 변경
    if (currentY < 0) {
      currentY = 0;
    }
    if (currentY > canvas.height) {
      currentY = canvas.height;
    }

    path.push({ x: currentX, y: currentY });
  }

  return path;
}

function initMap() {
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height); // 배경 이미지 그리기
  drawPath();
}

function drawPath() {
  const segmentLength = 20; // 몬스터 경로 세그먼트 길이
  const imageWidth = 60; // 몬스터 경로 이미지 너비
  const imageHeight = 60; // 몬스터 경로 이미지 높이
  const gap = 5; // 몬스터 경로 이미지 겹침 방지를 위한 간격

  for (let i = 0; i < monsterPath.length - 1; i++) {
    const startX = monsterPath[i].x;
    const startY = monsterPath[i].y;
    const endX = monsterPath[i + 1].x;
    const endY = monsterPath[i + 1].y;

    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const angle = Math.atan2(deltaY, deltaX);

    for (let j = gap; j < distance - gap; j += segmentLength) {
      const x = startX + Math.cos(angle) * j;
      const y = startY + Math.sin(angle) * j;
      drawRotatedImage(pathImage, x, y, imageWidth, imageHeight, angle);
    }
  }
}

function drawRotatedImage(image, x, y, width, height, angle) {
  ctx.save();
  ctx.translate(x + width / 2, y + height / 2);
  ctx.rotate(angle);
  ctx.drawImage(image, -width / 2, -height / 2, width, height);
  ctx.restore();
}

function getRandomPositionNearPath(maxDistance) {
  const segmentIndex = Math.floor(Math.random() * (monsterPath.length - 1));
  const startX = monsterPath[segmentIndex].x;
  const startY = monsterPath[segmentIndex].y;
  const endX = monsterPath[segmentIndex + 1].x;
  const endY = monsterPath[segmentIndex + 1].y;

  const t = Math.random();
  const posX = startX + t * (endX - startX);
  const posY = startY + t * (endY - endY);

  const offsetX = (Math.random() - 0.5) * 2 * maxDistance;
  const offsetY = (Math.random() - 0.5) * 2 * maxDistance;

  return {
    x: posX + offsetX,
    y: posY + offsetY,
  };
}

function placeInitialTowers() {
  for (let i = 0; i < numOfInitialTowers; i++) {
    const { x, y } = getRandomPositionNearPath(200);
    const tower = new Tower(x, y, towerCost, towerImage);
    towers.push(tower);
    tower.draw(ctx);
    sendEvent(42, { x, y }); // 이벤트 ID 42는 초기 타워 배치 이벤트
  }
}

function placeNewTower() {
  if (userGold < towerCost) {
    showMessage('골드가 부족합니다.');
    return;
  }

  userGold -= towerCost;

  const { x, y } = getRandomPositionNearPath(200);
  const tower = new Tower(x, y, towerCost, towerImage);
  towers.push(tower);
  tower.draw(ctx);
  sendEvent(43, { x, y }); // 이벤트 ID 43은 타워 구입 이벤트
  updateGoldDisplay();
}

function refundTower(tower) {
  const index = towers.indexOf(tower);
  if (index !== -1) {
    towers.splice(index, 1);
    userGold += tower.getRefundAmount();
    sendEvent(44, { x: tower.x, y: tower.y }); // 이벤트 ID 44는 타워 환불 이벤트
    updateGoldDisplay();
  }
}

function showMessage(message) {
  const messageBox = document.createElement('div');
  messageBox.textContent = message;
  messageBox.style.position = 'absolute';
  messageBox.style.top = '50%';
  messageBox.style.left = '50%';
  messageBox.style.transform = 'translate(-50%, -50%)';
  messageBox.style.padding = '20px';
  messageBox.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  messageBox.style.color = 'white';
  messageBox.style.fontSize = '20px';
  messageBox.style.borderRadius = '10px';
  document.body.appendChild(messageBox);

  setTimeout(() => {
    document.body.removeChild(messageBox);
  }, 2000);
}

canvas.addEventListener('click', (event) => {
  const x = event.offsetX;
  const y = event.offsetY;

  for (const tower of towers) {
    if (x >= tower.x && x <= tower.x + tower.width && y >= tower.y && y <= tower.y + tower.height) {
      if (isUpgrading) {
        upgradeTower(tower);
        isUpgrading = false;
      } else {
        if (confirm('타워를 환불하시겠습니까?')) {
          refundTower(tower);
        }
      }
      break;
    }
  }
});

function upgradeTower(tower) {
  if (tower.isUpgraded) {
    showMessage('이미 업그레이드된 타워입니다.');
    return;
  }

  if (userGold < upgradeCost) {
    showMessage('업그레이드 비용이 부족합니다.');
    return;
  }

  userGold -= upgradeCost;
  tower.upgrade();
  sendEvent(45, { x: tower.x, y: tower.y }); // 이벤트 ID 45는 타워 업그레이드 이벤트
  showMessage('업그레이드가 완료되었습니다.');
  updateGoldDisplay();
}

function updateGoldDisplay() {
  const goldDisplay = document.getElementById('goldDisplay');
  if (goldDisplay) {
    goldDisplay.textContent = `골드: ${userGold}`;
  } else {
    const newGoldDisplay = document.createElement('div');
    newGoldDisplay.id = 'goldDisplay';
    newGoldDisplay.textContent = `골드: ${userGold}`;
    newGoldDisplay.style.position = 'absolute';
    newGoldDisplay.style.top = '10px';
    newGoldDisplay.style.left = '10px';
    newGoldDisplay.style.color = 'white';
    newGoldDisplay.style.fontSize = '20px';
    document.body.appendChild(newGoldDisplay);
  }
}

const upgradeTowerButton = document.createElement('button');
upgradeTowerButton.textContent = '타워 업그레이드';
upgradeTowerButton.style.position = 'absolute';
upgradeTowerButton.style.top = '50px';
upgradeTowerButton.style.right = '10px';
upgradeTowerButton.style.padding = '10px 20px';
upgradeTowerButton.style.fontSize = '16px';
upgradeTowerButton.style.cursor = 'pointer';

upgradeTowerButton.addEventListener('click', () => {
  showMessage('업그레이드할 타워를 클릭해주세요.');
  isUpgrading = true;
});

document.body.appendChild(upgradeTowerButton);

function placeBase() {
  const lastPoint = monsterPath[monsterPath.length - 1];
  base = new Base(lastPoint.x, lastPoint.y, baseHp);
  base.draw(ctx, baseImage);
}

function spawnMonster() {
  monsters.push(new Monster(monsterPath, monsterImages, monsterLevel));
}

function gameLoop() {
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
  drawPath(monsterPath);

  ctx.font = '25px Times New Roman';
  ctx.fillStyle = 'skyblue';
  ctx.fillText(`최고 기록: ${highScore}`, 100, 50);
  ctx.fillStyle = 'white';
  ctx.fillText(`점수: ${score}`, 100, 100);
  ctx.fillStyle = 'yellow';
  ctx.fillText(`골드: ${userGold}`, 100, 150);
  ctx.fillStyle = 'black';
  ctx.fillText(`현재 레벨: ${monsterLevel}`, 100, 200);

  towers.forEach((tower) => {
    tower.draw(ctx);
    tower.updateCooldown();
    monsters.forEach((monster) => {
      const distance = Math.sqrt(Math.pow(tower.x - monster.x, 2) + Math.pow(tower.y - monster.y, 2));
      if (distance < tower.range) {
        tower.attack(monster);
      }
    });
  });

  if (score >= 2000 * monsterLevel) {
    monsterLevel++;
    userGold += 1000;
    updateGoldDisplay();
  }

  base.draw(ctx, baseImage);

  for (let i = monsters.length - 1; i >= 0; i--) {
    const monster = monsters[i];
    if (monster.hp > 0) {
      const isDestroyed = monster.move(base);
      if (isDestroyed) {
        showMessage('게임 오버. 스파르타 본부를 지키지 못했다...ㅠㅠ');
        setTimeout(() => location.reload(), 2000);
      }
      monster.draw(ctx);
    } else {
      sendEvent(41, { monsterLevel: monster.level });
      monsters.splice(i, 1);
      score += 100;
    }
  }

  requestAnimationFrame(gameLoop);
}

function initGame() {
  if (isInitGame) {
    return;
  }

  sendEvent(2, {});

  monsterPath = generateRandomMonsterPath();
  initMap();
  placeInitialTowers();
  placeBase();

  setInterval(spawnMonster, monsterSpawnInterval);
  gameLoop();
  isInitGame = true;
}

Promise.all([
  new Promise((resolve) => (backgroundImage.onload = resolve)),
  new Promise((resolve) => (towerImage.onload = resolve)),
  new Promise((resolve) => (baseImage.onload = resolve)),
  new Promise((resolve) => (pathImage.onload = resolve)),
  ...monsterImages.map((img) => new Promise((resolve) => (img.onload = resolve))),
]).then(() => {
  connectServer(id);

  // let somewhere;
  // serverSocket = io('서버주소', {
  //   auth: {
  //     token: somewhere, // 토큰이 저장된 어딘가에서 가져와야 합니다!
  //   },
  // });

  /* 
    서버의 이벤트들을 받는 코드들은 여기다가 쭉 작성해주시면 됩니다! 
    e.g. serverSocket.on("...", () => {...});
    이 때, 상태 동기화 이벤트의 경우에 아래의 코드를 마지막에 넣어주세요! 최초의 상태 동기화 이후에 게임을 초기화해야 하기 때문입니다! 
  */
  if (!isInitGame) {
    initGame();
  }
});

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
