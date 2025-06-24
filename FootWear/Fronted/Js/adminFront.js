document.addEventListener('DOMContentLoaded', () => {
  // Responsive sidebar toggle
  const sidebar = document.querySelector('.admin-sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    sidebarOverlay.classList.toggle('active');
  });
  sidebarOverlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('active');
  });


  document.querySelectorAll('.admin-sidebar nav ul li').forEach(li => {
    li.addEventListener('click', function() {
      document.querySelectorAll('.admin-sidebar nav ul li').forEach(x => x.classList.remove('active'));
      this.classList.add('active');
      document.querySelectorAll('.admin-section').forEach(sec => sec.classList.remove('active'));
      document.getElementById(this.dataset.section + '-section').classList.add('active');
    });
  });


  let allShoes = [];
  const productsTableBody = document.getElementById('productsTableBody');
  const filterSearch = document.getElementById('filterSearch');
  const filterBrand = document.getElementById('filterBrand');
  const filterStil = document.getElementById('filterStil');
  const filterSezon = document.getElementById('filterSezon');
  const filterGen = document.getElementById('filterGen');

  function loadShoes() {
    fetch('http://127.0.0.1:5000/api/shoes')
      .then(res => res.json())
      .then(data => {
        allShoes = Array.isArray(data) ? data : [];
        renderShoes();
        populateFilters();
      });
  }

  function populateFilters() {
    const brands = [...new Set(allShoes.map(s => s.brand).filter(Boolean))];
    const stiluri = [...new Set(allShoes.map(s => s.stil).filter(Boolean))];
    const sezoane = [...new Set(allShoes.map(s => s.sezon).filter(Boolean))];
    const genuri = [...new Set(allShoes.map(s => s.gen).filter(Boolean))];

    filterBrand.innerHTML = '<option value="">Toate brandurile</option>' + brands.map(b => `<option>${b}</option>`).join('');
    filterStil.innerHTML = '<option value="">Toate stilurile</option>' + stiluri.map(s => `<option>${s}</option>`).join('');
    filterSezon.innerHTML = '<option value="">Toate sezoanele</option>' + sezoane.map(s => `<option>${s}</option>`).join('');
    filterGen.innerHTML = '<option value="">Toate genurile</option>' + genuri.map(g => `<option>${g}</option>`).join('');
  }

  function renderShoes() {
    let filtered = allShoes.filter(shoe => {
      return (!filterSearch.value || shoe.nume.toLowerCase().includes(filterSearch.value.toLowerCase()))
        && (!filterBrand.value || shoe.brand === filterBrand.value)
        && (!filterStil.value || shoe.stil === filterStil.value)
        && (!filterSezon.value || shoe.sezon === filterSezon.value)
        && (!filterGen.value || shoe.gen === filterGen.value);
    });

    productsTableBody.innerHTML = '';
    if (filtered.length === 0) {
      productsTableBody.innerHTML = '<tr><td colspan="9">Nu există pantofi cu aceste filtre.</td></tr>';
      return;
    }
    filtered.forEach(shoe => {
      productsTableBody.innerHTML += `
        <tr style="${shoe.activ === 0 ? 'opacity:0.5;background:#fbeee6;' : ''}">
          <td><img src="${shoe.imagine || '../img/no-image.png'}" alt="img"></td>
          <td>${shoe.nume}</td>
          <td>${shoe.brand}</td>
          <td>${shoe.stil}</td>
          <td>${shoe.sezon}</td>
          <td>${shoe.culoare}</td>
          <td>${shoe.gen}</td>
          <td>
            <button class="preview-btn" data-id="${shoe.id}">Previzualizează</button>
            <button class="edit" data-id="${shoe.id}">Editare</button>
            <button class="delete" data-id="${shoe.id}">Șterge</button>
          </td>
          <td>
            <button class="toggle-active" data-id="${shoe.id}" style="background:${shoe.activ ? '#e67e22' : '#27ae60'}">
              ${shoe.activ ? 'Dezactivează' : 'Activează'}
            </button>
          </td>
        </tr>
      `;
    });
  }


  [filterSearch, filterBrand, filterStil, filterSezon, filterGen].forEach(f =>
    f.addEventListener('input', renderShoes)
  );


  document.getElementById('addProductForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    for(let pair of formData.entries())
    {
      console.log(pair[0]+': '+pair[1]);

    }
    fetch('http://127.0.0.1:5000/api/shoes', {
      method: 'POST',
      body: formData
    })
      .then(res => res.json())
      .then(result => {
        const msg = document.getElementById('add-product-message');
        if (result.success) {
          msg.style.color = 'green';
          msg.textContent = 'Produs adăugat!';
          this.reset();
          loadShoes();
        } else {
          msg.style.color = 'red';
          msg.textContent = result.error || 'Eroare!';
        }
      });
  });


  productsTableBody.addEventListener('click', function(e) {
    const id = e.target.getAttribute('data-id');
    if (e.target.classList.contains('delete')) {
      if (!confirm('Sigur vrei să ștergi acest pantof?')) return;
      fetch(`http://127.0.0.1:5000/api/shoes/${id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(result => {
          if (result.success) loadShoes();
          else alert(result.error || 'Eroare la ștergere!');
        });
    }
    if (e.target.classList.contains('edit')) {
      alert('Funcția de editare poate fi implementată similar cu adăugarea!');
    }
    if (e.target.classList.contains('preview-btn')) {
      const shoe = allShoes.find(s => s.id == id);
      if (!shoe) return;
      document.getElementById('previewContent').innerHTML = `
        <img src="${shoe.imagine || '../img/no-image.png'}" alt="img" style="width:120px;height:120px;object-fit:cover;border-radius:10px;margin-bottom:10px;">
        <div class="row"><strong>Nume:</strong> ${shoe.nume}</div>
        <div class="row"><strong>Brand:</strong> ${shoe.brand}</div>
        <div class="row"><strong>Stil:</strong> ${shoe.stil}</div>
        <div class="row"><strong>Sezon:</strong> ${shoe.sezon}</div>
        <div class="row"><strong>Culoare:</strong> ${shoe.culoare}</div>
        <div class="row"><strong>Gen:</strong> ${shoe.gen}</div>
      `;
      openModal(document.getElementById('modalPreview'));
    }
    if (e.target.classList.contains('toggle-active')) {
      const id = e.target.getAttribute('data-id');
      fetch(`http://127.0.0.1:5000/api/shoes/${id}/toggle-active`, { method: 'PATCH' })
        .then(res => res.json())
        .then(result => {
          console.log('Toggle result:', result); 
          if (result.success) loadShoes();
          else alert(result.error || 'Eroare la activare/dezactivare!');
        });
    }
  });


  function openModal(modal) { modal.classList.add('active'); }
  function closeModal(modal) { modal.classList.remove('active'); }
  document.getElementById('closePreview').onclick = () => closeModal(document.getElementById('modalPreview'));
  document.getElementById('modalPreview').onclick = e => { if (e.target === document.getElementById('modalPreview')) closeModal(document.getElementById('modalPreview')); };


  function loadDashboard() {
    fetch('http://127.0.0.1:5000/api/stats')
      .then(res => res.json())
      .then(stats => {
        document.getElementById('dashboard-widgets').innerHTML = `
          <div style="display:flex;gap:30px;flex-wrap:wrap;">
            <div style="background:#6a11cb;color:#fff;border-radius:12px;padding:24px 32px;min-width:180px;">
              <div style="font-size:2em;font-weight:bold;">${stats.totalShoes}</div>
              <div>Total produse</div>
            </div>
            <div style="background:#2575fc;color:#fff;border-radius:12px;padding:24px 32px;min-width:180px;">
              <div style="font-size:2em;font-weight:bold;">${stats.totalUsers}</div>
              <div>Total utilizatori</div>
            </div>

          </div>
        `;
      });
  }

  function loadUsers() {
    fetch('http://127.0.0.1:5000/api/users')
      .then(res => res.json())
      .then(users => {
        const container = document.getElementById('usersTable');
        if (!users.length) {
          container.innerHTML = '<p>Nu există utilizatori.</p>';
          return;
        }
        container.innerHTML = `
          <table class="products-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Creat la</th>
                <th>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              ${users.map(u => `
                <tr>
                  <td>${u.id}</td>
                  <td>${u.username}</td>
                  <td>${u.email || '-'}</td>
                  <td>${u.role}</td>
                  <td>${u.created_at ? u.created_at.slice(0, 19).replace('T', ' ') : ''}</td>
                  <td>
                  
                    ${u.role !== 'admin' ? `<button class="promote-btn" data-id="${u.id}">Promovează admin</button>` : `<button class="demote-btn" data-id="${u.id}">Elimină drepturi admin</button>`}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      });
  }
  document.getElementById('usersTable').addEventListener('click', function(e) {
  if (e.target.classList.contains('promote-btn')) {
    const id = e.target.getAttribute('data-id');
    if (!confirm('Sigur vrei să promovezi acest utilizator la admin?')) return;
    fetch(`http://127.0.0.1:5000/api/users/${id}/promote`, { method: 'PATCH' })
      .then(res => res.json())
      .then(result => {
        if (result.success) loadUsers();
        else alert(result.error || 'Eroare la promovare!');
      });
  }
});
  document.querySelector('[data-section="users"]').addEventListener('click', loadUsers);
  document.getElementById('exportHTML').onclick = () => window.open('http://127.0.0.1:5000/api/export/html');
  document.getElementById('exportCSV').onclick = () => window.open('http://127.0.0.1:5000/api/export/csv');
  document.getElementById('exportXML').onclick = () => window.open('http://127.0.0.1:5000/api/export/xml');







const usersData = [
  { username: "ana", role: "user", created_at: "2024-06-01" },
  { username: "bob", role: "admin", created_at: "2024-06-10" },
  { username: "carmen", role: "user", created_at: "2024-06-15" },
  { username: "dan", role: "user", created_at: "2024-06-18" },
  { username: "elena", role: "user", created_at: "2024-06-18" }
];
const productsData = [
  { brand: "Nike", sezon: "Vară", stil: "Sport", gen: "Masculin" },
  { brand: "Adidas", sezon: "Iarnă", stil: "Casual", gen: "Feminin" },
  { brand: "Nike", sezon: "Vară", stil: "Sport", gen: "Unisex" },
  { brand: "Puma", sezon: "Toamnă", stil: "Elegant", gen: "Masculin" },
  { brand: "Nike", sezon: "Primăvară", stil: "Sport", gen: "Feminin" },
  { brand: "Adidas", sezon: "Vară", stil: "Sport", gen: "Unisex" },
  { brand: "Puma", sezon: "Iarnă", stil: "Casual", gen: "Feminin" }
];

function countBy(arr, key) {
  return arr.reduce((acc, obj) => {
    const val = obj[key] || "Necunoscut";
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {});
}

function countByDate(arr, key) {
  
  return arr.reduce((acc, obj) => {
    const val = (obj[key] || "").slice(0, 10);
    if (val) acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {});
}

function drawBarChart(ctx, dataObj, title) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  const labels = Object.keys(dataObj);
  const data = Object.values(dataObj);
  const max = Math.max(...data, 1);
  ctx.font = '16px Montserrat';
  ctx.fillStyle = '#222';
  ctx.fillText(title, 20, 24);

  const barWidth = Math.max(30, (ctx.canvas.width - 60) / labels.length - 10);
  labels.forEach((label, i) => {
    const x = 40 + i * (barWidth + 10);
    const y = ctx.canvas.height - 40;
    const barHeight = (data[i] / max) * (ctx.canvas.height - 70);
    ctx.fillStyle = '#6a11cb';
    ctx.fillRect(x, y - barHeight, barWidth, barHeight);

    ctx.fillStyle = '#000';
    ctx.font = '13px Montserrat';
    ctx.save();
    ctx.translate(x + barWidth / 2, y + 16);
    ctx.rotate(-0.3);
    ctx.fillText(label, 0, 0);
    ctx.restore();

    ctx.fillStyle = '#2575fc';
    ctx.fillText(data[i], x + barWidth / 2 - 8, y - barHeight - 8);
  });
}

function drawPieChart(ctx, dataObj, title) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  const labels = Object.keys(dataObj);
  const data = Object.values(dataObj);
  const total = data.reduce((a, b) => a + b, 0) || 1;
  const colors = ['#6a11cb', '#2575fc', '#47d147', '#e67e22', '#e74c3c', '#f1c40f', '#8e44ad'];
  let startAngle = 0;
  const centerX = ctx.canvas.width / 2 - 30, centerY = ctx.canvas.height / 2 + 10, radius = 70;

  ctx.font = '16px Montserrat';
  ctx.fillStyle = '#222';
  ctx.fillText(title, 20, 24);

  labels.forEach((label, i) => {
    const angle = (data[i] / total) * 2 * Math.PI;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, startAngle + angle);
    ctx.closePath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
    startAngle += angle;
  });

  // Legend
  let y = 40;
  labels.forEach((label, i) => {
    ctx.fillStyle = colors[i % colors.length];
    ctx.fillRect(ctx.canvas.width - 120, y, 14, 14);
    ctx.fillStyle = '#000';
    ctx.font = '13px Montserrat';
    ctx.fillText(`${label} (${data[i]})`, ctx.canvas.width - 100, y + 12);
    y += 22;
  });
}

