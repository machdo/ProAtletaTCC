console.log("popup_solicitacoes.js carregado!");

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

if (finalId) {
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
                });
            } else {
                container.innerHTML = "<p>Nenhuma solicitação encontrada.</p>";
            }
        })
        .catch(error => console.error("Erro ao buscar solicitações:", error));
} else {
    console.error("Nenhum ID encontrado no localStorage.");
}
