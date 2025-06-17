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


document.addEventListener('DOMContentLoaded', function () {
    const senhaInput = document.getElementById('senha');
    const changeIcon = document.getElementById('viewPassword');

    changeIcon.addEventListener('click', function () {
        const tipoAtual = senhaInput.getAttribute('type');
        if (tipoAtual === 'password') {
            senhaInput.setAttribute('type', 'text');
            changeIcon.classList.remove('ri-eye-line');
            changeIcon.classList.add('ri-eye-off-line');
        } else {
            senhaInput.setAttribute('type', 'password');
            changeIcon.classList.remove('ri-eye-off-line');
            changeIcon.classList.add('ri-eye-line');
        }
    });
});
