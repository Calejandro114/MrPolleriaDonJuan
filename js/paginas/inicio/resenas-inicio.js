import { db } from '../../config/firebase-config.js';

export function initResenasInicio() {
    const resenasContainer = document.getElementById("resenas-preview-grid");
    if (!resenasContainer || !db) return;

    db.collection("resenas")
      .where("destacada", "==", true)
      .limit(3)
      .onSnapshot((snapshot) => {
          let html = "";
          snapshot.forEach((doc) => {
              const resena = doc.data();
              html += `
                <div class="resena-card-mini">
                  <div class="resena-stars">{"⭐".repeat(resena.estrellas || 5)}</div>
                  <p class="resena-texto">"${resena.comentario}"</p>
                  <span class="resena-autor">- ${resena.autor || 'Cliente Satisfecho'}</span>
                </div>
              `;
          });
          resenasContainer.innerHTML = html || "<p style='color: #94a3b8;'>Próximamente opiniones de nuestros clientes.</p>";
      }, (error) => {
          console.error("Error consultando reseñas:", error);
      });
}