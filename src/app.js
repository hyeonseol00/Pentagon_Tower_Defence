import express from 'express';
import { createServer } from 'http';
import dotEnv from 'dotenv';
import initSocket from './init/socket.js';
import { loadGameAssets } from './init/assets.js';
import errorHandlingMiddleware from './middlewares/error-handling.middleware.js';
import accountsRouter from './routes/accounts.router.js';
import connect from './mongodb/index.js';

dotEnv.config();
connect();

const app = express();
const server = createServer(app);

const PORT = 3000;

app.use(express.static('tower_defense_client'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/api', accountsRouter);
app.use(errorHandlingMiddleware);
initSocket(server);

app.get('/', (req, res) => {
  res.send('<h1>Hello World</h1>');
});

server.listen(PORT, async () => {
  console.log(`서버가 ${PORT}번 포트로 실행 성공했습니다.`);

  try {
    const assets = await loadGameAssets();
    console.log(assets);
    console.log('성공적으로 에셋을 로드했습니다.');
  } catch (error) {
    console.error('에셋 데이터 로드에 실패했습니다:', error);
  }
});
