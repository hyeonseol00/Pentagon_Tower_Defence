import mongoose from 'mongoose';

const userDataSchema = new mongoose.Schema({
  account_id: {
    type: String,
    required: true,
  },
  monster_level: {
    type: Number,
    required: true,
  },
  monster_spawn_interval: {
    type: Number,
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  user_high_score: {
    type: Number,
    required: true,
  },
  tower_coordinates: {
    type: Array,
    required: true,
  },
  gold: {
    type: Number,
    required: true,
  },
  hp: {
    type: Number,
    required: true,
  },
});

export default mongoose.model('user_data', userDataSchema);
