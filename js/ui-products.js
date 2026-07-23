import { openModal } from './ui-modal.js';

const WHATSAPP_PHONE = "526673538481"; 
const productsGrid = document.getElementById("products-grid");

export function renderProducts(items) {
    if (!productsGrid) return;
    productsGrid.innerHTML = "";

    if (items.length === 0) {
        productsGrid.innerHTML = `<p style="color: #94a3b8; grid-column: 1/-1; text-align: center;">No se encontraron productos coincidentes.</p>`;
        return;
    }

    items.forEach(prod => {
        const estaEnOferta = prod.enOferta === true;
        const esAgotado = prod.agotado === true;

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
                        <i class="fa-solid fa-wand-magic-sparkles"></i> O encarga la cantidad que necesites
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
                <img src="${prod.imagen}" alt="${prod.nombre}" onerror="this.onerror=null; this.src='img/notFound.jpg';">
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
                openModal(prod.imagen);
            });
        }

        productsGrid.appendChild(card);
    });
}