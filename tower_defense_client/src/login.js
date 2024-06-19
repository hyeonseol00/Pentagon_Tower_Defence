import { setAuthToken, setUserId } from './GaApplication.js';

document.getElementById('login').addEventListener('click', async () => {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const response = await fetch('/api/sign-in', {
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
    body: JSON.stringify({ loginId: username, password }),
  });

  console.log(await response.json());
  setAuthToken(
    document.cookie.match('(^|;) ?' + 'authorization' + '=([^;]*)(;|$)')[2],
  );
  setUserId(username);

  if (response.status === 200) window.location.href = 'index.html';

  /* 
    로그인 API 호출 후 로그인 성공 시 index.html로 이동시켜주세요!
    이 때, 엑세스 토큰은 어딘가에 저장을 해놔야겠죠?! 
  */
});

document.getElementById('back').addEventListener('click', () => {
  window.location.href = 'index.html';
});
