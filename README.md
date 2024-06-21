### Team.Pentagon

# 타워 디펜스 게임

## 구현 기능

- 게임 시작 이벤트

  ```js
  export const gameStart = (userId, payload) => {
    return { status: 'success', message: '게임이 정상적으로 실행되었습니다.' };
  };
  ```

  ```js
  serverSocket.on('connection', (data) => {
    syncData(data);
    console.log('connection: ', data);

    if (!isInitGame) {
      initGame();
    }
    sendEvent(2, {});
  });
  ```

  - handlerId: 2
  - 웹 소켓으로 유저와 연결되면 서버의 기본 데이터를 클라이언트에 동기화한다

- 최초 타워 추가 이벤트

  ```js
  function placeInitialTowers() {
    for (let i = 0; i < numOfInitialTowers; i++) {
      const { x, y } = getRandomPositionNearPath(200);
      const tower = new Tower(x, y, towerCost);
      towers.push(tower);
      tower.draw(ctx, towerImage);

      sendEvent(21, { x, y });
    }
  }
  ```

  ```js
  export const addInitialTowerHandler = async (userId, payload) => {
    const userData = await getUserData(userId);
    userData.tower_coordinates.push({
      x: payload.x,
      y: payload.y,
    });
    userData.tower_isUpgrades.push(false);

    await updateUserData(userData);

    return {
      status: 'success',
      message: '기본 타워가 성공적으로 배치되었습니다.',
    };
  };
  ```

  - handlerId: 21
  - 게임 시작시 일반 타워 3개 설치

- 타워 구입 이벤트

  ```js
  function placeNewTower() {
    const { x, y } = getRandomPositionNearPath(200);

    if (userGold >= towerCost) {
      sendEvent(22, { x, y, gold: userGold });
    } else {
      return;
    }

    const tower = new Tower(x, y);
    towers.push(tower);
    tower.draw(ctx, towerImage);
  }
  ```

  ```js
  export const purchaseTowerHandler = async (userId, payload) => {
    const { commonData } = getGameAssets();
    const userData = await getUserData(userId);

    if (userData.gold < commonData.tower_cost)
      return { status: 'fail', message: '돈이 부족해서 구매에 실패했습니다!' };

    userData.gold -= commonData.tower_cost;
    userData.tower_coordinates.push({
      x: payload.x,
      y: payload.y,
    });
    userData.tower_isUpgrades.push(false);

    await updateUserData(userData);

    return {
      status: 'success',
      message: '구매한 타워가 성공적으로 배치되었습니다.',
      data: userData,
    };
  };
  ```

  - handlerId: 22
  - 타워 가격: 500 Gold
  - 오른쪽 상단의 '타워 구입'버튼을 누르면 발생

- 몬스터 처치 이벤트

  ```js
  monsters.splice(i, 1);
  if (monster.monsterNumber !== 5) {
    sendEvent(23, { score });
  }
  ```

  ```js
  export const monsterKilledHandler = async (userId, payload) => {
    const { monster } = getGameAssets();
    const userData = await getUserData(userId);

    if (Math.abs(userData.score - payload.score) >= 200) {
      return { status: 'fail', message: '점수 데이터가 잘못되었습니다!' };
    }

    userData.score += 100;

    if (userData.monster_level <= userData.score / 2000) {
      userData.monster_level++;
      userData.gold += 1000;

      await updateUserData(userData);

      return {
        status: 'success',
        message: '몬스터를 처치했습니다, 몬스터가 강해집니다!',
        data: userData,
        monster: monster[userData.monster_level - 1],
      };
    }

    await updateUserData(userData);

    return {
      status: 'success',
      message: '몬스터를 처치했습니다!',
      data: userData,
    };
  };
  ```

  - handlerId: 23
  - 몬스터 한 마리 당 Score: 100 Score
  - 스코어가 2000의 배수가 될 때마다 1000 Gold씩 들어온다
  - 몬스터가 기지에 부딪쳐도 처치 판정으로 100 Score가 들어온다

