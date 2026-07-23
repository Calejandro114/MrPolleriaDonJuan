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
            <!-- Buscador por texto -->
            <div class="search-input-wrapper">
                <input type="text" id="search-input" placeholder="Buscar por nombre, ID o descripción..." />
                <button id="clear-search" style="display: none;">&times;</button>
            </div>

            <!-- Controles de Filtro Avanzado -->
            <div class="filters-container">
                <label class="filter-checkbox">
                    <input type="checkbox" id="filter-offers">
                    <span>🔥 Solo Ofertas</span>
                </label>

                <label class="filter-checkbox">
                    <input type="checkbox" id="filter-stock">
                    <span>⚡ Entrega Inmediata</span>
                </label>

                <div class="filter-price">
                    <label for="filter-max-price">Precio máx: $<span id="price-limit-val">500</span> MXN</label>
                    <input type="range" id="filter-max-price" min="0" max="1000" step="10" value="500">
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
    const rangePrecio = document.getElementById("filter-max-price");

    // Toggle de la Lupa (Ocultar/Mostrar)
    if (toggleSearchBtn && searchFilterPanel) {
        toggleSearchBtn.addEventListener("click", () => {
            searchFilterPanel.classList.toggle("hidden");
            if (!searchFilterPanel.classList.contains("hidden") && searchInput) {
                searchInput.focus(); // Foco automático al abrir
            }
        });
    }

    // Input de Búsqueda
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            textoBusqueda = e.target.value;
            if (clearSearchBtn) clearSearchBtn.style.display = textoBusqueda.length > 0 ? "block" : "none";
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
    if (rangePrecio) rangePrecio.addEventListener("input", onFilterChange);
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

    const rangePrecio = document.getElementById("filter-max-price");
    const lblPrecioVal = document.getElementById("price-limit-val");
    if (rangePrecio) {
        const maxVal = Number(rangePrecio.value);
        if (lblPrecioVal) lblPrecioVal.textContent = maxVal;
        resultado = resultado.filter(p => {
            const precioNum = Number(String(p.precioActual || 0).replace(/[^0-9.]/g, ''));
            return precioNum <= maxVal;
        });
    }

    renderProducts(resultado);
}