// js/paginas/bazares/main-admin-bazares.js
import { db } from '../../globales/firebase-config.js';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  cargarBazaresAdmin();

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

  if (formBazar) {
    formBazar.addEventListener("submit", async (e) => {
      e.preventDefault();

      const id = document.getElementById("bazar-id").value;
      const nombre = document.getElementById("bazar-nombre").value;
      const esActual = document.getElementById("bazar-es-actual").value === "true";
      const fecha = document.getElementById("bazar-fecha").value;
      const horario = document.getElementById("bazar-horario").value;
      const stand = document.getElementById("bazar-stand").value;
      const imagen = document.getElementById("bazar-imagen").value;
      const mapaIframeUrl = document.getElementById("bazar-mapa").value;
      const descripcion = document.getElementById("bazar-descripcion").value;

      const bazarData = {
        nombre,
        esActual,
        fecha,
        horario,
        stand,
        imagenCroquis: imagen,
        imagen: imagen,
        mapaIframeUrl,
        descripcion,
        descripcionUbicacion: descripcion
      };

      try {
        if (id) {
          const docRef = doc(db, "bazares", id);
          await updateDoc(docRef, bazarData);
          Swal.fire("¡Actualizado!", "El bazar se ha modificado correctamente.", "success");
        } else {
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

window.cargarBazaresAdmin = async function() {
  const gridAdmin = document.getElementById("admin-bazares-grid");
  if (!gridAdmin) return;

  gridAdmin.innerHTML = '<div class="skeleton-card"></div><div class="skeleton-card"></div>';

  try {
    const bazaresRef = collection(db, "bazares");
    const querySnapshot = getDocs(bazaresRef); // O await getDocs...
    // ... tu lógica para pintar el admin ...
  } catch (error) {
    console.error("Error al cargar bazares en admin:", error);
  }
}

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
    }
  }
}