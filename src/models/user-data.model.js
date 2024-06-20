import userDataSchema from '../mongodb/schemas/user-data.schema.js';

export const addUserData = async (userData) => {
  const targetData = new userDataSchema(userData);

  await targetData.save();
};

export const updateUserData = async (updatedUserData) => {
  let userData = await userDataSchema
    .findOne({ account_id: updatedUserData.account_id })
    .exec();

  userData = Object.assign(userData, updatedUserData);

  await userData.save();
};

export const getUserData = async (userId) => {
  const userData = await userDataSchema.findOne({ account_id: userId }).exec();

  return userData;
};
