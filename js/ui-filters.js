// js/ui-filters.js
import { renderProducts } from './ui-products.js';

let categoriaActiva = "todos";
let textoBusqueda = "";

export function setCategoriaActiva(catId, listaProductos) {
    categoriaActiva = catId;
    aplicarFiltrosYRender(listaProductos);
}

export function initFilterListeners(onFilterChange) {
    const searchInput = document.getElementById("search-input");
    const clearSearchBtn = document.getElementById("clear-search");
    const chkOfertas = document.getElementById("filter-offers");
    const chkStock = document.getElementById("filter-stock");
    const rangePrecio = document.getElementById("filter-max-price");

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

export function aplicarFiltrosYRender(listaProductos) {
    let resultado = listaProductos;

    // 1. Categoría
    if (categoriaActiva !== "todos") {
        resultado = resultado.filter(p => p.categoria === categoriaActiva);
    }

    // 2. Búsqueda por texto
    if (textoBusqueda.trim() !== "") {
        const q = textoBusqueda.toLowerCase();
        resultado = resultado.filter(p => 
            (p.nombre && p.nombre.toLowerCase().includes(q)) ||
            (p.descripcion && p.descripcion.toLowerCase().includes(q)) ||
            (p.id && p.id.toLowerCase().includes(q))
        );
    }

    // 3. Ofertas
    const chkOfertas = document.getElementById("filter-offers");
    if (chkOfertas && chkOfertas.checked) {
        resultado = resultado.filter(p => p.enOferta === true && !p.agotado);
    }

    // 4. Stock / Entrega Inmediata
    const chkStock = document.getElementById("filter-stock");
    if (chkStock && chkStock.checked) {
        resultado = resultado.filter(p => {
            const rawStock = p.stock !== undefined ? p.stock : p.Stock;
            const cantStock = Number(rawStock) || 0;
            return cantStock > 0 && !p.agotado;
        });
    }

    // 5. Precio Máximo
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

    // Renderizar
    renderProducts(resultado);
}