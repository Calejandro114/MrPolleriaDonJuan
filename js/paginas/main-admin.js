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

    // 5. Escuchador de Reseñas
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

    // 6. Escuchador de Productos con Nombres de Campos Exactos
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
                } else if (data.agotado === true) {
                    estadoStock = 'outstock';
                } else if (data.sobrePedido === true) {
                    estadoStock = 'onorder';
                } else {
                    estadoStock = 'instock';
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
                    estadoStock: estadoStock
                };

                if (estadoStock === 'instock') instockCount++;
                if (estadoStock === 'outstock' || estadoStock === 'unavailable') outstockCount++;

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
                        <option value="instock" ${item.estadoStock === 'instock' ? 'selected' : ''}>🟢 En Stock (Disponible)</option>
                        <option value="onorder" ${item.estadoStock === 'onorder' ? 'selected' : ''}>🟡 Sobre Pedido</option>
                        <option value="outstock" ${item.estadoStock === 'outstock' ? 'selected' : ''}>🔴 Agotado</option>
                        <option value="unavailable" ${item.estadoStock === 'unavailable' ? 'selected' : ''}>⚪ No disponible para venta actualmente</option>
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
                    payload = { agotado: false, sobrePedido: false, disponibleVenta: true };
                } else if (selectedVal === 'onorder') {
                    payload = { agotado: false, sobrePedido: true, disponibleVenta: true, stock: 0 };
                } else if (selectedVal === 'outstock') {
                    payload = { agotado: true, sobrePedido: false, disponibleVenta: true, stock: 0 };
                } else if (selectedVal === 'unavailable') {
                    payload = { agotado: true, sobrePedido: false, disponibleVenta: false, stock: 0 };
                }

                try {
                    await db.collection("productos").doc(docId).update(payload);
                    Toast.fire({ icon: 'success', title: 'Estado actualizado' });
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

    // 8. Modal de Edición/Creación con Autogeneración de Ruta de Imagen desde Archivo Local
    async function openProductModal(product = null) {
        const isEdit = !!product;

        const extraerNumero = (str) => {
            if (!str) return '';
            return String(str).replace(/[^0-9.]/g, '');
        };

        const numPrecioSin = product ? extraerNumero(product.precioSinDescuento) : '';
        const numPrecioCon = product ? extraerNumero(product.precioConDescuento) : '';

        const { value: formValues } = await Swal.fire({
            title: isEdit ? 'Editar Producto' : 'Nuevo Producto',
            html: `
                <div style="display:flex; flex-direction:column; gap:12px; text-align:left; max-height:70vh; overflow-y:auto; padding-right:5px;">
                    <div>
                        <label style="font-size:0.8rem; color:#94a3b8;">ID / Código del Producto *</label>
                        <input id="swal-prod-id" class="swal2-input" placeholder="Ej. 3DP-001" value="${product ? product.id : ''}" style="width:100%; margin:4px 0 0 0;">
                    </div>
                    <div>
                        <label style="font-size:0.8rem; color:#94a3b8;">Nombre del Producto *</label>
                        <input id="swal-prod-nombre" class="swal2-input" placeholder="Ej. Hatsune Miku / Figura 3d Articulada" value="${product ? product.nombre : ''}" style="width:100%; margin:4px 0 0 0;">
                    </div>
                    <div>
                        <label style="font-size:0.8rem; color:#94a3b8;">Categoría *</label>
                        <select id="swal-prod-cat" class="swal2-input" style="width:100%; margin:4px 0 0 0; background:#0f172a; color:#f8fafc;">
                            <option value="3d" ${product && product.categoria === '3d' ? 'selected' : ''}>Impresión 3D</option>
                            <option value="llavero" ${product && product.categoria === 'llavero' ? 'selected' : ''}>Llaveros</option>
                            <option value="laser" ${product && product.categoria === 'laser' ? 'selected' : ''}>Corte & Grabado Láser</option>
                            <option value="textil" ${product && product.categoria === 'textil' ? 'selected' : ''}>Gorras & Pulseras</option>
                            <option value="papeleria" ${product && product.categoria === 'papeleria' ? 'selected' : ''}>Papelería & Stickers</option>
                            <option value="pines" ${product && product.categoria === 'pines' ? 'selected' : ''}>Pines</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-size:0.8rem; color:#94a3b8;">Precio Normal (Escribe solo el número) *</label>
                        <input id="swal-prod-precio" type="number" step="0.01" class="swal2-input" placeholder="Ej. 250" value="${numPrecioSin}" style="width:100%; margin:4px 0 0 0;">
                    </div>
                    <div>
                        <label style="font-size:0.8rem; color:#94a3b8;">Precio Descuento (Escribe solo el número)</label>
                        <input id="swal-prod-precio-desc" type="number" step="0.01" class="swal2-input" placeholder="Ej. 150" value="${numPrecioCon}" style="width:100%; margin:4px 0 0 0;">
                    </div>
                    <div style="display:flex; align-items:center; gap:8px; margin-top:4px;">
                        <input type="checkbox" id="swal-prod-oferta" ${product && product.enOferta ? 'checked' : ''} style="width:18px; height:18px; cursor:pointer;">
                        <label for="swal-prod-oferta" style="font-size:0.85rem; color:#f8fafc; cursor:pointer;">Activar como Producto en Oferta (enOferta)</label>
                    </div>
                    <div>
                        <label style="font-size:0.8rem; color:#94a3b8;">Cantidad de Stock</label>
                        <input id="swal-prod-stock" type="number" class="swal2-input" placeholder="Ej. 2" value="${product ? product.stock : 0}" style="width:100%; margin:4px 0 0 0;">
                    </div>
                    <div>
                        <label style="font-size:0.8rem; color:#94a3b8;">Descripción</label>
                        <textarea id="swal-prod-desc" class="swal2-textarea" placeholder="Ej. Muñeco / Figura 3D Articulada" style="width:100%; margin:4px 0 0 0; background:#0f172a; color:#f8fafc;">${product ? product.descripcion : ''}</textarea>
                    </div>

                    <!-- SECCIÓN DE IMAGEN CON AUTOGENERACIÓN DE RUTA DESDE ARCHIVO LOCAL -->
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

                        <!-- VISTA PREVIA OBLIGATORIA -->
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
                const fileInput = document.getElementById('swal-prod-file');
                const btnFile = document.getElementById('swal-btn-file');
                const imgInput = document.getElementById('swal-prod-img');
                const catSelect = document.getElementById('swal-prod-cat');
                const previewWrapper = document.getElementById('swal-preview-wrapper');
                const imgPreview = document.getElementById('swal-img-preview');

                if (btnFile && fileInput) {
                    btnFile.addEventListener('click', () => fileInput.click());
                }

                if (fileInput) {
                    fileInput.addEventListener('change', (e) => {
                        const file = e.target.files[0];
                        if (file) {
                            const catValue = catSelect ? catSelect.value : '3d';
                            const cleanName = file.name.toLowerCase().replace(/\s+/g, '_');
                            
                            // Construye la ruta exacta para GitHub/Local
                            const rutaGenerada = `img/productos/${catValue}/${cleanName}`;
                            imgInput.value = rutaGenerada;

                            // Muestra la vista previa local inmediata
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
                const stockVal = Number(document.getElementById('swal-prod-stock').value) || 0;
                const descripcion = document.getElementById('swal-prod-desc').value.trim();
                const imagen = document.getElementById('swal-prod-img').value.trim();

                if (!customId || !nombre || !rawPrecioSin) {
                    Swal.showValidationMessage('Por favor completa ID, Nombre y Precio Normal.');
                    return false;
                }

                const precioSinDescuento = `$${rawPrecioSin} MXN`;
                const precioConDescuento = rawPrecioCon ? `$${rawPrecioCon} MXN` : '';

                return {
                    id: customId,
                    nombre,
                    categoria,
                    precioSinDescuento,
                    precioConDescuento,
                    enOferta,
                    stock: stockVal,
                    descripcion,
                    imagen
                };
            }
        });

        if (formValues) {
            try {
                if (isEdit) {
                    await db.collection("productos").doc(product.docId).update(formValues);
                    Toast.fire({ icon: 'success', title: 'Producto actualizado' });
                } else {
                    await db.collection("productos").add({
                        ...formValues,
                        agotado: false,
                        sobrePedido: false,
                        disponibleVenta: true
                    });
                    Toast.fire({ icon: 'success', title: 'Producto creado con éxito' });
                }
            } catch (e) {
                console.error(e);
                Toast.fire({ icon: 'error', title: 'Error al guardar en Firestore' });
            }
        }
    }
});
