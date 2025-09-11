$('#formAdicionarEvento').on('submit', function (e) {
    e.preventDefault();
    const titulo = $('input[name="titulo"]').val();
    const horario = $('input[name="horario"]').val();
    const local = $('input[name="local"]').val();

    if (window.calendarioInstance && typeof window.calendarioInstance.adicionarEvento === 'function') {
        window.calendarioInstance.adicionarEvento(titulo, horario, local);
    }
    alert('Evento salvo!');
});