// Utilizatori
function renderUserChart() {
  const statType = document.getElementById('user-stat-type').value;
  const chartType = document.getElementById('user-chart-type').value;
  console.log(document.getElementById('user-chart-type').value);
  const ctx = document.getElementById('userChart').getContext('2d');
  let dataObj = {};
  if (statType === 'role') {
    dataObj = countBy(usersData, 'role');
  } else if (statType === 'created_at') {
    dataObj = countByDate(usersData, 'created_at');
  }
  if (chartType === 'bar') drawBarChart(ctx, dataObj, 'Utilizatori');
  else drawPieChart(ctx, dataObj, 'Utilizatori');
}

// Produse
function renderProdChart() {
  const statType = document.getElementById('prod-stat-type').value;
  const chartType = document.getElementById('prod-chart-type').value;
  const ctx = document.getElementById('prodChart').getContext('2d');
  const dataObj = countBy(productsData, statType);
  if (chartType === 'bar') drawBarChart(ctx, dataObj, 'Produse');
  else drawPieChart(ctx, dataObj, 'Produse');
}


  document.getElementById('user-stat-type').addEventListener('change', renderUserChart);
  document.getElementById('user-chart-type').addEventListener('change', renderUserChart);
  document.getElementById('prod-stat-type').addEventListener('change', renderProdChart);
  document.getElementById('prod-chart-type').addEventListener('change', renderProdChart);

 


  loadShoes();
  loadDashboard();
  renderUserChart();
  renderProdChart();
  
});


