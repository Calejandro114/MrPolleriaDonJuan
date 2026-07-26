/* js/paginas/resenas/admin-resenas.js */
import { db } from '../../config/firebase-config.js';

document.addEventListener("DOMContentLoaded", () => {
    const listaPendientes = document.getElementById("lista-pendientes");
    const listaAprobadas = document.getElementById("lista-aprobadas");

    if (typeof db !== 'undefined' && db) {
        
        // Listener en tiempo real de todas las reseñas
        db.collection("resenas").orderBy("fecha", "desc").onSnapshot((snapshot) => {
            listaPendientes.innerHTML = "";
            listaAprobadas.innerHTML = "";

            let hayPendientes = false;
            let hayAprobadas = false;

            snapshot.forEach((doc) => {
                const data = doc.data();
                const docId = doc.id;

                const item = document.createElement("div");
                item.className = "admin-item";
                item.innerHTML = `
                    <div>
                        <strong style="color: #f8fafc; font-size: 1.05rem;">${data.nombre}</strong> 
                        <span style="color: #fbbf24;">(${data.estrellas} ⭐)</span> - 
                        <span style="color: #38bdf8;">${data.servicio || 'General'}</span>
                        <p style="color: #cbd5e1; margin: 8px 0 0 0;">"${data.comentario}"</p>
                    </div>
                    <div class="admin-actions">
                        ${!data.aprobado ? `<button class="btn-approve" data-id="${docId}"><i class="fa-solid fa-check"></i> Aprobar</button>` : ''}
                        <button class="btn-delete" data-id="${docId}"><i class="fa-solid fa-trash"></i> Borrar</button>
                    </div>
                `;

                if (!data.aprobado) {
                    listaPendientes.appendChild(item);
                    hayPendientes = true;
                } else {
                    listaAprobadas.appendChild(item);
                    hayAprobadas = true;
                }
            });

            if (!hayPendientes) {
                listaPendientes.innerHTML = `<p style="color: #64748b;">No hay reseñas pendientes por revisar.</p>`;
            }
            if (!hayAprobadas) {
                listaAprobadas.innerHTML = `<p style="color: #64748b;">Aún no hay reseñas aprobadas.</p>`;
            }

            // Escuchar clics de botones
            document.querySelectorAll(".btn-approve").forEach(btn => {
                btn.addEventListener("click", () => cambiarEstado(btn.dataset.id, true));
            });

            document.querySelectorAll(".btn-delete").forEach(btn => {
                btn.addEventListener("click", () => eliminarResena(btn.dataset.id));
            });
        });
    }

    async function cambiarEstado(id, nuevoEstado) {
        try {
            await db.collection("resenas").doc(id).update({ aprobado: nuevoEstado });
        } catch (e) {
            console.error("Error al aprobar:", e);
        }
    }

    async function eliminarResena(id) {
        if (confirm("¿Estás seguro de borrar esta reseña?")) {
            try {
                await db.collection("resenas").doc(id).delete();
            } catch (e) {
                console.error("Error al borrar:", e);
            }
        }
    }
});