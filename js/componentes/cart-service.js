/* js/componentes/cart-service.js */

/**
 * Limpia cadenas de precio como "$150.00 MXN" o "$55 MXN" a números flotantes puros.
 * @param {string|number} priceStr 
 * @returns {number}
 */
export function cleanPrice(priceStr) {
    if (typeof priceStr === 'number') return priceStr;
    if (!priceStr) return 0;

    // Remueve todo lo que no sea número o punto decimal
    const cleanNum = String(priceStr).replace(/[^0-9.]/g, '');
    return parseFloat(cleanNum) || 0;
}

/**
 * Obtiene los artículos del carrito guardados en localStorage
 */
export function getCart() {
    try {
        return JSON.parse(localStorage.getItem('cart_don_juan')) || [];
    } catch {
        return [];
    }
}

/**
 * Agrega un producto al carrito
 * @param {Object} product - Datos del producto
 */
export function addToCart(product) {
    const cart = getCart();
    
    // Determinar precio final numérico evaluando si está en oferta
    const precioNormal = cleanPrice(product.precioSinDescuento || product.precio);
    const precioOferta = cleanPrice(product.precioConDescuento);
    const precioFinalNum = (product.enOferta && precioOferta > 0) ? precioOferta : precioNormal;

    const existingIndex = cart.findIndex(item => item.id === product.id);

    if (existingIndex > -1) {
        cart[existingIndex].cantidad += 1;
    } else {
        cart.push({
            id: product.id,
            nombre: product.nombre,
            precioUnitario: precioFinalNum,
            precioTextoOriginal: product.precioConDescuento || product.precioSinDescuento || product.precio,
            imagen: product.imagen || '',
            cantidad: 1
        });
    }

    localStorage.setItem('cart_don_juan', JSON.stringify(cart));
    updateCartBadgeUI();
}

/**
 * Actualiza el indicador visual (+1, +2...) en el botón del carrito de la Navbar
 */
export function updateCartBadgeUI() {
    const badge = document.getElementById("cart-badge-count");
    if (!badge) return;

    const cart = getCart();
    const totalItems = cart.reduce((acc, item) => acc + item.cantidad, 0);

    badge.textContent = totalItems;
    badge.style.display = totalItems > 0 ? "inline-flex" : "none";
}