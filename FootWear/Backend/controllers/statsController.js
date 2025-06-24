const db = require('../db');
const { sendJSON } = require('../utils/response');

function globalStats(req, res) {
  db.serialize(() => {
    let stats = {};
    db.get('SELECT COUNT(*) AS totalShoes FROM Shoes', [], (err, row) => {
      stats.totalShoes = row ? row.totalShoes : 0;
      db.get('SELECT COUNT(*) AS totalUsers FROM Users', [], (err2, row2) => {
        stats.totalUsers = row2 ? row2.totalUsers : 0;
        db.get('SELECT COUNT(*) AS totalOrders FROM Orders', [], (err3, row3) => {
          stats.totalOrders = row3 ? row3.totalOrders : 0;

          db.get('SELECT brand, COUNT(*) AS cnt FROM Shoes GROUP BY brand ORDER BY cnt DESC LIMIT 1', [], (err4, row4) => {
            stats.topBrand = row4 ? row4.brand : null;

            db.get('SELECT sezon, COUNT(*) AS cnt FROM Shoes GROUP BY sezon ORDER BY cnt DESC LIMIT 1', [], (err5, row5) => {
              stats.topSezon = row5 ? row5.sezon : null;
              sendJSON(res, stats);
            });
          });
        });
      });
    });
  });
}
module.exports = { globalStats };