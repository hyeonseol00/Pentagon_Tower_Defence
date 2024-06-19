function getAuthToken() {
  return localStorage.getItem('authToken');
}

function setAuthToken(token) {
  localStorage.setItem('authToken', token);
}

function getUserId() {
  return localStorage.getItem('userId');
}

function setUserId(id) {
  localStorage.setItem('userId', id);
}

export { getAuthToken, setAuthToken, getUserId, setUserId };
