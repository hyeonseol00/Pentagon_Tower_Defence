import TreasureGoblin from '../schemas/treasure-goblin.schema.js';

// 보물 고블린 생성 핸들러
export const createTreasureGoblin = async () => {
  const position = { x: Math.random() * 100, y: Math.random() * 100 }; // 랜덤 위치 생성 예시
  const treasureGoblin = new TreasureGoblin({ position });
  await treasureGoblin.save();
  return treasureGoblin;
};

// 활성화된 보물 고블린 찾기 핸들러
export const findActiveTreasureGoblin = async () => {
  const treasureGoblin = await TreasureGoblin.findOne({ isActive: true }).exec();
  return treasureGoblin;
};

// 특정 조건에 따라 보물 고블린을 출현시키는 핸들러
export const spawnTreasureGoblinIfNeeded = async () => {
  const existingGoblin = await findActiveTreasureGoblin();
  
  if (!existingGoblin) {
    const newGoblin = await createTreasureGoblin();
    console.log('보물 고블린이 출현했습니다:', newGoblin);
  } else {
    console.log('이미 활성화된 보물 고블린이 있습니다:', existingGoblin);
  }
};

// 보물 고블린 비활성화 핸들러 (예: 사용자가 보물 고블린을 잡았을 때)
export const deactivateTreasureGoblin = async (id) => {
  await TreasureGoblin.findByIdAndUpdate(id, { isActive: false }).exec();
  console.log('보물 고블린이 비활성화되었습니다:', id);
};
