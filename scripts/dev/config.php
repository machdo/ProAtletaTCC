<?php
// Configuração SÓ para rodar em localhost: usa um arquivo SQLite em vez do MySQL da Hostinger.
return ['dsn' => 'sqlite:' . __DIR__ . '/proatleta-dev.sqlite'];
