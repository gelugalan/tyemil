const db = require('../db');
const { sendJSON } = require('../utils/response');

function getAllShoes(req, res, query) {
  db.all('SELECT * FROM Shoes', [], (err, rows) => {
    if (err) return sendJSON(res, { error: err.message }, 500);
    sendJSON(res, rows);
  });
}

function getShoeById(req, res, id) {
  db.get('SELECT * FROM Shoes WHERE id = ?', [id], (err, row) => {
    if (err) return sendJSON(res, { error: err.message }, 500);
    if (!row) return sendJSON(res, { error: 'Not found' }, 404);
    sendJSON(res, row);
  });
}

function addShoe(req, res, body) {
  const { nume, brand, stil, sezon, culoare, gen } = body;
  console.log(body);
  if (!nume || !brand || !stil || !sezon || !culoare || !gen)
    return sendJSON(res, { error: 'Date lipsă' }, 400);
  db.run(
    'INSERT INTO Shoes (nume, brand, stil, sezon, culoare ,gen) VALUES (?, ?, ?, ?, ?, ?)',
    [nume, brand, stil, sezon, culoare, gen || ''],
    function (err) {
      if (err) return sendJSON(res, { error: err.message }, 500);
      sendJSON(res, { success: true, id: this.lastID });
    }
  );
}

function deleteShoe(req, res, id) {
  db.run('DELETE FROM Shoes WHERE id = ?', [id], function (err) {
    if (err) return sendJSON(res, { error: err.message }, 500);
    sendJSON(res, { success: true });
  });
}

function updateShoe(req, res, id, body) {
  const { nume, brand, stil, sezon, culoare, gen } = body;
  if (!nume || !brand || !stil || !sezon || !culoare || !gen)
    return sendJSON(res, { error: 'Date lipsă' }, 400);
  db.run(
    'UPDATE Shoes SET nume=?, brand=?, stil=?, sezon=?, culoare=?, gen=? WHERE id=?',
    [nume, brand, stil, sezon, culoare, gen, id],
    function (err) {
      if (err) return sendJSON(res, { error: err.message }, 500);
      sendJSON(res, { success: true });
    }
  );
}

function toggleActiveShoe(req, res, id) {
  db.get('SELECT activ FROM Shoes WHERE id=?', [id], (err, row) => {
    if (err || !row) return sendJSON(res, { error: 'Produs inexistent' }, 404);
    const newVal = row.activ ? 0 : 1;
    db.run('UPDATE Shoes SET activ=? WHERE id=?', [newVal, id], function (err2) {
      if (err2) return sendJSON(res, { error: err2.message }, 500);
      sendJSON(res, { success: true });
    });
  });
}


module.exports = { getAllShoes, getShoeById, addShoe, deleteShoe, updateShoe, toggleActiveShoe };