const MESSAGES_TABLE = "messages";

async function obtenerInvitadoActual() {
    const guestId = localStorage.getItem(GUEST_STORAGE_KEY);

    if (!guestId) {
        return null;
    }

    const { data, error } = await supabaseClient
        .from("guests")
        .select("id, name")
        .eq("id", guestId)
        .maybeSingle();

    if (error) {
        console.error("Error obteniendo invitado:", error);
        return null;
    }

    return data;
}

async function enviarMensaje() {
    const mensajeInput = document.getElementById("guest-message");
    const boton = document.getElementById("send-message");

    if (!mensajeInput) return;

    const mensaje = mensajeInput.value.trim();

    if (!mensaje) {
        alert("Por favor escribe un mensaje.");
        mensajeInput.focus();
        return;
    }

    if (mensaje.length > 500) {
        alert("El mensaje no puede superar los 500 caracteres.");
        return;
    }

    const invitado = await obtenerInvitadoActual();

    if (!invitado) {
        alert(
            "No pudimos identificarte. " +
            "Por favor recarga la página."
        );
        return;
    }

    if (boton) {
        boton.disabled = true;
        boton.textContent = "Enviando...";
    }

    const { error } = await supabaseClient
        .from(MESSAGES_TABLE)
        .insert({
            guest_id: invitado.id,
            guest_name: invitado.name,
            message: mensaje
        });

    if (error) {
        console.error("Error enviando mensaje:", error);

        alert(
            "No pudimos guardar tu mensaje. " +
            "Inténtalo nuevamente."
        );

        if (boton) {
            boton.disabled = false;
            boton.textContent = "Dejar mensaje";
        }

        return;
    }

    mensajeInput.value = "";

    if (boton) {
        boton.disabled = false;
        boton.textContent = "Dejar mensaje";
    }

    alert("¡Gracias por dejar un mensaje para nosotros! ❤️");

    cargarMensajes();
}

async function cargarMensajes() {
    const lista = document.getElementById("messages-list");

    if (!lista) return;

    const { data, error } = await supabaseClient
        .from(MESSAGES_TABLE)
        .select("guest_name, message, created_at")
        .order("created_at", {
            ascending: false
        });

    if (error) {
        console.error("Error cargando mensajes:", error);

        lista.innerHTML =
            "<p>No se pudieron cargar los mensajes.</p>";

        return;
    }

    if (!data || data.length === 0) {
        lista.innerHTML =
            "<p>Aún no hay mensajes. Sé el primero en escribirnos.</p>";

        return;
    }

    lista.innerHTML = "";

    data.forEach((mensaje) => {
        const tarjeta = document.createElement("div");
        tarjeta.className = "message-card";

        const nombre = document.createElement("h3");
        nombre.textContent = mensaje.guest_name;

        const texto = document.createElement("p");
        texto.textContent = mensaje.message;

        tarjeta.appendChild(nombre);
        tarjeta.appendChild(texto);

        lista.appendChild(tarjeta);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    cargarMensajes();
});
