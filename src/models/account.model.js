import accountsSchema from '../mongodb/schemas/account.schema.js';

export const addAccount = async (account) => {
  const targetAccount = new accountsSchema(account);

  await targetAccount.save();
};

export const getAccounts = async () => {
  const accounts = await accountsSchema.find().exec();

  return accounts;
};
