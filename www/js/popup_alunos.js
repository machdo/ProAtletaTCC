var userType = localStorage.getItem("userType");
var userId = localStorage.getItem("userId");
var professorId = localStorage.getItem("professor_id");

var finalIdProf = null;
if (userType === "prof") {
    finalIdProf = professorId || userId;
} else if (userType === "aluno") {
    finalIdProf = professorId;
}

if (!finalIdProf) {
    console.error("Nenhum Id de professor encontrado no localStorage.");
    if (typeof app !== 'undefined' && app.dialog) {
        app.dialog.alert('Nenhum Id de professor encontrado no localStorage.', 'Erro');
    } else {
        alert('Nenhum Id de professor encontrado no localStorage.');
    }
} else {
    fetch("https://proatleta.site/get_alunos.php?id=" + finalIdProf)
        .then(response => response.json())
        .then(data => {
            console.log(data.alunos);
            var container = document.getElementById("prof-container");
            if (!container) return;

            // Limpa o container apenas uma vez
            container.innerHTML = "";

            if (data.success && data.alunos && data.alunos.length > 0) {
                data.alunos.forEach(function (aluno) {
                    var div = document.createElement("div");
                    div.className = "solicitacao-item";
                    div.innerHTML = `
                        <div class="prof-actions">
                            <img src="${aluno.foto || 'img/user.png'}" alt="Foto de ${aluno.nome_aluno}" class="prof-foto" />
                            <span class="prof-nome">${aluno.nome_aluno}</span>
                        </div>
                        <div class="alunos-botoes">
                            <button class="btn-chat" title="Abrir chat" data-aluno-id="${aluno.id}">
                                <i class="ri-chat-3-line"></i>
                            </button>
                            <button class="btn-deletar" title="Remover aluno" data-aluno-id="${aluno.id}">
                                <i class="ri-delete-bin-line"></i>
                            </button>
                        </div>`;
                    container.appendChild(div); // Adiciona a div ao container

                    var infosButton = div.querySelector(".btn-chat");
                    infosButton.addEventListener("click", function () {
                        // Fecha o sheet modal antes de navegar
                        const sheet = document.getElementById('sheetAlunos');
                        if (sheet) {
                            app.sheet.close(sheet);
                        }

                        // Salva os dados do aluno no localStorage
                        localStorage.setItem('alunoNome', aluno.nome_aluno);
                        localStorage.setItem('alunoEmail', aluno.email);
                        localStorage.setItem('alunoFoto', aluno.foto);

                        // Navega para a página de informações do professor
                        app.views.main.router.navigate('/chat_prof/');
                    });

                    // Função que executa a deleção
                    function executarDelecao(alunoIdLocal) {
                        fetch("https://proatleta.site/delete_aluno_professor.php", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                Aluno_ID: alunoIdLocal,
                                Professor_ID: finalIdProf,
                            }),
                        })
                            .then(response => response.json())
                            .then(result => {
                                if (result.success) {
                                    if (typeof app !== 'undefined' && app.dialog) {
                                        app.dialog.alert("Aluno removido com sucesso!", "Sucesso");
                                    } else {
                                        alert("Aluno removido com sucesso!");
                                    }
                                    div.remove(); // Remove a div do aluno
                                } else {
                                    if (typeof app !== 'undefined' && app.dialog) {
                                        app.dialog.alert("Erro ao remover aluno: " + (result.message || ''), "Erro");
                                    } else {
                                        alert("Erro ao remover aluno: " + (result.message || ''));
                                    }
                                }
                            })
                            .catch(error => {
                                console.error("Erro ao deletar aluno:", error);
                                if (typeof app !== 'undefined' && app.dialog) {
                                    app.dialog.alert("Erro ao deletar aluno.", "Erro");
                                } else {
                                    alert("Erro ao deletar aluno.");
                                }
                            });
                    }

                    // Configura o evento de clique do botão deletar
                    var deleteButton = div.querySelector(".btn-deletar");
                    deleteButton.addEventListener("click", function () {
                        var alunoIdLocal = this.getAttribute("data-aluno-id");
                        var mensagem = `Tem certeza que deseja remover o aluno ${aluno.nome_aluno}?`;

                        if (typeof app !== 'undefined' && app.dialog) {
                            app.dialog.confirm(mensagem, 'Confirmação', function () {
                                executarDelecao(alunoIdLocal);
                            });
                        } else {
                            if (confirm(mensagem)) {
                                executarDelecao(alunoIdLocal);
                            }
                        }
                    });

                    // Configura o evento de clique do botão chat
                    var chatButton = div.querySelector(".btn-chat");
                    chatButton.addEventListener("click", function () {
                        const alunoIdLocal = this.getAttribute("data-aluno-id");
                        const alunoNome = div.querySelector(".prof-nome").textContent;
                        const alunoFoto = div.querySelector(".prof-foto").src;
                        const alunoEmail = aluno.email || "email@exemplo.com"; // Certifique-se de que o objeto `aluno` contém o email

                        // Armazena os dados do aluno no localStorage
                        localStorage.setItem("chatAlunoId", alunoIdLocal);
                        localStorage.setItem("chatAlunoNome", alunoNome);
                        localStorage.setItem("chatAlunoFoto", alunoFoto);
                        localStorage.setItem("chatAlunoEmail", alunoEmail); // Adiciona o email ao localStorage
                        localStorage.setItem("chatAlunoEscolinha", aluno.escolinha || "Pendente");

                        // Navega para a página de chat
                        if (typeof app !== 'undefined' && app.views && app.views.main && app.views.main.router) {
                            app.views.main.router.navigate('/chat_prof/');
                        } else {
                            console.warn("Router do app não disponível para navegação.");
                        }
                    });
                });
            } else {
                container.innerHTML = "<p>Nenhum aluno encontrado.</p>";
            }
        })
        .catch(error => {
            console.error("Erro ao buscar alunos:", error);
            if (typeof app !== 'undefined' && app.dialog) {
                app.dialog.alert("Erro ao buscar alunos.", "Erro");
            } else {
                alert("Erro ao buscar alunos.");
            }
        });
}