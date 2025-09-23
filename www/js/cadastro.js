document.getElementById('cadastroForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const nome = (document.getElementById('nome').value || '').trim();
    // normaliza e valida o e-mail: tentativa robusta de leitura + remoção de caracteres invisíveis
    const emailInputEl = document.getElementById('email');
    let emailRaw = '';

    // 1) tentativa direta
    try { emailRaw = (emailInputEl && emailInputEl.value) ? String(emailInputEl.value) : ''; } catch (err) { emailRaw = ''; }

    // 2) fallback: atributo 'value' ou defaultValue
    if (!emailRaw && emailInputEl) {
        emailRaw = emailInputEl.getAttribute('value') || emailInputEl.defaultValue || '';
    }

    // 3) fallback: FormData
    const form = document.getElementById('cadastroForm');
    if (!emailRaw && form) {
        try {
            const fd = new FormData(form);
            const fEmail = fd.get('email');
            if (fEmail) emailRaw = String(fEmail);
        } catch (err) {
            // ignore
        }
    }

    // 4) fallback: form.elements
    if (!emailRaw && form) {
        try {
            const el = form.elements ? form.elements['email'] : null;
            if (el && el.value) emailRaw = String(el.value);
        } catch (err) { /* ignore */ }
    }

    // 5) fallback: query selector (case of duplicate ids/names)
    if (!emailRaw) {
        const q = document.querySelector('input[name="email"], input#email');
        if (q && q.value) emailRaw = String(q.value);
    }

    // remove caracteres invisíveis comuns que quebram validação
    emailRaw = (emailRaw || '').replace(/[\u200B\u200C\u200D\uFEFF\u00A0]/g, '').trim();
    const email = emailRaw.toLowerCase();

    // Logs detalhados para diagnosticar o que aconteceu
    try {
        console.log('--- Depuração leitura email ---');
        console.log('emailInputEl present:', !!emailInputEl);
        if (emailInputEl) {
            console.log('emailInputEl.outerHTML:', emailInputEl.outerHTML);
            console.log('emailInputEl.value raw length:', (emailInputEl.value || '').length);
            console.log('emailInputEl.defaultValue length:', (emailInputEl.defaultValue || '').length);
            console.log('emailInputEl.getAttribute("value"):', emailInputEl.getAttribute('value'));
            console.log('emailInputEl === document.querySelector("input[name=email]"):', emailInputEl === document.querySelector('input[name="email"]'));
            console.log('emailInputEl matches :focus:', emailInputEl === document.activeElement);
        }
        if (form) {
            console.log('form.elements names:', Array.from(form.elements).map(x => x.name || x.id || x.tagName).join(', '));
            try {
                const fd2 = new FormData(form);
                console.log('FormData entries:');
                for (const pair of fd2.entries()) console.log('  ', pair[0], '=', String(pair[1]));
            } catch (err) { console.log('FormData read failed', err); }
        }
        console.log('Email lido (após fallbacks):', JSON.stringify(emailRaw), 'len:', emailRaw.length, 'codes:', Array.from(emailRaw).map(c => c.codePointAt(0).toString(16)).join(' '));
        console.log('--- Fim depuração ---');
    } catch (err) {
        console.error('Erro ao gerar logs de depuração:', err);
    }

    // Se após todas as tentativas o email estiver vazio, aborta e informa o usuário
    if (!emailRaw) {
        app.dialog.alert('Não foi possível ler o e-mail preenchido. Verifique se há scripts que modificam o campo ou se o teclado/autofill está interferindo. Abra o console para detalhes.', 'Erro no E-mail');
        return;
    }

    // validação simples de e-mail (evita enviar endereços inválidos ao servidor)
    function isValidEmail(e) {
        // regex simples: texto@dominio.ext (não cobre todos os casos RFC mas é suficiente aqui)
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
    }

    if (!isValidEmail(email)) {
        app.dialog.alert('E-mail inválido. Verifique o endereço antes de prosseguir.', 'Erro no E-mail');
        return;
    }

    // Leitura robusta dos campos de senha (tenta várias fontes)
    let senha = (document.getElementById('senha') && document.getElementById('senha').value) || '';
    let confirmar = (document.getElementById('confirmar') && document.getElementById('confirmar').value) || '';
    let valorFonte = 'direct';

    // se direct estiver vazio, tenta FormData (pode pegar valores que por algum motivo não estavam disponíveis diretamente)
    if (!senha && form) {
        try {
            const fd = new FormData(form);
            const fSenha = fd.get('senha');
            const fConfirmar = fd.get('confirmar');
            if (fSenha) { senha = fSenha; valorFonte = 'formdata'; }
            if (fConfirmar) { confirmar = fConfirmar; }
        } catch (e) {
            // continua para próximo fallback
        }
    }

    // último fallback: querySelector por name (em caso de duplicados ou substituições dinâmicas)
    if (!senha) {
        const byName = document.querySelector('input[name="senha"]');
        if (byName && byName.value) { senha = byName.value; valorFonte = 'query'; }
    }

    senha = (senha || '').trim();
    confirmar = (confirmar || '').trim();

    console.log('Fonte da senha lida:', valorFonte);

    const categoriaEl = document.querySelector('input[name="categoria"]:checked');
    const categoria = categoriaEl ? categoriaEl.value : null;

    // Se nenhuma categoria selecionada, avisa e interrompe
    if (!categoria) {
        app.dialog.alert('Selecione a categoria (Aluno ou Professor).', 'Erro');
        return;
    }

    // Verificação Unicode-aware: tenta usar \p{Lu} e \p{Nd}, com fallback para [A-Z] e [0-9]
    let temMaiuscula = false;
    let temNumero = false;
    try {
        temMaiuscula = /\p{Lu}/u.test(senha); // letras maiúsculas Unicode
        temNumero = /\p{Nd}/u.test(senha);    // dígitos Unicode
    } catch (e) {
        // Ambiente sem suporte a Unicode property escapes -> fallback ASCII
        temMaiuscula = /[A-Z]/.test(senha);
        temNumero = /[0-9]/.test(senha);
    }

    // Log para depuração (não inclui a senha em texto)
    console.log('Senha comprimento:', senha.length, 'temMaiuscula:', temMaiuscula, 'temNumero:', temNumero);

    if (!temMaiuscula || !temNumero) {
        app.dialog.alert('A senha deve conter pelo menos uma letra maiúscula e um número.', 'Erro na Senha');
        return;
    }

    if (senha !== confirmar) {
        app.dialog.create({
            title: 'Erro na Senha',
            text: 'As senhas não são iguais.',
            buttons: [
                {
                    text: 'OK',
                    onClick: function () {
                        return;
                    }
                }
            ]
        }).open();
        return;
    }

    fetch('https://proatleta.site/cadastro.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
       body: `nome=${encodeURIComponent(nome)}&email=${encodeURIComponent(email)}&senha=${encodeURIComponent(senha)}&categoria=${encodeURIComponent(categoria)}`
    })
        .then(response => response.text())
        .then(text => {
            console.log("Resposta bruta:", text);

            try {
                const data = JSON.parse(text);

                if (data.success) {
                    app.dialog.create({
                        title: 'Verifique seu E-Mail',
                        text: 'Um link de verificação foi enviado para o seu e-mail. Clique nele para ativar sua conta.',
                        buttons: [
                            {
                                text: 'OK',
                                onClick: function () {
                                    window.location.href = 'index.html';
                                }
                            }
                        ]
                    }).open();
                } else {
                    app.dialog.alert(data.message || 'Erro ao cadastrar.', 'Erro');
                }
            } catch (e) {
                console.error('Erro ao converter resposta em JSON:', e);
                app.dialog.alert('Erro inesperado na resposta do servidor.', 'Erro');
            }
        })
        .catch(error => {
            console.error(error);
            document.getElementById('mensagem').innerText = 'Erro ao enviar dados.';
            app.dialog.alert('Ocorreu um erro ao enviar os dados. Dados já cadastrados.', 'Erro');
        });
});
