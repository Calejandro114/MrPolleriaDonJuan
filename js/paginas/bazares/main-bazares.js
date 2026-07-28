import { db } from '../../config/firebase-config.js';
import { renderNavUI } from '../../componentes/ui-nav.js';
import { renderFooterUI } from '../../componentes/ui-footer.js';
import { initModal } from '../../componentes/ui-modal.js';

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Inyecta la navegación, footer y modal
  renderNavUI();
  if (typeof renderFooterUI === 'function') renderFooterUI();
  if (typeof initModal === 'function') initModal();

  const containerActual = document.getElementById("bazar-actual-container");
  const gridPasados = document.getElementById("bazares-pasados-grid");

  try {
    // 2. Consulta Firestore usando la sintaxis Compat que exporta db
    const snapshot = await db.collection("bazares").get();

    let bazarActualHTML = "";
    let pasadosHTML = "";

    snapshot.forEach((doc) => {
      const data = doc.data();

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
            <div class="bazar-past-content">
              <h4 style="color: #f8fafc; margin-bottom: 6px;">${data.nombre}</h4>
              <p style="color: #94a3b8; font-size: 0.85rem;">${data.fecha || ''}</p>
            </div>
          </div>
        `;
      }
    });

    if (containerActual) containerActual.innerHTML = bazarActualHTML || "<p style='color: #94a3b8;'>No hay eventos activos por el momento.</p>";
    if (gridPasados) gridPasados.innerHTML = pasadosHTML || "<p style='color: #94a3b8;'>No hay historial de eventos anteriores.</p>";

  } catch (error) {
    console.error("Error al cargar bazares públicos:", error);
  }
});