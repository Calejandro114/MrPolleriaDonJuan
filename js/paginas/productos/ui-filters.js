// js/ui-filters.js
import { renderProducts } from './ui-products.js';

let categoriaActiva = "todos";
let textoBusqueda = "";

// 1. Inyectar la estructura HTML de Búsqueda y Filtros
export function renderFiltersUI() {
    const wrapper = document.getElementById("search-filter-wrapper");
    if (!wrapper) return;

    wrapper.innerHTML = `
        <div id="search-filter-panel" class="search-filter-panel hidden">
            
            <!-- Barra Superior Unificada (Input de Búsqueda) -->
            <div class="search-input-wrapper">
                <i class="fa-solid fa-magnifying-glass search-icon-inside"></i>
                <input type="text" id="search-input" placeholder="Buscar producto, anime, ID o descripción..." />
                <button id="clear-search" class="clear-btn-inside" style="display: none;" title="Limpiar búsqueda">&times;</button>
            </div>

            <!-- Controles de Filtro Avanzado (Chips & Presupuesto) -->
            <div class="filters-container">
                <div class="filter-chips-group">
                    <label class="filter-chip">
                        <input type="checkbox" id="filter-offers">
                        <span class="chip-content"><i class="fa-solid fa-fire"></i> Solo Ofertas</span>
                    </label>

                    <label class="filter-chip">
                        <input type="checkbox" id="filter-stock">
                        <span class="chip-content"><i class="fa-solid fa-bolt"></i> Entrega Inmediata</span>
                    </label>
                </div>

                <!-- Input de Presupuesto Directo por Texto -->
                <div class="filter-budget">
                    <span class="budget-label"><i class="fa-solid fa-wallet"></i> Presupuesto máx:</span>
                    <div class="budget-input-wrapper">
                        <span class="currency-symbol">$</span>
                        <input type="number" id="filter-max-price" placeholder="Ej. 150" min="0" step="5" />
                        <span class="currency-tag">MXN</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

export function setCategoriaActiva(catId, listaProductos) {
    categoriaActiva = catId;
    aplicarFiltrosYRender(listaProductos);
}

// 2. Registrar los Listeners
export function initFilterListeners(onFilterChange) {
    const toggleSearchBtn = document.getElementById("toggle-search-btn");
    const searchFilterPanel = document.getElementById("search-filter-panel");
    const searchInput = document.getElementById("search-input");
    const clearSearchBtn = document.getElementById("clear-search");
    const chkOfertas = document.getElementById("filter-offers");
    const chkStock = document.getElementById("filter-stock");
    const inputPrecio = document.getElementById("filter-max-price");

    // Toggle de la Lupa / Menú Desplegable
    if (toggleSearchBtn && searchFilterPanel) {
        toggleSearchBtn.addEventListener("click", () => {
            searchFilterPanel.classList.toggle("hidden");
            if (!searchFilterPanel.classList.contains("hidden") && searchInput) {
                searchInput.focus();
            }
        });
    }

    // Input de Búsqueda
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            textoBusqueda = e.target.value;
            if (clearSearchBtn) clearSearchBtn.style.display = textoBusqueda.length > 0 ? "flex" : "none";
            onFilterChange();
        });
    }

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener("click", () => {
            if (searchInput) searchInput.value = "";
            textoBusqueda = "";
            clearSearchBtn.style.display = "none";
            onFilterChange();
        });
    }

    if (chkOfertas) chkOfertas.addEventListener("change", onFilterChange);
    if (chkStock) chkStock.addEventListener("change", onFilterChange);
    if (inputPrecio) inputPrecio.addEventListener("input", onFilterChange);
}

// 3. Lógica de Filtrado
export function aplicarFiltrosYRender(listaProductos) {
    let resultado = listaProductos;

    if (categoriaActiva !== "todos") {
        resultado = resultado.filter(p => p.categoria === categoriaActiva);
    }

    if (textoBusqueda.trim() !== "") {
        const q = textoBusqueda.toLowerCase();
        resultado = resultado.filter(p => 
            (p.nombre && p.nombre.toLowerCase().includes(q)) ||
            (p.descripcion && p.descripcion.toLowerCase().includes(q)) ||
            (p.id && p.id.toLowerCase().includes(q))
        );
    }

    const chkOfertas = document.getElementById("filter-offers");
    if (chkOfertas && chkOfertas.checked) {
        resultado = resultado.filter(p => p.enOferta === true && !p.agotado);
    }

    const chkStock = document.getElementById("filter-stock");
    if (chkStock && chkStock.checked) {
        resultado = resultado.filter(p => {
            const rawStock = p.stock !== undefined ? p.stock : p.Stock;
            const cantStock = Number(rawStock) || 0;
            return cantStock > 0 && !p.agotado;
        });
    }

    // Filtrado por Presupuesto Escrito
    const inputPrecio = document.getElementById("filter-max-price");
    let presupuestoIngresado = false;
    let maxVal = 0;

    if (inputPrecio && inputPrecio.value.trim() !== "") {
        maxVal = Number(inputPrecio.value);
        if (!isNaN(maxVal) && maxVal >= 0) {
            presupuestoIngresado = true;
            resultado = resultado.filter(p => {
                const valorPrecio = (p.enOferta && p.precioConDescuento) ? p.precioConDescuento : (p.precioSinDescuento || 0);
                const precioNum = Number(String(valorPrecio).replace(/[^0-9.]/g, ''));
                return precioNum <= maxVal;
            });
        }
    }

    // Evaluación para renderizar productos o el mensaje personalizado de presupuesto
    if (resultado.length === 0 && presupuestoIngresado) {
        renderNoResultsBudget(maxVal);
    } else {
        renderProducts(resultado);
    }
}

// Función auxiliar para renderizar el mensaje personalizado cuando no hay stock en el rango de precio
function renderNoResultsBudget(presupuesto) {
    const grid = document.getElementById("products-grid");
    if (!grid) return;

    // Configura tus enlaces/datos de contacto directos
    const whatsappLink = `https://wa.me/526673538481?text=${encodeURIComponent(`Hola, estuve viendo la página y busco un producto con presupuesto de $${presupuesto} MXN.`)}`;
    const instagramLink = "https://instagram.com/mr.polleriadonjuan"; 

    grid.innerHTML = `
        <div class="empty-budget-card">
            <div class="empty-icon"><i class="fa-solid fa-hand-holding-dollar"></i></div>
            <h3>Por el momento no tenemos un producto en página que cumpla con ese precio</h3>
            <p>¡Pero si nos contactas veremos cómo solucionarte! Hacemos pedidos personalizados que se adaptan a tu presupuesto.</p>
            <div class="empty-actions">
                <a href="${whatsappLink}" target="_blank" rel="noopener noreferrer" class="btn-contact btn-wa">
                    <i class="fa-brands fa-whatsapp"></i> Consultar por WhatsApp
                </a>
                <a href="${instagramLink}" target="_blank" rel="noopener noreferrer" class="btn-contact btn-ig">
                    <i class="fa-brands fa-instagram"></i> Mensaje por Instagram
                </a>
            </div>
        </div>
    `;
}