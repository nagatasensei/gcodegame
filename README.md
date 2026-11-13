# Desafio da Ender 3

Simulador educativo de coordenadas para uma mesa de impressão 3D de 220 × 220 mm. O aluno informa uma posição, visualiza o ponto e o percurso na mesa e pode gerar um arquivo G-code.

## Funcionalidades

- Visualização da mesa com grade de 10 mm e réguas X e Y numeradas a cada 20 mm.
- Origem das coordenadas no canto inferior esquerdo; X cresce da esquerda para a direita e Y de baixo para cima.
- Entrada do nome do aluno e de coordenadas X e Y entre 0 e 220 mm, em incrementos de 0,1 mm.
- Atualização do ponto, do percurso e das coordenadas no G-code ao adicionar uma posição. Uma nova posição substitui a anterior em vez de acumular movimentos.
- Exibição e download do G-code com o nome do aluno no arquivo.

## Como executar

O projeto é estático e não requer instalação de dependências nem etapa de build. Para executá-lo com um servidor local, abra um terminal na pasta do projeto e rode:

```bash
python3 -m http.server 8000
```

Depois, acesse <http://localhost:8000>. Também é possível abrir `index.html` diretamente no navegador, mas um servidor local é recomendado.

## Como usar

1. Informe o nome do aluno.
2. Digite as coordenadas X e Y desejadas, de 0 a 220 mm.
3. Clique em **Adicionar posição** para atualizar a visualização e o G-code.
4. Clique em **Baixar G-code** para salvar o arquivo.

## Estrutura do projeto

```text
.
├── index.html             # Página e interface do simulador
├── js/
│   ├── ender3.js          # Validação, visualização e geração do G-code
│   └── senai-theme.js     # Comportamentos compartilhados do tema
├── css/
│   └── senai-theme.css    # Estilos compartilhados
└── img/
    └── Hero_Alunos.webp   # Imagem de destaque
```

O Bootstrap 5.3.3 é carregado por CDN, e o tema pode carregar a fonte Exo 2 do Google Fonts; esses recursos externos dependem de conexão com a internet.

## Atenção

O G-code inclui comandos fixos, como aquecimento do bico a 205 °C e homing dos eixos. Antes de usar o arquivo em uma impressora real, confira se os comandos, temperaturas e parâmetros são compatíveis com o equipamento e com o material utilizado.
