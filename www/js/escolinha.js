const API_KEY = 'pk.189efc57c2334b907bc107b028bc4b36';

// ---------------- DISTÂNCIA ----------------
function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const toRad = x => x * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
}

// ---------------- LIMPA TEXTO DO ENDEREÇO ----------------
function limparEndereco(displayName) {
    let endereco = displayName;

    // remove "Região Geográfica ..." e "Região Metropolitana ..."
    endereco = endereco.replace(/,?\s*Região [^,]*/g, "");

    // remove "Brazil"
    endereco = endereco.replace(/,?\s*Brazil/g, "");

    // remove CEP ou números no final (ex: ", 09190-610" ou ", 12345")
    endereco = endereco.replace(/,?\s*\d{5}(-\d{3})?$/g, "");

    // remove vírgulas duplicadas e espaços extras
    endereco = endereco.replace(/,\s*,/g, ",").replace(/,\s*$/, "").trim();

    return endereco;
}

// ---------------- AUTOCOMPLETE ----------------
async function mostrarSugestoes() {
    const query = document.getElementById("endereco").value.trim();
    const resultados = document.getElementById("resultados");

    resultados.innerHTML = "";

    if (query.length < 3) return; // só busca se tiver 3+ letras

    try {
        const resp = await fetch(
            `https://us1.locationiq.com/v1/autocomplete?key=${API_KEY}&q=${encodeURIComponent(query)}&limit=8&format=json&countrycodes=br`
        );
        const data = await resp.json();

        const filtrados = data.filter(item =>
            item.display_name.includes("Brazil")
        );

        if (!filtrados.length) {
            resultados.innerHTML = "<li>Nenhum resultado encontrado no Brasil</li>";
            return;
        }

        filtrados.forEach(item => {
            const li = document.createElement("li");
            li.classList.add("resultado-endereco");

            const enderecoFormatado = limparEndereco(item.display_name);
            li.textContent = enderecoFormatado;

            li.onclick = () => {
                document.getElementById("endereco").value = enderecoFormatado;
                resultados.innerHTML = "";
                buscarEscolinhas();
            };

            resultados.appendChild(li);
        });

    } catch (err) {
        console.error("Erro no autocomplete:", err);
        resultados.innerHTML = "<li>Erro ao buscar sugestões</li>";
    }

    toggleClear();
}

// ---------------- BUSCAR ESCOLINHAS ----------------
async function buscarEscolinhas() {
    const endereco = document.getElementById('endereco').value.trim();
    const resultados = document.getElementById('resultados');

    if (!endereco) {
        alert('Por favor, digite um endereço.');
        return;
    }

    localStorage.setItem('ultimoEndereco', endereco);
    resultados.innerHTML = '<li>Buscando...</li>';

    try {
        const geoResp = await fetch(
            `https://us1.locationiq.com/v1/search?key=${API_KEY}&q=${encodeURIComponent(endereco)}&format=json&countrycodes=br`
        );
        const geoData = await geoResp.json();

        if (!geoData.length) {
            resultados.innerHTML = '<li>Endereço não encontrado no Brasil.</li>';
            return;
        }

        const latRef = parseFloat(geoData[0].lat);
        const lonRef = parseFloat(geoData[0].lon);

        const esporteSelecionado = localStorage.getItem('esporteSelecionado') || '';
        const tagEsporte = esporteSelecionado.toLowerCase();

        const overpassQuery = `
        [out:json];
        (
          node["leisure"="sports_centre"]["sport"="${tagEsporte}"](around:10000,${latRef},${lonRef});
          way["leisure"="sports_centre"]["sport"="${tagEsporte}"](around:10000,${latRef},${lonRef});
          relation["leisure"="sports_centre"]["sport"="${tagEsporte}"](around:10000,${latRef},${lonRef});
        );
        out center;
        `;

        const overpassResp = await fetch("https://overpass-api.de/api/interpreter", {
            method: "POST",
            body: overpassQuery
        });
        const overpassData = await overpassResp.json();

        resultados.innerHTML = '';

        let locais = overpassData.elements.filter(item => item.tags && item.tags.name);

        if (!locais.length) {
            resultados.innerHTML = '<li>Nenhuma escolinha encontrada para o esporte selecionado.</li>';
            return;
        }

        locais = locais.map(item => {
            const itemLat = item.lat || (item.center && item.center.lat);
            const itemLon = item.lon || (item.center && item.center.lon);
            const distancia = calcularDistancia(latRef, lonRef, itemLat, itemLon);
            return {
                nome: item.tags.name,
                lat: itemLat,
                lon: itemLon,
                distancia: distancia
            };
        });

        locais.sort((a, b) => a.distancia - b.distancia);
        localStorage.setItem('resultados', JSON.stringify(locais));

        locais.forEach(loc => {
            const li = document.createElement('li');

            const button = document.createElement('button');
            button.classList.add('escolinha-button');

            const nomeDiv = document.createElement('div');
            nomeDiv.classList.add('nome-escola');
            nomeDiv.textContent = loc.nome;

            const distanciaDiv = document.createElement('div');
            distanciaDiv.classList.add('distancia-escola');
            distanciaDiv.textContent = `${(loc.distancia / 1000).toFixed(2)} km`;

            button.appendChild(nomeDiv);
            button.appendChild(distanciaDiv);

            button.addEventListener('click', async (e) => {
                e.preventDefault();
                const enderecoDiv = document.getElementById('endereco-escolinha');
                enderecoDiv.style.display = 'block';
                enderecoDiv.textContent = 'Carregando endereço...';

                try {
                    const resp = await fetch(
                        `https://us1.locationiq.com/v1/reverse.php?key=${API_KEY}&lat=${loc.lat}&lon=${loc.lon}&format=json`
                    );
                    const data = await resp.json();

                    const enderecoFormatado = limparEndereco(data.display_name);

                    enderecoDiv.textContent = `Endereço: ${enderecoFormatado}`;
                } catch (error) {
                    enderecoDiv.textContent = 'Erro ao obter o endereço.';
                }
            });

            li.appendChild(button);
            resultados.appendChild(li);
        });

    } catch (error) {
        resultados.innerHTML = `<li>Erro: ${error.message}</li>`;
    }
}

