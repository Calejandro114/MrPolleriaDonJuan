/* js/paginas/productos/ui-products.js */
import { openModal } from '../../componentes/ui-modal.js';

const WHATSAPP_PHONE = "526673538481"; 

/**
 * Renderiza tarjetas de producto en el contenedor especificado o por defecto.
 * @param {Array} items - Lista de productos.
 * @param {HTMLElement|null} customContainer - Elemento DOM donde inyectar la grilla.
 */
export function renderProductsUI(items, customContainer = null) {
    // Si no se pasa un contenedor específico, busca el de por defecto 'products-grid'
    const targetGrid = customContainer || document.getElementById("products-grid");

    if (!targetGrid) return;
    targetGrid.innerHTML = "";

    if (!items || items.length === 0) {
        targetGrid.innerHTML = `<p style="color: #94a3b8; grid-column: 1/-1; text-align: center;">No se encontraron productos coincidentes.</p>`;
        return;
    }

    // Detectar si la página se está ejecutando desde una subcarpeta (ej. /paginas/)
    const esSubcarpeta = window.location.pathname.includes('/paginas/');
    const fallbackImage = esSubcarpeta ? '../img/notFound.jpg' : 'img/notFound.jpg';

    items.forEach(prod => {
        const estaEnOferta = prod.enOferta === true;
        const esAgotado = prod.agotado === true;

        // Normalización inteligente de la ruta de la imagen
        let imgSrc = prod.imagen || fallbackImage;

        // Si es una ruta local y estamos en subcarpeta, anteponemos ../
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

        // Lectura limpia en camelCase
        const precioSinDesc = prod.precioSinDescuento || '';
        const precioConDesc = prod.precioConDescuento || '';

        // Precio dinámico que se envía al mensaje de WhatsApp
        const precioFinal = estaEnOferta ? precioConDesc : precioSinDesc;

        // Por defecto (enOferta === false): Muestra solo precioSinDescuento
        let priceHTML = `<div class="product-price">${precioSinDesc}</div>`;
        let badgeHTML = '';
        let stockHTML = '';
        let buttonHTML = '';

        // Si enOferta === true: Muestra ambos precios y el badge de ¡Oferta!
        if (estaEnOferta && !esAgotado) {
            priceHTML = `
                <div class="price-container">
                    <span class="price-original">${precioSinDesc}</span>
                    <span class="price-discount">${precioConDesc}</span>
                </div>
            `;
            badgeHTML = `<span class="badge-offer">¡Oferta!</span>`;
        }

        // Manejo de Stock
        const rawStock = prod.stock !== undefined ? prod.stock : prod.Stock;
        const cantidadStock = Number(rawStock);

        if (!isNaN(cantidadStock) && cantidadStock > 0 && !esAgotado) {
            let textoEntrega = "";
            let iconoStock = "";

            if (cantidadStock < 5) {
                iconoStock = `<i class="fa-solid fa-fire" style="color: #f59e0b;"></i>`;
                textoEntrega = cantidadStock === 1 
                    ? "¡Solo queda 1 disponible!" 
                    : `¡Solo quedan ${cantidadStock} disponibles!`;
            } else {
                iconoStock = `<i class="fa-solid fa-bolt" style="color: #38bdf8;"></i>`;
                textoEntrega = `¡${cantidadStock} en tienda para entrega inmediata!`;
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
                <a href="${waLink}" target="_blank" class="btn-buy">
                    <i class="fa-brands fa-whatsapp"></i> Pedir o Encargar
                </a>
            `;
        } else {
            // SOBRE PEDIDO / SIN STOCK
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
                <a href="${waLink}" target="_blank" class="btn-buy" style="background-color: #0284c7;">
                    <i class="fa-brands fa-whatsapp"></i> Encargar sobre Pedido
                </a>
            `;
        }

        const card = document.createElement("div");
        card.className = "product-card";
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

        const imgElement = card.querySelector('.card-image-wrapper img');
        if (imgElement) {
            imgElement.addEventListener('click', (e) => {
                e.stopPropagation();
                openModal(imgSrc);
            });
        }

        targetGrid.appendChild(card);
    });
}

// Mantener alias por retrocompatibilidad con scripts antiguos que usen 'renderProducts'
export const renderProducts = renderProductsUI;