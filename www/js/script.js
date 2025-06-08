const API_KEY = 'pk.189efc57c2334b907bc107b028bc4b36';

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
        const geoResp = await fetch(`https://us1.locationiq.com/v1/search?key=${API_KEY}&q=${encodeURIComponent(endereco)}&format=json`);
        const geoData = await geoResp.json();

        if (!geoData.length) {
            resultados.innerHTML = '<li>Endereço não encontrado.</li>';
            return;
        }

        const latRef = parseFloat(geoData[0].lat);
        const lonRef = parseFloat(geoData[0].lon);

        const overpassQuery = `
        [out:json];
        (
          node["leisure"="sports_centre"](around:3000,${latRef},${lonRef});
          way["leisure"="sports_centre"](around:3000,${latRef},${lonRef});
          relation["leisure"="sports_centre"](around:3000,${latRef},${lonRef});
          
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
            resultados.innerHTML = '<li>Nenhuma escolinha encontrada.</li>';
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
            distanciaDiv.textContent = `${loc.distancia} m`;

            button.appendChild(nomeDiv);
            button.appendChild(distanciaDiv);

            button.addEventListener('click', async (e) => {
                e.preventDefault();
                const enderecoDiv = document.getElementById('endereco-escolinha');
                enderecoDiv.style.display = 'block';
                enderecoDiv.textContent = 'Carregando endereço...';

                try {
                    const resp = await fetch(`https://us1.locationiq.com/v1/reverse.php?key=${API_KEY}&lat=${loc.lat}&lon=${loc.lon}&format=json`);
                    const data = await resp.json();

                    const enderecoFormatado =
                        `${data.address.road || ''}` +
                        (data.address.house_number ? `, ${data.address.house_number}` : '') +
                        (data.address.suburb ? `, ${data.address.suburb}` : '') +
                        (data.address.postcode ? `, ${data.address.postcode}` : '');

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

document.addEventListener('DOMContentLoaded', () => {
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
            distanciaDiv.textContent = `${loc.distancia} m`;

            button.appendChild(nomeDiv);
            button.appendChild(distanciaDiv);

            button.addEventListener('click', async (e) => {
                e.preventDefault();
                const enderecoDiv = document.getElementById('endereco-escolinha');
                enderecoDiv.style.display = 'block';
                enderecoDiv.textContent = 'Carregando endereço...';

                try {
                    const resp = await fetch(`https://us1.locationiq.com/v1/reverse.php?key=${API_KEY}&lat=${loc.lat}&lon=${loc.lon}&format=json`);
                    const data = await resp.json();

                    const enderecoFormatado = data.display_name ||
                        `${data.address.road || ''}, ${data.address.city || data.address.town || ''}, ${data.address.state || ''}`;

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
