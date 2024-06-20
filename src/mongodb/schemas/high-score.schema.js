import mongoose from 'mongoose';

const highScoreSchema = new mongoose.Schema({
  high_score: {
    type: Number,
    required: true,
  },
});

export default mongoose.model('high_score', highScoreSchema);
