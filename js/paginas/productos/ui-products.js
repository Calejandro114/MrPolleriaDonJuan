/* js/paginas/productos/ui-products.js */
import { openModal } from '../../componentes/ui-modal.js';
import { addToCart } from '../../componentes/cart-service.js';

const WHATSAPP_PHONE = "526673538481"; 

/**
 * Renderiza tarjetas de producto en el contenedor especificado o por defecto.
 * @param {Array} items - Lista de productos.
 * @param {HTMLElement|null} customContainer - Elemento DOM donde inyectar la grilla.
 */
export function renderProductsUI(items, customContainer = null) {
    const targetGrid = customContainer || document.getElementById("products-grid");

    if (!targetGrid) return;
    targetGrid.innerHTML = "";

    if (!items || items.length === 0) {
        targetGrid.innerHTML = `<p style="color: #94a3b8; grid-column: 1/-1; text-align: center;">No se encontraron productos coincidentes.</p>`;
        return;
    }

    const esSubcarpeta = window.location.pathname.includes('/paginas/');
    const fallbackImage = esSubcarpeta ? '../img/notFound.jpg' : 'img/notFound.jpg';

    items.forEach(prod => {
        // 1. Identificación de Banderas y Estados
        const estaEnOferta = prod.enOferta === true;
        const esAgotado = prod.agotado === true;
        const esSobrePedido = prod.sobrePedido === true;
        const esDisponibleVenta = prod.disponibleVenta !== false;

        // Clasificación exacta de los 4 estados:
        const esNoDisponibleActualmente = !esDisponibleVenta; 
        const esPiezaUnica = !esAgotado && !esSobrePedido && esDisponibleVenta;
        const esAgotadoSobrePedido = esAgotado && esSobrePedido && esDisponibleVenta;
        const esEnStockSobrePedido = !esAgotado && !esSobrePedido && esDisponibleVenta;

        // Normalización de la ruta de imagen
        let imgSrc = prod.imagen || fallbackImage;
        if (
            imgSrc && 
            !imgSrc.startsWith('http') && 
            !imgSrc.startsWith('data:') && 
            !imgSrc.startsWith('/') && 
            !imgSrc.startsWith('../')
        ) {
            if (esSubcarpeta) {
                imgSrc = '../' + imgSrc;
            }
        }

        const precioSinDesc = prod.precioSinDescuento || '';
        const precioConDesc = prod.precioConDescuento || '';
        const precioFinal = estaEnOferta ? precioConDesc : precioSinDesc;

        let priceHTML = `<div class="product-price">${precioSinDesc}</div>`;
        let badgeHTML = '';
        let stockHTML = '';
        let buttonHTML = '';

        // Si está en oferta (y no no-disponible), muestra ambos precios y badge de Oferta
        if (estaEnOferta && !esNoDisponibleActualmente) {
            priceHTML = `
                <div class="price-container">
                    <span class="price-original">${precioSinDesc}</span>
                    <span class="price-discount">${precioConDesc}</span>
                </div>
            `;
            badgeHTML = `<span class="badge-offer">¡Oferta!</span>`;
        }

        // =========================================================================
        // APLICACIÓN DE LAS REGLAS POR CADA UNO DE LOS 4 ESTADOS CON BOTÓN DOBLE
        // =========================================================================

        if (esNoDisponibleActualmente) {
            // ⚪ CASO 1: AGOTADO NO DISPONIBLE ACTUAMENTE
            stockHTML = `
                <div class="stock-count" style="color: #64748b;">
                    <div class="stock-main">
                        <i class="fa-solid fa-ban"></i> No disponible por el momento
                    </div>
                </div>
            `;
            buttonHTML = `
                <div class="product-actions-group">
                    <button class="btn-buy" disabled style="background-color: #334155; color: #94a3b8; cursor: not-allowed; border: none; width: 100%;">
                        No disponible por el momento
                    </button>
                </div>
            `;

        } else if (esPiezaUnica) {
            // 🟢 CASO 2: EN STOCK PIEZAS ÚNICAS
            badgeHTML += `<span class="badge-offer" style="background: #10b981; color: #0f172a; margin-top: 4px;">Piezas únicas</span>`;
            
            stockHTML = `
                <div class="stock-count" style="color: #10b981;">
                    <div class="stock-main">
                        <i class="fa-solid fa-bolt" style="color: #10b981;"></i> ¡Pieza única en tienda!
                    </div>
                </div>
            `;

            const message = encodeURIComponent(`Hola! Me interesa la pieza única (${prod.id || ''}): *${prod.nombre}* (${precioFinal}). Quisiera saber si aún la tienes disponible para entrega inmediata.`);
            const waLink = `https://wa.me/${WHATSAPP_PHONE}?text=${message}`;

            buttonHTML = `
                <div class="product-actions-group">
                    <a href="${waLink}" target="_blank" class="btn-buy" style="background-color: #10b981;">
                        <i class="fa-brands fa-whatsapp"></i> Comprar Pieza
                    </a>
                    <button class="btn-add-cart" data-id="${prod.id || ''}" title="Agregar al Carrito">
                        <span>Agregar al Carrito</span>
                        <i class="fa-solid fa-cart-plus"></i>
                    </button>
                </div>
            `;

        } else if (esAgotadoSobrePedido) {
            // 🔴 CASO 3: AGOTADO SOBRE PEDIDO
            if (!estaEnOferta) {
                badgeHTML = `<span class="badge-offer badge-custom-order">Sobre Pedido</span>`;
            }
            stockHTML = `
                <div class="stock-count" style="color: #38bdf8;">
                    <div class="stock-main">
                        <i class="fa-solid fa-box-open"></i> Sin stock en tienda
                    </div>
                    <div class="custom-order-hint" style="color: #94a3b8;">
                        <i class="fa-solid fa-clock"></i> ¡Disponible sobre encargo!
                    </div>
                </div>
            `;

            const message = encodeURIComponent(`Hola! Vi que el producto (${prod.id || ''}): *${prod.nombre}* (${precioFinal}) no tiene stock en tienda. Me gustaría encargar piezas sobre pedido.`);
            const waLink = `https://wa.me/${WHATSAPP_PHONE}?text=${message}`;

            buttonHTML = `
                <div class="product-actions-group">
                    <a href="${waLink}" target="_blank" class="btn-buy" style="background-color: #0284c7;">
                        <i class="fa-brands fa-whatsapp"></i> Encargar
                    </a>
                    <button class="btn-add-cart" data-id="${prod.id || ''}" title="Agregar al Carrito">
                        <span>Agregar al Carrito</span>
                        <i class="fa-solid fa-cart-plus"></i>
                    </button>
                </div>
            `;

        } else {
            // 🟢 CASO 4: EN STOCK SOBRE PEDIDO
            const rawStock = prod.stock !== undefined ? prod.stock : prod.Stock;
            const cantidadStock = Number(rawStock);

            let textoEntrega = "";
            let iconoStock = "";

            if (!isNaN(cantidadStock) && cantidadStock < 5 && cantidadStock > 0) {
                iconoStock = `<i class="fa-solid fa-fire" style="color: #f59e0b;"></i>`;
                textoEntrega = cantidadStock === 1 
                    ? "¡Solo queda 1 disponible!" 
                    : `¡Solo quedan ${cantidadStock} disponibles!`;
            } else {
                iconoStock = `<i class="fa-solid fa-bolt" style="color: #38bdf8;"></i>`;
                textoEntrega = `¡Disponible para entrega inmediata!`;
            }
                
            stockHTML = `
                <div class="stock-count">
                    <div class="stock-main">
                        ${iconoStock} ${textoEntrega}
                    </div>
                    <div class="custom-order-hint">
                        <i class="fa-solid fa-wand-magic-sparkles"></i> Encarga la cantidad que necesites
                    </div>
                </div>
            `;

            const message = encodeURIComponent(`Hola! Me interesa el producto (${prod.id || ''}): *${prod.nombre}* (${precioFinal}). Quisiera saber si aún está disponible en tienda o si puedo encargarlo sobre pedido.`);
            const waLink = `https://wa.me/${WHATSAPP_PHONE}?text=${message}`;

            buttonHTML = `
                <div class="product-actions-group">
                    <a href="${waLink}" target="_blank" class="btn-buy">
                        <i class="fa-brands fa-whatsapp"></i> Pedir o Encargar
                    </a>
                    <button class="btn-add-cart" data-id="${prod.id || ''}" title="Agregar al Carrito">
                        <span>Agregar al Carrito</span>
                        <i class="fa-solid fa-cart-plus"></i>
                    </button>
                </div>
            `;
        }

        const card = document.createElement("div");
        card.className = "product-card";
        if (esNoDisponibleActualmente) card.style.opacity = "0.6";

        card.innerHTML = `
            <div class="card-image-wrapper">
                ${badgeHTML}
                <img src="${imgSrc}" alt="${prod.nombre}" onerror="this.onerror=null; this.src='${fallbackImage}';">
            </div>
            <div class="product-info">
                <div>
                    <div class="product-title">${prod.nombre}</div>
                    <div class="product-desc">${prod.descripcion || ''}</div>
                    <div class="product-id">ID: ${prod.id || 'N/A'}</div>
                </div>
                <div>
                    ${stockHTML}
                    ${priceHTML}
                    ${buttonHTML}
                </div>
            </div>
        `;

        // Evento para abrir Modal al dar clic en la imagen
        const imgElement = card.querySelector('.card-image-wrapper img');
        if (imgElement) {
            imgElement.addEventListener('click', (e) => {
                e.stopPropagation();
                openModal(imgSrc);
            });
        }

        // Agregar al carrito real + feedback visual
        const btnAddCart = card.querySelector('.btn-add-cart');
        if (btnAddCart) {
            btnAddCart.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Agrega el producto a localStorage y actualiza el contador de la Navbar
                addToCart(prod);

                // Animación sutil de botón presionado
                btnAddCart.classList.add('cart-added-pop');
                setTimeout(() => {
                    btnAddCart.classList.remove('cart-added-pop');
                }, 300);
            });
        }

        targetGrid.appendChild(card);
    });
}

// Mantener alias por retrocompatibilidad
export const renderProducts = renderProductsUI;