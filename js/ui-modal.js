// js/ui-modal.js
export function renderModalUI() {
    const container = document.getElementById("modal-container");
    if (!container) return;

    container.innerHTML = `
        <div id="image-modal" class="modal" style="display: none;">
            <img id="modal-img" class="modal-content" alt="Previsualización" />
        </div>
    `;
}

export function initModal() {
    renderModalUI(); // Inyectamos el HTML al cargar
    const modal = document.getElementById("image-modal");
    if (!modal) return;
    
    modal.addEventListener("click", () => {
        modal.style.display = "none";
    });
}

export function openModal(imageSrc) {
    const modal = document.getElementById("image-modal");
    const modalImg = document.getElementById("modal-img");
    if (!modal || !modalImg) return;
    
    modalImg.src = imageSrc;
    modal.style.display = "flex";
}