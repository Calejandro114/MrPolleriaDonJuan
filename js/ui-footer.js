// js/ui-footer.js
const WHATSAPP_PHONE = "526673538481";

export function renderFooterUI() {
    const container = document.getElementById("footer-container");
    if (!container) return;

    container.innerHTML = `
        <footer class="main-footer">
            <div class="footer-grid">
                
                <!-- Sección 1: Redes y Contacto -->
                <div class="footer-col">
                    <h3>Pollería Don Juan</h3>
                    <p class="footer-desc">Creaciones personalizadas en impresión 3D, corte láser, papelería y coleccionables.</p>
                    
                    <div class="footer-socials-cards">
                        <a href="https://wa.me/526673538481" target="_blank" class="social-card wa">
                            <i class="fa-brands fa-whatsapp"></i>
                            <div class="card-text">
                                <span class="card-title">WhatsApp</span>
                                <span class="card-subtitle">Cotiza o pide por mensaje</span>
                            </div>
                        </a>
                        <a href="https://instagram.com/mr.polleriadonjuan/" target="_blank" class="social-card ig">
                            <i class="fa-brands fa-instagram"></i>
                            <div class="card-text">
                                <span class="card-title">Instagram</span>
                                <span class="card-subtitle">Ver catálogo de trabajos</span>
                            </div>
                        </a>
                    </div>
                </div>

                <!-- Sección 2: Métodos de Pago -->
                <div class="footer-col">
                    <h4>Métodos de Pago</h4>
                    <ul class="footer-list">
                        <li><i class="fa-solid fa-money-bill-transfer"></i> Transferencia SPEI</li>
                        <li><i class="fa-solid fa-store"></i> Pago en Depósito</li>
                        <li><i class="fa-solid fa-hand-holding-dollar"></i> Efectivo al entregar (Local)</li>
                    </ul>
                </div>

                <!-- Sección 3: Tiempos y Envíos -->
                <div class="footer-col" id="como-pedir">
                    <h4>Envíos y Pedidos</h4>
                    <p class="footer-text">⚡ <strong>En tienda:</strong> Entrega inmediata en productos con stock.</p>
                    <p class="footer-text">📦 <strong>Sobre Pedido:</strong> Elaboración en 2 a 5 días hábiles según complejidad.</p>
                    <p class="footer-text">📍 Entregas locales y envíos a coordinar por WhatsApp.</p>
                </div>

                <!-- Sección 4: FAQ Rápido -->
                <div class="footer-col" id="faq">
                    <h4>Preguntas Frecuentes</h4>
                    <details class="faq-item">
                        <summary>¿Hacen diseños personalizados?</summary>
                        <p>¡Sí! Cotizamos figuras 3D, llaveros o placas láser desde tu idea o imagen.</p>
                    </details>
                    <details class="faq-item">
                        <summary>¿Cómo encargo un producto agotado?</summary>
                        <p>Toca el botón "Encargar sobre Pedido" para enviarnos mensaje directo con tu ID de producto.</p>
                    </details>
                    <details class="faq-item">
                        <summary>¿Qué tamaño son las figuras?</summary>
                        <p>Todos los tamaños son personalizados y varian entre 1cm a 20cm de altura.</p>
                    </details>
                    <details class="faq-item">
                        <summary>¿Cuánto tarda en imprimirse una pieza personalizada?</summary>
                        <p>Si no requiere modificaciones adicionales, el tiempo de impresión varía entre 24 y 72 horas.</p>
                    </details>
                </div>

            </div>

            <div class="footer-bottom">
                <p>&copy; ${new Date().getFullYear()} Mr. Pollería Don Juan. Todos los derechos reservados.</p>
            </div>
        </footer>
    `;
}