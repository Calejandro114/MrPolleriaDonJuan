// js/ui-modal.js

export function initModal() {
    const container = document.getElementById("modal-container");
    if (!container) return;

    // Escuchar clic fuera de la imagen para cerrar
    container.addEventListener("click", (e) => {
        if (e.target.classList.contains("modal-overlay") || e.target.classList.contains("modal-close")) {
            closeModal();
        }
    });
}

export function openModal(imageSrc) {
    const container = document.getElementById("modal-container");
    if (!container) return;

    container.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <button class="modal-close">&times;</button>
                <img src="${imageSrc}" class="modal-img" alt="Previsualización" />
            </div>
        </div>
    `;
}

export function closeModal() {
    const container = document.getElementById("modal-container");
    if (container) {
        container.innerHTML = "";
    }
}