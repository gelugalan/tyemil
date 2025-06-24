const db = require('../db');
const { sendRegisterEmail } = require('../utils/email');
const { sendJSON } = require('../utils/response');
const crypto = require('crypto');


function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function register(req, res, body) {
  const { username, password, email } = body;
  if (!username || !password || !email) return sendJSON(res, { error: 'Date lipsă' }, 400);

  const hash = hashPassword(password);
  db.run(
    `INSERT INTO Users (username, password,email, role, created_at, last_login, login_count)
     VALUES (?, ?,?, 'user', CURRENT_TIMESTAMP, NULL, 0)`,
    [username, hash,email],
    function (err) {
      if (err) {
        console.error('SQLite error:', err); 
        return sendJSON(res, { error: 'Utilizator existent sau eroare' }, 400);
      }
      
      sendRegisterEmail(email,username)
      .then(()=>{
        sendJSON(res, { success: true, userId: this.lastID });
      })
      .catch(emailErr => {
        console.error('Email error:', emailErr);
        sendJSON(res, { success: true, userId: this.lastID });
      });
      
    }
  );
}

function login(req, res, body) {
  const { username, password } = body;
  if (!username || !password) return sendJSON(res, { error: 'Date lipsă' }, 400);

  const hash = hashPassword(password);
  db.get(
    'SELECT id, username, role FROM Users WHERE username = ? AND password = ?',
    [username, hash],
    (err, user) => {
      if (err) return sendJSON(res, { error: err.message }, 500);
      if (!user) return sendJSON(res, { error: 'Date incorecte' }, 401);


      db.run(
        'UPDATE Users SET last_login = CURRENT_TIMESTAMP, login_count = COALESCE(login_count,0)+1 WHERE id = ?',
        [user.id]
      );

      sendJSON(res, { success: true, user });
    }
  );
}

function userStats(req, res) {
  // Total utilizatori
  db.get('SELECT COUNT(*) AS total FROM Users', [], (err, totalRow) => {
    if (err) return sendJSON(res, { error: err.message }, 500);

    // Utilizatori unici (distinct username)
    db.get('SELECT COUNT(DISTINCT username) AS unici FROM Users', [], (err2, uniciRow) => {
      if (err2) return sendJSON(res, { error: err2.message }, 500);

      // Logări totale
      db.get('SELECT SUM(login_count) AS total_logari FROM Users', [], (err3, logariRow) => {
        if (err3) return sendJSON(res, { error: err3.message }, 500);

        // Conturi noi în ultimele 7 zile
        db.get('SELECT COUNT(*) AS noi_7zile FROM Users WHERE created_at >= datetime("now", "-7 days")', [], (err4, noiRow) => {
          if (err4) return sendJSON(res, { error: err4.message }, 500);

          // Ultimele 10 conturi create
          db.all('SELECT username, created_at FROM Users ORDER BY created_at DESC LIMIT 10', [], (err5, lastUsers) => {
            if (err5) return sendJSON(res, { error: err5.message }, 500);

            sendJSON(res, {
              total: totalRow.total,
              unici: uniciRow.unici,
              total_logari: logariRow.total_logari || 0,
              noi_7zile: noiRow.noi_7zile,
              lastUsers
            });
          });
        });
      });
    });
  });
}

function getAllUsers(req, res) {
  db.all('SELECT id, username, email, role, created_at FROM Users ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return sendJSON(res, { error: err.message }, 500);
    sendJSON(res, rows);
  });
}

function promoteUser(req,res,id){
  console.log('Promoting user with ID:', id);
  db.run( 'UPDATE Users Set role="admin"  Where id=?',[id],function(err){
    if(err) return sendJSON(res,{error:err.message},500);
    sendJSON(res,{success:true});
});
}
function deleteAdminRights(req,res,id)
{
  db.run ('update Users set role="user" where id=?',[id],function(err){
    if(err) return sendJSON(res,{error:err.message},500)
    sendJSON(res,{success:true});

  });
}

module.exports = { register, login, userStats,getAllUsers,promoteUser,deleteAdminRights };