const form = document.getElementById('contactForm');
const popup = document.getElementById('popup-mensagem');
const popupMessage = document.getElementById('popupMessage');
    const popupClose = document.getElementById('popupClose');


form.addEventListener('submit', async function(e) {
    e.preventDefault(); // impede o reload da página
    const formData = new FormData(form);

    try {
        const response = await fetch('../php/enviar.php', {
            method: 'POST',
            body: formData
        });

        // Verifica se a requisição foi bem-sucedida
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.text();
        popupMessage.textContent = data; // mensagem do PHP
        popup.style.display = 'flex';
        form.reset(); // limpa o formulário
    } catch (error) {
        popupMessage.textContent = 'Erro ao enviar mensagem!';
        popup.style.display = 'flex';
    }
});

// Fecha o popup ao clicar no botão de fechar
popupClose.addEventListener('click', () => {
    popup.style.display = 'none';
});

// Fecha se clicar fora da área do conteúdo
window.addEventListener('click', (e) => {
    if (e.target === popup) popup.style.display = 'none';
});

const handlePhone = (event) => {
  let input = event.target
  input.value = phoneMask(input.value)
}

const phoneMask = (value) => {
  if (!value) return ""
  value = value.replace(/\D/g,'')
  value = value.replace(/(\d{2})(\d)/,"($1) $2")
  value = value.replace(/(\d)(\d{4})$/,"$1-$2")
  return value
}