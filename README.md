# Refúgio Literário

O **Refúgio Literário** é uma aplicação web desenvolvida para facilitar a rotina de uma biblioteca. A ideia do projeto é permitir o gerenciamento completo do acervo, o cadastro de leitores e o controle de empréstimos e devoluções de forma simples e direta pelo navegador.

## Tecnologias utilizadas

Para construir a aplicação, utilizamos ferramentas padrão do desenvolvimento web:

- **HTML5** e **CSS3** para a estrutura e estilização base.
- **Bootstrap 5** para agilizar o layout responsivo e os componentes visuais.
- **JavaScript** para toda a lógica do sistema e manipulação do DOM.
- **Open Library API** para buscar dados reais de livros e popular o acervo inicial.
- **localStorage** para salvar as informações diretamente no navegador, sem precisar de um banco de dados externo.

## O que o sistema faz

- **Acervo integrado:** Na primeira vez que o sistema é aberto com internet, ele busca e importa até 50 livros da Open Library automaticamente.
- **Gestão de livros:** Dá para cadastrar novos títulos, editar informações, excluir registros e controlar quantos exemplares ainda estão disponíveis na estante.
- **Busca e filtros:** Pesquisa rápida por título ou autor, além de filtros por gênero, disponibilidade e opções de ordenação.
- **Controle de leitores:** Cadastro completo com opções de edição e exclusão.
- **Empréstimos e devoluções:** Registro de novos empréstimos vinculando livro e leitor, alteração de prazos, baixa na devolução e histórico completo.
- **Resumo e relatórios:** Um painel inicial mostra os números gerais, além de um ranking dos livros mais emprestados.
- **Indicação rápida:** Uma função que escolhe um livro aleatório do acervo para quem está sem ideia do que ler.

> **Nota:** Para facilitar os testes logo de cara, o sistema já vem populado com alguns leitores e empréstimos fictícios.

## Como rodar o projeto

1. Baixe os arquivos ou clone este repositório na sua máquina.
2. Abra a pasta do projeto no **VS Code** (ou no seu editor de preferência).
3. Abra o arquivo `index.html` usando a extensão **Live Server** (ou acesse diretamente pelo link do GitHub Pages).
4. Certifique-se de estar conectado à internet para que o Bootstrap carregue corretamente e a API consiga buscar os livros iniciais.

*Dica: Como tudo fica salvo no `localStorage` do seu navegador, se você quiser zerar o sistema e voltar ao estado inicial, basta limpar os dados do site nas configurações do navegador.*

## Organização do projeto

```text
Refugio-Literario/
├── imagens/     # Imagens utilizadas na interface
├── index.html   # Estrutura principal e modais da interface
├── style.css    # Ajustes visuais personalizados
├── script.js    # Integração com API e localStorage
└── README.md    # Documentação do projeto