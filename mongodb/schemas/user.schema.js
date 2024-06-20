import mongoose from 'mongoose';

const usersSchema = new mongoose.Schema({
  uuid: {
    type: String,
    required: true,
  },
  socket_id: {
    type: String,
    required: true,
  },
});

export default mongoose.model('users', usersSchema);
