const GALLERY_BUCKET = "ms-mr-garibaldi-santos-media";
const GALLERY_LIMIT = 9;

async function cargarGaleria() {
    const gallery = document.getElementById("gallery");

    if (!gallery) return;

    gallery.innerHTML = "<p>Cargando recuerdos...</p>";

    const { data, error } = await supabaseClient
        .storage
        .from(GALLERY_BUCKET)
        .list("", {
            limit: GALLERY_LIMIT,
            offset: 0,
            sortBy: {
                column: "created_at",
                order: "desc"
            }
        });

    if (error) {
        console.error("Error cargando galería:", error);
        gallery.innerHTML = "<p>No se pudieron cargar los recuerdos.</p>";
        return;
    }

    if (!data || data.length === 0) {
        gallery.innerHTML = "<p>Aún no hay recuerdos.</p>";
        return;
    }

    gallery.innerHTML = "";

    data.forEach((archivo) => {
        if (!archivo.name) return;

        const { data: publicUrlData } =
            supabaseClient
                .storage
                .from(GALLERY_BUCKET)
                .getPublicUrl(archivo.name);

        const url = publicUrlData.publicUrl;

        const extension =
            archivo.name.split(".").pop().toLowerCase();

        const esVideo =
            ["mp4", "mov", "webm", "m4v"].includes(extension);

        const item = document.createElement("div");
        item.className = "gallery-item";

        if (esVideo) {
            item.innerHTML = `
                <div class="video-thumbnail">
                    <span class="play-icon">▶</span>
                    <span class="video-label">VIDEO</span>
                </div>
            `;

            item.addEventListener("click", () => {
                abrirRecuerdo(url, true);
            });

        } else {
            item.innerHTML = `
                <img
                    src="${url}"
                    alt="Recuerdo de nuestra celebración"
                    loading="lazy"
                >
            `;

            item.addEventListener("click", () => {
                abrirRecuerdo(url, false);
            });
        }

        gallery.appendChild(item);
    });
}


function abrirRecuerdo(url, esVideo) {
    const modal = document.createElement("div");
    modal.className = "media-modal";

    if (esVideo) {
        modal.innerHTML = `
            <div class="modal-content">
                <button class="close-modal">×</button>

                <video
                    src="${url}"
                    controls
                    autoplay
                    playsinline
                ></video>
            </div>
        `;
    } else {
        modal.innerHTML = `
            <div class="modal-content">
                <button class="close-modal">×</button>

                <img
                    src="${url}"
                    alt="Recuerdo"
                >
            </div>
        `;
    }

    document.body.appendChild(modal);

    modal.querySelector(".close-modal").onclick = () => {
        modal.remove();
    };

    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.remove();
        }
    });
}


document.addEventListener("DOMContentLoaded", () => {
    cargarGaleria();
});
