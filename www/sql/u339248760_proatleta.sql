-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Tempo de geração: 26/09/2025 às 19:00
-- Versão do servidor: 11.8.3-MariaDB-log
-- Versão do PHP: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `u339248760_proatleta`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `agenda_eventos`
--

CREATE TABLE `agenda_eventos` (
  `id` int(11) NOT NULL,
  `aluno_id` int(11) NOT NULL,
  `professor_id` int(11) NOT NULL,
  `titulo` varchar(32) NOT NULL,
  `descricao` text DEFAULT NULL,
  `data_evento` date NOT NULL,
  `horario_inicio` time NOT NULL,
  `horario_fim` time NOT NULL,
  `localizacao` varchar(32) NOT NULL,
  `tipo` varchar(32) NOT NULL DEFAULT 'streino',
  `status_agenda` varchar(20) NOT NULL DEFAULT 'ativo',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `aluno_professor`
--

CREATE TABLE `aluno_professor` (
  `ID` int(11) NOT NULL,
  `Aluno_ID` int(11) NOT NULL,
  `Professor_ID` int(11) NOT NULL,
  `data_vinculo` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `aluno_professor`
--

INSERT INTO `aluno_professor` (`ID`, `Aluno_ID`, `Professor_ID`, `data_vinculo`) VALUES
(44, 89, 46, '2025-09-24 19:40:38'),
(46, 81, 46, '2025-09-25 17:28:48');

-- --------------------------------------------------------

--
-- Estrutura para tabela `eventos`
--

CREATE TABLE `eventos` (
  `id` int(11) NOT NULL,
  `aluno_id` int(11) NOT NULL,
  `professor_id` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `data_hora` datetime NOT NULL,
  `local` varchar(255) DEFAULT NULL,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `eventos_prof`
--

CREATE TABLE `eventos_prof` (
  `id` int(11) NOT NULL,
  `aluno_id` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `data_evento` date NOT NULL,
  `hora_evento` time NOT NULL,
  `criado_em` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `exercicios`
--

CREATE TABLE `exercicios` (
  `id` int(11) NOT NULL,
  `treino_id` int(11) NOT NULL,
  `nome` varchar(25) NOT NULL,
  `series` int(11) DEFAULT NULL,
  `repeticoes` varchar(25) DEFAULT NULL,
  `descanso` int(11) NOT NULL DEFAULT 60,
  `observacoes` text DEFAULT NULL,
  `ordem` int(11) NOT NULL DEFAULT 1,
  `concluido` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `exercicios`
--

INSERT INTO `exercicios` (`id`, `treino_id`, `nome`, `series`, `repeticoes`, `descanso`, `observacoes`, `ordem`, `concluido`) VALUES
(16, 16, 'Supino reto', 3, '10', 60, 'Manter postura reta', 1, 0),
(19, 19, 'Supino', 3, '12', 60, '', 1, 0);

-- --------------------------------------------------------

--
-- Estrutura para tabela `historico_treinos`
--

CREATE TABLE `historico_treinos` (
  `id` int(11) NOT NULL,
  `treino_id` int(11) NOT NULL,
  `aluno_id` int(11) NOT NULL,
  `data_execucao` datetime NOT NULL DEFAULT current_timestamp(),
  `tempo_total` int(11) DEFAULT NULL COMMENT 'Tempo em minutos',
  `observacoes_aluno` text DEFAULT NULL,
  `completo` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `solicitacoes_professor`
--

CREATE TABLE `solicitacoes_professor` (
  `ID` int(11) NOT NULL,
  `ID_aluno` int(11) NOT NULL,
  `ID_professor` int(11) NOT NULL,
  `status` enum('pendente','aceito','recusado') NOT NULL DEFAULT 'pendente',
  `data_solicitacao` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `treinos`
--

CREATE TABLE `treinos` (
  `id` int(11) NOT NULL,
  `professor_id` int(11) NOT NULL,
  `aluno_id` int(11) NOT NULL,
  `nome_treino` varchar(20) NOT NULL,
  `tipo_treino` varchar(30) DEFAULT NULL,
  `data_treino` date DEFAULT NULL,
  `observacoes` text DEFAULT NULL,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `ativo` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `treinos`
--

INSERT INTO `treinos` (`id`, `professor_id`, `aluno_id`, `nome_treino`, `tipo_treino`, `data_treino`, `observacoes`, `criado_em`, `atualizado_em`, `ativo`) VALUES
(16, 46, 81, 'Treino A', 'musculacao', '2025-09-24', 'Treino de musculação ', '2025-09-24 19:34:13', '2025-09-24 19:34:13', 1),
(19, 46, 89, 'Biceps', 'musculacao', '2025-09-25', '', '2025-09-24 22:43:23', '2025-09-24 22:43:23', 1);

-- --------------------------------------------------------

--
-- Estrutura para tabela `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nome` varchar(60) NOT NULL,
  `email` varchar(60) NOT NULL,
  `senha` varchar(30) NOT NULL,
  `verificado` tinyint(1) DEFAULT NULL,
  `token_verificado` varchar(255) DEFAULT NULL,
  `foto` varchar(255) DEFAULT 'https://proatleta.site/uploads/user.jpg',
  `categoria` varchar(5) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `usuarios`
--

INSERT INTO `usuarios` (`id`, `nome`, `email`, `senha`, `verificado`, `token_verificado`, `foto`, `categoria`) VALUES
(46, 'Professor', '1@1', '1', 1, 'f598cb9a94a7a982fc0d2ac8da7c9eb8', 'https://proatleta.site/uploads/foto2_68d448e16622e.jpg', 'prof'),
(81, 'Aluno', '2@2', '2', 1, NULL, 'https://proatleta.site/uploads/foto_68d3e30126177.png', 'aluno'),
(89, 'Vitor', 'vitor.machado.raimundo@gmail.com', 'Vitor1', 1, 'bc8b8a4f99887b89f3dae89c22e8c32a', 'https://proatleta.site/uploads/foto_68d44e5f0297e.jpg', 'aluno'),
(98, 'Vinicius Alves Barrero', 'vinicius.barrero07@gmail.com', 'Vini25', 1, '9d6164314ba5820567be0b118e5efb17', 'https://proatleta.site/uploads/foto2_68d496064ebd4.png', 'prof'),
(111, 'Teste', 'mr.vitor5505@gmail.com', 'Teste1', 1, 'e8c07b18462e127a4626946bac994146', 'https://proatleta.site/uploads/foto_68d6cc3190046.jpg', 'aluno');

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `agenda_eventos`
--
ALTER TABLE `agenda_eventos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_aluno_id` (`aluno_id`),
  ADD KEY `idx_professor_id` (`professor_id`),
  ADD KEY `idx_data_evento` (`data_evento`),
  ADD KEY `idx_status` (`status_agenda`);

--
-- Índices de tabela `aluno_professor`
--
ALTER TABLE `aluno_professor`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `fk_aluno_professor_aluno` (`Aluno_ID`),
  ADD KEY `fk_aluno_professor_professor` (`Professor_ID`);

--
-- Índices de tabela `eventos`
--
ALTER TABLE `eventos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `aluno_id` (`aluno_id`),
  ADD KEY `professor_id` (`professor_id`);

--
-- Índices de tabela `eventos_prof`
--
ALTER TABLE `eventos_prof`
  ADD PRIMARY KEY (`id`),
  ADD KEY `aluno_id` (`aluno_id`);

--
-- Índices de tabela `exercicios`
--
ALTER TABLE `exercicios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_treino` (`treino_id`),
  ADD KEY `idx_ordem` (`ordem`),
  ADD KEY `idx_treino_ordem` (`treino_id`,`ordem`);

--
-- Índices de tabela `historico_treinos`
--
ALTER TABLE `historico_treinos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_treino_hist` (`treino_id`),
  ADD KEY `idx_aluno_hist` (`aluno_id`),
  ADD KEY `idx_data_exec` (`data_execucao`);

--
-- Índices de tabela `solicitacoes_professor`
--
ALTER TABLE `solicitacoes_professor`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `fk_solicitacoes_professor_aluno` (`ID_aluno`),
  ADD KEY `fk_solicitacoes_professor_professor` (`ID_professor`);

--
-- Índices de tabela `treinos`
--
ALTER TABLE `treinos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_professor` (`professor_id`),
  ADD KEY `idx_aluno` (`aluno_id`),
  ADD KEY `idx_data` (`data_treino`),
  ADD KEY `idx_professor_aluno` (`professor_id`,`aluno_id`);

--
-- Índices de tabela `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email_unique` (`email`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `agenda_eventos`
--
ALTER TABLE `agenda_eventos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `aluno_professor`
--
ALTER TABLE `aluno_professor`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT de tabela `eventos`
--
ALTER TABLE `eventos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `eventos_prof`
--
ALTER TABLE `eventos_prof`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `exercicios`
--
ALTER TABLE `exercicios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT de tabela `historico_treinos`
--
ALTER TABLE `historico_treinos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `solicitacoes_professor`
--
ALTER TABLE `solicitacoes_professor`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=93;

--
-- AUTO_INCREMENT de tabela `treinos`
--
ALTER TABLE `treinos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT de tabela `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=112;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `agenda_eventos`
--
ALTER TABLE `agenda_eventos`
  ADD CONSTRAINT `agenda_eventos_ibfk_1` FOREIGN KEY (`aluno_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `agenda_eventos_ibfk_2` FOREIGN KEY (`professor_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `aluno_professor`
--
ALTER TABLE `aluno_professor`
  ADD CONSTRAINT `fk_aluno_professor_aluno` FOREIGN KEY (`Aluno_ID`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_aluno_professor_professor` FOREIGN KEY (`Professor_ID`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `eventos_prof`
--
ALTER TABLE `eventos_prof`
  ADD CONSTRAINT `eventos_prof_ibfk_1` FOREIGN KEY (`aluno_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `exercicios`
--
ALTER TABLE `exercicios`
  ADD CONSTRAINT `fk_exercicio_treino` FOREIGN KEY (`treino_id`) REFERENCES `treinos` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `historico_treinos`
--
ALTER TABLE `historico_treinos`
  ADD CONSTRAINT `fk_hist_aluno` FOREIGN KEY (`aluno_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_hist_treino` FOREIGN KEY (`treino_id`) REFERENCES `treinos` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `solicitacoes_professor`
--
ALTER TABLE `solicitacoes_professor`
  ADD CONSTRAINT `fk_solicitacoes_professor_aluno` FOREIGN KEY (`ID_aluno`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_solicitacoes_professor_professor` FOREIGN KEY (`ID_professor`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `treinos`
--
ALTER TABLE `treinos`
  ADD CONSTRAINT `fK_treino_aluno` FOREIGN KEY (`aluno_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_treino_professor` FOREIGN KEY (`professor_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

-- Modificar a tabela exercicios para suportar arquivos de vídeo
ALTER TABLE `exercicios` ADD COLUMN `video_arquivo` VARCHAR(500) DEFAULT NULL AFTER `observacoes`;

-- Adicionar coluna para timestamp de conclusão dos exercícios
ALTER TABLE `exercicios` ADD COLUMN `concluido_em` TIMESTAMP NULL DEFAULT NULL AFTER `concluido`;
