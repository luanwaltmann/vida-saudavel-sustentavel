/* =========================================================
   ACESSIBILIDADE — Vida Saudável
   Painel com: tamanho da fonte, contraste, modo escuro,
   escala de cinza, fonte legível, espaçamento, destaque de
   links e leitura em voz alta (pt-BR).
   Nada aqui depende de bibliotecas externas.
   ========================================================= */
(function () {
  'use strict';

  var CHAVE = 'vidaSaudavelA11y';
  var raiz = document.documentElement;

  var TAM_MIN = 100, TAM_MAX = 200, TAM_PASSO = 10;

  var padrao = {
    tamanho: 100,
    contraste: false,
    escuro: false,
    cinza: false,
    fonte: false,
    espacamento: false,
    links: false
  };

  var estado = carregar();

  /* ---------- Armazenamento (com proteção caso esteja bloqueado) ---------- */
  function carregar() {
    var salvo = {};
    try { salvo = JSON.parse(localStorage.getItem(CHAVE)) || {}; } catch (e) {}
    var e = {};
    for (var k in padrao) e[k] = (k in salvo) ? salvo[k] : padrao[k];
    return e;
  }
  function salvar() {
    try { localStorage.setItem(CHAVE, JSON.stringify(estado)); } catch (e) {}
  }

  /* ---------- Aplicar ajustes na página ---------- */
  function aplicar() {
    raiz.style.fontSize = estado.tamanho + '%';
    raiz.classList.toggle('a11y-contraste', estado.contraste);
    raiz.classList.toggle('a11y-escuro', estado.escuro);
    raiz.classList.toggle('a11y-cinza', estado.cinza);
    raiz.classList.toggle('a11y-fonte', estado.fonte);
    raiz.classList.toggle('a11y-espacamento', estado.espacamento);
    raiz.classList.toggle('a11y-links', estado.links);
    atualizarBotoes();
  }

  // Aplica já na carga para evitar "piscada" de tema
  aplicar();

  /* ---------- Montagem do painel ---------- */
  var botaoAbrir, painel, live, nivelTxt, botaoPausa, botoesToggle = {};

  function el(tag, attrs, texto) {
    var n = document.createElement(tag);
    for (var a in (attrs || {})) n.setAttribute(a, attrs[a]);
    if (texto) n.textContent = texto;
    return n;
  }

  function criarToggle(chave, rotulo, pai, largo) {
    var b = el('button', { type: 'button', 'aria-pressed': 'false' }, rotulo);
    if (largo) b.className = 'a11y-largo';
    b.addEventListener('click', function () {
      estado[chave] = !estado[chave];
      // Contraste e modo escuro não fazem sentido juntos
      if (chave === 'contraste' && estado.contraste) estado.escuro = false;
      if (chave === 'escuro' && estado.escuro) estado.contraste = false;
      aplicar(); salvar();
      anunciar(rotulo + (estado[chave] ? ' ativado' : ' desativado'));
    });
    botoesToggle[chave] = b;
    pai.appendChild(b);
    return b;
  }

  function atualizarBotoes() {
    for (var k in botoesToggle) botoesToggle[k].setAttribute('aria-pressed', String(!!estado[k]));
    if (nivelTxt) nivelTxt.textContent = 'Fonte: ' + estado.tamanho + '%';
  }

  function anunciar(msg) {
    if (!live) return;
    live.textContent = '';
    setTimeout(function () { live.textContent = msg; }, 50);
  }

  function montar() {
    live = el('div', { 'class': 'a11y-live', role: 'status', 'aria-live': 'polite' });

    botaoAbrir = el('button', {
      type: 'button', 'class': 'a11y-botao', id: 'a11y-abrir',
      'aria-expanded': 'false', 'aria-controls': 'a11y-painel',
      'aria-label': 'Abrir painel de acessibilidade'
    });
    botaoAbrir.appendChild(el('span', { 'aria-hidden': 'true' }, '♿'));
    botaoAbrir.appendChild(el('span', { 'class': 'a11y-rotulo' }, 'Acessibilidade'));

    painel = el('div', {
      id: 'a11y-painel', 'class': 'a11y-painel', role: 'dialog',
      'aria-labelledby': 'a11y-titulo', hidden: ''
    });
    painel.appendChild(el('h2', { id: 'a11y-titulo' }, 'Painel de acessibilidade'));
    painel.appendChild(el('p', { 'class': 'a11y-dica' }, 'Suas escolhas ficam salvas neste navegador.'));

    /* Tamanho da fonte */
    painel.appendChild(el('h3', {}, 'Tamanho do texto'));
    var g1 = el('div', { 'class': 'a11y-grade' });
    var menos = el('button', { type: 'button', 'aria-label': 'Diminuir tamanho do texto' }, 'A−');
    var mais = el('button', { type: 'button', 'aria-label': 'Aumentar tamanho do texto' }, 'A+');
    nivelTxt = el('div', { 'class': 'a11y-nivel a11y-largo' });
    menos.addEventListener('click', function () { mudarTamanho(-TAM_PASSO); });
    mais.addEventListener('click', function () { mudarTamanho(TAM_PASSO); });
    g1.appendChild(menos); g1.appendChild(mais); g1.appendChild(nivelTxt);
    painel.appendChild(g1);

    /* Cores e leitura */
    painel.appendChild(el('h3', {}, 'Cores e visual'));
    var g2 = el('div', { 'class': 'a11y-grade' });
    criarToggle('contraste', 'Alto contraste', g2);
    criarToggle('escuro', 'Modo escuro', g2);
    criarToggle('cinza', 'Escala de cinza', g2);
    criarToggle('links', 'Destacar links', g2);
    painel.appendChild(g2);

    painel.appendChild(el('h3', {}, 'Leitura do texto'));
    var g3 = el('div', { 'class': 'a11y-grade' });
    criarToggle('fonte', 'Fonte legível', g3);
    criarToggle('espacamento', 'Espaçamento maior', g3);
    painel.appendChild(g3);

    /* Voz */
    painel.appendChild(el('h3', {}, 'Leitura em voz alta'));
    var g4 = el('div', { 'class': 'a11y-grade' });
    if ('speechSynthesis' in window && 'SpeechSynthesisUtterance' in window) {
      var bPagina = el('button', { type: 'button', 'class': 'a11y-largo' }, '🔊 Ler a página inteira');
      var bSel = el('button', { type: 'button' }, 'Ler seleção');
      var bPausa = el('button', { type: 'button', 'aria-pressed': 'false' }, 'Pausar');
      botaoPausa = bPausa;
      var bParar = el('button', { type: 'button', 'class': 'a11y-largo' }, '⏹ Parar leitura');
      bPagina.addEventListener('click', lerPagina);
      bSel.addEventListener('click', lerSelecao);
      bPausa.addEventListener('click', function () { alternarPausa(bPausa); });
      bParar.addEventListener('click', function () { pararLeitura(true); });
      g4.appendChild(bPagina); g4.appendChild(bSel); g4.appendChild(bPausa); g4.appendChild(bParar);
    } else {
      g4.appendChild(el('p', { 'class': 'a11y-dica a11y-largo' },
        'Seu navegador não oferece leitura em voz alta. Use o leitor de tela do seu aparelho.'));
    }
    painel.appendChild(g4);

    /* Rodapé do painel */
    var g5 = el('div', { 'class': 'a11y-grade', style: 'margin-top:16px' });
    var reset = el('button', { type: 'button', 'class': 'a11y-reset' }, 'Restaurar padrão');
    var fechar = el('button', { type: 'button', 'class': 'a11y-fechar' }, 'Fechar');
    reset.addEventListener('click', function () {
      for (var k in padrao) estado[k] = padrao[k];
      pararLeitura(false);
      aplicar(); salvar();
      anunciar('Configurações restauradas ao padrão');
    });
    fechar.addEventListener('click', function () { alternarPainel(false); });
    g5.appendChild(reset); g5.appendChild(fechar);
    painel.appendChild(g5);

    painel.appendChild(el('p', { 'class': 'a11y-atalhos' },
      'Atalhos: Alt+A abre/fecha este painel · Alt+L lê a página · Alt+S para a leitura · Esc fecha o painel.'));

    botaoAbrir.addEventListener('click', function () {
      alternarPainel(painel.hasAttribute('hidden'));
    });

    document.body.appendChild(live);
    document.body.appendChild(painel);
    document.body.appendChild(botaoAbrir);
    atualizarBotoes();
  }

  function alternarPainel(abrir) {
    if (abrir) {
      painel.removeAttribute('hidden');
      botaoAbrir.setAttribute('aria-expanded', 'true');
      botaoAbrir.setAttribute('aria-label', 'Fechar painel de acessibilidade');
      var primeiro = painel.querySelector('button');
      if (primeiro) primeiro.focus();
    } else {
      painel.setAttribute('hidden', '');
      botaoAbrir.setAttribute('aria-expanded', 'false');
      botaoAbrir.setAttribute('aria-label', 'Abrir painel de acessibilidade');
      botaoAbrir.focus();
    }
  }

  function mudarTamanho(delta) {
    var novo = Math.max(TAM_MIN, Math.min(TAM_MAX, estado.tamanho + delta));
    if (novo === estado.tamanho) {
      anunciar(delta > 0 ? 'Tamanho máximo atingido' : 'Tamanho mínimo atingido');
      return;
    }
    estado.tamanho = novo;
    aplicar(); salvar();
    anunciar('Tamanho do texto: ' + novo + ' por cento');
  }

  /* ---------- Leitura em voz alta (Web Speech API) ---------- */
  var fila = [], lendo = false, vozPt = null, destaqueAtual = null;

  function escolherVoz() {
    if (!('speechSynthesis' in window)) return;
    var vozes = speechSynthesis.getVoices();
    vozPt = null;
    for (var i = 0; i < vozes.length; i++) {
      if (/^pt[-_]BR/i.test(vozes[i].lang)) { vozPt = vozes[i]; break; }
    }
    if (!vozPt) {
      for (var j = 0; j < vozes.length; j++) {
        if (/^pt/i.test(vozes[j].lang)) { vozPt = vozes[j]; break; }
      }
    }
  }
  if ('speechSynthesis' in window) {
    escolherVoz();
    speechSynthesis.addEventListener('voiceschanged', escolherVoz);
  }

  function limparDestaque() {
    if (destaqueAtual) { destaqueAtual.classList.remove('a11y-lendo'); destaqueAtual = null; }
  }

  function falar(texto, elemento, aoTerminar) {
    var u = new SpeechSynthesisUtterance(texto);
    u.lang = 'pt-BR';
    if (vozPt) u.voice = vozPt;
    u.rate = 1;
    u.onstart = function () {
      limparDestaque();
      if (elemento) {
        destaqueAtual = elemento;
        elemento.classList.add('a11y-lendo');
        elemento.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    };
    u.onend = function () { aoTerminar(); };
    u.onerror = function () { aoTerminar(); };
    speechSynthesis.speak(u);
  }

  function lerFila() {
    if (!lendo) return;
    if (!fila.length) { pararLeitura(false); return; }
    var item = fila.shift();
    falar(item.texto, item.el, lerFila);
  }

  function lerPagina() {
    pararLeitura(false);
    // Lê o cabeçalho, o menu e o conteúdo principal, bloco por bloco
    var blocos = document.querySelectorAll(
      'header h1, header p, main h2, main h3, main p, main li, main label, footer p');
    fila = [];
    for (var i = 0; i < blocos.length; i++) {
      var t = blocos[i].textContent.replace(/\s+/g, ' ').trim();
      // Ignora emojis soltos no início para a voz não falar o nome deles
      t = t.replace(/^[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B06}\uFE0F\s]+/u, '');
      if (t) fila.push({ texto: t, el: blocos[i] });
    }
    lendo = true;
    anunciar('Iniciando leitura da página');
    lerFila();
  }

  function lerSelecao() {
    var sel = window.getSelection ? String(window.getSelection()).trim() : '';
    if (!sel) {
      anunciar('Nenhum texto selecionado. Selecione um trecho e tente de novo.');
      return;
    }
    pararLeitura(false);
    lendo = true;
    // Divide em pedaços para não cortar no meio (alguns navegadores param após ~15s)
    var partes = sel.match(/[^.!?]+[.!?]*/g) || [sel];
    fila = partes.map(function (p) { return { texto: p.trim(), el: null }; })
                 .filter(function (p) { return p.texto; });
    lerFila();
  }

  function alternarPausa(botao) {
    if (!('speechSynthesis' in window)) return;
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause();
      botao.setAttribute('aria-pressed', 'true');
      botao.textContent = 'Continuar';
    } else if (speechSynthesis.paused) {
      speechSynthesis.resume();
      botao.setAttribute('aria-pressed', 'false');
      botao.textContent = 'Pausar';
    }
  }

  function pararLeitura(avisar) {
    if (!('speechSynthesis' in window)) return;
    lendo = false;
    fila = [];
    speechSynthesis.cancel();
    limparDestaque();
    if (botaoPausa) { botaoPausa.setAttribute('aria-pressed', 'false'); botaoPausa.textContent = 'Pausar'; }
    if (avisar) anunciar('Leitura interrompida');
  }

  window.addEventListener('beforeunload', function () {
    if ('speechSynthesis' in window) speechSynthesis.cancel();
  });

  /* ---------- Teclado ---------- */
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && painel && !painel.hasAttribute('hidden')) {
      alternarPainel(false);
      return;
    }
    if (!ev.altKey || ev.ctrlKey || ev.metaKey) return;
    var k = ev.key.toLowerCase();
    if (k === 'a') { ev.preventDefault(); alternarPainel(painel.hasAttribute('hidden')); }
    else if (k === 'l' && 'speechSynthesis' in window) { ev.preventDefault(); lerPagina(); }
    else if (k === 's' && 'speechSynthesis' in window) { ev.preventDefault(); pararLeitura(true); }
  });

  /* ---------- Links internos movem o foco para o destino ---------- */
  // Sem isso, leitores de tela às vezes continuam lendo de onde estavam.
  document.addEventListener('click', function (ev) {
    var a = ev.target.closest && ev.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    var alvo = id && document.getElementById(id);
    if (!alvo) return;
    if (!alvo.hasAttribute('tabindex')) alvo.setAttribute('tabindex', '-1');
    setTimeout(function () { alvo.focus({ preventScroll: false }); }, 0);
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montar);
  else montar();
})();
