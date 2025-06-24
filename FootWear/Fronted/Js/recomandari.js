document.getElementById('recommendationForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const data = {
    sezon: document.getElementById('sezon').value,
    ocazie: document.getElementById('ocazie').value,
    culoare: document.getElementById('culoare').value,
    marca: document.getElementById('marca').value,
    stil: document.getElementById('stil').value,
    gen: document.getElementById('gen').value
  };

  console.log('Trimitem datele către server:', data);


  localStorage.setItem("recomandare", JSON.stringify(data));


  window.location.href = "rezultate.html";
});
