const reduzMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function formatar(valor, casas) {
  return valor.toFixed(casas).replace(".", ",");
}

function contar(el) {
  const alvo = parseFloat(el.dataset.alvo);
  const casas = parseInt(el.dataset.casas || "0", 10);

  if (reduzMovimento) {
    el.textContent = formatar(alvo, casas);
    return;
  }

  const duracao = 1400;
  const inicio = performance.now();

  function passo(agora) {
    const progresso = Math.min((agora - inicio) / duracao, 1);
    const suave = 1 - Math.pow(1 - progresso, 3);
    el.textContent = formatar(alvo * suave, casas);
    if (progresso < 1) requestAnimationFrame(passo);
  }
  requestAnimationFrame(passo);
}

function preencherBarra(barra) {
  barra.querySelector(".trilho span").style.width = barra.dataset.valor + "%";
}

const observador = new IntersectionObserver((entradas) => {
  entradas.forEach((entrada) => {
    if (!entrada.isIntersecting) return;
    const el = entrada.target;
    if (el.classList.contains("contar")) contar(el);
    if (el.classList.contains("barra")) preencherBarra(el);
    observador.unobserve(el);
  });
}, { threshold: 0.4 });

document.querySelectorAll(".contar, .barra").forEach((el) => observador.observe(el));

const mensagens = document.querySelectorAll("#conversa .msg");

function mostrarConversa() {
  if (reduzMovimento) {
    mensagens.forEach((m) => m.classList.add("visivel"));
    return;
  }
  mensagens.forEach((m, i) => {
    setTimeout(() => m.classList.add("visivel"), 700 + i * 1300);
  });
}
mostrarConversa();

const exemplos = [
  {
    comando: "Quero transferir R$100 para o CPF 123.456.789-10",
    passos: [
      "Entendi o seu pedido",
      "Abrindo a tela de transferência",
      "Preenchendo valor e CPF",
      "Tarefa executada automaticamente"
    ]
  },
  {
    comando: "Quero marcar uma consulta com um cardiologista",
    passos: [
      "Entendi o seu pedido",
      "Procurando horários com cardiologistas",
      "Selecionando o primeiro horário livre",
      "Tarefa executada automaticamente"
    ]
  },
  {
    comando: "Quero repetir a compra do mês passado",
    passos: [
      "Entendi o seu pedido",
      "Localizando o seu último pedido",
      "Adicionando os itens ao carrinho",
      "Tarefa executada automaticamente"
    ]
  }
];

const campo = document.getElementById("comando");
const micBtn = document.getElementById("micBtn");
const form = document.getElementById("demoForm");
const listaPassos = document.getElementById("passos");
const abas = document.querySelectorAll(".aba");

let atual = 0;
let temporizadores = [];
let digitando = null;

function limpar() {
  temporizadores.forEach(clearTimeout);
  temporizadores = [];
  clearInterval(digitando);
  micBtn.classList.remove("ouvindo");
  campo.placeholder = "";
  listaPassos.querySelectorAll("li").forEach((li) => li.classList.remove("ativo"));
}

function montarPassos() {
  listaPassos.innerHTML = "";
  exemplos[atual].passos.forEach((texto, i, todos) => {
    const li = document.createElement("li");
    li.textContent = texto;
    if (i === todos.length - 1) li.classList.add("final");
    listaPassos.appendChild(li);
  });
}

function executar() {
  limpar();
  listaPassos.querySelectorAll("li").forEach((li, i) => {
    const espera = reduzMovimento ? 0 : (i + 1) * 700;
    temporizadores.push(setTimeout(() => li.classList.add("ativo"), espera));
  });
}

function escolher(i) {
  atual = i;
  limpar();
  abas.forEach((aba, j) => {
    aba.classList.toggle("ativa", i === j);
    aba.setAttribute("aria-selected", i === j ? "true" : "false");
  });
  campo.value = exemplos[i].comando;
  montarPassos();
}

abas.forEach((aba) => {
  aba.addEventListener("click", () => escolher(parseInt(aba.dataset.i, 10)));
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (campo.value.trim() === "") {
    campo.focus();
    return;
  }
  executar();
});

micBtn.addEventListener("click", () => {
  limpar();
  campo.value = "";
  micBtn.classList.add("ouvindo");
  campo.placeholder = "Ouvindo...";

  const texto = exemplos[atual].comando;
  let i = 0;
  digitando = setInterval(() => {
    campo.value = texto.slice(0, ++i);
    if (i >= texto.length) {
      clearInterval(digitando);
      micBtn.classList.remove("ouvindo");
      campo.placeholder = "";
      executar();
    }
  }, reduzMovimento ? 0 : 35);
});

escolher(0);

const flutuante = document.getElementById("flutuante");
const demo = document.getElementById("demo");

new IntersectionObserver(([entrada]) => {
  flutuante.style.display = entrada.isIntersecting ? "none" : "grid";
}, { threshold: 0.3 }).observe(demo);

const contato = document.getElementById("contatoForm");
const nome = document.getElementById("nome");
const email = document.getElementById("email");
const retorno = document.getElementById("retorno");

contato.addEventListener("submit", (e) => {
  e.preventDefault();
  const nomeOk = nome.value.trim().length > 1;
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());

  nome.classList.toggle("erro", !nomeOk);
  email.classList.toggle("erro", !emailOk);

  if (!nomeOk || !emailOk) {
    retorno.textContent = "Preencha seu nome e um e-mail válido.";
    return;
  }

  const primeiroNome = nome.value.trim().split(" ")[0];
  retorno.textContent = "Obrigado, " + primeiroNome + "! Vamos manter você por dentro do projeto.";
  contato.reset();
});
