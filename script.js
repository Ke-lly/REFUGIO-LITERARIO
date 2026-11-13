let livros = JSON.parse(localStorage.getItem("livros")) || [];
let leitores = JSON.parse(localStorage.getItem("leitores")) || [];
let emprestimos = JSON.parse(localStorage.getItem("emprestimos")) || [];

if (leitores.length === 0 && localStorage.getItem("leitoresExemploCriados") !== "sim") {
    leitores = [
        { id: "leitor-exemplo-1", nome: "Ana Paula Martins", email: "ana.martins@exemplo.com", telefone: "(47) 99912-3456", ativo: true },
        { id: "leitor-exemplo-2", nome: "Lucas Ferreira", email: "lucas.ferreira@exemplo.com", telefone: "(47) 99876-5432", ativo: true },
        { id: "leitor-exemplo-3", nome: "Mariana Costa", email: "mariana.costa@exemplo.com", telefone: "(47) 99771-2233", ativo: true },
        { id: "leitor-exemplo-4", nome: "Pedro Henrique Alves", email: "pedro.alves@exemplo.com", telefone: "(47) 99654-1122", ativo: true }
    ];
    localStorage.setItem("leitoresExemploCriados", "sim");
    localStorage.setItem("leitores", JSON.stringify(leitores));
}

const formularioLivro = document.querySelector("#form-livro");
const listaLivros = document.querySelector("#lista-livros");
const formularioLeitor = document.querySelector("#form-leitor");
const listaLeitores = document.querySelector("#lista-leitores");
const formularioEmprestimo = document.querySelector("#form-emprestimo");
const listaEmprestimos = document.querySelector("#lista-emprestimos");
const areaMensagens = document.querySelector("#area-mensagens");
const statusCatalogoApi = document.querySelector("#status-catalogo-api");
const botaoCarregarCatalogo = document.querySelector("#btn-carregar-catalogo");

let tipoExclusao = "";
let idExclusao = "";
let carregandoCatalogo = false;

function salvarDados() {
    localStorage.setItem("livros", JSON.stringify(livros));
    localStorage.setItem("leitores", JSON.stringify(leitores));
    localStorage.setItem("emprestimos", JSON.stringify(emprestimos));
}

function mostrarMensagem(texto, tipo = "success") {
    areaMensagens.innerHTML = `
        <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
            ${texto}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
        </div>
    `;
}

function escaparHTML(texto) {
    return String(texto ?? "").replace(/[&<>"']/g, function (caractere) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        }[caractere];
    });
}

function dataAtual() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
}

