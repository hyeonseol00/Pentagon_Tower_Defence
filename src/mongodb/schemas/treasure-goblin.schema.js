import mongoose from 'mongoose';

const treasureGoblinSchema = new mongoose.Schema({
  spawnTime: {
    type: Date,
    default: Date.now
  },
  position: {
    x: Number,
    y: Number
  },
  isActive: {
    type: Boolean,
    default: true
  },
  treasureAmount: {
    type: Number,
    default: 10000 // 보물의 양
  }
});

export default mongoose.model('TreasureGoblin', treasureGoblinSchema);
