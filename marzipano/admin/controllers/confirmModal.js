async function openConfirmModal(options) {

    if (!document.getElementById("confirmModal")) {

        const html = await fetch("/admin/components/confirmModal.html")
            .then(r => r.text());

        document.body.insertAdjacentHTML("beforeend", html);
    }

    const modal = document.getElementById("confirmModal");

    document.getElementById("confirmTitle").textContent =
        options.title || "Confirmación";

    document.getElementById("confirmMessage").textContent =
        options.message || "";

    const btn = document.getElementById("confirmAccept");

    btn.textContent = options.confirmText || "Aceptar";
    btn.className = options.confirmClass || "btn btn-primary";

    btn.onclick = async () => {

        closeConfirmModal();

        if (options.onConfirm)
            await options.onConfirm();

    };

    modal.classList.add("show");
}

function closeConfirmModal() {

    const modal = document.getElementById("confirmModal");

    if (!modal)
        return;

    modal.classList.remove("show");
    modal.remove();

}