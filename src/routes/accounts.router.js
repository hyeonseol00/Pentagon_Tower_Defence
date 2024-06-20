import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { addAccount, getAccounts } from '../models/account.model.js';

const router = express.Router();
const regex = /^[A-Za-z0-9]*$/;

/** 사용자 회원가입 API **/
router.post('/sign-up', async (req, res, next) => {
  try {
    const { loginId, password } = req.body;
    const accounts = await getAccounts();
    const isExistUser = accounts.find((account) => account.id == loginId);

    if (isExistUser)
      return res.status(409).json({ message: '이미 존재하는 ID입니다.' });
    else if (!regex.test(loginId))
      return res
        .status(400)
        .json({ message: 'ID는 영어와 숫자만 사용할 수 있습니다.' });
    else if (password.length < 6)
      return res
        .status(400)
        .json({ message: '비밀번호는 6자 이상이어야 합니다.' });

    const hashedPassword = await bcrypt.hash(password, 10);

    // DB 저장부
    await addAccount({ id: loginId, password: hashedPassword });

    return res.status(201).json({ message: '회원가입이 완료되었습니다.' });
  } catch (error) {
    next(error);
  }
});

/** 사용자 로그인 API **/
router.post('/sign-in', async (req, res, next) => {
  try {
    const { loginId, password } = req.body;
    // DB 호출부
    const accounts = await getAccounts();
    const account = accounts.find((account) => account.id == loginId);

    if (!account)
      return res.status(401).json({ message: '존재하지 않는 ID입니다.' });
    else if (!(await bcrypt.compare(password, account.password)))
      return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });

    const token = jwt.sign(
      {
        id: account.id,
      },
      process.env.TOKEN_SECRET_KEY,
    );

    res.cookie('authorization', `Bearer ${token}`);

    return res.status(200).json({ message: '로그인 성공' });
  } catch (error) {
    next(error);
  }
});

export default router;
