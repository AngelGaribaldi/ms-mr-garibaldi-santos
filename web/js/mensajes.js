const MESSAGES_TABLE = "messages";

async function enviarMensaje() {
    const nombreInput = document.getElementById("guest-name");
    const mensajeInput = document.getElementById("guest-message");
    const boton = document.getElementById("send-message");

    if (!nombreInput || !mensajeInput) return;

    const nombre = nombreInput.value.trim();
    const mensaje = mensajeInput.value.trim();

    if (!nombre) {
        alert("Por favor escribe tu nombre.");
        nombreInput.focus();
        return;
    }

    if (!mensaje) {
        alert("Por favor escribe un mensaje.");
        mensajeInput.focus();
        return;
    }

    if (mensaje.length > 500) {
        alert("El mensaje no puede superar los 500 caracteres.");
        return;
    }

    if (boton) {
        boton.disabled = true;
        boton.textContent = "Enviando...";
    }

    const { error } = await supabaseClient
        .from(MESSAGES_TABLE)
        .insert({
            guest_name: nombre,
            message: mensaje
        });

    if (error) {
        console.error("Error enviando mensaje:", error);

        alert(
            "No pudimos guardar tu mensaje. Inténtalo nuevamente."
        );

        if (boton) {
            boton.disabled = false;
            boton.textContent = "Dejar mensaje";
        }

        return;
    }

    nombreInput.value = "";
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
