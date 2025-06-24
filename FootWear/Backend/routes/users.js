const { register, login, userStats } = require('../controllers/usersController');
const {getAllUsers,promoteUser, deleteAdminRights} =require('../controllers/usersController');
function parseBody(req, callback) {
  let data = '';
  req.on('data', chunk => (data += chunk));
  req.on('end', () => {
    try {
      callback(JSON.parse(data));
    } catch {
      callback({});
    }
  });
}

function usersRouter(req, res, pathname) {
  if (req.method === 'POST' && pathname === '/api/register') {
    return parseBody(req, body => register(req, res, body));
  }
  if (req.method === 'POST' && pathname === '/api/login') {
    return parseBody(req, body => login(req, res, body));
  }
  if (req.method === 'GET' && pathname === '/api/userstats') {
    return userStats(req, res);
  }
  if (req.method === 'GET' && pathname === '/api/users') {
    return getAllUsers(req, res);
  }
  const promoteMatch = pathname.match(/^\/api\/users\/(\d+)\/promote$/);
  if (req.method === 'PATCH' && promoteMatch) {
    return promoteUser(req, res, promoteMatch[1]);
  }
  const removeRights = pathname.match(/^\/api\/users\/(\d+)\/removeRights$/);
  if(req.method ==='PATCH'&& removerights)
  {
    return deleteAdminRights(req,res,removeRights[1]);
  }
  return false;
}

module.exports = usersRouter;