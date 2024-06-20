import usersSchema from '../mongodb/schemas/user.schema.js';

export const addUser = async (user) => {
  let targetUser = await usersSchema.findOne({ uuid: user.uuid }).exec();

  if (!targetUser) targetUser = new usersSchema(user);
  else targetUser.socket_id = user.socket_id;

  await targetUser.save();
};

export const removeUser = async (socketId) => {
  const users = await usersSchema.findOne({ socket_id: socketId }).exec();

  await users.deleteOne({ socket_id: socketId });

  return await getUsers();
};

export const getUsers = async () => {
  const users = await usersSchema.find().exec();

  return users;
};
