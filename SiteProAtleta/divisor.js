 document.addEventListener('DOMContentLoaded', function() {
      // Seleciona todos os separadores na página
      const separators = document.querySelectorAll('.gradient-separator');

      // Opções do Intersection Observer:
      // root: null → viewport do navegador
      // rootMargin: "0px" → sem margem extra
      // threshold: 0.1 → dispara quando 10% do elemento ficar visível
      const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
      };

      // Callback: recebe entradas (entries) e o próprio observer
      const callback = (entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Quando pelo menos 10% do separador estiver visível, adicionamos a classe
            entry.target.classList.add('in-view');
            // Opcional: parar de observar depois que animou uma vez
            observer.unobserve(entry.target);
          }
        });
      };

      // Cria o Intersection Observer
      const observer = new IntersectionObserver(callback, options);

      // Começa a observar cada separador
      separators.forEach(separator => {
        observer.observe(separator);
      });
    });