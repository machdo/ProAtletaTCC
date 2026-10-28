// Servidor de desenvolvimento para ver o site e o app no navegador (sem Cordova).
// Uso: node scripts/servidor-local.mjs
//   site -> http://localhost:5500   app -> http://localhost:5501   API de peneiras (PHP) -> http://localhost:8000
// A API usa um banco SQLite local (scripts/dev). Para ter peneiras de exemplo: php scripts/dev/popular-exemplos.php
import http from 'node:http';
import { spawn } from 'node:child_process';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tipos = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.mjs': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.eot': 'application/vnd.ms-fontobject',
  '.glb': 'model/gltf-binary', '.mp4': 'video/mp4',
};

// No navegador não existe Cordova: este stub dispara o "deviceready" para o Framework7 iniciar.
const cordovaStub = `window.cordova = window.cordova || { platformId: 'browser' };
setTimeout(() => document.dispatchEvent(new Event('deviceready')), 0);`;

function servir(pasta, porta) {
  http.createServer(async (req, res) => {
    let url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (url === '/cordova.js') {
      res.writeHead(200, { 'Content-Type': 'text/javascript' });
      return res.end(cordovaStub);
    }
    if (url.endsWith('/')) url += 'index.html';
    const arquivo = path.join(pasta, url);
    if (!arquivo.startsWith(pasta)) { res.writeHead(403); return res.end(); }
    try {
      await stat(arquivo);
      res.writeHead(200, { 'Content-Type': tipos[path.extname(arquivo).toLowerCase()] || 'application/octet-stream' });
      res.end(await readFile(arquivo));
    } catch {
      res.writeHead(404); res.end('Não encontrado');
    }
  }).listen(porta, () => console.log(`${path.basename(pasta)} -> http://localhost:${porta}`));
}

servir(path.join(raiz, 'Website'), Number(process.env.PORTA_SITE || 5500));
servir(path.join(raiz, 'proatleta'), Number(process.env.PORTA_APP || 5501));

// API PHP com banco SQLite local
const api = spawn('php', ['-S', 'localhost:8000', '-t', path.join(raiz, 'api')], {
  env: { ...process.env, PROATLETA_CONFIG: path.join(raiz, 'scripts', 'dev', 'config.php') },
  stdio: 'ignore',
});
api.on('error', () => console.log('PHP não encontrado: instale o PHP 8 para rodar a API de peneiras.'));
api.on('spawn', () => console.log('api -> http://localhost:8000'));
process.on('exit', () => api.kill());
process.on('SIGINT', () => process.exit());
