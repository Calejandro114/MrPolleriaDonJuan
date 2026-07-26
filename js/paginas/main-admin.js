/* js/paginas/main-admin.js */
import { db } from '../config/firebase-config.js';

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
    const productsGrid = document.getElementById("products-grid");
    const searchProductsInput = document.getElementById("search-admin-products");
    const btnAddProduct = document.getElementById("btn-add-product");

    let allProductsList = [];

    // Helper Toast SweetAlert2
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: '#1e293b',
        color: '#f8fafc',
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
    });

    // Lista de Servicios Disponibles para el Selector de Edición de Reseñas
    const SERVICIOS_OPCIONES = [
        "Impresión 3D",
        "Llaveros",
        "Pines",
        "Corte Láser / Grabado",
        "Papelería & Stickers",
        "Gorras & Pulseras / Textil",
        "Regalo Personalizado",
        "Otro Trabajo"
    ];

    // 1. Manejo de Pestañas
    const tabButtons = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");

    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const targetTab = btn.getAttribute("data-tab");
            tabButtons.forEach(b => b.classList.remove("active"));
            tabContents.forEach(c => c.classList.remove("active"));

            btn.classList.add("active");
            document.getElementById(targetTab)?.classList.add("active");
        });
    });

    // 2. Autenticación Firebase
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            if (authOverlay) authOverlay.style.display = "none";
            if (adminContent) adminContent.style.display = "block";
            if (userEmailDisplay) userEmailDisplay.textContent = user.email;

            listenToReviews();
            listenToProducts();
        } else {
            if (authOverlay) authOverlay.style.display = "flex";
            if (adminContent) adminContent.style.display = "none";
        }
    });

    // 3. Login
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
                Toast.fire({ icon: 'success', title: '¡Bienvenido al panel!' });

            } catch (error) {
                console.error("Error de Login:", error);
                authError.style.display = "block";
                authError.textContent = "Correo o contraseña incorrectos.";
            } finally {
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = `<i class="fa-solid fa-lock"></i> Iniciar Sesión`;
            }
        });
    }

    // 4. Logout
    if (btnLogoutAdmin) {
        btnLogoutAdmin.addEventListener("click", () => {
            firebase.auth().signOut().then(() => location.reload());
        });
    }

    // 5. Escuchador de Reseñas con Edición de Datos
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
                const cardHTML = createAdminCardHTML(doc.id, data);

                if (data.aprobado === false) {
                    pendingGrid.innerHTML += cardHTML;
                    pendingCount++;
                } else {
                    approvedGrid.innerHTML += cardHTML;
                    approvedCount++;
                }
            });

            if (pendingCountElem) pendingCountElem.textContent = pendingCount;
            if (approvedCountElem) approvedCountElem.textContent = approvedCount;

            if (pendingCount === 0) {
                pendingGrid.innerHTML = `
                    <div class="empty-state-card">
                        <i class="fa-solid fa-circle-check" style="color: #10b981;"></i>
                        <p>¡Bandeja al día!</p>
                        <span>No hay ninguna reseña pendiente por autorizar.</span>
                    </div>`;
            }

            if (approvedCount === 0) {
                approvedGrid.innerHTML = `
                    <div class="empty-state-card">
                        <i class="fa-solid fa-comment-slash" style="color: #64748b;"></i>
                        <p>Sin reseñas publicadas</p>
                        <span>Aún no has aprobado comentarios.</span>
                    </div>`;
            }

            attachReviewEvents(snapshot);
        });
    }

    function createAdminCardHTML(id, data) {
        const fechaObj = new Date(data.fecha);
        const fechaFormateada = fechaObj.toLocaleDateString("es-MX", { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

        let estrellasHTML = "";
        for (let i = 1; i <= 5; i++) {
            estrellasHTML += `<i class="${i <= data.estrellas ? 'fa-solid' : 'fa-regular'} fa-star" style="color: #fbbf24;"></i>`;
        }

        const productoTag = data.productoNombre ? `<div style="font-size:0.8rem; color:#38bdf8; margin-top:4px;"><i class="fa-solid fa-tag"></i> ${data.productoNombre} (${data.productoId})</div>` : '<div style="font-size:0.75rem; color:#64748b; margin-top:4px;">Sin producto asociado</div>';
        const isPending = data.aprobado === false;

        let fotoHTML = '';
        if (data.fotoUrl) {
            fotoHTML = `
                <div style="margin-top:10px; position:relative;">
                    <img src="${data.fotoUrl}" style="width:100%; max-height:150px; object-fit:cover; border-radius:8px; border:1px solid #334155;">
                    ${isPending ? `
                        <button class="btn-remove-photo" data-id="${id}" style="position:absolute; top:6px; right:6px; background:rgba(239, 68, 68, 0.9); color:#fff; border:none; padding:4px 8px; border-radius:6px; font-size:0.75rem; cursor:pointer; font-weight:600; backdrop-filter:blur(4px);">
                            <i class="fa-solid fa-image-slash"></i> Quitar Foto
                        </button>
                    ` : ''}
                </div>`;
        }

        return `
            <div class="admin-card ${isPending ? 'pending' : 'approved'}" data-id="${id}">
                <div>
                    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                        <div>
                            <strong style="color:#f8fafc; font-size:1.05rem;">${data.nombre}</strong>
                            <div style="font-size:0.8rem; color:#94a3b8;"><i class="fa-solid fa-wrench" style="font-size:0.7rem;"></i> ${data.servicio || 'Cliente'}</div>
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
                        ${isPending ? `<button class="btn-edit-review" data-id="${id}" style="background:#0284c7; color:#fff; border:none; padding:6px 10px; border-radius:6px; cursor:pointer; font-size:0.8rem; font-weight:600;"><i class="fa-solid fa-pen-to-square"></i> Editar Datos</button>` : ''}
                        ${isPending ? `<button class="btn-approve btn-action-approve" data-id="${id}"><i class="fa-solid fa-check"></i> Aprobar</button>` : ''}
                        <button class="btn-delete btn-action-delete" data-id="${id}" title="Eliminar"><i class="fa-solid fa-trash-can"></i> ${isPending ? 'Rechazar' : 'Eliminar'}</button>
                    </div>
                </div>
            </div>`;
    }

    function attachReviewEvents(snapshot) {
        // Evento para Editar Datos de la Reseña Pendiente (Servicio y Producto Asociado)
        document.querySelectorAll(".btn-edit-review").forEach(btn => {
            btn.addEventListener("click", async () => {
                const id = btn.getAttribute("data-id");
                
                // Obtener datos actuales de la reseña
                let reviewData = null;
                snapshot.forEach(doc => {
                    if (doc.id === id) reviewData = doc.data();
                });

                if (!reviewData) return;

                const optionsServicioHTML = SERVICIOS_OPCIONES.map(s => 
                    `<option value="${s}" ${reviewData.servicio === s ? 'selected' : ''}>${s}</option>`
                ).join("");

                const optionsProductosHTML = `<option value="">-- Sin producto asociado --</option>` + 
                    allProductsList.map(p => 
                        `<option value="${p.id}" ${reviewData.productoId === p.id ? 'selected' : ''}>[${p.id}] ${p.nombre}</option>`
                    ).join("");

                const { value: formValues } = await Swal.fire({
                    title: 'Corregir Datos de Reseña',
                    html: `
                        <div style="display:flex; flex-direction:column; gap:12px; text-align:left;">
                            <div>
                                <label style="font-size:0.8rem; color:#94a3b8; display:block; margin-bottom:4px;">Servicio Solicitado:</label>
                                <select id="swal-review-service" class="swal2-input" style="width:100%; margin:0; background:#0f172a; color:#f8fafc;">
                                    ${optionsServicioHTML}
                                </select>
                            </div>
                            <div>
                                <label style="font-size:0.8rem; color:#94a3b8; display:block; margin-bottom:4px;">Producto Asociado:</label>
                                <select id="swal-review-product" class="swal2-input" style="width:100%; margin:0; background:#0f172a; color:#f8fafc;">
                                    ${optionsProductosHTML}
                                </select>
                            </div>
                        </div>
                    `,
                    focusConfirm: false,
                    showCancelButton: true,
                    confirmButtonText: 'Guardar Cambios',
                    confirmButtonColor: '#38bdf8',
                    cancelButtonColor: '#334155',
                    preConfirm: () => {
                        const nuevoServicio = document.getElementById('swal-review-service').value;
                        const nuevoProdId = document.getElementById('swal-review-product').value;
                        
                        let nuevoProdNombre = null;
                        if (nuevoProdId) {
                            const prodObj = allProductsList.find(p => p.id === nuevoProdId);
                            if (prodObj) nuevoProdNombre = prodObj.nombre;
                        }

                        return {
                            servicio: nuevoServicio,
                            productoId: nuevoProdId || null,
                            productoNombre: nuevoProdNombre
                        };
                    }
                });

                if (formValues) {
                    try {
                        await db.collection("resenas").doc(id).update(formValues);
                        Toast.fire({ icon: 'success', title: 'Datos de la reseña actualizados' });
                    } catch (e) {
                        Toast.fire({ icon: 'error', title: 'Error al actualizar reseña' });
                    }
                }
            });
        });

        // Evento para Aprobar Reseña
        document.querySelectorAll(".btn-action-approve").forEach(btn => {
            btn.addEventListener("click", async () => {
                const id = btn.getAttribute("data-id");
                try {
                    await db.collection("resenas").doc(id).update({ aprobado: true });
                    Toast.fire({ icon: 'success', title: 'Reseña aprobada con éxito' });
                } catch (e) {
                    Toast.fire({ icon: 'error', title: 'Error al aprobar: ' + e.message });
                }
            });
        });

        // Evento para Quitar Foto
        document.querySelectorAll(".btn-remove-photo").forEach(btn => {
            btn.addEventListener("click", async () => {
                const id = btn.getAttribute("data-id");
                const result = await Swal.fire({
                    title: '¿Quitar imagen?',
                    text: 'Se eliminará la foto adjunta pero se conservará el comentario para que puedas aprobarlo.',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#ef4444',
                    cancelButtonColor: '#334155',
                    confirmButtonText: 'Sí, quitar foto',
                    cancelButtonText: 'Cancelar'
                });

                if (result.isConfirmed) {
                    try {
                        await db.collection("resenas").doc(id).update({
                            fotoUrl: firebase.firestore.FieldValue.delete()
                        });
                        Toast.fire({ icon: 'success', title: 'Imagen removida de la reseña' });
                    } catch (e) {
                        Toast.fire({ icon: 'error', title: 'Error al quitar la imagen: ' + e.message });
                    }
                }
            });
        });

        // Evento para Eliminar Reseña
        document.querySelectorAll(".btn-action-delete").forEach(btn => {
            btn.addEventListener("click", async () => {
                const id = btn.getAttribute("data-id");
                const result = await Swal.fire({
                    title: '¿Eliminar reseña?',
                    text: 'Esta acción no se puede deshacer.',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#ef4444',
                    cancelButtonColor: '#334155',
                    confirmButtonText: 'Sí, eliminar',
                    cancelButtonText: 'Cancelar'
                });

                if (result.isConfirmed) {
                    try {
                        await db.collection("resenas").doc(id).delete();
                        Toast.fire({ icon: 'success', title: 'Reseña eliminada' });
                    } catch (e) {
                        Toast.fire({ icon: 'error', title: 'Error al eliminar: ' + e.message });
                    }
                }
            });
        });
    }

    // 6. Escuchador de Productos
    function listenToProducts() {
        if (!db || !productsGrid) return;

        db.collection("productos").onSnapshot((snapshot) => {
            allProductsList = [];
            let instockCount = 0;
            let outstockCount = 0;

            snapshot.forEach(doc => {
                const data = doc.data();

                let estadoStock = 'instock';
                
                if (data.disponibleVenta === false) {
                    estadoStock = 'unavailable'; 
                } else if (data.agotado === true && data.sobrePedido === true) {
                    estadoStock = 'outstock_onorder'; 
                } else if (data.piezasUnicas === true) {
                    estadoStock = 'unique'; 
                } else if (data.agotado === false && data.sobrePedido === true) {
                    estadoStock = 'instock'; 
                } else {
                    estadoStock = 'outstock_onorder';
                }

                const item = {
                    docId: doc.id,
                    id: data.id || doc.id,
                    nombre: data.nombre || "Producto",
                    precioSinDescuento: data.precioSinDescuento || "$0 MXN",
                    precioConDescuento: data.precioConDescuento || "",
                    enOferta: data.enOferta === true,
                    categoria: data.categoria || "3d",
                    descripcion: data.descripcion || "",
                    imagen: data.imagen || 'https://placehold.co/70x70?text=P',
                    stock: data.stock !== undefined ? data.stock : 0,
                    agotado: data.agotado === true,
                    sobrePedido: data.sobrePedido === true,
                    disponibleVenta: data.disponibleVenta !== false,
                    piezasUnicas: data.piezasUnicas === true,
                    estadoStock: estadoStock
                };

                if (estadoStock === 'instock' || estadoStock === 'unique') instockCount++;
                if (estadoStock === 'outstock_onorder' || estadoStock === 'unavailable') outstockCount++;

                allProductsList.push(item);
            });

            const totalElem = document.getElementById("stat-products-total");
            const inElem = document.getElementById("stat-products-instock");
            const outElem = document.getElementById("stat-products-outstock");

            if (totalElem) totalElem.textContent = allProductsList.length;
            if (inElem) inElem.textContent = instockCount;
            if (outElem) outElem.textContent = outstockCount;

            renderProductsGrid(allProductsList);
        });
    }

    function renderProductsGrid(list) {
        productsGrid.innerHTML = "";

        if (list.length === 0) {
            productsGrid.innerHTML = `
                <div class="empty-state-card">
                    <i class="fa-solid fa-box-open" style="color: #64748b;"></i>
                    <p>No hay productos guardados</p>
                    <span>Haz clic en "Nuevo Producto" para agregar ítems a tu catálogo.</span>
                </div>`;
            return;
        }

        list.forEach(item => {
            let rutaImg = item.imagen;
            if (rutaImg && !rutaImg.startsWith('http') && !rutaImg.startsWith('../')) {
                rutaImg = '../' + rutaImg;
            }

            const badgeOferta = item.enOferta ? `<span style="font-size:0.7rem; background:#f59e0b; color:#0f172a; padding:1px 6px; border-radius:4px; font-weight:700;">¡Oferta!</span>` : '';
            const precioMostrar = item.enOferta && item.precioConDescuento ? `${item.precioConDescuento} <s style="font-size:0.8rem; color:#94a3b8;">${item.precioSinDescuento}</s>` : item.precioSinDescuento;

            const card = document.createElement("div");
            card.className = "admin-product-card";
            card.innerHTML = `
                <div class="product-card-top">
                    <img src="${rutaImg}" class="product-thumb" onerror="this.src='https://placehold.co/70x70?text=P';">
                    <div class="product-info">
                        <h4>${item.nombre} ${badgeOferta}</h4>
                        <span class="product-id-badge">[${item.id}]</span>
                        <div class="product-price">${precioMostrar}</div>
                    </div>
                </div>
                <div>
                    <label style="font-size: 0.75rem; color: #94a3b8; display: block; margin-bottom: 4px;">Estado de Stock:</label>
                    <select class="stock-selector ${item.estadoStock}" data-id="${item.docId}">
                        <option value="instock" ${item.estadoStock === 'instock' ? 'selected' : ''}>🟢 En stock (Sobre pedido)</option>
                        <option value="unique" ${item.estadoStock === 'unique' ? 'selected' : ''}>🟢 En stock (Piezas únicas)</option>
                        <option value="outstock_onorder" ${item.estadoStock === 'outstock_onorder' ? 'selected' : ''}>🔴 Agotado (Sobre pedido)</option>
                        <option value="unavailable" ${item.estadoStock === 'unavailable' ? 'selected' : ''}>⚪ Agotado (No disponible actualmente)</option>
                    </select>
                </div>
                <div class="admin-actions" style="margin-top: 8px; padding-top: 10px;">
                    <button class="btn-approve btn-edit-product" data-id="${item.docId}"><i class="fa-solid fa-pen"></i> Editar</button>
                    <button class="btn-delete btn-delete-product" data-id="${item.docId}"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            `;
            productsGrid.appendChild(card);
        });

        attachProductEvents();
    }

    if (searchProductsInput) {
        searchProductsInput.addEventListener("input", () => {
            const query = searchProductsInput.value.toLowerCase().trim();
            const filtered = allProductsList.filter(p => 
                p.id.toLowerCase().includes(query) || 
                p.nombre.toLowerCase().includes(query) ||
                p.categoria.toLowerCase().includes(query)
            );
            renderProductsGrid(filtered);
        });
    }

    // 7. Sincronización del Selector de Stock
    function attachProductEvents() {
        document.querySelectorAll(".stock-selector").forEach(select => {
            select.addEventListener("change", async () => {
                const docId = select.getAttribute("data-id");
                const selectedVal = select.value;

                let payload = {};
                if (selectedVal === 'instock') {
                    payload = { agotado: false, sobrePedido: true, disponibleVenta: true, piezasUnicas: false };
                } else if (selectedVal === 'unique') {
                    payload = { agotado: false, sobrePedido: false, disponibleVenta: true, piezasUnicas: true };
                } else if (selectedVal === 'outstock_onorder') {
                    payload = { agotado: true, sobrePedido: true, disponibleVenta: true, piezasUnicas: false, stock: 0 };
                } else if (selectedVal === 'unavailable') {
                    payload = { agotado: true, sobrePedido: false, disponibleVenta: false, piezasUnicas: false, stock: 0 };
                }

                try {
                    await db.collection("productos").doc(docId).update(payload);
                    Toast.fire({ icon: 'success', title: 'Estado de stock actualizado' });
                } catch (e) {
                    Toast.fire({ icon: 'error', title: 'Error al cambiar estado' });
                }
            });
        });

        document.querySelectorAll(".btn-delete-product").forEach(btn => {
            btn.addEventListener("click", async () => {
                const docId = btn.getAttribute("data-id");
                const res = await Swal.fire({
                    title: '¿Eliminar producto?',
                    text: 'Saldrá de Firestore inmediatamente.',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#ef4444',
                    cancelButtonColor: '#334155',
                    confirmButtonText: 'Sí, borrar'
                });

                if (res.isConfirmed) {
                    try {
                        await db.collection("productos").doc(docId).delete();
                        Toast.fire({ icon: 'success', title: 'Producto eliminado' });
                    } catch (e) {
                        Toast.fire({ icon: 'error', title: 'Error al eliminar' });
                    }
                }
            });
        });

        document.querySelectorAll(".btn-edit-product").forEach(btn => {
            btn.addEventListener("click", () => {
                const docId = btn.getAttribute("data-id");
                const item = allProductsList.find(p => p.docId === docId);
                if (item) openProductModal(item);
            });
        });
    }

    if (btnAddProduct) {
        btnAddProduct.addEventListener("click", () => openProductModal(null));
    }

    // 8. Modal de Edición/Creación de Producto
    async function openProductModal(product = null) {
        const isEdit = !!product;

        const prefijosCat = {
            '3d': '3DP',
            'llavero': 'LLAV',
            'pines': 'PIN',
            'laser': 'LAS',
            'papeleria': 'PAP',
            'textil': 'TEXT'
        };

        const obtenerSiguienteId = (catKey) => {
            const prefijo = prefijosCat[catKey] || '3DP';
            const numerosExistentes = allProductsList
                .map(p => p.id)
                .filter(id => id && id.startsWith(`${prefijo}-`))
                .map(id => {
                    const parts = id.split('-');
                    return parseInt(parts[1], 10);
                })
                .filter(num => !isNaN(num));

            const maxNum = numerosExistentes.length > 0 ? Math.max(...numerosExistentes) : 0;
            const siguienteNum = String(maxNum + 1).padStart(3, '0');
            return `${prefijo}-${siguienteNum}`;
        };

        const extraerNumero = (str) => {
            if (!str) return '';
            return String(str).replace(/[^0-9.]/g, '');
        };

        const numPrecioSin = product ? extraerNumero(product.precioSinDescuento) : '';
        const numPrecioCon = product ? extraerNumero(product.precioConDescuento) : '';

        const initialCat = product ? product.categoria : '3d';
        const initialId = isEdit ? product.id : obtenerSiguienteId(initialCat);

        const { value: formValues } = await Swal.fire({
            title: isEdit ? 'Editar Producto' : 'Nuevo Producto',
            html: `
                <div style="display:flex; flex-direction:column; gap:12px; text-align:left; max-height:70vh; overflow-y:auto; padding-right:5px;">
                    <div>
                        <label style="font-size:0.8rem; color:#94a3b8;">Categoría *</label>
                        <select id="swal-prod-cat" class="swal2-input" style="width:100%; margin:4px 0 0 0; background:#0f172a; color:#f8fafc;">
                            <option value="3d" ${initialCat === '3d' ? 'selected' : ''}>Impresión 3D (3DP)</option>
                            <option value="llavero" ${initialCat === 'llavero' ? 'selected' : ''}>Llaveros (LLAV)</option>
                            <option value="pines" ${initialCat === 'pines' ? 'selected' : ''}>Pines (PIN)</option>
                            <option value="laser" ${initialCat === 'laser' ? 'selected' : ''}>Corte & Grabado Láser (LAS)</option>
                            <option value="papeleria" ${initialCat === 'papeleria' ? 'selected' : ''}>Papelería & Stickers (PAP)</option>
                            <option value="textil" ${initialCat === 'textil' ? 'selected' : ''}>Gorras & Pulseras (TEXT)</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-size:0.8rem; color:#94a3b8;">ID / Código del Producto (Autogenerado) *</label>
                        <input id="swal-prod-id" class="swal2-input" value="${initialId}" readonly style="width:100%; margin:4px 0 0 0; background:#1e293b; color:#38bdf8; font-weight:700; cursor:not-allowed;">
                    </div>
                    <div>
                        <label style="font-size:0.8rem; color:#94a3b8;">Nombre del Producto *</label>
                        <input id="swal-prod-nombre" class="swal2-input" placeholder="Ej. Hatsune Miku / Figura 3d Articulada" value="${product ? product.nombre : ''}" style="width:100%; margin:4px 0 0 0;">
                    </div>

                    <!-- PRECIO NORMAL -->
                    <div>
                        <label style="font-size:0.8rem; color:#94a3b8;">Precio Normal *</label>
                        <div style="display:flex; align-items:center; margin-top:4px;">
                            <span style="background:#334155; color:#38bdf8; font-weight:700; padding:0 12px; height:42px; display:flex; align-items:center; border-top-left-radius:8px; border-bottom-left-radius:8px; border:1px solid #334155; border-right:none;">$</span>
                            <input id="swal-prod-precio" type="number" step="0.01" class="swal2-input" placeholder="250" value="${numPrecioSin}" style="margin:0; border-radius:0; height:42px; width:100%;">
                            <span style="background:#334155; color:#94a3b8; font-weight:700; font-size:0.8rem; padding:0 12px; height:42px; display:flex; align-items:center; border-top-right-radius:8px; border-bottom-right-radius:8px; border:1px solid #334155; border-left:none;">MXN</span>
                        </div>
                    </div>

                    <!-- PRECIO DESCUENTO -->
                    <div>
                        <label style="font-size:0.8rem; color:#94a3b8;">Precio Descuento (Opcional)</label>
                        <div style="display:flex; align-items:center; margin-top:4px;">
                            <span style="background:#334155; color:#38bdf8; font-weight:700; padding:0 12px; height:42px; display:flex; align-items:center; border-top-left-radius:8px; border-bottom-left-radius:8px; border:1px solid #334155; border-right:none;">$</span>
                            <input id="swal-prod-precio-desc" type="number" step="0.01" class="swal2-input" placeholder="150" value="${numPrecioCon}" style="margin:0; border-radius:0; height:42px; width:100%;">
                            <span style="background:#334155; color:#94a3b8; font-weight:700; font-size:0.8rem; padding:0 12px; height:42px; display:flex; align-items:center; border-top-right-radius:8px; border-bottom-right-radius:8px; border:1px solid #334155; border-left:none;">MXN</span>
                        </div>
                    </div>

                    <!-- CASILLA DE EN OFERTA -->
                    <div style="display:flex; align-items:center; gap:8px; margin-top:4px;">
                        <input type="checkbox" id="swal-prod-oferta" ${product && product.enOferta ? 'checked' : ''} style="width:18px; height:18px; cursor:pointer;">
                        <label for="swal-prod-oferta" style="font-size:0.85rem; color:#f8fafc; cursor:pointer;">Activar como Producto en Oferta (enOferta)</label>
                    </div>

                    <!-- CASILLA DE PIEZAS ÚNICAS -->
                    <div style="display:flex; align-items:center; gap:8px;">
                        <input type="checkbox" id="swal-prod-unicas" ${product && product.piezasUnicas ? 'checked' : ''} style="width:18px; height:18px; cursor:pointer;">
                        <label for="swal-prod-unicas" style="font-size:0.85rem; color:#10b981; font-weight:600; cursor:pointer;">⚡ Activar como Piezas Únicas (entrega inmediata)</label>
                    </div>

                    <div>
                        <label style="font-size:0.8rem; color:#94a3b8;">Cantidad de Stock</label>
                        <input id="swal-prod-stock" type="number" class="swal2-input" placeholder="Ej. 2" value="${product ? product.stock : 0}" style="width:100%; margin:4px 0 0 0;">
                    </div>
                    <div>
                        <label style="font-size:0.8rem; color:#94a3b8;">Descripción</label>
                        <textarea id="swal-prod-desc" class="swal2-textarea" placeholder="Ej. Muñeco / Figura 3D Articulada" style="width:100%; margin:4px 0 0 0; background:#0f172a; color:#f8fafc;">${product ? product.descripcion : ''}</textarea>
                    </div>

                    <!-- SECCIÓN DE IMAGEN -->
                    <div style="background:#0f172a; border:1px solid #334155; padding:12px; border-radius:10px;">
                        <label style="font-size:0.8rem; color:#38bdf8; font-weight:700; display:block; margin-bottom:6px;">
                            <i class="fa-solid fa-image"></i> Seleccionar Imagen desde tu Equipo
                        </label>
                        <input type="file" id="swal-prod-file" accept="image/*" style="display:none;">
                        <button type="button" id="swal-btn-file" style="background:rgba(56,189,248,0.15); color:#38bdf8; border:1px solid rgba(56,189,248,0.4); padding:8px 12px; border-radius:8px; width:100%; cursor:pointer; font-weight:600; font-size:0.85rem;">
                            <i class="fa-solid fa-folder-open"></i> Elegir foto de muestra
                        </button>

                        <div style="margin-top:10px;">
                            <label style="font-size:0.75rem; color:#94a3b8;">Ruta Generada para GitHub / Local:</label>
                            <input id="swal-prod-img" class="swal2-input" placeholder="Ej. img/productos/3d/miku.png" value="${product ? product.imagen : ''}" style="width:100%; margin:4px 0 0 0; font-size:0.85rem;">
                        </div>

                        <div id="swal-preview-wrapper" style="margin-top:10px; display:${product && product.imagen ? 'block' : 'none'}; text-align:center;">
                            <span style="font-size:0.75rem; color:#94a3b8; display:block; margin-bottom:4px;">Vista Previa de Imagen:</span>
                            <img id="swal-img-preview" src="${product && product.imagen ? (product.imagen.startsWith('http') || product.imagen.startsWith('../') ? product.imagen : '../' + product.imagen) : ''}" style="max-height:100px; border-radius:8px; border:1px solid #334155; object-fit:cover;">
                        </div>
                    </div>
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: isEdit ? 'Guardar Cambios' : 'Crear Producto',
            confirmButtonColor: '#38bdf8',
            cancelButtonColor: '#334155',

            willOpen: () => {
                document.body.style.overflow = 'hidden';
            },
            didOpen: () => {
                const catSelect = document.getElementById('swal-prod-cat');
                const idInput = document.getElementById('swal-prod-id');
                const fileInput = document.getElementById('swal-prod-file');
                const btnFile = document.getElementById('swal-btn-file');
                const imgInput = document.getElementById('swal-prod-img');
                const previewWrapper = document.getElementById('swal-preview-wrapper');
                const imgPreview = document.getElementById('swal-img-preview');

                if (catSelect && !isEdit) {
                    catSelect.addEventListener('change', () => {
                        idInput.value = obtenerSiguienteId(catSelect.value);
                    });
                }

                if (btnFile && fileInput) {
                    btnFile.addEventListener('click', () => fileInput.click());
                }

                if (fileInput) {
                    fileInput.addEventListener('change', (e) => {
                        const file = e.target.files[0];
                        if (file) {
                            const catValue = catSelect ? catSelect.value : '3d';
                            const cleanName = file.name.toLowerCase().replace(/\s+/g, '_');
                            
                            const rutaGenerada = `img/productos/${catValue}/${cleanName}`;
                            imgInput.value = rutaGenerada;

                            const reader = new FileReader();
                            reader.onload = (evt) => {
                                imgPreview.src = evt.target.result;
                                previewWrapper.style.display = 'block';
                            };
                            reader.readAsDataURL(file);
                        }
                    });
                }

                if (imgInput) {
                    imgInput.addEventListener('input', () => {
                        const val = imgInput.value.trim();
                        if (val) {
                            let src = val;
                            if (!src.startsWith('http') && !src.startsWith('../')) src = '../' + src;
                            imgPreview.src = src;
                            previewWrapper.style.display = 'block';
                        } else {
                            previewWrapper.style.display = 'none';
                        }
                    });
                }
            },
            didClose: () => {
                document.body.style.overflow = 'auto';
            },

            preConfirm: () => {
                const customId = document.getElementById('swal-prod-id').value.trim();
                const nombre = document.getElementById('swal-prod-nombre').value.trim();
                const categoria = document.getElementById('swal-prod-cat').value;
                const rawPrecioSin = document.getElementById('swal-prod-precio').value.trim();
                const rawPrecioCon = document.getElementById('swal-prod-precio-desc').value.trim();
                const enOferta = document.getElementById('swal-prod-oferta').checked;
                const esPiezasUnicas = document.getElementById('swal-prod-unicas').checked;
                const stockVal = Number(document.getElementById('swal-prod-stock').value) || 0;
                const descripcion = document.getElementById('swal-prod-desc').value.trim();
                const imagen = document.getElementById('swal-prod-img').value.trim();

                if (!customId || !nombre || !rawPrecioSin) {
                    Swal.showValidationMessage('Por favor completa Nombre y Precio Normal.');
                    return false;
                }

                const precioSinDescuento = `$${rawPrecioSin} MXN`;
                const precioConDescuento = rawPrecioCon ? `$${rawPrecioCon} MXN` : '';

                const esStockCero = stockVal <= 0;

                return {
                    id: customId,
                    nombre,
                    categoria,
                    precioSinDescuento,
                    precioConDescuento,
                    enOferta,
                    stock: stockVal,
                    descripcion,
                    imagen,
                    agotado: esStockCero,
                    sobrePedido: esPiezasUnicas ? false : true,
                    disponibleVenta: true,
                    piezasUnicas: esPiezasUnicas
                };
            }
        });

        if (formValues) {
            try {
                if (isEdit) {
                    await db.collection("productos").doc(product.docId).update(formValues);
                    Toast.fire({ icon: 'success', title: 'Producto actualizado' });
                } else {
                    await db.collection("productos").add(formValues);
                    Toast.fire({ icon: 'success', title: 'Producto creado con éxito' });
                }
            } catch (e) {
                console.error(e);
                Toast.fire({ icon: 'error', title: 'Error al guardar en Firestore' });
            }
        }
    }

    // --- 9. GESTIÓN DE BAZARES EN EL PANEL ---
    const btnAddBazar = document.getElementById("btn-add-bazar");
    const bazarFormContainer = document.getElementById("bazar-form-container");
    const btnCancelBazar = document.getElementById("btn-cancel-bazar");
    const formBazar = document.getElementById("form-bazar");

    if (btnAddBazar && bazarFormContainer) {
        btnAddBazar.addEventListener("click", () => {
            formBazar.reset();
            document.getElementById("bazar-id").value = "";
            document.getElementById("bazar-form-title").innerText = "Registrar Nuevo Bazar";
            bazarFormContainer.style.display = "block";
        });
    }

    if (btnCancelBazar && bazarFormContainer) {
        btnCancelBazar.addEventListener("click", () => {
            bazarFormContainer.style.display = "none";
        });
    }

    if (formBazar) {
        formBazar.addEventListener("submit", async (e) => {
            e.preventDefault();
            const id = document.getElementById("bazar-id").value;
            const nombre = document.getElementById("bazar-nombre").value.trim();
            const esActual = document.getElementById("bazar-es-actual").value === "true";
            const fecha = document.getElementById("bazar-fecha").value.trim();
            const horario = document.getElementById("bazar-horario").value.trim();
            const stand = document.getElementById("bazar-stand").value.trim();
            const imagen = document.getElementById("bazar-imagen").value.trim();
            const mapaIframeUrl = document.getElementById("bazar-mapa").value.trim();
            const descripcion = document.getElementById("bazar-descripcion").value.trim();

            const bazarData = {
                nombre,
                esActual,
                fecha,
                horario,
                stand,
                imagenCroquis: imagen,
                imagen: imagen,
                mapaIframeUrl,
                descripcion,
                descripcionUbicacion: descripcion
            };

            try {
                if (id) {
                    await db.collection("bazares").doc(id).update(bazarData);
                    Toast.fire({ icon: 'success', title: 'Bazar actualizado correctamente' });
                } else {
                    await db.collection("bazares").add(bazarData);
                    Toast.fire({ icon: 'success', title: 'Nuevo bazar registrado' });
                }

                formBazar.reset();
                bazarFormContainer.style.display = "none";
                cargarBazaresAdmin();
            } catch (err) {
                console.error(err);
                Toast.fire({ icon: 'error', title: 'Error al guardar el bazar' });
            }
        });
    }

    // Actualizar el escuchador de pestañas para que cargue los bazares al hacer clic
    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const targetTab = btn.getAttribute("data-tab");
            if (targetTab === "tab-bazares") {
                cargarBazaresAdmin();
            }
        });
    });

    // Cargar bazares por si el usuario entra directo a la pestaña
    cargarBazaresAdmin();
});

// Función global para listar los bazares en el panel de control
window.cargarBazaresAdmin = async function() {
    const gridAdmin = document.getElementById("admin-bazares-grid");
    if (!gridAdmin) return;

    gridAdmin.innerHTML = '<div class="skeleton-card"></div><div class="skeleton-card"></div>';

    try {
        const snapshot = await db.collection("bazares").get();
        let html = "";

        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const id = docSnap.id;

            html += `
                <div class="contacto-card" style="background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 16px; display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <span style="font-size: 0.75rem; color: #38bdf8; font-weight: 700; text-transform: uppercase;">
                            ${data.esActual ? '📍 Bazar Actual' : '📜 Bazar Anterior'}
                        </span>
                        <h4 style="color: #f8fafc; margin: 6px 0; font-size: 1.1rem;">${data.nombre}</h4>
                        <p style="color: #94a3b8; font-size: 0.85rem; margin-bottom: 4px;"><i class="fa-regular fa-calendar-days"></i> ${data.fecha}</p>
                        <p style="color: #94a3b8; font-size: 0.85rem; margin-bottom: 8px;"><i class="fa-solid fa-store"></i> ${data.stand || 'Sin stand asignado'}</p>
                    </div>
                    <div style="display: flex; gap: 8px; margin-top: 12px;">
                        <button onclick="window.eliminarBazar('${id}')" class="btn-logout" style="padding: 6px 12px; font-size: 0.8rem; border-radius: 6px; cursor: pointer;">
                            <i class="fa-solid fa-trash"></i> Eliminar
                        </button>
                    </div>
                </div>
            `;
        });

        gridAdmin.innerHTML = html || `<p style="color: #94a3b8; grid-column: 1 / -1; text-align: center; padding: 20px;">No hay bazares registrados todavía. ¡Haz clic en "Nuevo Bazar o Evento" para agregar uno!</p>`;

    } catch (error) {
        console.error("Error al cargar bazares en admin:", error);
        gridAdmin.innerHTML = `<p style="color: #ef4444; grid-column: 1 / -1; text-align: center;">Error al cargar los registros.</p>`;
    }
}

window.eliminarBazar = async function(id) {
    const confirmacion = await Swal.fire({
        title: '¿Estás seguro?',
        text: "Esta acción eliminará el bazar del sistema.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#334155',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });

    if (confirmacion.isConfirmed) {
        try {
            await db.collection("bazares").doc(id).delete();
            Swal.fire("¡Eliminado!", "El registro ha sido borrado.", "success");
            cargarBazaresAdmin();
        } catch (error) {
            console.error("Error al eliminar bazar:", error);
            Swal.fire("Error", "No se pudo eliminar el registro.", "error");
        }
    }
}

// Función global para eliminar un bazar
window.eliminarBazar = async function(id) {
    const confirmacion = await Swal.fire({
        title: '¿Estás seguro?',
        text: "Esta acción eliminará el bazar del sistema.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#334155',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });

    if (confirmacion.isConfirmed) {
        try {
            await firebase.firestore().collection("bazares").doc(id).delete();
            Swal.fire("¡Eliminado!", "El registro ha sido borrado.", "success");
            cargarBazaresAdmin();
        } catch (error) {
            console.error("Error al eliminar bazar:", error);
            Swal.fire("Error", "No se pudo eliminar el registro.", "error");
        }
    }
}
