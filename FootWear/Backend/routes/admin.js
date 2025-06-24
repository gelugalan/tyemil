const { getAllShoes, getShoeById, addShoe, deleteShoe } = require('../controllers/shoesController');

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

function shoesRouter(req, res, pathname, query) {
  // /api/shoes
  if (req.method === 'GET' && pathname === '/api/shoes') {
    return getAllShoes(req, res, query);
  }
  // /api/shoes/:id
  const match = pathname.match(/^\/api\/shoes\/(\d+)$/);
  if (req.method === 'GET' && match) {
    return getShoeById(req, res, match[1]);
  }
  // Adaugă pantof
  if (req.method === 'POST' && pathname === '/api/shoes') {
    return parseBody(req, body => addShoe(req, res, body));
  }
  // Șterge pantof
  if (req.method === 'DELETE' && match) {
    return deleteShoe(req, res, match[1]);
  }
  return false;
}

module.exports = shoesRouter;