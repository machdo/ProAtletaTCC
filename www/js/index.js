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