- 게임 오버 이벤트

  ```js
  if (isDestroyed) {
    /* 게임 오버 */
    sendEvent(3, { score });

    setTimeout(() => {
      alert('게임 오버. 스파르타 본부를 지키지 못했다...ㅠㅠ');
      location.reload();
    }, 500);
  }
  ```

  ```js
  export const gameEnd = async (userId, payload) => {
    const userData = await getUserData(userId);

    if (Math.abs(userData.score - payload.score) >= 200)
      return { status: 'fail', message: '점수 데이터가 잘못되었습니다!' };

    if (userData.user_high_score < payload.score)
      userData.user_high_score = payload.score;

    await updateUserData(userData);

    const highScore = await getHighScore();

    if (highScore < payload.score) {
      await updateHighScore(payload.score);
      return {
        status: 'success',
        message: '게임 종료, 최고기록이 갱신되었습니다!',
        broadcast: {
          message: '서버 최고기록이 갱신되었습니다!',
          userId,
          highscore: payload.score + 100,
        },
      };
    }

    return { status: 'success', message: '게임 종료!' };
  };
  ```

  - handlerId: 3
  - 기지의 체력이 0 이하로 내려가면 게임이 종료된다

- 최고 기록 스코어 저장

  ```js
  if (userData.user_high_score < payload.score)
    userData.user_high_score = payload.score;

  await updateUserData(userData);

  const highScore = await getHighScore();

  if (highScore < payload.score) {
    await updateHighScore(payload.score);
    return {
      status: 'success',
      message: '게임 종료, 최고기록이 갱신되었습니다!',
      broadcast: {
        message: '서버 최고기록이 갱신되었습니다!',
        userId,
        highscore: payload.score + 100,
      },
    };
  }
  ```

  - 게임 오버가 발생할 때 서버의 high_score와 현재 Score를 비교해서 더 높은 점수가 high_score가 된다

## 추가 구현 기능

- 타워 환불 이벤트

  ```js
  function refundLastTower() {
    sendEvent(25, {});
  }
  ```

  ```js
  serverSocket.on('refundTower', (data) => {
    towers.pop();
    userGold = data.refundTower.gold;
    console.log('refundTower', data);
  });
  ```

  ```js
  export const refundTowerHandler = async (userId, payload) => {
    const userData = await getUserData(userId);
    const { commonData } = getGameAssets();

    if (userData.tower_coordinates.length <= 0)
      return { status: 'fail', message: '환불할 수 있는 타워가 없습니다!' };

    if (userData.tower_isUpgrades.at(-1)) {
      userData.gold += commonData.tower_cost * 2;
    } else {
      userData.gold += commonData.tower_cost;
    }
    userData.tower_coordinates.pop();
    userData.tower_isUpgrades.pop();
    await updateUserData(userData);

    return {
      status: 'success',
      message: '마지막으로 설치한 타워가 성공적으로 환불되었습니다.',
      refundTower: userData,
    };
  };
  ```

  - handlerId: 25
  - 타워 환불 가격: 500 Gold
  - 오른쪽 상단의 '타워 환불'버튼을 누르면 발생
  - 가장 마지막에 추가된 타워부터 환불된다

