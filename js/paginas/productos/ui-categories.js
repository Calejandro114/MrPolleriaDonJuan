// js/ui-categories.js

const categorias = [
    { id: "todos", nombre: "Todos" },
    { id: "3d", nombre: "Impresión & Muñecos 3D" },
    { id: "llavero", nombre: "Llaveros" },
    { id: "laser", nombre: "Corte y Grabado Láser" },
    { id: "textil", nombre: "Gorras & Pulseras" },
    { id: "papeleria", nombre: "Libretas, Stickers & Papercraft" },
    { id: "pines", nombre: "Pines" }
];

export function initCategories(onCategorySelect) {
    const categoriesContainer = document.getElementById("categories-container");
    if (!categoriesContainer) return;

    categoriesContainer.innerHTML = "";
    categorias.forEach((cat, index) => {
        const btn = document.createElement("button");
        btn.className = `btn-category ${index === 0 ? 'active' : ''}`;
        btn.textContent = cat.nombre;
        
        btn.addEventListener("click", () => {
            document.querySelectorAll(".btn-category").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            // Le pasamos el id de la categoría elegida al callback principal
            onCategorySelect(cat.id);
        });
        
        categoriesContainer.appendChild(btn);
    });
}