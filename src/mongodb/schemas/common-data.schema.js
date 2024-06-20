import mongoose from 'mongoose';

const commonDataSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
  },
  user_gold: {
    type: Number,
    required: true,
  },
  base_hp: {
    type: Number,
    required: true,
  },
  tower_cost: {
    type: Number,
    required: true,
  },
  num_of_initial_towers: {
    type: Number,
    required: true,
  },
});

export default mongoose.model('common_data', commonDataSchema);
