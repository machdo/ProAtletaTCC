const senhaInput = document.getElementById('senha');
const changeIcon = document.getElementById('viewPassword');

changeIcon.addEventListener('click', function () {
  const tipoAtual = senhaInput.getAttribute('type');
  if (tipoAtual === 'password') {
    senhaInput.setAttribute('type', 'text');
    changeIcon.classList.remove('fa-eye');
    changeIcon.classList.add('fa-eye-slash');
  } else {
    senhaInput.setAttribute('type', 'password');
    changeIcon.classList.remove('fa-eye-slash');
    changeIcon.classList.add('fa-eye');
  }
});

document.addEventListener('DOMContentLoaded', function () {
    const confirmarInput = document.getElementById('confirmar');
    const changeIcon = document.getElementById('viewPassword2');

    changeIcon.addEventListener('click', function () {
        const tipoAtual2 = confirmarInput.getAttribute('type');
        if (tipoAtual2 === 'password') {
            confirmarInput.setAttribute('type', 'text');
            changeIcon.classList.remove('fa-eye');
            changeIcon.classList.add('fa-eye-slash');
        } else {
            confirmarInput.setAttribute('type', 'password');
            changeIcon.classList.remove('fa-eye-slash');
            changeIcon.classList.add('fa-eye');
        }
    });
});

document.getElementById("senha").addEventListener("input", function (event) {
  let input = event.target.value;
  if (input.length > 14) {
    input = input.slice(0, 14);
  }
  event.target.value = input;
});

document.getElementById("nome").addEventListener("input", function (event) {
  let input = event.target.value;
  if (input.length > 60) {
    input = input.slice(0, 60);
  }
  event.target.value = input;
});

document.getElementById("email").addEventListener("input", function (event) {
  let input = event.target.value;
  if (input.length > 60) {
    input = input.slice(0, 60);
  }
  event.target.value = input;
});