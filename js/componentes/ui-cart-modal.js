/* js/componentes/ui-cart-modal.js */
import { getCart, updateCartBadgeUI } from './cart-service.js';

// Reemplaza esta URL con la URL pública que te dio Cloudflare
const WORKER_URL = "https://telegram-don-juan.mrpolleriadonjuan.workers.dev/";

export function initCartModal() {
    if (!document.getElementById("cart-modal")) {
        const modalHTML = `
            <div id="cart-modal" class="cart-modal-overlay" style="display: none;">
                <div class="cart-modal-content">
                    <div class="cart-header">
                        <h2><i class="fa-solid fa-receipt"></i> Tu Pedido</h2>
                        <button id="close-cart-btn" class="close-cart-btn">&times;</button>
                    </div>

                    <div id="cart-items-container" class="cart-items-container">
                        <!-- Productos del carrito -->
                    </div>

                    <div id="cart-summary-section" class="cart-summary-section">
                        <!-- Formulario de Datos del Cliente -->
                        <div class="client-info-form">
                            <h4 class="form-title"><i class="fa-solid fa-user-pen"></i> Datos de Contacto</h4>
                            <div class="input-group">
                                <input type="text" id="cart-client-name" placeholder="Tu Nombre Completo *" required>
                            </div>
                            <div class="input-group">
                                <input type="tel" id="cart-client-phone" placeholder="WhatsApp / Teléfono de Contacto *" required>
                            </div>
                            <div class="input-group" id="group-client-address" style="display: none;">
                                <input type="text" id="cart-client-address" placeholder="Dirección Completa para Envío *">
                            </div>
                        </div>

                        <!-- Métodos de Entrega y Pago -->
                        <div class="checkout-options">
                            <label class="checkout-label">Método de entrega:</label>
                            <div class="delivery-options">
                                <label class="radio-option">
                                    <input type="radio" name="deliveryMethod" value="local" checked>
                                    <span>🏪 Recoger / Entrega local</span>
                                </label>
                                <label class="radio-option">
                                    <input type="radio" name="deliveryMethod" value="envio">
                                    <span>📦 Envío a domicilio</span>
                                </label>
                            </div>

                            <label class="checkout-label">Método de pago:</label>
                            <div class="payment-options">
                                <label class="radio-option" id="opt-pay-transfer">
                                    <input type="radio" name="paymentMethod" value="transferencia" checked>
                                    <span>💳 Transferencia / Depósito</span>
                                </label>
                                <label class="radio-option" id="opt-pay-cash">
                                    <input type="radio" name="paymentMethod" value="efectivo">
                                    <span>💵 Efectivo al entregar</span>
                                </label>
                            </div>
                        </div>

                        <!-- Total Final -->
                        <div class="cart-total-box">
                            <span>Total a pagar:</span>
                            <strong id="cart-total-price">$0 MXN</strong>
                        </div>

                        <!-- Botón de Envío -->
                        <button id="cart-checkout-btn" class="btn-checkout-telegram">
                            <i class="fa-solid fa-paper-plane"></i> Confirmar Pedido
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // Escuchar apertura y cierre
    document.addEventListener("click", (e) => {
        if (e.target.closest("#open-cart-btn")) {
            renderCartModalUI();
            document.getElementById("cart-modal").style.display = "flex";
        }
        if (e.target.id === "close-cart-btn" || e.target.id === "cart-modal") {
            document.getElementById("cart-modal").style.display = "none";
        }
    });

    // Mostrar u ocultar campo de dirección según el envío
    document.addEventListener("change", (e) => {
        if (e.target.name === "deliveryMethod") {
            const addressGroup = document.getElementById("group-client-address");
            const optCash = document.getElementById("opt-pay-cash");
            const radioTransfer = document.querySelector('input[name="paymentMethod"][value="transferencia"]');

            if (e.target.value === "envio") {
                addressGroup.style.display = "block";
                optCash.style.display = "none";
                if (radioTransfer) radioTransfer.checked = true;
            } else {
                addressGroup.style.display = "none";
                optCash.style.display = "flex";
            }
        }
    });

    // Clic en Confirmar Pedido
    document.addEventListener("click", (e) => {
        if (e.target.id === "cart-checkout-btn" || e.target.closest("#cart-checkout-btn")) {
            enviarPedidoTelegram();
        }
    });
}

export function renderCartModalUI() {
    const container = document.getElementById("cart-items-container");
    const summarySection = document.getElementById("cart-summary-section");
    const totalEl = document.getElementById("cart-total-price");
    if (!container) return;

    const cart = getCart();

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="cart-empty-state">
                <i class="fa-solid fa-cart-flatbed" style="font-size: 3rem; color: #475569;"></i>
                <p>Tu carrito está vacío</p>
            </div>
        `;
        if (summarySection) summarySection.style.display = "none";
        return;
    }

    if (summarySection) summarySection.style.display = "block";

    let html = "";
    let totalGeneral = 0;

    cart.forEach((item, index) => {
        const subtotal = item.precioUnitario * item.cantidad;
        totalGeneral += subtotal;

        html += `
            <div class="cart-item-row">
                <img src="${item.imagen || 'img/notFound.jpg'}" alt="${item.nombre}" class="cart-item-img">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.nombre}</div>
                    <div class="cart-item-price">$${item.precioUnitario} MXN c/u</div>
                </div>
                <div class="cart-item-controls">
                    <button class="cart-btn-qty" data-action="minus" data-index="${index}">-</button>
                    <span>${item.cantidad}</span>
                    <button class="cart-btn-qty" data-action="plus" data-index="${index}">+</button>
                </div>
                <div class="cart-item-subtotal">$${subtotal} MXN</div>
                <button class="cart-btn-remove" data-action="remove" data-index="${index}" title="Eliminar">&times;</button>
            </div>
        `;
    });

    container.innerHTML = html;
    if (totalEl) totalEl.textContent = `$${totalGeneral} MXN`;

    container.querySelectorAll("button[data-action]").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const idx = parseInt(e.target.dataset.index);
            const action = e.target.dataset.action;
            modificarCantidadCarrito(idx, action);
        });
    });
}

