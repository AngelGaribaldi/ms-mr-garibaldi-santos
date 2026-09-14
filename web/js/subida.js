const UPLOAD_BUCKET = "ms-mr-garibaldi-santos-media";
const MAX_FILE_SIZE = 50 * 1024 * 1024;

async function seleccionarArchivos() {
    const input = document.createElement("input");

    input.type = "file";
    input.accept = "image/*,video/*";
    input.multiple = true;

    input.onchange = async () => {
        const archivos = Array.from(input.files || []);

        if (archivos.length === 0) {
            return;
        }

        let subidos = 0;
        let errores = 0;

        alert(
            `Compartiendo ${archivos.length} recuerdo(s)...\n\n` +
            "La ventana puede tardar unos momentos en completarse."
        );

        for (const archivo of archivos) {

            if (archivo.size > MAX_FILE_SIZE) {
                errores++;

                alert(
                    `"${archivo.name}" supera el límite de 50 MB y no se subirá.`
                );

                continue;
            }

            const nombre =
                Date.now() +
                "-" +
                Math.random().toString(36).substring(2, 8) +
                "-" +
                archivo.name.replace(/[^a-zA-Z0-9._-]/g, "_");

            const { error } = await supabaseClient
                .storage
                .from(UPLOAD_BUCKET)
                .upload(nombre, archivo);

            if (error) {
                console.error("Error al subir:", error);
                errores++;
                continue;
            }

            subidos++;

            console.log(
                `Recuerdos compartidos: ${subidos} de ${archivos.length}`
            );
        }

        let mensaje =
            `¡Listo!\n\n${subidos} de ${archivos.length} recuerdo(s) compartido(s).`;

        if (errores > 0) {
            mensaje +=
                `\n\n${errores} archivo(s) no pudieron compartirse.`;
        }

        alert(mensaje);

        if (typeof cargarGaleria === "function") {
            cargarGaleria();
        }
    };

    input.click();
}
