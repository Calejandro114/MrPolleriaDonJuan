/* js/paginas/resenas/main-resenas.js */
import { db } from '../../config/firebase-config.js';
import { renderNavUI } from '../../componentes/ui-nav.js';
import { renderFooterUI } from '../../componentes/ui-footer.js';

document.addEventListener("DOMContentLoaded", () => {
    renderNavUI();
    renderFooterUI();

    const formResena = document.getElementById("form-resena");
    const resenasGrid = document.getElementById("resenas-grid");
    const ratingPicker = document.getElementById("rating-picker");
    const estrellasInput = document.getElementById("estrellas");

    const buscarInput = document.getElementById("buscar-producto");
    const autocompleteList = document.getElementById("autocomplete-list");
    const productoIdInput = document.getElementById("producto-id");
    const productoNombreInput = document.getElementById("producto-nombre");

    const chkAnonimo = document.getElementById("chk-anonimo");
    const nombreInput = document.getElementById("nombre");

    const fotoInput = document.getElementById("foto-producto");
    const previewContainer = document.getElementById("preview-container");
    const fotoPreview = document.getElementById("foto-preview");
    const btnRemovePhoto = document.getElementById("btn-remove-photo");

    let base64ImageCompressed = "";
    let listaProductos = [];

    // 1. Manejo del Checkbox Anónimo
    if (chkAnonimo && nombreInput) {
        chkAnonimo.addEventListener("change", () => {
            if (chkAnonimo.checked) {
                nombreInput.value = "Anónimo";
                nombreInput.disabled = true;
            } else {
                nombreInput.value = "";
                nombreInput.disabled = false;
            }
        });
    }

    // 2. Cargar productos desde Firestore incluyendo la imagen del producto
    if (typeof db !== 'undefined' && db) {
        db.collection("productos").get().then((snapshot) => {
            snapshot.forEach(doc => {
                const data = doc.data();
                
                let rutaImg = data.imagen || data.img || data.fotoUrl || '';

                // Si la ruta no es un link externo (http) y no empieza ya con ../, le agregamos ../ para salir de /paginas/
                if (rutaImg && !rutaImg.startsWith('http') && !rutaImg.startsWith('../')) {
                    rutaImg = '../' + rutaImg;
                }

                listaProductos.push({
                    idDoc: doc.id,
                    customId: data.id || data.codigo || doc.id,
                    nombre: data.nombre || data.titulo || "Producto",
                    imagen: rutaImg || 'https://placehold.co/40x40?text=P'
                });
            });
        }).catch(err => console.error("Error al cargar productos para el buscador:", err));
    }

    // 3. Buscador Autocompletar por ID o Nombre con Miniatura Visual
    if (buscarInput && autocompleteList) {
        buscarInput.addEventListener("input", () => {
            const query = buscarInput.value.toLowerCase().trim();
            autocompleteList.innerHTML = "";

            if (!query) {
                autocompleteList.style.display = "none";
                if (productoIdInput) productoIdInput.value = "";
                if (productoNombreInput) productoNombreInput.value = "";
                return;
            }

            const resultados = listaProductos.filter(p => 
                p.customId.toLowerCase().includes(query) || 
                p.nombre.toLowerCase().includes(query)
            );

            if (resultados.length > 0) {
                resultados.forEach(p => {
                    const item = document.createElement("div");
                    item.className = "autocomplete-item";
                    item.innerHTML = `
                        <img src="${p.imagen}" class="autocomplete-thumb" onerror="this.src='https://placehold.co/40x40?text=P';">
                        <div>
                            <div><strong>[${p.customId}]</strong> ${p.nombre}</div>
                        </div>
                    `;
                    item.addEventListener("click", () => {
                        buscarInput.value = `[${p.customId}] ${p.nombre}`;
                        if (productoIdInput) productoIdInput.value = p.customId;
                        if (productoNombreInput) productoNombreInput.value = p.nombre;
                        autocompleteList.style.display = "none";
                    });
                    autocompleteList.appendChild(item);
                });
                autocompleteList.style.display = "block";
            } else {
                autocompleteList.style.display = "none";
            }
        });

        document.addEventListener("click", (e) => {
            if (e.target !== buscarInput) autocompleteList.style.display = "none";
        });
    }

    // 4. Procesar, Comprimir Foto en Base64 y actualizar etiqueta visual
    if (fotoInput) {
        fotoInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            const uploadLabel = document.querySelector(".custom-file-upload span");

            if (!file) {
                if (uploadLabel) uploadLabel.textContent = "Seleccionar o tomar foto";
                return;
            }

            if (uploadLabel) {
                uploadLabel.textContent = `Foto lista: ${file.name.length > 20 ? file.name.substring(0, 17) + '...' : file.name}`;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    const MAX_WIDTH = 600;
                    let width = img.width;
                    let height = img.height;

                    if (width > MAX_WIDTH) {
                        height = Math.round((height * MAX_WIDTH) / width);
                        width = MAX_WIDTH;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0, width, height);

                    // Compresión JPEG a calidad 0.7
                    base64ImageCompressed = canvas.toDataURL("image/jpeg", 0.7);
                    if (fotoPreview) fotoPreview.src = base64ImageCompressed;
                    if (previewContainer) previewContainer.style.display = "block";
                };
            };
            reader.readAsDataURL(file);
        });
    }

    if (btnRemovePhoto) {
        btnRemovePhoto.addEventListener("click", () => {
            if (fotoInput) fotoInput.value = "";
            base64ImageCompressed = "";
            if (previewContainer) previewContainer.style.display = "none";
            const uploadLabel = document.querySelector(".custom-file-upload span");
            if (uploadLabel) uploadLabel.textContent = "Seleccionar o tomar foto";
        });
    }

    // 5. Selector de Estrellas
    if (ratingPicker) {
        const stars = ratingPicker.querySelectorAll("i");
        stars.forEach(star => {
            star.addEventListener("click", () => {
                const value = parseInt(star.getAttribute("data-value"));
                if (estrellasInput) estrellasInput.value = value;
                
                stars.forEach(s => {
                    const sVal = parseInt(s.getAttribute("data-value"));
                    s.classList.toggle("active", sVal <= value);
                });
            });
        });
    }

    // 6. Enviar Reseña a Firebase
    if (formResena) {
        formResena.addEventListener("submit", async (e) => {
            e.preventDefault();

            const btnSubmit = formResena.querySelector("button[type='submit']");
            const nombre = chkAnonimo && chkAnonimo.checked ? "Anónimo" : document.getElementById("nombre").value.trim();
            const servicio = document.getElementById("servicio").value;
            const estrellas = parseInt(estrellasInput ? estrellasInput.value : 5);
            const comentario = document.getElementById("comentario").value.trim();

            if (!nombre || !comentario) {
                alert("Por favor completa el nombre y comentario.");
                return;
            }

            try {
                if (btnSubmit) {
                    btnSubmit.disabled = true;
                    btnSubmit.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Enviando...`;
                }

                await db.collection("resenas").add({
                    nombre: nombre,
                    servicio: servicio,
                    estrellas: estrellas,
                    comentario: comentario,
                    productoId: productoIdInput ? productoIdInput.value || null : null,
                    productoNombre: productoNombreInput ? productoNombreInput.value || null : null,
                    fotoUrl: base64ImageCompressed || null,
                    aprobado: false,
                    fecha: new Date().toISOString()
                });

                alert("¡Gracias por tu reseña! Está en revisión por el equipo y se publicará muy pronto.");
                
                // Reset completo del formulario
                formResena.reset();
                if (chkAnonimo) chkAnonimo.checked = false;
                if (nombreInput) nombreInput.disabled = false;

                base64ImageCompressed = "";
                if (productoIdInput) productoIdInput.value = "";
                if (productoNombreInput) productoNombreInput.value = "";
                if (previewContainer) previewContainer.style.display = "none";
                if (estrellasInput) estrellasInput.value = 5;
                if (ratingPicker) {
                    ratingPicker.querySelectorAll("i").forEach(s => s.classList.add("active"));
                }

                // Restaurar texto del botón de carga de foto
                const uploadLabel = document.querySelector(".custom-file-upload span");
                if (uploadLabel) uploadLabel.textContent = "Seleccionar o tomar foto";

                // Cierre automático del acordeón
                const collapse = document.querySelector(".resenas-collapse");
                if (collapse) collapse.removeAttribute("open");

            } catch (error) {
                console.error("Error al enviar la reseña:", error);
                alert("Hubo un detalle al enviar tu comentario. Intenta de nuevo.");
            } finally {
                if (btnSubmit) {
                    btnSubmit.disabled = false;
                    btnSubmit.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Publicar Reseña`;
                }
            }
        });
    }

    // 7. Leer solo reseñas APROBADAS (aprobado == true)
    if (typeof db !== 'undefined' && db && resenasGrid) {
        db.collection("resenas")
          .where("aprobado", "==", true)
          .onSnapshot((snapshot) => {
              resenasGrid.innerHTML = "";

              if (snapshot.empty) {
                  resenasGrid.innerHTML = `<p style="color: #94a3b8; grid-column: 1/-1;">Sé el primero en dejar una reseña para el taller.</p>`;
                  return;
              }

              snapshot.forEach((doc) => {
                  const data = doc.data();
                  const fechaObj = new Date(data.fecha);
                  const fechaFormateada = fechaObj.toLocaleDateString("es-MX", { year: 'numeric', month: 'short', day: 'numeric' });

                  let estrellasHTML = "";
                  for (let i = 1; i <= 5; i++) {
                      estrellasHTML += `<i class="${i <= data.estrellas ? 'fa-solid' : 'fa-regular'} fa-star"></i>`;
                  }

                  const productoTag = data.productoNombre ? `<div class="resena-product-tag"><i class="fa-solid fa-tag"></i> ${data.productoNombre} (${data.productoId})</div>` : '';
                  const fotoHTML = data.fotoUrl ? `<div class="resena-img-container"><img src="${data.fotoUrl}" alt="Foto del trabajo"></div>` : '';

                  const card = document.createElement("div");
                  card.className = "resena-card";
                  card.innerHTML = `
                      <div>
                          <div class="resena-header">
                              <div class="resena-author">
                                  <h4>${data.nombre}</h4>
                                  <span class="resena-service-badge">${data.servicio || 'Cliente'}</span>
                                  ${productoTag}
                              </div>
                              <div class="resena-stars">${estrellasHTML}</div>
                          </div>
                          <p class="resena-body" style="margin-top: 12px;">"${data.comentario}"</p>
                          ${fotoHTML}
                      </div>
                      <div class="resena-footer" style="margin-top: 12px;">${fechaFormateada}</div>
                  `;
                  resenasGrid.appendChild(card);
              });
          }, (error) => {
              console.error("Error al cargar reseñas:", error);
          });
    }
});