function modificarCantidadCarrito(index, action) {
    let cart = getCart();
    if (!cart[index]) return;

    if (action === "plus") {
        cart[index].cantidad += 1;
    } else if (action === "minus") {
        cart[index].cantidad -= 1;
        if (cart[index].cantidad <= 0) cart.splice(index, 1);
    } else if (action === "remove") {
        cart.splice(index, 1);
    }

    localStorage.setItem('cart_don_juan', JSON.stringify(cart));
    updateCartBadgeUI();
    renderCartModalUI();
}

async function enviarPedidoTelegram() {
    const cart = getCart();
    if (cart.length === 0) return;

    const nombre = document.getElementById("cart-client-name")?.value.trim();
    const telefono = document.getElementById("cart-client-phone")?.value.trim();
    const direccion = document.getElementById("cart-client-address")?.value.trim();

    const delivery = document.querySelector('input[name="deliveryMethod"]:checked')?.value;
    const payment = document.querySelector('input[name="paymentMethod"]:checked')?.value;

    if (!nombre || !telefono) {
        alert("Por favor ingresa tu Nombre y Teléfono de contacto.");
        return;
    }

    if (delivery === "envio" && !direccion) {
        alert("Por favor ingresa la dirección para el envío.");
        return;
    }

    const btnSubmit = document.getElementById("cart-checkout-btn");
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Enviando pedido...`;

    let textoEntrega = delivery === "envio" ? `📦 Envío (${direccion})` : "🏪 Recoger / Entrega local";
    let textoPago = payment === "transferencia" ? "💳 Transferencia / Depósito" : "💵 Efectivo al entregar";

    let cuerpoMensaje = `👤 *Cliente:* ${nombre}\n`;
    cuerpoMensaje += `📱 *WhatsApp:* ${telefono}\n`;
    cuerpoMensaje += `📍 *Entrega:* ${textoEntrega}\n`;
    cuerpoMensaje += `💳 *Pago:* ${textoPago}\n\n`;
    cuerpoMensaje += `🧾 *PRODUCTOS:* \n`;

    let total = 0;
    cart.forEach(item => {
        const subtotal = item.precioUnitario * item.cantidad;
        total += subtotal;
        cuerpoMensaje += `• ${item.nombre} (x${item.cantidad}) ➔ *$${subtotal} MXN*\n`;
    });

    cuerpoMensaje += `━━━━━━━━━━━━━━━━━━\n`;
    cuerpoMensaje += `💰 *TOTAL A PAGAR:* *$${total} MXN*`;

    try {
        const response = await fetch(WORKER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tipo: "pedido",
                mensaje: cuerpoMensaje
            })
        });

        if (response.ok) {
            alert("¡Pedido enviado con éxito! Nos pondremos en contacto contigo a la brevedad.");
            localStorage.removeItem('cart_don_juan');
            updateCartBadgeUI();
            document.getElementById("cart-modal").style.display = "none";
        } else {
            alert("Hubo un detalle al enviar tu pedido. Por favor intenta de nuevo.");
        }
    } catch (error) {
        console.error("Error enviando pedido:", error);
        alert("Error de conexión. Intenta de nuevo.");
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Confirmar Pedido`;
    }
}