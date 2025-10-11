document.addEventListener('DOMContentLoaded', function () {
    // Limitar tamanho dos inputs
    const senhaInput = document.getElementById("senha");
    const nomeInput = document.getElementById("nome");
    const emailInput = document.getElementById("email");
    const confirmarInput = document.getElementById("confirmar");

    if (senhaInput) {
        senhaInput.addEventListener("input", function (event) {
            let input = event.target.value;
            if (input.length > 14) input = input.slice(0, 14);
            event.target.value = input;
        });
    }

    if (nomeInput) {
        nomeInput.addEventListener("input", function (event) {
            let input = event.target.value;
            if (input.length > 60) input = input.slice(0, 60);
            event.target.value = input;
        });
    }

    if (emailInput) {
        emailInput.addEventListener("input", function (event) {
            let input = event.target.value;
            if (input.length > 60) input = input.slice(0, 60);
            event.target.value = input;
        });
    }

    // Função helper para alternar tipo e ícone
    function attachToggle(iconEl, targetInput) {
        if (!iconEl || !targetInput) return;
        // evita adicionar múltiplos listeners ao mesmo elemento
        if (iconEl.dataset.toggleAttached === '1') return;
        iconEl.addEventListener('click', function () {
            const type = targetInput.getAttribute('type') === 'password' ? 'text' : 'password';
            targetInput.setAttribute('type', type);
            iconEl.classList.toggle('ri-eye-line');
            iconEl.classList.toggle('ri-eye-off-line');
        });
        iconEl.dataset.toggleAttached = '1';
    }

    // Seleciona os ícones por id (conforme o HTML)
    const toggleSenha = document.getElementById('viewPassword');
    const toggleConfirmar = document.getElementById('viewPassword3');

    attachToggle(toggleSenha, senhaInput);
    attachToggle(toggleConfirmar, confirmarInput);
});

// Fallback usando delegação para casos em que a página/elementos são carregados dinamicamente
document.addEventListener('click', function (e) {
    const icon = e.target.closest && e.target.closest('.password-toggle-icon');
    if (!icon) return;

    // se já tem handler direto, não precisa do fallback
    if (icon.dataset.toggleAttached === '1') return;

    // tenta achar o input dentro do mesmo wrapper (.item-input-wrap)
    let wrap = icon.closest('.item-input-wrap');
    let input = wrap ? wrap.querySelector('input') : null;

    // ou usa um atributo data-target apontando para o id do input (opcional)
    if (!input) {
        const targetId = icon.getAttribute('data-target');
        if (targetId) input = document.getElementById(targetId);
    }

    if (!input) return;

    const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
    input.setAttribute('type', type);
    icon.classList.toggle('ri-eye-line');
    icon.classList.toggle('ri-eye-off-line');
});