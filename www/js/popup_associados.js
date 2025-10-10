var userType = localStorage.getItem("userType");
var userId = localStorage.getItem("userId");
var alunoId = localStorage.getItem("aluno_id");
var professorId = localStorage.getItem("professor_id");

var finalIdAss = null;
if (userType === "aluno") {
    finalIdAss = alunoId || userId;
} else if (userType === "professor") {
    finalIdAss = professorId || userId;
}

if (!finalIdAss) {
    console.error("Nenhum Id encontrado no localStorage.");
} else {
    fetch("https://proatleta.site/get_associados.php?id=" + finalIdAss)
        .then(response => response.json())
        .then(data => {
            console.log("associados:", data);

            var container_prof = document.getElementById("prof-container");
            if (!container_prof) {
                console.error("Elemento #prof-container não encontrado");
                return;
            }

            container_prof.innerHTML = "";

            if (data.success && data.professores.length > 0) {
                data.professores.forEach(function (professor) {
                    var div = document.createElement("div");
                    div.classList.add("solicitacao-item");

                    // Foto, nome e botão dentro do mesmo container
                    div.innerHTML = `
                        <div class="prof-actions">
                            <img src="${professor.foto}" alt="Foto de ${professor.nome_prof}" class="prof-foto" />
                            <span class="prof-nome">${professor.nome_prof}</span>
                            <button class="infos-prof">
                                <i class="ri-chat-3-line"></i>
                            </button>
                        </div>
                    `;

                    container_prof.appendChild(div);

                    var infosButton = div.querySelector(".infos-prof");
                    infosButton.addEventListener("click", function () {
                        // Fecha o sheet modal antes de navegar
                        const sheet = document.getElementById('sheetAssociado');
                        if (sheet) {
                            app.sheet.close(sheet);
                        }

                        // Salva os dados do professor no localStorage
                        localStorage.setItem('profNome', professor.nome_prof);
                        localStorage.setItem('profEmail', professor.email);
                        localStorage.setItem('profFoto', professor.foto);

                        // Navega para a página de informações do professor
                        app.views.main.router.navigate('/chat_aluno/');
                    });
                });
            }

        })
        .catch(error => console.error("Erro ao buscar associados:", error));
}