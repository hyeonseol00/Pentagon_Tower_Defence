import mongoose from 'mongoose';

const monsterSchema = new mongoose.Schema({
  level: {
    type: Number,
    required: true,
  },
  power: {
    type: Number,
    required: true,
  },
  hp: {
    type: Number,
    required: true,
  },
  spawn_interval: {
    type: Number,
    required: true,
  },
});

export default mongoose.model('monster', monsterSchema);