let fosaSettings = {
  storeName: "FoSA",
  primaryColor: "#6a11cb",
  notifEmail: "admin@fosa.ro",
  recurrence: "weekly",
  templateRegister: "Bun venit, {username}! Contul tău a fost creat.",
  templateRecurrent: "Salut, {username}! Nu uita să verifici noile produse.",
  logoDataUrl: "" 
};

function loadSettings() {
  document.getElementById('storeName').value = fosaSettings.storeName;
  document.getElementById('primaryColor').value = fosaSettings.primaryColor;
  document.getElementById('notifEmail').value = fosaSettings.notifEmail;
  document.getElementById('recurrence').value = fosaSettings.recurrence;
  document.getElementById('template-register').value = fosaSettings.templateRegister;
  document.getElementById('template-recurrent').value = fosaSettings.templateRecurrent;
  if (fosaSettings.logoDataUrl)
    document.getElementById('logoPreview').innerHTML = `<img src="${fosaSettings.logoDataUrl}" alt="logo" style="max-width:120px;max-height:60px;">`;
}
document.addEventListener('DOMContentLoaded', loadSettings);

document.getElementById('logoInput').addEventListener('change', function() {
  const file = this.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    document.getElementById('logoPreview').innerHTML = `<img src="${e.target.result}" alt="logo" style="max-width:120px;max-height:60px;">`;
    fosaSettings.logoDataUrl = e.target.result;
  };
  reader.readAsDataURL(file);
});

document.getElementById('saveSettingsBtn').onclick = function() {
  fosaSettings.storeName = document.getElementById('storeName').value;
  fosaSettings.primaryColor = document.getElementById('primaryColor').value;
  fosaSettings.notifEmail = document.getElementById('notifEmail').value;
  fosaSettings.recurrence = document.getElementById('recurrence').value;
  fosaSettings.templateRegister = document.getElementById('template-register').value;
  fosaSettings.templateRecurrent = document.getElementById('template-recurrent').value;
  
  document.getElementById('settingsMessage').textContent = 'Setări salvate în memorie!';
  setTimeout(() => document.getElementById('settingsMessage').textContent = '', 2000);
};


window.getFosaSettings = () => fosaSettings;
