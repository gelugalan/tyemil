let savedData; 

document.addEventListener("DOMContentLoaded", function () {
  savedData = JSON.parse(localStorage.getItem("recomandare"));

  if (!savedData) {
    document.getElementById("rezultate-container").innerHTML = "<p>Date lipsă. Înapoi la recomandări.</p>";
    return;
  }

  fetch("http://127.0.0.1:5000/api/recomandari", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(savedData)
  })
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("rezultate-container");

      if (data.length === 0) {
        container.innerHTML = "<p>Nu s-au găsit recomandări 😢</p>";
        return;
      }

      data.forEach(pantof => {
        const card = document.createElement("div");
        card.classList.add("card");

        card.innerHTML = `
          <h2>${pantof.nume}</h2>
          <div class="detalii">
            <p><strong>Brand:</strong> ${pantof.brand}</p>
            <p><strong>Stil:</strong> ${pantof.stil}</p>
            <p><strong>Sezon:</strong> ${pantof.sezon}</p>
            <p><strong>Culoare:</strong> ${pantof.culoare}</p>
          </div>
          <div class="poze">
            ${pantof.poze.map(url => `<img src="${url}" alt="Pantof">`).join('')}
          </div>
        `;


        const exportContainer = document.createElement("div");
        exportContainer.classList.add("export-buttons");

        // CSV
        const csvBtn = document.createElement("button");
        csvBtn.textContent = "Export CSV";
        csvBtn.classList.add("export-button", "csv");
        csvBtn.addEventListener("click", () => {
          fetch("http://127.0.0.1:5000/api/export_single_csv", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(pantof)
          })
            .then(res => res.blob())
            .then(blob => {
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${pantof.nume.replace(/\s+/g, "_")}.csv`;
              document.body.appendChild(a);
              a.click();
              a.remove();
            });
        });

        // HTML
        const htmlBtn = document.createElement("button");
        htmlBtn.textContent = "Export HTML";
        htmlBtn.classList.add("export-button", "html");
        htmlBtn.addEventListener("click", () => {
          fetch("http://127.0.0.1:5000/api/export_single_html", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(pantof)
          })
            .then(res => res.blob())
            .then(blob => {
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${pantof.nume.replace(/\s+/g, "_")}.html`;
              document.body.appendChild(a);
              a.click();
              a.remove();
            });
        });

        // XML
        const xmlBtn = document.createElement("button");
        xmlBtn.textContent = "Export XML";
        xmlBtn.classList.add("export-button", "xml");
        xmlBtn.addEventListener("click", () => {
          fetch("http://127.0.0.1:5000/api/export_single_xml", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(pantof)
          })
            .then(res => res.blob())
            .then(blob => {
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${pantof.nume.replace(/\s+/g, "_")}.xml`;
              document.body.appendChild(a);
              a.click();
              a.remove();
            });
        });

        exportContainer.appendChild(csvBtn);
        exportContainer.appendChild(htmlBtn);
        exportContainer.appendChild(xmlBtn);
        card.appendChild(exportContainer);
        container.appendChild(card);
      });
    })
    .catch(err => {
      console.error("Eroare la preluarea recomandărilor:", err);
      document.getElementById("rezultate-container").innerHTML =
        "<p>Ups! A apărut o eroare la conectarea cu serverul.</p>";
    });
});


document.body.insertAdjacentHTML("beforeend", `
  <div id="lightbox" class="lightbox hidden">
    <span class="close-btn">&times;</span>
    <span class="arrow left">&larr;</span>
    <img class="lightbox-img" src="" alt="Preview">
    <span class="arrow right">&rarr;</span>
  </div>
`);

const lightbox = document.getElementById("lightbox");
const lightboxImg = lightbox.querySelector(".lightbox-img");
const closeBtn = lightbox.querySelector(".close-btn");
const leftArrow = lightbox.querySelector(".arrow.left");
const rightArrow = lightbox.querySelector(".arrow.right");

let currentImages = [];
let currentIndex = 0;

document.addEventListener("keydown", function (e) {
  if (lightbox.classList.contains("hidden")) return;

  if (e.key === "ArrowRight") {
    currentIndex = (currentIndex + 1) % currentImages.length;
    lightboxImg.src = currentImages[currentIndex];
  } else if (e.key === "ArrowLeft") {
    currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
    lightboxImg.src = currentImages[currentIndex];
  } else if (e.key === "Escape") {
    lightbox.classList.add("hidden");
    lightboxImg.src = "";
  }
});



document.addEventListener("click", function (e) {

  if (e.target.tagName === "IMG" && e.target.closest(".poze")) {
    const imgs = Array.from(e.target.closest(".poze").querySelectorAll("img"));
    currentImages = imgs.map(img => img.src);
    currentIndex = imgs.indexOf(e.target);

    lightboxImg.src = currentImages[currentIndex];
    lightbox.classList.remove("hidden");
  }

  // Închide
  if (e.target === closeBtn || e.target === lightbox) {
    lightbox.classList.add("hidden");
    lightboxImg.src = "";
    currentImages = [];
    currentIndex = 0;
  }

  // Navigare stânga
  if (e.target === leftArrow && currentImages.length > 0) {
    currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
    lightboxImg.src = currentImages[currentIndex];
  }

  // Navigare dreapta
  if (e.target === rightArrow && currentImages.length > 0) {
    currentIndex = (currentIndex + 1) % currentImages.length;
    lightboxImg.src = currentImages[currentIndex];
  }
});