function formatarData(data) {
    if (!data) return "-";
    const partes = data.split("-");
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function calcularData(dias) {
    const data = new Date();
    data.setDate(data.getDate() + dias);

    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}

function criarEmprestimosExemplo() {
    if (localStorage.getItem("emprestimosExemploCriados") === "sim") return;

    if (emprestimos.length > 0) {
        localStorage.setItem("emprestimosExemploCriados", "sim");
        return;
    }

    if (livros.length < 5 || leitores.length < 4) return;

    const livro1 = livros[0];
    const livro2 = livros[1];
    const livro3 = livros[2];
    const livro4 = livros[3];
    const livro5 = livros[4];

    [livro1, livro2, livro5].forEach(function (livro) {
        livro.quantidade = Math.max(Number(livro.quantidade), 2);
        livro.disponiveis = Math.min(Number(livro.disponiveis), livro.quantidade - 1);
    });

    emprestimos = [
        {
            id: "emprestimo-exemplo-1",
            livroId: livro1.id,
            leitorId: leitores[0].id,
            dataEmprestimo: calcularData(-20),
            dataDevolucaoPrevista: calcularData(-6),
            dataDevolucaoReal: "",
            status: "emprestado"
        },
        {
            id: "emprestimo-exemplo-2",
            livroId: livro2.id,
            leitorId: leitores[1].id,
            dataEmprestimo: calcularData(-7),
            dataDevolucaoPrevista: calcularData(7),
            dataDevolucaoReal: "",
            status: "emprestado"
        },
        {
            id: "emprestimo-exemplo-3",
            livroId: livro3.id,
            leitorId: leitores[2].id,
            dataEmprestimo: calcularData(-35),
            dataDevolucaoPrevista: calcularData(-21),
            dataDevolucaoReal: calcularData(-22),
            status: "devolvido"
        },
        {
            id: "emprestimo-exemplo-4",
            livroId: livro4.id,
            leitorId: leitores[3].id,
            dataEmprestimo: calcularData(-24),
            dataDevolucaoPrevista: calcularData(-10),
            dataDevolucaoReal: calcularData(-11),
            status: "devolvido"
        },
        {
            id: "emprestimo-exemplo-5",
            livroId: livro5.id,
            leitorId: leitores[0].id,
            dataEmprestimo: calcularData(-3),
            dataDevolucaoPrevista: calcularData(11),
            dataDevolucaoReal: "",
            status: "emprestado"
        }
    ];

    localStorage.setItem("emprestimosExemploCriados", "sim");
    salvarDados();
}

function carregarAcervoInicial() {
    if (carregandoCatalogo) return;

    if (localStorage.getItem("catalogoInicialImportado") === "sim") {
        criarEmprestimosExemplo();
        statusCatalogoApi.textContent = `${livros.length} livros no acervo. Os dados estão salvos neste navegador.`;
        botaoCarregarCatalogo.hidden = true;
        listarLivros();
        listarLeitores();
        listarEmprestimos();
        atualizarTudo();
        return;
    }

    carregandoCatalogo = true;
    statusCatalogoApi.textContent = "Carregando livros da Open Library...";
    botaoCarregarCatalogo.hidden = true;

    const parametros = new URLSearchParams({
        q: "subject:fiction",
        limit: "50",
        fields: "key,title,author_name,first_publish_year,subject,isbn,cover_i"
    });

    fetch(`https://openlibrary.org/search.json?${parametros}`)
        .then(function (resposta) {
            if (!resposta.ok) {
                throw new Error("Não foi possível consultar a Open Library.");
            }
            return resposta.json();
        })
        .then(function (dados) {
            const resultados = dados.docs || [];
            let quantidadeAdicionada = 0;

            resultados.forEach(function (livroApi, indice) {
                const jaExiste = livros.find(function (livro) {
                    return livro.obraKey && livro.obraKey === livroApi.key;
                });

                if (!livroApi.key || jaExiste) return;

                livros.push({
                    id: String(Date.now() + indice),
                    obraKey: livroApi.key,
                    titulo: livroApi.title || "Título não informado",
                    autor: livroApi.author_name ? livroApi.author_name.join(", ") : "Autor não informado",
                    ano: livroApi.first_publish_year || "",
                    assunto: livroApi.subject ? livroApi.subject[0] : "Ficção",
                    isbn: livroApi.isbn ? livroApi.isbn[0] : "",
                    quantidade: 1,
                    disponiveis: 1,
                    capa: livroApi.cover_i
                        ? `https://covers.openlibrary.org/b/id/${livroApi.cover_i}-M.jpg`
                        : ""
                });

                quantidadeAdicionada++;
            });

            criarEmprestimosExemplo();
            salvarDados();
            localStorage.setItem("catalogoInicialImportado", "sim");
            statusCatalogoApi.textContent = `${livros.length} livros estão no acervo. Os dados foram carregados da Open Library e salvos neste navegador.`;
            botaoCarregarCatalogo.hidden = true;
            listarLivros();
            listarLeitores();
            listarEmprestimos();
            atualizarTudo();
        })
        .catch(function (erro) {
            statusCatalogoApi.textContent = "Não foi possível carregar os livros. Verifique sua conexão e tente novamente.";
            botaoCarregarCatalogo.hidden = false;
            mostrarMensagem(erro.message, "danger");
        })
        .finally(function () {
            carregandoCatalogo = false;
        });
}

function cadastrarLivro(evento) {
    evento.preventDefault();

    const id = document.querySelector("#livro-id").value;
    const titulo = document.querySelector("#titulo").value.trim();
    const autor = document.querySelector("#autor").value.trim();
    const ano = document.querySelector("#ano").value;
    const assunto = document.querySelector("#assunto").value.trim();
    const isbn = document.querySelector("#isbn").value.trim();
    const quantidade = Number(document.querySelector("#quantidade").value);
    const obraKey = document.querySelector("#livro-obra-key").value;
    const capa = document.querySelector("#livro-capa").value;

    if (quantidade < 1) {
        mostrarMensagem("Informe pelo menos um exemplar.", "warning");
        return;
    }

    if (obraKey) {
        const repetido = livros.find(function (livro) {
            return livro.obraKey === obraKey && livro.id !== id;
        });

        if (repetido) {
            mostrarMensagem("Este livro já está cadastrado no acervo.", "warning");
            return;
        }
    }

    if (id) {
        const livro = livros.find(function (item) {
            return item.id === id;
        });

        if (livro) {
            const emprestados = livro.quantidade - livro.disponiveis;

            if (quantidade < emprestados) {
                mostrarMensagem("A quantidade não pode ser menor que os exemplares emprestados.", "warning");
                return;
            }

            livro.titulo = titulo;
            livro.autor = autor;
            livro.ano = ano;
            livro.assunto = assunto;
            livro.isbn = isbn;
            livro.quantidade = quantidade;
            livro.disponiveis = quantidade - emprestados;
            livro.obraKey = obraKey;
            livro.capa = capa;
        }

        mostrarMensagem("Livro atualizado com sucesso.");
    } else {
        livros.push({
            id: String(Date.now()),
            obraKey: obraKey,
            titulo: titulo,
            autor: autor,
            ano: ano,
            assunto: assunto,
            isbn: isbn,
            quantidade: quantidade,
            disponiveis: quantidade,
            capa: capa
        });

        mostrarMensagem("Livro cadastrado com sucesso.");
    }

    salvarDados();
    formularioLivro.reset();
    document.querySelector("#livro-id").value = "";
    document.querySelector("#livro-obra-key").value = "";
    document.querySelector("#livro-capa").value = "";
    document.querySelector("#botao-salvar-livro").textContent = "Cadastrar livro";
    document.querySelector("#cancelar-edicao-livro").hidden = true;
    listarLivros();
    atualizarTudo();
}

function atualizarFiltroAssunto() {
    const campoAssunto = document.querySelector("#filtro-assunto");
    const assuntoSelecionado = campoAssunto.value;
    const assuntos = [];

    livros.forEach(function (livro) {
        if (livro.assunto && !assuntos.includes(livro.assunto)) {
            assuntos.push(livro.assunto);
        }
    });

    assuntos.sort();
    campoAssunto.innerHTML = '<option value="">Todos os assuntos</option>';

    assuntos.forEach(function (assunto) {
        campoAssunto.innerHTML += `<option value="${escaparHTML(assunto)}">${escaparHTML(assunto)}</option>`;
    });

    campoAssunto.value = assuntos.includes(assuntoSelecionado) ? assuntoSelecionado : "";
}

function listarLivros() {
    atualizarFiltroAssunto();

    const filtro = document.querySelector("#filtro-livros").value.toLowerCase();
    const disponibilidade = document.querySelector("#filtro-disponibilidade").value;
    const assuntoSelecionado = document.querySelector("#filtro-assunto").value;
    const ordenacao = document.querySelector("#ordenacao-livros").value;

    let livrosFiltrados = livros.filter(function (livro) {
        const corresponde = livro.titulo.toLowerCase().includes(filtro) || livro.autor.toLowerCase().includes(filtro);
        const disponivel = livro.disponiveis > 0;

        if (disponibilidade === "disponivel" && !disponivel) return false;
        if (disponibilidade === "indisponivel" && disponivel) return false;
        if (assuntoSelecionado && livro.assunto !== assuntoSelecionado) return false;

        return corresponde;
    });

    livrosFiltrados.sort(function (a, b) {
        if (ordenacao === "autor") return a.autor.localeCompare(b.autor);
        if (ordenacao === "ano") return Number(b.ano || 0) - Number(a.ano || 0);
        return a.titulo.localeCompare(b.titulo);
    });

    listaLivros.innerHTML = "";

    livrosFiltrados.forEach(function (livro) {
        const coluna = document.createElement("div");
        coluna.className = "col-12 col-sm-6 col-lg-4 col-xl-3";

        const capa = livro.capa
            ? `<img src="${escaparHTML(livro.capa)}" class="livro-capa" alt="Capa de ${escaparHTML(livro.titulo)}" loading="lazy">`
            : `<div class="livro-capa capa-sem-imagem">📚<span>Capa indisponível</span></div>`;

        const situacao = livro.disponiveis > 0
            ? `<span class="badge livro-disponivel">Disponível</span>`
            : `<span class="badge livro-indisponivel">Indisponível</span>`;

        coluna.innerHTML = `
            <div class="card livro-card h-100">
                <div class="livro-capa-area">
                    ${capa}
                </div>
                <div class="card-body d-flex flex-column">
                    <div class="mb-2">${situacao}</div>
                    <h4 class="livro-titulo">${escaparHTML(livro.titulo)}</h4>
                    <p class="livro-autor">${escaparHTML(livro.autor)}</p>
                    <div class="livro-detalhes">
                        <span>${escaparHTML(livro.ano || "Ano não informado")}</span>
                        <span>${escaparHTML(livro.assunto || "Sem gênero")}</span>
                    </div>
                    <p class="livro-exemplares">${livro.disponiveis} de ${livro.quantidade} exemplar(es) disponível(is)</p>
                    <div class="acoes mt-auto">
                        <button class="btn btn-sm botao-editar" data-acao="editar-livro" data-id="${livro.id}">Editar</button>
                        <button class="btn btn-sm botao-excluir" data-acao="excluir-livro" data-id="${livro.id}">Excluir</button>
                    </div>
                </div>
            </div>
        `;

        const imagem = coluna.querySelector("img");
        if (imagem) {
            imagem.addEventListener("error", function () {
                imagem.outerHTML = '<div class="livro-capa capa-sem-imagem">📚<span>Capa indisponível</span></div>';
            });
        }

        listaLivros.appendChild(coluna);
    });

    document.querySelector("#mensagem-livros-vazios").hidden = livrosFiltrados.length > 0;
}

function editarLivro(id) {
    const livro = livros.find(function (item) {
        return item.id === id;
    });

    if (!livro) return;

    document.querySelector("#livro-id").value = livro.id;
    document.querySelector("#titulo").value = livro.titulo;
    document.querySelector("#autor").value = livro.autor;
    document.querySelector("#ano").value = livro.ano;
    document.querySelector("#assunto").value = livro.assunto;
    document.querySelector("#isbn").value = livro.isbn;
    document.querySelector("#quantidade").value = livro.quantidade;
    document.querySelector("#livro-obra-key").value = livro.obraKey || "";
    document.querySelector("#livro-capa").value = livro.capa || "";
    document.querySelector("#botao-salvar-livro").textContent = "Salvar alterações";
    document.querySelector("#cancelar-edicao-livro").hidden = false;
    formularioLivro.scrollIntoView({ behavior: "smooth" });
}

function cancelarEdicaoLivro() {
    formularioLivro.reset();
    document.querySelector("#livro-id").value = "";
    document.querySelector("#livro-obra-key").value = "";
    document.querySelector("#livro-capa").value = "";
    document.querySelector("#botao-salvar-livro").textContent = "Cadastrar livro";
    document.querySelector("#cancelar-edicao-livro").hidden = true;
}

function cadastrarLeitor(evento) {
    evento.preventDefault();

    const id = document.querySelector("#leitor-id").value;
    const nome = document.querySelector("#nome-leitor").value.trim();
    const email = document.querySelector("#email-leitor").value.trim();
    const telefone = document.querySelector("#telefone-leitor").value.trim();

    const emailExiste = leitores.find(function (leitor) {
        return leitor.email.toLowerCase() === email.toLowerCase() && leitor.id !== id;
    });

    if (emailExiste) {
        mostrarMensagem("Já existe um leitor cadastrado com esse e-mail.", "warning");
        return;
    }

    if (id) {
        const leitor = leitores.find(function (item) {
            return item.id === id;
        });

        if (leitor) {
            leitor.nome = nome;
            leitor.email = email;
            leitor.telefone = telefone;
        }
        mostrarMensagem("Leitor atualizado com sucesso.");
    } else {
        leitores.push({
            id: String(Date.now()),
            nome: nome,
            email: email,
            telefone: telefone,
            ativo: true
        });
        mostrarMensagem("Leitor cadastrado com sucesso.");
    }

    salvarDados();
    cancelarEdicaoLeitor();
    listarLeitores();
    atualizarTudo();
}

function listarLeitores() {
    const filtro = document.querySelector("#filtro-leitores").value.toLowerCase();
    const leitoresFiltrados = leitores.filter(function (leitor) {
        return leitor.nome.toLowerCase().includes(filtro);
    });

    listaLeitores.innerHTML = "";

    leitoresFiltrados.forEach(function (leitor) {
        const linha = document.createElement("tr");
        linha.innerHTML = `
            <td>${escaparHTML(leitor.nome)}</td>
            <td>${escaparHTML(leitor.email)}</td>
            <td>${escaparHTML(leitor.telefone)}</td>
            <td>${leitor.ativo ? "Ativo" : "Inativo"}</td>
            <td class="acoes-tabela">
                <button class="btn btn-sm botao-editar" data-acao="editar-leitor" data-id="${leitor.id}">Editar</button>
                <button class="btn btn-sm btn-secondary" data-acao="status-leitor" data-id="${leitor.id}">${leitor.ativo ? "Desativar" : "Ativar"}</button>
                <button class="btn btn-sm botao-excluir" data-acao="excluir-leitor" data-id="${leitor.id}">Excluir</button>
            </td>
        `;
        listaLeitores.appendChild(linha);
    });

    document.querySelector("#mensagem-leitores-vazios").hidden = leitoresFiltrados.length > 0;
}

function editarLeitor(id) {
    const leitor = leitores.find(function (item) {
        return item.id === id;
    });

    if (!leitor) return;

    document.querySelector("#leitor-id").value = leitor.id;
    document.querySelector("#nome-leitor").value = leitor.nome;
    document.querySelector("#email-leitor").value = leitor.email;
    document.querySelector("#telefone-leitor").value = leitor.telefone;
    document.querySelector("#botao-salvar-leitor").textContent = "Salvar alterações";
    document.querySelector("#cancelar-edicao-leitor").hidden = false;
    formularioLeitor.scrollIntoView({ behavior: "smooth" });
}

function cancelarEdicaoLeitor() {
    formularioLeitor.reset();
    document.querySelector("#leitor-id").value = "";
    document.querySelector("#botao-salvar-leitor").textContent = "Cadastrar leitor";
    document.querySelector("#cancelar-edicao-leitor").hidden = true;
}

function alterarStatusLeitor(id) {
    const leitor = leitores.find(function (item) {
        return item.id === id;
    });

    if (!leitor) return;

    const emprestimoAtivo = emprestimos.find(function (emprestimo) {
        return emprestimo.leitorId === id && emprestimo.status === "emprestado";
    });

    if (leitor.ativo && emprestimoAtivo) {
        mostrarMensagem("Este leitor possui um empréstimo em andamento e não pode ser desativado.", "warning");
        return;
    }

    leitor.ativo = !leitor.ativo;
    salvarDados();
    listarLeitores();
    atualizarTudo();
    mostrarMensagem("Situação do leitor atualizada.");
}

function atualizarOpcoesEmprestimo() {
    const campoLivro = document.querySelector("#emprestimo-livro");
    const campoLeitor = document.querySelector("#emprestimo-leitor");
    const livroSelecionado = campoLivro.value;
    const leitorSelecionado = campoLeitor.value;

    campoLivro.innerHTML = '<option value="">Selecione um livro</option>';
    campoLeitor.innerHTML = '<option value="">Selecione um leitor</option>';

    livros.forEach(function (livro) {
        if (livro.disponiveis > 0) {
            campoLivro.innerHTML += `<option value="${livro.id}">${escaparHTML(livro.titulo)} (${livro.disponiveis} disponível(is))</option>`;
        }
    });

    leitores.forEach(function (leitor) {
        if (leitor.ativo) {
            campoLeitor.innerHTML += `<option value="${leitor.id}">${escaparHTML(leitor.nome)}</option>`;
        }
    });

    campoLivro.value = livroSelecionado;
    campoLeitor.value = leitorSelecionado;
}

function cadastrarEmprestimo(evento) {
    evento.preventDefault();

    const id = document.querySelector("#emprestimo-id").value;
    const livroId = document.querySelector("#emprestimo-livro").value;
    const leitorId = document.querySelector("#emprestimo-leitor").value;
    const dataEmprestimo = document.querySelector("#data-emprestimo").value;
    const dataPrevista = document.querySelector("#data-devolucao-prevista").value;

    if (dataPrevista < dataEmprestimo) {
        mostrarMensagem("A data de devolução deve ser igual ou posterior à data do empréstimo.", "warning");
        return;
    }

    if (id) {
        const emprestimo = emprestimos.find(function (item) {
            return item.id === id;
        });

        if (emprestimo) {
            emprestimo.dataDevolucaoPrevista = dataPrevista;
        }
        mostrarMensagem("Empréstimo atualizado com sucesso.");
    } else {
        const livro = livros.find(function (item) {
            return item.id === livroId;
        });
        const leitor = leitores.find(function (item) {
            return item.id === leitorId;
        });

        if (!livro || !leitor || !leitor.ativo) {
            mostrarMensagem("Selecione um livro e um leitor válidos.", "warning");
            return;
        }

        if (livro.disponiveis < 1) {
            mostrarMensagem("Não há exemplares disponíveis deste livro.", "warning");
            return;
        }

        livro.disponiveis--;

        emprestimos.push({
            id: String(Date.now()),
            livroId: livroId,
            leitorId: leitorId,
            dataEmprestimo: dataEmprestimo,
            dataDevolucaoPrevista: dataPrevista,
            dataDevolucaoReal: "",
            status: "emprestado"
        });

        mostrarMensagem("Empréstimo registrado com sucesso.");
    }

    salvarDados();
    cancelarEdicaoEmprestimo();
    listarEmprestimos();
    listarLivros();
    atualizarTudo();
}

function listarEmprestimos() {
    listaEmprestimos.innerHTML = "";

    emprestimos.forEach(function (emprestimo) {
        const livro = livros.find(function (item) {
            return item.id === emprestimo.livroId;
        });
        const leitor = leitores.find(function (item) {
            return item.id === emprestimo.leitorId;
        });

        const atrasado = emprestimo.status === "emprestado" && emprestimo.dataDevolucaoPrevista < dataAtual();
        let status = emprestimo.status === "devolvido" ? "Devolvido" : (atrasado ? "Atrasado" : "Emprestado");

        const linha = document.createElement("tr");
        linha.innerHTML = `
            <td>${escaparHTML(livro ? livro.titulo : "Livro removido")}</td>
            <td>${escaparHTML(leitor ? leitor.nome : "Leitor removido")}</td>
            <td>${formatarData(emprestimo.dataEmprestimo)}</td>
            <td>${formatarData(emprestimo.dataDevolucaoPrevista)}</td>
            <td>${status}</td>
            <td class="acoes-tabela">
                ${emprestimo.status === "emprestado" ? `<button class="btn btn-sm botao-editar" data-acao="editar-emprestimo" data-id="${emprestimo.id}">Editar</button>` : ""}
                ${emprestimo.status === "emprestado" ? `<button class="btn btn-sm btn-success" data-acao="devolver-emprestimo" data-id="${emprestimo.id}">Devolver</button>` : ""}
                <button class="btn btn-sm botao-excluir" data-acao="excluir-emprestimo" data-id="${emprestimo.id}">Excluir</button>
            </td>
        `;
        listaEmprestimos.appendChild(linha);
    });

    document.querySelector("#mensagem-emprestimos-vazios").hidden = emprestimos.length > 0;
}

function editarEmprestimo(id) {
    const emprestimo = emprestimos.find(function (item) {
        return item.id === id;
    });

    if (!emprestimo || emprestimo.status === "devolvido") return;

    atualizarOpcoesEmprestimo();
    document.querySelector("#emprestimo-id").value = emprestimo.id;
    document.querySelector("#emprestimo-livro").value = emprestimo.livroId;
    document.querySelector("#emprestimo-leitor").value = emprestimo.leitorId;
    document.querySelector("#data-emprestimo").value = emprestimo.dataEmprestimo;
    document.querySelector("#data-devolucao-prevista").value = emprestimo.dataDevolucaoPrevista;
    document.querySelector("#emprestimo-livro").disabled = true;
    document.querySelector("#emprestimo-leitor").disabled = true;
    document.querySelector("#data-emprestimo").disabled = true;
    document.querySelector("#botao-salvar-emprestimo").textContent = "Salvar alterações";
    document.querySelector("#cancelar-edicao-emprestimo").hidden = false;
    formularioEmprestimo.scrollIntoView({ behavior: "smooth" });
}

function cancelarEdicaoEmprestimo() {
    formularioEmprestimo.reset();
    document.querySelector("#emprestimo-id").value = "";
    document.querySelector("#emprestimo-livro").disabled = false;
    document.querySelector("#emprestimo-leitor").disabled = false;
    document.querySelector("#data-emprestimo").disabled = false;
    document.querySelector("#botao-salvar-emprestimo").textContent = "Registrar empréstimo";
    document.querySelector("#cancelar-edicao-emprestimo").hidden = true;
    document.querySelector("#data-emprestimo").value = dataAtual();
}

function devolverEmprestimo(id) {
    const emprestimo = emprestimos.find(function (item) {
        return item.id === id;
    });

    if (!emprestimo || emprestimo.status === "devolvido") return;

    const livro = livros.find(function (item) {
        return item.id === emprestimo.livroId;
    });

    if (livro) {
        livro.disponiveis++;
    }

    emprestimo.status = "devolvido";
    emprestimo.dataDevolucaoReal = dataAtual();

    salvarDados();
    listarEmprestimos();
    listarLivros();
    atualizarTudo();
    mostrarMensagem("Devolução registrada com sucesso.");
}

function abrirExclusao(tipo, id) {
    tipoExclusao = tipo;
    idExclusao = id;
    const modal = new bootstrap.Modal(document.querySelector("#modal-exclusao"));
    modal.show();
}

function confirmarExclusao() {
    if (tipoExclusao === "livro") {
        const emprestimoAtivo = emprestimos.find(function (item) {
            return item.livroId === idExclusao && item.status === "emprestado";
        });

        if (emprestimoAtivo) {
            mostrarMensagem("Não é possível excluir um livro que possui empréstimo em andamento.", "warning");
        } else {
            livros = livros.filter(function (item) {
                return item.id !== idExclusao;
            });
            mostrarMensagem("Livro excluído com sucesso.");
        }
    }

    if (tipoExclusao === "leitor") {
        const emprestimoAtivo = emprestimos.find(function (item) {
            return item.leitorId === idExclusao && item.status === "emprestado";
        });

        if (emprestimoAtivo) {
            mostrarMensagem("Não é possível excluir um leitor que possui empréstimo em andamento.", "warning");
        } else {
            leitores = leitores.filter(function (item) {
                return item.id !== idExclusao;
            });
            mostrarMensagem("Leitor excluído com sucesso.");
        }
    }

    if (tipoExclusao === "emprestimo") {
        const emprestimo = emprestimos.find(function (item) {
            return item.id === idExclusao;
        });

        if (emprestimo && emprestimo.status === "emprestado") {
            const livro = livros.find(function (item) {
                return item.id === emprestimo.livroId;
            });
            if (livro) livro.disponiveis++;
        }

        emprestimos = emprestimos.filter(function (item) {
            return item.id !== idExclusao;
        });
        mostrarMensagem("Registro de empréstimo excluído.");
    }

    salvarDados();
    listarLivros();
    listarLeitores();
    listarEmprestimos();
    atualizarTudo();

    const modal = bootstrap.Modal.getInstance(document.querySelector("#modal-exclusao"));
    modal.hide();
}

function sugerirLivro() {
    const areaSugestao = document.querySelector("#sugestao-livro");

    if (livros.length === 0) {
        areaSugestao.innerHTML = "<p class='text-muted'>Cadastre algum livro para receber uma sugestão.</p>";
        return;
    }

    const indice = Math.floor(Math.random() * livros.length);
    const livro = livros[indice];

    areaSugestao.innerHTML = `
        <div class="alert alert-light border mb-0">
            <strong>${escaparHTML(livro.titulo)}</strong><br>
            ${escaparHTML(livro.autor)}
        </div>
    `;
}

function atualizarRelatorios() {
    const ranking = livros.map(function (livro) {
        const total = emprestimos.filter(function (emprestimo) {
            return emprestimo.livroId === livro.id;
        }).length;

        return {
            titulo: livro.titulo,
            autor: livro.autor,
            total: total
        };
    });

    ranking.sort(function (a, b) {
        return b.total - a.total;
    });

    const rankingLivros = document.querySelector("#ranking-livros");
    rankingLivros.innerHTML = "";

    ranking.filter(function (livro) {
        return livro.total > 0;
    }).slice(0, 5).forEach(function (livro) {
        const linha = document.createElement("tr");
        linha.innerHTML = `
            <td>${escaparHTML(livro.titulo)}</td>
            <td>${escaparHTML(livro.autor)}</td>
            <td>${livro.total}</td>
        `;
        rankingLivros.appendChild(linha);
    });

    document.querySelector("#mensagem-ranking-vazio").hidden = ranking.some(function (livro) {
        return livro.total > 0;
    });

    const historico = document.querySelector("#historico-emprestimos");
    historico.innerHTML = "";

    emprestimos.forEach(function (emprestimo) {
        const livro = livros.find(function (item) {
            return item.id === emprestimo.livroId;
        });
        const leitor = leitores.find(function (item) {
            return item.id === emprestimo.leitorId;
        });
        const atrasado = emprestimo.status === "emprestado" && emprestimo.dataDevolucaoPrevista < dataAtual();
        const status = emprestimo.status === "devolvido" ? "Devolvido" : (atrasado ? "Atrasado" : "Emprestado");

        const linha = document.createElement("tr");
        linha.innerHTML = `
            <td>${escaparHTML(livro ? livro.titulo : "Livro removido")}</td>
            <td>${escaparHTML(leitor ? leitor.nome : "Leitor removido")}</td>
            <td>${formatarData(emprestimo.dataEmprestimo)}</td>
            <td>${emprestimo.dataDevolucaoReal ? formatarData(emprestimo.dataDevolucaoReal) : "-"}</td>
            <td>${status}</td>
        `;
        historico.appendChild(linha);
    });

    document.querySelector("#mensagem-historico-vazio").hidden = emprestimos.length > 0;
}

function atualizarDashboard() {
    const ativos = leitores.filter(function (leitor) {
        return leitor.ativo;
    }).length;

    const emprestimosAtivos = emprestimos.filter(function (emprestimo) {
        return emprestimo.status === "emprestado";
    });

    const atrasados = emprestimosAtivos.filter(function (emprestimo) {
        return emprestimo.dataDevolucaoPrevista < dataAtual();
    }).length;

    document.querySelector("#total-livros").textContent = livros.length;
    document.querySelector("#total-leitores").textContent = ativos;
    document.querySelector("#total-emprestimos").textContent = emprestimosAtivos.length;
    document.querySelector("#total-atrasados").textContent = atrasados;
}

function atualizarTudo() {
    atualizarOpcoesEmprestimo();
    atualizarDashboard();
    atualizarRelatorios();
}

botaoCarregarCatalogo.addEventListener("click", carregarAcervoInicial);

formularioLivro.addEventListener("submit", cadastrarLivro);
formularioLeitor.addEventListener("submit", cadastrarLeitor);
formularioEmprestimo.addEventListener("submit", cadastrarEmprestimo);

document.querySelector("#cancelar-edicao-livro").addEventListener("click", cancelarEdicaoLivro);
document.querySelector("#cancelar-edicao-leitor").addEventListener("click", cancelarEdicaoLeitor);
document.querySelector("#cancelar-edicao-emprestimo").addEventListener("click", cancelarEdicaoEmprestimo);
document.querySelector("#btn-sugerir-livro").addEventListener("click", sugerirLivro);
document.querySelector("#confirmar-exclusao").addEventListener("click", confirmarExclusao);

document.querySelector("#filtro-livros").addEventListener("input", listarLivros);
document.querySelector("#filtro-disponibilidade").addEventListener("change", listarLivros);
document.querySelector("#filtro-assunto").addEventListener("change", listarLivros);
document.querySelector("#ordenacao-livros").addEventListener("change", listarLivros);
document.querySelector("#filtro-leitores").addEventListener("input", listarLeitores);

listaLivros.addEventListener("click", function (evento) {
    const botao = evento.target.closest("button");

    if (!botao) return;

    const id = botao.dataset.id;

    if (botao.dataset.acao === "editar-livro") editarLivro(id);
    if (botao.dataset.acao === "excluir-livro") abrirExclusao("livro", id);
});

listaLeitores.addEventListener("click", function (evento) {
    const botao = evento.target;
    const id = botao.dataset.id;

    if (botao.dataset.acao === "editar-leitor") editarLeitor(id);
    if (botao.dataset.acao === "status-leitor") alterarStatusLeitor(id);
    if (botao.dataset.acao === "excluir-leitor") abrirExclusao("leitor", id);
});

listaEmprestimos.addEventListener("click", function (evento) {
    const botao = evento.target;
    const id = botao.dataset.id;

    if (botao.dataset.acao === "editar-emprestimo") editarEmprestimo(id);
    if (botao.dataset.acao === "devolver-emprestimo") devolverEmprestimo(id);
    if (botao.dataset.acao === "excluir-emprestimo") abrirExclusao("emprestimo", id);
});

document.querySelectorAll('[data-bs-toggle="tab"]').forEach(function (botao) {
    botao.addEventListener("shown.bs.tab", function () {
        atualizarTudo();

        if (botao.dataset.bsTarget === "#acervo") {
            carregarAcervoInicial();
        }
    });
});

document.querySelector("#data-emprestimo").value = dataAtual();
listarLivros();
listarLeitores();
listarEmprestimos();
atualizarTudo();
carregarAcervoInicial();