- 타워 업그레이드 이벤트

  ```js
  function upgradeRandomTower() {
    sendEvent(26, {});
  }
  ```

  ```js
  serverSocket.on('upgradeTower', (data) => {
    towers[data.towerIdx].isUpgraded = true;
    userGold = data.data.gold;
    console.log('upgradeTower:', data);
    towers[data.towerIdx].draw(ctx, upgradedTowerImage);
  });
  ```

  ```js
  export const upgradeTowerHandler = async (userId, payload) => {
    const userData = await getUserData(userId);
    const { commonData } = getGameAssets();

    if (userData.tower_isUpgrades.findIndex((bool) => bool == false) == -1) {
      return {
        status: 'fail',
        message: '업그레이드 할 수 있는 타워가 없습니다!',
      };
    }

    if (userData.gold < commonData.tower_cost) {
      return {
        status: 'fail',
        message: '업그레이드에 필요한 골드가 부족합니다!',
      };
    }

    let randIdx;
    do {
      randIdx = Math.floor(Math.random() * userData.tower_isUpgrades.length);
    } while (userData.tower_isUpgrades[randIdx] != false);

    userData.gold -= commonData.tower_cost;
    userData.tower_isUpgrades[randIdx] = true;
    await updateUserData(userData);

    return {
      status: 'success',
      message: '타워 하나가 성공적으로 업그레이드 되었습니다.',
      data: userData,
      towerIdx: randIdx,
    };
  };
  ```

  ```js
  else if (this.isUpgraded) {
      monster.hp -= this.attackPower;
      this.cooldown = 90; // 1.5초 쿨타임 (초당 60프레임)
      this.beamDuration = 30; // 광선 지속 시간 (0.5초)
      this.target = monster; // 광선의 목표 설정
    }
  ```

  - handlerId: 26
  - 타워 업그레이드 가격: 500 Gold
  - 오른쪽 상단의 '타워 업그레이드'버튼을 누르면 발생
  - 설치된 일반 타워 중 랜덤으로 업그레이드 시킨다
  - 업그레이드된 타워는 형태가 변하고 공격 속도가 오른다
  - 환불 시 업그레이드에 쓴 비용을 같이 환불된다

- 황금 고블린 이벤트

  ```js
  function placeEpicTower() {
    const { x, y } = getRandomPositionNearPath(200);

    sendEvent(27, { x, y, gold: userGold });

    const epictower = new Tower(x, y, towerCost, true);
    epictowers.push(epictower);
    epictower.draw(ctx, epictowerImage);
  }
  ```

  ```js
  if (
    monster.monsterNumber === 5 &&
    monster.x < monsterPath[monsterPath.length - 1].x - 3
  ) {
    placeEpicTower();
  }
  ```

  ```js
  const randomValue = Math.random();
  if (randomValue < 0.01) {
    // 1프로 확률
    this.monsterNumber = monsterImages.length - 1; // 6번 황금 고블린
  } else {
    this.monsterNumber = Math.floor(Math.random() * (monsterImages.length - 1)); // 1번부터 5번 몬스터
  }
  ```

  ```js
  if (this.monsterNumber === monsterImages.length - 1) {
    this.speed = 4; // 황금 고블린의 이동 속도
  } else {
    this.speed = 2; // 몬스터의 이동 속도
  }
  ```

  ```js
  if (this.monsterNumber === monsterImages.length - 1) {
    this.maxHp = 50 + 10 * level; // 황금 고블린의 현재 HP
  } else {
    this.maxHp = 100 + 10 * level; // 몬스터의 현재 HP
  }
  ```
  
  - handlerId: 27
  - 황금 고블린은 1퍼센트의 확률로 등장한다
  - 황금 고블린은 일반 몬스터의 2배의 속도로 움직이지만 체력이 더 낮다
  - 황금 고블린은 일반 몬스터와 달리 처치해도 Score를 주지 않는다
  - 황금 고블린을 처치하면 '에픽 타워'라는 특별한 타워를 얻는다

    ```js
    export const epicTowerHandler = async (userId, payload) => {
      const userData = await getUserData(userId);
      userData.epic_tower_coordinates.push({
        x: payload.x,
        y: payload.y,
      });

      await updateUserData(userData);

      return {
        status: 'success',
        message: '황금 고블린 처치! 에픽 타워를 획득하셨습니다.',
      };
    };
    ```

    ```js
    if (this.isEpic) {
      monster.hp -= this.attackPower * 1.5;
      this.cooldown = 45; // 0.75초 쿨타임 (초당 60프레임)
      this.beamDuration = 10; // 광선 지속 시간 (0.16초)
      this.target = monster; // 광선의 목표 설정
    }
    ```

    - 에픽 타워는 일반 타워의 1.5배의 공격력을 가지고 있다
    - 에픽 타워는 일반 타워의 4배의 공격 속도를 가지고 있다
    - 에픽 타워는 타워 환불로 환불되지 않는다


## ERD DIAGRAM

![alt text](image.png)
