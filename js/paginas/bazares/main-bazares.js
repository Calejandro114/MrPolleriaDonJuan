// js/paginas/bazares/main-bazares.js
import { db } from '../../config/firebase-config.js';
import { renderNavUI } from '../../componentes/ui-nav.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Pinta la barra de navegación superior para el público
  renderNavUI();

  const containerActual = document.getElementById("bazar-actual-container");
  const gridPasados = document.getElementById("bazares-pasados-grid");

  try {
    const bazaresRef = collection(db, "bazares");
    const querySnapshot = await getDocs(bazaresRef);

    let bazarActualHTML = "";
    let pasadosHTML = "";

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();

      if (data.esActual) {
        bazarActualHTML = `
          <div class="bazar-card-hero">
            <div class="bazar-badge-status">
              <i class="fa-solid fa-circle-dot fa-beat-fade"></i> Evento Programado
            </div>
            <h3 style="color: #f8fafc; font-size: 1.5rem; margin-bottom: 6px;">${data.nombre}</h3>
            <p style="color: #38bdf8; font-weight: 600;"><i class="fa-regular fa-calendar-days"></i> ${data.fecha}</p>
          </div>
        `;
      } else {
        pasadosHTML += `
          <div class="bazar-card-past">
            <h4 style="color: #f8fafc;">${data.nombre}</h4>
          </div>
        `;
      }
    });

    if (containerActual) containerActual.innerHTML = bazarActualHTML || "<p>No hay eventos activos.</p>";
    if (gridPasados) gridPasados.innerHTML = pasadosHTML || "<p>No hay eventos pasados.</p>";

  } catch (error) {
    console.error("Error al cargar bazares públicos:", error);
  }
});