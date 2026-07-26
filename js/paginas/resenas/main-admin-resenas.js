/* js/paginas/resenas/main-admin-resenas.js */
import { db } from '../../config/firebase-config.js';

document.addEventListener("DOMContentLoaded", () => {
    escucharResenasAdmin();
});

function escucharResenasAdmin() {
    const pendingGrid = document.getElementById("pending-grid");
    const approvedGrid = document.getElementById("approved-grid");
    const statPending = document.getElementById("stat-pending-count");
    const statApproved = document.getElementById("stat-approved-count");

    if (!pendingGrid || !approvedGrid) return;

    db.collection("resenas").onSnapshot((snapshot) => {
        let countPending = 0;
        let countApproved = 0;

        let htmlPending = "";
        let htmlApproved = "";

        snapshot.forEach((doc) => {
            const data = doc.data();
            const id = doc.id;
            const esAprobado = data.aprobado === true;

            if (esAprobado) countApproved++;
            else countPending++;

            const fechaObj = new Date(data.fecha);
            const fechaFormateada = fechaObj.toLocaleDateString("es-MX", { year: 'numeric', month: 'short', day: 'numeric' });

            let estrellasHTML = "";
            for (let i = 1; i <= 5; i++) {
                estrellasHTML += `<i class="${i <= data.estrellas ? 'fa-solid' : 'fa-regular'} fa-star"></i>`;
            }

            const productoTag = data.productoNombre ? `
                <span class="resena-product-tag">
                    <i class="fa-solid fa-tag"></i> ${data.productoNombre} (${data.productoId})
                </span>
            ` : '';

            const fotoHTML = data.fotoUrl ? `<div class="resena-img-container"><img src="${data.fotoUrl}" alt="Foto cliente"></div>` : '';

            const card = `
                <div class="resena-card" style="background: #1e293b; border: 1px solid #334155;">
                    <div class="resena-card-main">
                        <div class="resena-header">
                            <div class="resena-author">
                                <h4 style="color:#f8fafc;">${data.nombre}</h4>
                                <span class="resena-service-badge">${data.servicio || 'Cliente'}</span>
                                ${productoTag}
                            </div>
                            <div class="resena-rating-box">
                                <span class="resena-stars-icons">${estrellasHTML}</span>
                                <span class="resena-rating-score">${data.estrellas}/5</span>
                            </div>
                        </div>
                        <p class="resena-body" style="color:#cbd5e1;">"${data.comentario}"</p>
                        ${fotoHTML}
                    </div>
                    <div class="resena-footer" style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid #334155; padding-top:10px; margin-top:10px;">
                        <span style="color:#94a3b8; font-size:0.8rem;">${fechaFormateada}</span>
                        <div style="display:flex; gap:8px;">
                            ${!esAprobado ? `
                                <button onclick="window.aprobarResena('${id}')" class="btn-primary" style="padding:4px 10px; font-size:0.75rem; background:#10b981;">
                                    <i class="fa-solid fa-check"></i> Aprobar
                                </button>
                            ` : ''}
                            <button onclick="window.eliminarResena('${id}')" class="btn-logout" style="padding:4px 10px; font-size:0.75rem;">
                                <i class="fa-solid fa-trash"></i> Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            `;

            if (esAprobado) {
                htmlApproved += card;
            } else {
                htmlPending += card;
            }
        });

        if (statPending) statPending.innerText = countPending;
        if (statApproved) statApproved.innerText = countApproved;

        pendingGrid.innerHTML = htmlPending || `<p style="color: #94a3b8; grid-column: 1/-1;">No hay reseñas pendientes por aprobar.</p>`;
        approvedGrid.innerHTML = htmlApproved || `<p style="color: #94a3b8; grid-column: 1/-1;">No hay reseñas publicadas todavía.</p>`;
    });
}

// Funciones globales para botones
window.aprobarResena = async function(id) {
    try {
        await db.collection("resenas").doc(id).update({ aprobado: true });
        Swal.fire({
            icon: 'success',
            title: '¡Aprobada!',
            text: 'La reseña ahora es visible para todo el público.',
            timer: 1500,
            showConfirmButton: false
        });
    } catch (error) {
        console.error("Error al aprobar:", error);
        Swal.fire("Error", "No se pudo aprobar la reseña.", "error");
    }
};

window.eliminarResena = async function(id) {
    const res = await Swal.fire({
        title: '¿Eliminar reseña?',
        text: "Esta acción borrará el comentario permanentemente.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#334155',
        confirmButtonText: 'Sí, borrar'
    });

    if (res.isConfirmed) {
        try {
            await db.collection("resenas").doc(id).delete();
            Swal.fire("Eliminada", "La reseña ha sido borrada.", "success");
        } catch (error) {
            console.error("Error al eliminar:", error);
            Swal.fire("Error", "No se pudo eliminar.", "error");
        }
    }
};