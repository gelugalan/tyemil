const { getAllShoes, getShoeById, addShoe, deleteShoe, updateShoe, toggleActiveShoe } = require('../controllers/shoesController');
const { globalStats } = require('../controllers/statsController');
const Busboy = require('busboy');
const fs = require('fs');
const path = require('path');

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

function parseMultipart(req, callback) {
  const busboy = new Busboy({ headers: req.headers });
  const fields = {};
  let imagePath = null;

  busboy.on('file', (fieldname, file, filename) => {
    if (filename) {
      const saveTo = path.join(__dirname, '../uploads', Date.now() + '-' + filename);
      imagePath = '/uploads/' + path.basename(saveTo);
      file.pipe(fs.createWriteStream(saveTo));
    } else {
      file.resume();
    }
  });

  busboy.on('field', (fieldname, val) => {
    fields[fieldname] = val;
  });

  busboy.on('finish', () => {
    callback({ ...fields, imagine: imagePath });
  });

  req.pipe(busboy);
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
    return parseMultipart(req, body => addShoe(req, res, body));
  }
  // sterge pantof
  if (req.method === 'DELETE' && match) {
    return deleteShoe(req, res, match[1]);
  }
  // Editează pantof
  if (req.method === 'PUT' && match) {
    return parseBody(req, body => updateShoe(req, res, match[1], body));
  }
  // Toggle activ/dezactivare
  if (req.method === 'PATCH' && pathname.match(/^\/api\/shoes\/(\d+)\/toggle-active$/)) {
    const id = pathname.match(/^\/api\/shoes\/(\d+)\/toggle-active$/)[1];
    return toggleActiveShoe(req, res, id);
  }
  // /api/stats
  if (req.method === 'GET' && pathname === '/api/stats') {
    return globalStats(req, res);
  }
  return false;
}

module.exports = shoesRouter;