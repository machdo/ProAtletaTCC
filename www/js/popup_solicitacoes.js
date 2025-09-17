var userType = localStorage.getItem("userType");
var userId = localStorage.getItem("userId");
var alunoId = localStorage.getItem("aluno_id");
var professorId = localStorage.getItem("professor_id");

var finalId = null;
if (userType === "aluno") {
    finalId = alunoId || userId;
} else if (userType === "professor") {
    finalId = professorId || userId;
}

console.log("userType:", userType);
console.log("alunoId:", alunoId);
console.log("professorId:", professorId);
console.log("finalId:", finalId);

if (!finalId) {
    console.error("Nenhum ID encontrado no localStorage.");
} else {
    fetch("https://proatleta.site/get_solicitacoes.php?id=" + finalId)
        .then(response => response.json())
        .then(data => {
            console.log("Solicitações recebidas:", data);

            var container = document.getElementById("solicitacoes-container");
            if (!container) {
                console.error("Elemento #solicitacoes-container não encontrado.");
                return;
            }

            container.innerHTML = "";

            if (data.success && data.solicitacoes.length > 0) {
                data.solicitacoes.forEach(function (solicitacao) {
                    var div = document.createElement("div");
                    div.classList.add("solicitacao-item");

                    div.innerHTML = `<div class="solicitacao-info">
                        <p><strong>Professor:</strong> ${solicitacao.email_professor}</p>
                        <p><strong>Status:</strong> <span class="status ${solicitacao.status.toLowerCase()}">${solicitacao.status}</span></p>
                    </div>
                    <div class="solicitacao-actions">
                        <button class="btn-recusar">X</button>
                        <button class="btn-aceitar">✔</button>
                    </div>`;

                    container.appendChild(div);

                    // Botão recusar vinculado à solicitação
                    var btnRecusar = div.querySelector(".btn-recusar");
                    btnRecusar.addEventListener("click", function () {
                        app.dialog.create({
                            title: 'Confirmação',
                            text: 'Deseja realmente recusar esta solicitação?',
                            buttons: [
                                {
                                    text: 'Cancelar',
                                    onClick: function () {
                                        return; 
                                    }
                                },
                                {
                                    text: 'Sim',
                                    onClick: function () {
                                        fetch("https://proatleta.site/delete_solicitacao.php", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ ID: solicitacao.ID })
                                        })
                                            .then(response => response.json())
                                            .then(result => {
                                                if (result.success) {
                                                    div.remove();
                                                    app.dialog.alert('Solicitação recusada com sucesso!', 'Sucesso');
                                                } else {
                                                    app.dialog.alert('Erro ao recusar a solicitação: ' + (result.message || ''), 'Erro');
                                                }
                                            })
                                            .catch(error => {
                                                console.error("Erro ao apagar solicitação:", error);
                                                app.dialog.alert('Erro inesperado ao apagar solicitação.', 'Erro');
                                            });
                                    }
                                }
                            ]
                        }).open();
                    });

                    // Botão aceitar
                    var btnRecusar = div.querySelector(".btn-aceitar");
                    btnRecusar.addEventListener("click", function () {
                        app.dialog.create({
                            title: 'Confirmação',
                            text: 'Deseja realmente aceitar esta solicitação?',
                            buttons: [
                                {
                                    text: 'Cancelar',
                                    onClick: function () {
                                        return; 
                                    }
                                },
                                {
                                    text: 'Sim',
                                    onClick: function () {
                                        fetch("https://proatleta.site/aceitar_solicitacao.php", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ ID: solicitacao.ID })
                                        })
                                            .then(response => response.json())
                                            .then(result => {
                                                if (result.success) {
                                                    div.remove();
                                                    app.dialog.alert('Solicitação aceita com sucesso!', 'Sucesso');
                                                } else {
                                                    app.dialog.alert('Erro ao aceitar a solicitação: ' + (result.message || ''), 'Erro');
                                                }
                                            })
                                            .catch(error => {
                                                console.error("Erro ao apagar solicitação:", error);
                                                app.dialog.alert('Erro inesperado ao apagar solicitação.', 'Erro');
                                            });
                                    }
                                }
                            ]
                        }).open();
                    });

                });
            } else {
                container.innerHTML = `<div class="align1"><p>Nenhuma solicitação encontrada.</p><div>`;
            }
        })
        .catch(error => console.error("Erro ao buscar solicitações:", error));
}
