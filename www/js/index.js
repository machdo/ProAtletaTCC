function atualizarTabbarPorTipoUsuario() { 
  const userType = localStorage.getItem('userType');

  document.querySelectorAll('.aluno-link, .prof-link').forEach(el => {
    el.style.display = 'none';
  });

  if (userType === 'aluno') {
    document.querySelectorAll('.aluno-link').forEach(el => {
      el.style.display = 'flex';
    });
  } else if (userType === 'prof') {
    document.querySelectorAll('.prof-link').forEach(el => {
      el.style.display = 'flex';
    });
  }
}

// Executa após o carregamento inicial da página
document.addEventListener('DOMContentLoaded', function () {
  atualizarTabbarPorTipoUsuario();
});

// Esconde a tabbar quando o teclado é aberto (input focado)
$(document).on('focusin', 'input, textarea', function() {
    $('.toolbar-bottom').css('display', 'none');
});

// Mostra a tabbar quando o teclado é fechado (input desfocado)
$(document).on('focusout', 'input, textarea', function() {
    $('.toolbar-bottom').css('display', '');
});


