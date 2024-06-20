import userDataSchema from '../schemas/user-data.schema.js';

export const addUserData = async (userData) =>{
    const targetUser = new userDataSchema(userData);

    await targetData.save();
};

export const updateUserData = async (updateUserData)=>{
    let userData = await userDataSchema
    .findOne({account_id: updateUserData.account_id})
    .exec();

    userData = Object.assign(userData, updateUserData);

    await userData.save();
};

export const getUserData = async (userId)=>{
    const userData = await userDataSchema.findOne({ account_id:userId }).exec();

    return userData;
};