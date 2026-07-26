import { db } from '../globales/firebase-config.js';
import { collection, getDocs, addDoc, deleteDoc, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  // Inicializar la carga de bazares en el admin si estamos en esa pestaña o al cargar
  cargarBazaresAdmin();

  // Botón para mostrar el formulario de nuevo bazar
  const btnAddBazar = document.getElementById("btn-add-bazar");
  const formContainer = document.getElementById("bazar-form-container");
  const btnCancelBazar = document.getElementById("btn-cancel-bazar");
  const formBazar = document.getElementById("form-bazar");

  if (btnAddBazar && formContainer) {
    btnAddBazar.addEventListener("click", () => {
      formBazar.reset();
      document.getElementById("bazar-id").value = "";
      document.getElementById("bazar-form-title").innerText = "Registrar Nuevo Bazar";
      formContainer.style.display = "block";
    });
  }

  if (btnCancelBazar && formContainer) {
    btnCancelBazar.addEventListener("click", () => {
      formContainer.style.display = "none";
    });
  }

  // Guardar o Actualizar Bazar
  if (formBazar) {
    formBazar.addEventListener("submit", async (e) => {
      e.preventDefault();

      const id = document.getElementById("bazar-id").value;
      const nombre = document.getElementById("bazar-nombre").value;
      const esActual = document.getElementById("bazar-es-actual").value === "true";
      const fecha = document.getElementById("bazar-fecha").value;
      const horario = document.getElementById("bazar-horario").value;
      const stand = document.getElementById("bazar-stand").value;
      const imagen = document.getElementById("bazar-imagen").value; // Ruta tipo img/bazares/...
      const mapaIframeUrl = document.getElementById("bazar-mapa").value;
      const descripcion = document.getElementById("bazar-descripcion").value;

      const bazarData = {
        nombre,
        esActual,
        fecha,
        horario,
        stand,
        imagenCroquis: imagen, // Para el bazar actual
        imagen: imagen,         // Para los bazares pasados
        mapaIframeUrl,
        descripcion,
        descripcionUbicacion: descripcion
      };

      try {
        if (id) {
          // Actualizar existente
          const docRef = doc(db, "bazares", id);
          await updateDoc(docRef, bazarData);
          Swal.fire("¡Actualizado!", "El bazar se ha modificado correctamente.", "success");
        } else {
          // Crear nuevo
          await addDoc(collection(db, "bazares"), bazarData);
          Swal.fire("¡Guardado!", "El nuevo bazar ha sido registrado.", "success");
        }

        formBazar.reset();
        formContainer.style.display = "none";
        cargarBazaresAdmin();

      } catch (error) {
        console.error("Error al guardar el bazar:", error);
        Swal.fire("Error", "No se pudo guardar la información.", "error");
      }
    });
  }
});

// Función para cargar y listar los bazares en el panel de control
window.cargarBazaresAdmin = async function() {
  const gridAdmin = document.getElementById("admin-bazares-grid");
  if (!gridAdmin) return;

  gridAdmin.innerHTML = '<div class="skeleton-card"></div><div class="skeleton-card"></div>';

  try {
    const bazaresRef = collection(db, "bazares");
    const querySnapshot = await getDocs(bazaresRef);

    let html = "";
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const id = docSnap.id;

      html += `
        <div class="contacto-card" style="background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 16px; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <span style="font-size: 0.75rem; color: #38bdf8; font-weight: 700; text-transform: uppercase;">
              ${data.esActual ? '📍 Bazar Actual' : '📜 Bazar Anterior'}
            </span>
            <h4 style="color: #f8fafc; margin: 6px 0; font-size: 1.1rem;">${data.nombre}</h4>
            <p style="color: #94a3b8; font-size: 0.85rem; margin-bottom: 4px;"><i class="fa-regular fa-calendar-days"></i> ${data.fecha}</p>
            <p style="color: #94a3b8; font-size: 0.85rem; margin-bottom: 8px;"><i class="fa-solid fa-store"></i> ${data.stand || 'Sin stand asignado'}</p>
          </div>
          <div style="display: flex; gap: 8px; margin-top: 12px;">
            <button onclick="window.eliminarBazar('${id}')" class="btn-logout" style="padding: 6px 12px; font-size: 0.8rem; border-radius: 6px; cursor: pointer;">
              <i class="fa-solid fa-trash"></i> Eliminar
            </button>
          </div>
        </div>
      `;
    });

    gridAdmin.innerHTML = html || `<p style="color: #94a3b8; grid-column: 1 / -1; text-align: center; padding: 20px;">No hay bazares registrados todavía. ¡Haz clic en "Nuevo Bazar o Evento" para agregar uno!</p>`;

  } catch (error) {
    console.error("Error al cargar bazares en admin:", error);
    gridAdmin.innerHTML = `<p style="color: #ef4444; grid-column: 1 / -1; text-align: center;">Error al cargar los registros.</p>`;
  }
}

// Función global para eliminar un bazar
window.eliminarBazar = async function(id) {
  const confirmacion = await Swal.fire({
    title: '¿Estás seguro?',
    text: "Esta acción eliminará el bazar del sistema.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#334155',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  });

  if (confirmacion.isConfirmed) {
    try {
      await deleteDoc(doc(db, "bazares", id));
      Swal.fire("¡Eliminado!", "El registro ha sido borrado.", "success");
      cargarBazaresAdmin();
    } catch (error) {
      console.error("Error al eliminar bazar:", error);
      Swal.fire("Error", "No se pudo eliminar el registro.", "error");
    }
  }
}