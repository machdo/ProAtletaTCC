document.addEventListener('DOMContentLoaded', function() {
    
    const inputTelefone = document.getElementById('telefone');

    if (inputTelefone) {
        inputTelefone.addEventListener('input', function (e) {
            let value = e.target.value;
            value = value.replace(/\D/g, ''); 

       
            if (value.length > 10) { 
                value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
            } else if (value.length > 6) { 
                value = value.replace(/^(\d{2})(\d{4})(\d{4}).*/, '($1) $2-$3');
            } else if (value.length > 2) {
                value = value.replace(/^(\d{2})(\d+)/, '($1) $2');
            }

          
            e.target.value = value;
        });
    }
});