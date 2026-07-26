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
    const productsGrid = document.getElementById("products-grid");
    const searchProductsInput = document.getElementById("search-admin-products");
    const btnAddProduct = document.getElementById("btn-add-product");

    let allProductsList = [];

    // Helper Toast
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

    // 1. Manejo de Pestañas (Tabs)
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

    // 2. Escuchador de Autenticación de Firebase
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

    // 3. Inicio de Sesión
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

    // 4. Cerrar Sesión
    if (btnLogoutAdmin) {
        btnLogoutAdmin.addEventListener("click", () => {
            firebase.auth().signOut().then(() => location.reload());
        });
    }

    // 5. Escuchador en Tiempo Real de Reseñas
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

            attachReviewEvents();
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
            </div>`;
    }

    function attachReviewEvents() {
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

    // 6. Escuchador en Tiempo Real de Productos
    function listenToProducts() {
        if (!db || !productsGrid) return;

        db.collection("productos").onSnapshot((snapshot) => {
            allProductsList = [];
            let instockCount = 0;
            let outstockCount = 0;

            snapshot.forEach(doc => {
                const data = doc.data();
                const item = {
                    docId: doc.id,
                    customId: data.id || data.codigo || doc.id,
                    nombre: data.nombre || data.titulo || "Producto",
                    precio: data.precio || 0,
                    imagen: data.imagen || data.img || data.fotoUrl || 'https://placehold.co/70x70?text=P',
                    stock: data.stock || 'instock'
                };

                if (item.stock === 'instock') instockCount++;
                if (item.stock === 'outstock') outstockCount++;

                allProductsList.push(item);
            });

            // Actualizar Métricas
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

            const card = document.createElement("div");
            card.className = "admin-product-card";
            card.innerHTML = `
                <div class="product-card-top">
                    <img src="${rutaImg}" class="product-thumb" onerror="this.src='https://placehold.co/70x70?text=P';">
                    <div class="product-info">
                        <h4>${item.nombre}</h4>
                        <span class="product-id-badge">[${item.customId}]</span>
                        <div class="product-price">$${parseFloat(item.precio).toFixed(2)} MXN</div>
                    </div>
                </div>
                <div>
                    <label style="font-size: 0.75rem; color: #94a3b8; display: block; margin-bottom: 4px;">Estado de Stock:</label>
                    <select class="stock-selector ${item.stock}" data-id="${item.docId}">
                        <option value="instock" ${item.stock === 'instock' ? 'selected' : ''}>🟢 En Stock (Disponible)</option>
                        <option value="onorder" ${item.stock === 'onorder' ? 'selected' : ''}>🟡 Sobre Pedido</option>
                        <option value="outstock" ${item.stock === 'outstock' ? 'selected' : ''}>🔴 Agotado</option>
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

    // Buscador de productos
    if (searchProductsInput) {
        searchProductsInput.addEventListener("input", () => {
            const query = searchProductsInput.value.toLowerCase().trim();
            const filtered = allProductsList.filter(p => 
                p.customId.toLowerCase().includes(query) || 
                p.nombre.toLowerCase().includes(query)
            );
            renderProductsGrid(filtered);
        });
    }

    // Eventos de los productos
    function attachProductEvents() {
        document.querySelectorAll(".stock-selector").forEach(select => {
            select.addEventListener("change", async () => {
                const docId = select.getAttribute("data-id");
                const newStock = select.value;
                try {
                    await db.collection("productos").doc(docId).update({ stock: newStock });
                    Toast.fire({ icon: 'success', title: 'Stock actualizado' });
                } catch (e) {
                    Toast.fire({ icon: 'error', title: 'Error al cambiar stock' });
                }
            });
        });

        document.querySelectorAll(".btn-delete-product").forEach(btn => {
            btn.addEventListener("click", async () => {
                const docId = btn.getAttribute("data-id");
                const res = await Swal.fire({
                    title: '¿Eliminar producto?',
                    text: 'Saldrá del catálogo inmediatamente.',
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

    // Botón Agregar Producto
    if (btnAddProduct) {
        btnAddProduct.addEventListener("click", () => openProductModal(null));
    }

    // Modal Crear / Editar Producto
    async function openProductModal(product = null) {
        const isEdit = !!product;

        const { value: formValues } = await Swal.fire({
            title: isEdit ? 'Editar Producto' : 'Nuevo Producto',
            html: `
                <div style="display:flex; flex-direction:column; gap:12px; text-align:left;">
                    <div>
                        <label style="font-size:0.8rem; color:#94a3b8;">ID / Código del Producto *</label>
                        <input id="swal-prod-id" class="swal2-input" placeholder="Ej. 3DP-005" value="${product ? product.customId : ''}" style="width:100%; margin:4px 0 0 0;">
                    </div>
                    <div>
                        <label style="font-size:0.8rem; color:#94a3b8;">Nombre del Producto *</label>
                        <input id="swal-prod-nombre" class="swal2-input" placeholder="Ej. Figura Hatsune Miku" value="${product ? product.nombre : ''}" style="width:100%; margin:4px 0 0 0;">
                    </div>
                    <div>
                        <label style="font-size:0.8rem; color:#94a3b8;">Precio (MXN) *</label>
                        <input id="swal-prod-precio" type="number" step="0.01" class="swal2-input" placeholder="Ej. 250.00" value="${product ? product.precio : ''}" style="width:100%; margin:4px 0 0 0;">
                    </div>
                    <div>
                        <label style="font-size:0.8rem; color:#94a3b8;">Ruta o URL de Imagen</label>
                        <input id="swal-prod-img" class="swal2-input" placeholder="Ej. img/productos/miku.webp" value="${product ? product.imagen : ''}" style="width:100%; margin:4px 0 0 0;">
                    </div>
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: isEdit ? 'Guardar Cambios' : 'Crear Producto',
            confirmButtonColor: '#38bdf8',
            cancelButtonColor: '#334155',
            preConfirm: () => {
                const customId = document.getElementById('swal-prod-id').value.trim();
                const nombre = document.getElementById('swal-prod-nombre').value.trim();
                const precio = parseFloat(document.getElementById('swal-prod-precio').value) || 0;
                const imagen = document.getElementById('swal-prod-img').value.trim();

                if (!customId || !nombre) {
                    Swal.showValidationMessage('Por favor completa el ID y Nombre.');
                    return false;
                }

                return { customId, nombre, precio, imagen };
            }
        });

        if (formValues) {
            try {
                if (isEdit) {
                    await db.collection("productos").doc(product.docId).update({
                        id: formValues.customId,
                        nombre: formValues.nombre,
                        precio: formValues.precio,
                        imagen: formValues.imagen
                    });
                    Toast.fire({ icon: 'success', title: 'Producto actualizado' });
                } else {
                    await db.collection("productos").add({
                        id: formValues.customId,
                        nombre: formValues.nombre,
                        precio: formValues.precio,
                        imagen: formValues.imagen,
                        stock: 'instock',
                        fecha: new Date().toISOString()
                    });
                    Toast.fire({ icon: 'success', title: 'Producto creado' });
                }
            } catch (e) {
                Toast.fire({ icon: 'error', title: 'Error al guardar producto' });
            }
        }
    }
});