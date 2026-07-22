import { db } from './firebase-config.js';
import { initModal } from './ui-modal.js';
import { renderProducts } from './ui-products.js';
import { initCarousel } from './ui-carousel.js';

document.addEventListener("DOMContentLoaded", () => {
    const categoriesContainer = document.getElementById("categories-container");
    const searchInput = document.getElementById("search-input");
    const clearSearchBtn = document.getElementById("clear-search");
    
    
    const categorias = [
        { id: "todos", nombre: "Todos" },
        { id: "3d", nombre: "Impresión & Muñecos 3D" },
        { id: "llavero", nombre: "Llaveros" },
        { id: "laser", nombre: "Corte y Grabado Láser" },
        { id: "textil", nombre: "Gorras & Pulseras" },
        { id: "papeleria", nombre: "Libretas, Stickers & Papercraft" },
        { id: "pines", nombre: "Pines" }
    ];
    
    let listaProductos = [];
    let categoriaActiva = "todos";
    let textoBusqueda = "";
    
    // Inicializar el modal
    initModal();
    // Inicializar el carrusel
    initCarousel();
    
    // Dibujar Categorías
    function renderCategories() {
        if (!categoriesContainer) return;
        categoriesContainer.innerHTML = "";
        categorias.forEach((cat, index) => {
            const btn = document.createElement("button");
            btn.className = `btn-category ${index === 0 ? 'active' : ''}`;
            btn.textContent = cat.nombre;
            btn.addEventListener("click", () => {
                document.querySelectorAll(".btn-category").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                categoriaActiva = cat.id;
                filterAndRender();
            });
            categoriesContainer.appendChild(btn);
        });
    }

    // Filtrar
    function filterAndRender() {
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

        renderProducts(resultado);
    }

    // Eventos de Búsqueda
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            textoBusqueda = e.target.value;
            clearSearchBtn.style.display = textoBusqueda.length > 0 ? "block" : "none";
            filterAndRender();
        });
    }

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener("click", () => {
            searchInput.value = "";
            textoBusqueda = "";
            clearSearchBtn.style.display = "none";
            filterAndRender();
        });
    }

    // Iniciar
    renderCategories();

    // Escuchar Firebase en tiempo real
    db.collection("productos").onSnapshot((snapshot) => {
        listaProductos = [];
        snapshot.forEach((doc) => {
            listaProductos.push({ id: doc.id, ...doc.data() });
        });
        filterAndRender();
    });
});