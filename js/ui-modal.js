const modal = document.getElementById("image-modal");
const modalImg = document.getElementById("modal-img");

export function initModal() {
    if (!modal) return;
    // Cerrar al tocar en cualquier parte
    modal.addEventListener("click", () => {
        modal.style.display = "none";
    });
}

export function openModal(imageSrc) {
    if (!modal || !modalImg) return;
    modalImg.src = imageSrc;
    modal.style.display = "flex";
}