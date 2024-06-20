import mongoose from 'mongoose';

const accountsSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

export default mongoose.model('accounts', accountsSchema);
