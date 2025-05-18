// Define a URL base da API.
// Usada para buscar (GET), inserir (POST) e excluir (DELETE) dados via requisições HTTP.
const API_URL = "http://leoproti.com.br:8004/produtos";

// Função assíncrona responsável por buscar os dados da API (alunos) e exibi-los na tabela HTML.
async function carregarAlunos() {
  try {
    const resp = await fetch(API_URL);
    if (!resp.ok) {
      throw new Error(`Erro ao carregar alunos: HTTP ${resp.status} - ${resp.statusText}`);
    }
    const alunos = await resp.json();
    const tbody = document.getElementById("produtosBody");
    tbody.innerHTML = ""; // Limpa o conteúdo anterior da tabela

    alunos.forEach((aluno) => {
      const tr = document.createElement("tr");

      // Células de dados do aluno
      tr.innerHTML = `
        <td>${aluno.id}</td>
        <td>${aluno.nome}</td>
        <td>${aluno.Curso !== undefined && aluno.Curso !== null ? aluno.Curso : ""}</td>
        <td>${aluno.Turma !== undefined && aluno.Turma !== null ? aluno.Turma : ""}</td>
        <td>${aluno.Matricula !== undefined && aluno.Matricula !== null ? aluno.Matricula : ""}</td>
      `;

      // Célula para o botão de exclusão
      const tdAcoes = document.createElement("td");
      const btnExcluir = document.createElement("button");
      btnExcluir.textContent = "Excluir";
      btnExcluir.className = "btn btn-danger btn-sm"; // Classes Bootstrap para estilização
      btnExcluir.onclick = () => excluirAluno(aluno.id); // Chama a função excluirAluno com o ID do aluno

      tdAcoes.appendChild(btnExcluir);
      tr.appendChild(tdAcoes);

      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error("Falha ao carregar alunos:", error);
    alert(`Não foi possível carregar os alunos. ${error.message}`);
  }
}

// Função assíncrona para excluir um aluno
async function excluirAluno(id) {
  // Pede confirmação ao usuário
  const confirmacao = confirm(
    `Tem certeza que deseja excluir o aluno com ID ${id}? Esta ação não pode ser desfeita.`
  );

  if (confirmacao) {
    try {
      // Envia a requisição DELETE para a API. A URL para exclusão geralmente é API_URL/id
      const resp = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (resp.ok) {
        alert("Aluno excluído com sucesso!");
        carregarAlunos(); // Atualiza a tabela imediatamente
      } else {
        // Se a resposta não for OK, tenta ler uma mensagem de erro do corpo da resposta
        let errorMsg = `Erro ao excluir aluno (HTTP ${resp.status})`;
        try {
          const errorData = await resp.json();
          errorMsg += ` - ${errorData.message || JSON.stringify(errorData)}`;
        } catch (jsonError) {
          // Se o corpo não for JSON ou estiver vazio, usa o statusText
          const textError = await resp.text();
          errorMsg += ` - ${textError || resp.statusText || 'Nenhuma mensagem de erro adicional.'}`;
        }
        throw new Error(errorMsg);
      }
    } catch (err) {
      console.error("Erro ao excluir aluno:", err);
      alert(`Falha ao excluir o aluno: ${err.message}`);
    }
  }
}

// Adiciona um ouvinte de evento para o envio do formulário de cadastro de aluno.
document
  .getElementById("produtoForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const idInput = document.getElementById("ID").value.trim();
    const nome = document.getElementById("nome").value.trim();
    const curso = document.getElementById("Curso").value.trim();
    const turma = document.getElementById("Turma").value.trim();
    const matricula = document.getElementById("Matricula").value.trim();

    const id = parseInt(idInput);
    if (isNaN(id)) {
      alert("O campo ID deve ser um número válido.");
      return;
    }

    if (!nome || !curso || !turma || !matricula) {
      alert(
        "Todos os campos (Nome, Curso, Turma, Matrícula) devem ser preenchidos."
      );
      return;
    }

    const alunoData = {
      id: id,
      nome: nome,
      Curso: curso,
      Turma: turma,
      Matricula: matricula,
    };

    try {
      const resp = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(alunoData),
      });

      if (!resp.ok) {
        let errorMsg = `Erro HTTP: ${resp.status}`;
        try {
          const errorData = await resp.json();
          errorMsg += ` - ${errorData.message || JSON.stringify(errorData)}`;
        } catch (jsonError) {
          const textError = await resp.text();
          errorMsg += ` - ${textError || resp.statusText || 'Nenhuma mensagem de erro adicional.'}`;
        }
        throw new Error(errorMsg);
      }

      alert("Aluno inserido com sucesso!");
      this.reset();
      carregarAlunos();
    } catch (err) {
      console.error("Erro ao salvar aluno:", err);
      alert(`Erro ao salvar aluno na API: \n${err.message}`);
    }
  });

// Ao carregar o script, chama a função para exibir os alunos já cadastrados.
carregarAlunos();