// ---------------- CONFIGURAÇÕES INICIAIS ----------------
document.addEventListener('DOMContentLoaded', () => {
    const esporte = localStorage.getItem('esporteSelecionado') || '';
    if (esporte) {
        const esporteTitulo = document.getElementById('esporte-titulo');
        if (esporteTitulo) {
            esporteTitulo.textContent = `Resultados para: ${esporte.charAt(0).toUpperCase() + esporte.slice(1)}`;
        }
    }

    const enderecoSalvo = localStorage.getItem('ultimoEndereco');
    const resultadosSalvos = localStorage.getItem('resultados');

    if (enderecoSalvo) {
        document.getElementById('endereco').value = enderecoSalvo;
    }

    if (resultadosSalvos) {
        const resultados = JSON.parse(resultadosSalvos);
        const ul = document.getElementById('resultados');

        resultados.forEach(loc => {
            const li = document.createElement('li');

            const button = document.createElement('button');
            button.classList.add('escolinha-button');

            const nomeDiv = document.createElement('div');
            nomeDiv.classList.add('nome-escola');
            nomeDiv.textContent = loc.nome;

            const distanciaDiv = document.createElement('div');
            distanciaDiv.classList.add('distancia-escola');
            distanciaDiv.textContent = `${(loc.distancia / 1000).toFixed(2)} km`;

            button.appendChild(nomeDiv);
            button.appendChild(distanciaDiv);

            button.addEventListener('click', async (e) => {
                e.preventDefault();
                const enderecoDiv = document.getElementById('endereco-escolinha');
                enderecoDiv.style.display = 'block';
                enderecoDiv.textContent = 'Carregando endereço...';

                try {
                    const resp = await fetch(
                        `https://us1.locationiq.com/v1/reverse.php?key=${API_KEY}&lat=${loc.lat}&lon=${loc.lon}&format=json`
                    );
                    const data = await resp.json();

                    const enderecoFormatado = limparEndereco(data.display_name);

                    enderecoDiv.textContent = `Endereço: ${enderecoFormatado}`;
                } catch (error) {
                    enderecoDiv.textContent = 'Erro ao obter o endereço.';
                }
            });

            li.appendChild(button);
            ul.appendChild(li);
        });
    }
});

// ---------------- INPUT ----------------
const input = document.getElementById('endereco');
const clearBtn = document.querySelector('.icon.clear');

function toggleClear() {
    if (input.value.trim() !== '') {
        clearBtn.style.display = 'block';
    } else {
        clearBtn.style.display = 'none';
    }
}

function clearInput() {
    input.value = '';
    document.getElementById('resultados').innerHTML = '';
    toggleClear();
    input.focus();
}

input.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        buscarEscolinhas();
    }
});

window.onload = toggleClear;