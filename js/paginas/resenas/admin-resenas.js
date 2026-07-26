/* js/paginas/resenas/admin-resenas.js */
import { db } from '../../config/firebase-config.js';

document.addEventListener("DOMContentLoaded", () => {
    const authOverlay = document.getElementById("auth-overlay");
    const adminContent = document.getElementById("admin-content");
    const formLoginAdmin = document.getElementById("form-login-admin");
    const emailInput = document.getElementById("admin-email");
    const passInput = document.getElementById("admin-pass");
    const btnSubmit = document.getElementById("btn-login-admin");
    const btnLogoutAdmin = document.getElementById("btn-logout-admin");
    const authError = document.getElementById("auth-error");
    const userEmailDisplay = document.getElementById("user-email-display");

    const pendingGrid = document.getElementById("pending-grid");
    const approvedGrid = document.getElementById("approved-grid");

    // 1. Escuchador de Estado de Autenticación de Firebase
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            if (authOverlay) authOverlay.style.display = "none";
            if (adminContent) adminContent.style.display = "block";
            if (userEmailDisplay) userEmailDisplay.textContent = user.email;

            listenToReviews();
        } else {
            if (authOverlay) authOverlay.style.display = "flex";
            if (adminContent) adminContent.style.display = "none";
        }
    });

    // 2. Manejo de Inicio de Sesión
    if (formLoginAdmin) {
        formLoginAdmin.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const email = emailInput.value.trim();
            const password = passInput.value.trim();

            if (!email || !password) return;

            try {
                btnSubmit.disabled = true;
                btnSubmit.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Verificando...`;
                authError.style.display = "none";

                await firebase.auth().signInWithEmailAndPassword(email, password);

            } catch (error) {
                console.error("Error de Login:", error);
                authError.style.display = "block";
                
                if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password") {
                    authError.textContent = "Correo o contraseña incorrectos.";
                } else if (error.code === "auth/too-many-requests") {
                    authError.textContent = "Demasiados intentos fallidos. Intenta más tarde.";
                } else {
                    authError.textContent = "Error al iniciar sesión: " + error.message;
                }
            } finally {
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = `<i class="fa-solid fa-lock"></i> Iniciar Sesión`;
            }
        });
    }

    // 3. Cerrar Sesión
    if (btnLogoutAdmin) {
        btnLogoutAdmin.addEventListener("click", () => {
            firebase.auth().signOut().then(() => {
                location.reload();
            });
        });
    }

    // 4. Leer Reseñas de Firestore en Tiempo Real con Cajas Vacías Estilizadas
    function listenToReviews() {
        if (!db) return;

        const pendingCountElem = document.getElementById("stat-pending-count");
        const approvedCountElem = document.getElementById("stat-approved-count");

        db.collection("resenas").onSnapshot((snapshot) => {
            pendingGrid.innerHTML = "";
            approvedGrid.innerHTML = "";

            let pendingCount = 0;
            let approvedCount = 0;

            snapshot.forEach((doc) => {
                const data = doc.data();
                const id = doc.id;

                const cardHTML = createAdminCardHTML(id, data);

                if (data.aprobado === false) {
                    pendingGrid.innerHTML += cardHTML;
                    pendingCount++;
                } else {
                    approvedGrid.innerHTML += cardHTML;
                    approvedCount++;
                }
            });

            // Actualizar contadores superiores
            if (pendingCountElem) pendingCountElem.textContent = pendingCount;
            if (approvedCountElem) approvedCountElem.textContent = approvedCount;

            // Renderizar cajas de estado vacío (Empty States)
            if (pendingCount === 0) {
                pendingGrid.innerHTML = `
                    <div class="empty-state-card">
                        <i class="fa-solid fa-circle-check" style="color: #10b981;"></i>
                        <p>¡Bandeja al día!</p>
                        <span>No hay ninguna reseña pendiente por autorizar en este momento.</span>
                    </div>
                `;
            }

            if (approvedCount === 0) {
                approvedGrid.innerHTML = `
                    <div class="empty-state-card">
                        <i class="fa-solid fa-comment-slash" style="color: #64748b;"></i>
                        <p>Sin reseñas publicadas</p>
                        <span>Aún no has aprobado comentarios para mostrar en el sitio público.</span>
                    </div>
                `;
            }

            attachCardEvents();
        }, (err) => {
            console.error("Error cargando panel admin:", err);
        });
    }

    function createAdminCardHTML(id, data) {
        const fechaObj = new Date(data.fecha);
        const fechaFormateada = fechaObj.toLocaleDateString("es-MX", { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

        let estrellasHTML = "";
        for (let i = 1; i <= 5; i++) {
            estrellasHTML += `<i class="${i <= data.estrellas ? 'fa-solid' : 'fa-regular'} fa-star" style="color: #fbbf24;"></i>`;
        }

        const productoTag = data.productoNombre ? `<div style="font-size:0.8rem; color:#38bdf8; margin-top:4px;"><i class="fa-solid fa-tag"></i> ${data.productoNombre} (${data.productoId})</div>` : '';
        const fotoHTML = data.fotoUrl ? `<div style="margin-top:10px;"><img src="${data.fotoUrl}" style="width:100%; max-height:150px; object-fit:cover; border-radius:8px; border:1px solid #334155;"></div>` : '';

        const isPending = data.aprobado === false;

        return `
            <div class="admin-card ${isPending ? 'pending' : 'approved'}" data-id="${id}">
                <div>
                    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                        <div>
                            <strong style="color:#f8fafc; font-size:1.05rem;">${data.nombre}</strong>
                            <div style="font-size:0.8rem; color:#94a3b8;">${data.servicio || 'Cliente'}</div>
                            ${productoTag}
                        </div>
                        <div>${estrellasHTML}</div>
                    </div>
                    <p style="color:#e2e8f0; font-size:0.9rem; margin-top:12px; font-style:italic;">"${data.comentario}"</p>
                    ${fotoHTML}
                </div>
                <div>
                    <div style="font-size:0.75rem; color:#64748b; margin-top:12px;">${fechaFormateada}</div>
                    <div class="admin-actions">
                        ${isPending ? `<button class="btn-approve btn-action-approve" data-id="${id}"><i class="fa-solid fa-check"></i> Aprobar</button>` : ''}
                        <button class="btn-delete btn-action-delete" data-id="${id}" title="Eliminar"><i class="fa-solid fa-trash-can"></i> ${isPending ? 'Rechazar' : 'Eliminar'}</button>
                    </div>
                </div>
            </div>
        `;
    }

    function attachCardEvents() {
        document.querySelectorAll(".btn-action-approve").forEach(btn => {
            btn.addEventListener("click", async () => {
                const id = btn.getAttribute("data-id");
                try {
                    await db.collection("resenas").doc(id).update({ aprobado: true });
                } catch (e) {
                    alert("Error al aprobar reseña: " + e.message);
                }
            });
        });

        document.querySelectorAll(".btn-action-delete").forEach(btn => {
            btn.addEventListener("click", async () => {
                const id = btn.getAttribute("data-id");
                if (confirm("¿Seguro que deseas eliminar esta reseña?")) {
                    try {
                        await db.collection("resenas").doc(id).delete();
                    } catch (e) {
                        alert("Error al eliminar: " + e.message);
                    }
                }
            });
        });
    }
});