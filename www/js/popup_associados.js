// Busca associados e, ao clicar, abre o chat do aluno já com o contexto do professor
var userType = localStorage.getItem("userType");
var userId = localStorage.getItem("userId");
var alunoId = localStorage.getItem("aluno_id");
var professorId = localStorage.getItem("professor_id");

var finalIdAss = null;
if (userType === "aluno") {
  finalIdAss = alunoId || userId;
} else if (userType === "professor" || userType === "prof") {
  finalIdAss = professorId || userId;
}

if (!finalIdAss) {
  console.error("Nenhum Id encontrado no localStorage.");
} else {
  fetch("https://proatleta.site/get_associados.php?id=" + encodeURIComponent(finalIdAss))
    .then(response => response.json())
    .then(data => {
      console.log("associados:", data);

      var container = document.getElementById("prof-container") || document.getElementById("associados-container");
      if (!container) {
        console.error("Elemento de container dos associados não encontrado (#prof-container ou #associados-container).");
        return;
      }
      container.innerHTML = "";

      // Suporta dois formatos de retorno: { success, professores: [] } ou { success, associados: [] }
      var lista = (data && (data.professores || data.associados)) || [];
      if (!data || !data.success || !Array.isArray(lista) || !lista.length) {
        container.innerHTML = "<p>Nenhum associado encontrado.</p>";
        return;
      }

      lista.forEach(function (professor) {
        var profId = professor.id_professor || professor.professor_id || professor.id || professor.idProfessor || professor.profId;
        var profNome = professor.nome_prof || professor.nome_professor || professor.nome || "Professor";
        var profEmail = professor.email || "";
        var profFoto = professor.foto || "img/user.jpg";
        var profEscolinha = professor.escolinha || professor.academia || "";

        var div = document.createElement("div");
        div.className = "solicitacao-item";
        div.innerHTML = `
          <div class="prof-actions" style="display:flex;align-items:center;gap:10px;">
            <img src="${profFoto}" alt="Foto de ${profNome}" class="prof-foto" style="width:44px;height:44px;border-radius:50%;object-fit:cover;">
            <span class="prof-nome" style="font-weight:600;">${profNome}</span>
            <button class="infos-prof" ${!profId ? 'disabled' : ''} title="Abrir chat">
              <i class="ri-chat-3-line"></i>
            </button>
          </div>
        `;
        container.appendChild(div);

        var infosButton = div.querySelector(".infos-prof");
        if (!infosButton) return;

        infosButton.addEventListener("click", function () {
          if (!profId) {
            console.error("ID do professor ausente no item:", professor);
            if (typeof app !== 'undefined' && app.dialog) app.dialog.alert('Não foi possível abrir o chat. ID do professor ausente.', 'Erro');
            else alert('Não foi possível abrir o chat. ID do professor ausente.');
            return;
          }

          // Fecha o sheet/modal se existir
          try {
            const sheet = document.getElementById('sheetAssociado') || document.getElementById('sheetAssociados');
            if (sheet && window.app && app.sheet) app.sheet.close(sheet);
          } catch (e) {}

          // Salva o CONTEXTO esperado pelo chat_aluno.js
          localStorage.setItem('chatProfessorId', String(profId));
          localStorage.setItem('chatProfNome', profNome);
          localStorage.setItem('chatProfEmail', profEmail);
          localStorage.setItem('chatProfFoto', profFoto);
          localStorage.setItem('chatProfEscolinha', profEscolinha);

          // Navega passando o ID também na rota (dupla garantia)
          if (window.app && app.views && app.views.main && app.views.main.router) {
            app.views.main.router.navigate('/chat_aluno/', { query: { id: String(profId) } });
          } else {
            location.href = 'chat_aluno.html?id=' + encodeURIComponent(String(profId));
          }
        });
      });
    })
    .catch(error => console.error("Erro ao buscar associados:", error));
}