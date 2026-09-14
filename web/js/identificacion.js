const GUEST_STORAGE_KEY = "ms_mr_guest_id";

async function iniciarIdentificacion() {
    const guestId = localStorage.getItem(GUEST_STORAGE_KEY);

    if (guestId) {
        const { data, error } = await supabaseClient
            .from("guests")
            .select("id, name")
            .eq("id", guestId)
            .maybeSingle();

        if (!error && data) {
            mostrarBienvenida(data.name);
            return;
        }

        localStorage.removeItem(GUEST_STORAGE_KEY);
    }

    mostrarFormularioNombre();
}

function mostrarFormularioNombre() {
    const modal = document.createElement("div");

    modal.id = "guest-identification";
    modal.className = "guest-identification";

    modal.innerHTML = `
        <div class="guest-identification-card">

            <h2>Bienvenido</h2>

            <p>
                Para participar en nuestra celebración,
                escribe tu nombre.
            </p>

            <input
                type="text"
                id="guest-name-identification"
                placeholder="Tu nombre y apellido"
                maxlength="100"
                autocomplete="name"
            >

            <button
                id="guest-enter-button"
                class="upload-button"
            >
                Entrar
            </button>

        </div>
    `;

    document.body.appendChild(modal);

    const input = document.getElementById(
        "guest-name-identification"
    );

    const button = document.getElementById(
        "guest-enter-button"
    );

    button.addEventListener("click", registrarInvitado);

    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            registrarInvitado();
        }
    });

    setTimeout(() => input.focus(), 100);
}

async function registrarInvitado() {
    const input = document.getElementById(
        "guest-name-identification"
    );

    const button = document.getElementById(
        "guest-enter-button"
    );

    if (!input) return;

    const nombre = input.value.trim();

    if (!nombre) {
        alert("Por favor escribe tu nombre.");
        input.focus();
        return;
    }

    if (button) {
        button.disabled = true;
        button.textContent = "Entrando...";
    }

    const { data, error } = await supabaseClient
        .from("guests")
        .insert({
            name: nombre
        })
        .select("id, name")
        .single();

    if (error) {
        console.error("Error registrando invitado:", error);

        alert(
            "No pudimos registrar tu nombre. " +
            "Inténtalo nuevamente."
        );

        if (button) {
            button.disabled = false;
            button.textContent = "Entrar";
        }

        return;
    }

    localStorage.setItem(
        GUEST_STORAGE_KEY,
        data.id
    );

    const modal = document.getElementById(
        "guest-identification"
    );

    if (modal) {
        modal.remove();
    }

    mostrarBienvenida(data.name);
}

function mostrarBienvenida(nombre) {
    const bienvenida = document.createElement("div");

    bienvenida.className = "guest-welcome";

    bienvenida.innerHTML = `
        <div class="guest-welcome-card">
            <div class="guest-welcome-heart">♡</div>

            <h2>¡Bienvenido, ${escaparHTML(nombre)}!</h2>

            <p>
                Gracias por formar parte de
                este día tan especial.
            </p>
        </div>
    `;

    document.body.appendChild(bienvenida);

    setTimeout(() => {
        bienvenida.classList.add("guest-welcome-hide");

        setTimeout(() => {
            bienvenida.remove();
        }, 500);

    }, 3000);
}

function escaparHTML(texto) {
    const div = document.createElement("div");
    div.textContent = texto;
    return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", () => {
    iniciarIdentificacion();
});
