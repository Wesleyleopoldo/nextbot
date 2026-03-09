/* ======================================
   NexBot Client Portal — JavaScript
   ====================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ---- Defaults ----
    const DEFAULT_CLIENT_EMAIL = 'cliente@empresa.com';
    const DEFAULT_CLIENT_PASSWORD = 'cliente123';

    const KEYS = {
        auth: 'nexbot_client_auth',
        credentials: 'nexbot_client_credentials',
        config: 'nexbot_bot_config'
    };

    // Default bot config
    const DEFAULT_CONFIG = {
        botName: 'Assistente Virtual',
        botSubtitle: 'Online agora',
        avatar: '🤖',
        colorPrimary: '#6C5CE7',
        colorHeader: '#1A1A2E',
        colorBotMsg: '#2D2D3F',
        colorUserMsg: '#6C5CE7',
        borderRadius: 16,
        position: 'right',
        widgetSize: 'medium',
        welcomeMsg: 'Olá! 👋 Como posso ajudá-lo hoje?',
        offlineMsg: 'No momento estamos offline, mas deixe sua mensagem que retornaremos em breve! 😊',
        inputPlaceholder: 'Digite sua mensagem...',
        quickActions: [
            { emoji: '📋', text: 'Ver Planos' },
            { emoji: '💬', text: 'Falar com Humano' },
            { emoji: '📞', text: 'Contato' }
        ],
        faqs: [
            { question: 'Quais são os planos disponíveis?', answer: 'Temos planos Starter (R$497/mês), Professional (R$997/mês) e Enterprise (sob consulta). Cada plano tem limites diferentes de conversas e recursos.' },
            { question: 'Como funciona o atendimento?', answer: 'Nosso chatbot funciona 24/7! Para dúvidas mais complexas, um atendente humano pode assumir a conversa durante o horário comercial.' }
        ]
    };

    // ---- State ----
    let config = {};
    let currentPage = 'appearance';

    // ---- Helpers ----
    function getConfig() {
        const stored = localStorage.getItem(KEYS.config);
        if (stored) return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
        return { ...DEFAULT_CONFIG };
    }

    function saveConfig() {
        localStorage.setItem(KEYS.config, JSON.stringify(config));
    }

    function getCredentials() {
        const stored = localStorage.getItem(KEYS.credentials);
        if (stored) return JSON.parse(stored);
        return { email: DEFAULT_CLIENT_EMAIL, password: DEFAULT_CLIENT_PASSWORD };
    }

    function isLoggedIn() {
        return localStorage.getItem(KEYS.auth) === 'true';
    }

    // ---- Auth ----
    function showLogin() {
        document.getElementById('login-screen').style.display = '';
        document.getElementById('portal').style.display = 'none';
    }

    function showPortal() {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('portal').style.display = 'flex';
        config = getConfig();
        loadAllConfigs();
        updatePreview();
        navigateTo('appearance');
    }

    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const creds = getCredentials();

        // Also check admin-created clients
        const clients = JSON.parse(localStorage.getItem('nexbot_clients') || '[]');
        const matchClient = clients.find(c => c.email === email && c.password === password && c.status === 'ativo');

        if ((email === creds.email && password === creds.password) || matchClient) {
            localStorage.setItem(KEYS.auth, 'true');
            document.getElementById('login-error').textContent = '';
            showPortal();
        } else {
            document.getElementById('login-error').textContent = 'Email ou senha incorretos.';
        }
    });

    document.getElementById('logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem(KEYS.auth);
        showLogin();
    });

    if (isLoggedIn()) showPortal();
    else showLogin();

    // ---- Navigation ----
    const pageTitles = {
        appearance: ['Aparência do Chatbot', 'Personalize o visual do seu chatbot'],
        messages: ['Mensagens e Ações', 'Configure mensagens e botões rápidos'],
        knowledge: ['Base de Conhecimento', 'Cadastre perguntas e respostas'],
        embed: ['Código de Integração', 'Adicione o chatbot ao seu site']
    };

    function navigateTo(page) {
        currentPage = page;
        document.querySelectorAll('.nav-item[data-page]').forEach(item => {
            item.classList.toggle('active', item.getAttribute('data-page') === page);
        });
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        const target = document.getElementById(`page-${page}`);
        if (target) target.classList.add('active');

        document.getElementById('page-title').textContent = pageTitles[page]?.[0] || page;
        document.getElementById('topbar-sub').textContent = pageTitles[page]?.[1] || '';

        if (page === 'embed') generateEmbedCode();

        document.getElementById('sidebar').classList.remove('open');
    }

    document.querySelectorAll('.nav-item[data-page]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(item.getAttribute('data-page'));
        });
    });

    // ---- Mobile sidebar ----
    document.getElementById('mobile-menu-btn').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });
    document.getElementById('sidebar-close').addEventListener('click', () => {
        document.getElementById('sidebar').classList.remove('open');
    });

    // Preview toggle (responsive)
    const previewToggle = document.getElementById('preview-toggle');
    if (previewToggle) {
        previewToggle.addEventListener('click', () => {
            document.getElementById('preview-container').classList.toggle('open');
        });
    }

    // ---- Load all configs into UI ----
    function loadAllConfigs() {
        // Identity
        document.getElementById('bot-name').value = config.botName;
        document.getElementById('bot-subtitle').value = config.botSubtitle;
        // Avatar
        document.querySelectorAll('.avatar-option').forEach(opt => {
            opt.classList.toggle('active', opt.getAttribute('data-avatar') === config.avatar);
        });
        // Colors
        document.getElementById('color-primary').value = config.colorPrimary;
        document.getElementById('color-primary-hex').value = config.colorPrimary;
        document.getElementById('color-header').value = config.colorHeader;
        document.getElementById('color-header-hex').value = config.colorHeader;
        document.getElementById('color-bot-msg').value = config.colorBotMsg;
        document.getElementById('color-bot-msg-hex').value = config.colorBotMsg;
        document.getElementById('color-user-msg').value = config.colorUserMsg;
        document.getElementById('color-user-msg-hex').value = config.colorUserMsg;
        // Radius
        document.getElementById('border-radius').value = config.borderRadius;
        document.getElementById('radius-value').textContent = config.borderRadius + 'px';
        // Position
        document.querySelectorAll('.position-option').forEach(opt => {
            opt.classList.toggle('active', opt.getAttribute('data-position') === config.position);
        });
        // Size
        document.getElementById('widget-size').value = config.widgetSize;
        // Messages
        document.getElementById('welcome-msg').value = config.welcomeMsg;
        document.getElementById('offline-msg').value = config.offlineMsg;
        document.getElementById('input-placeholder').value = config.inputPlaceholder;
        // Quick actions
        renderQuickActions();
        // FAQs
        renderFAQs();
    }

    // ---- Reactive Config Binding ----
    // Every change updates config + refreshes preview instantly

    function bindInput(id, key) {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('input', () => {
            config[key] = el.value;
            updatePreview();
        });
    }

    bindInput('bot-name', 'botName');
    bindInput('bot-subtitle', 'botSubtitle');
    bindInput('welcome-msg', 'welcomeMsg');
    bindInput('offline-msg', 'offlineMsg');
    bindInput('input-placeholder', 'inputPlaceholder');

    // Color inputs (sync color picker + hex input)
    function bindColor(colorId, hexId, key) {
        const colorEl = document.getElementById(colorId);
        const hexEl = document.getElementById(hexId);
        if (!colorEl || !hexEl) return;

        colorEl.addEventListener('input', () => {
            config[key] = colorEl.value;
            hexEl.value = colorEl.value;
            updatePreview();
        });
        hexEl.addEventListener('input', () => {
            if (/^#[0-9A-Fa-f]{6}$/.test(hexEl.value)) {
                config[key] = hexEl.value;
                colorEl.value = hexEl.value;
                updatePreview();
            }
        });
    }

    bindColor('color-primary', 'color-primary-hex', 'colorPrimary');
    bindColor('color-header', 'color-header-hex', 'colorHeader');
    bindColor('color-bot-msg', 'color-bot-msg-hex', 'colorBotMsg');
    bindColor('color-user-msg', 'color-user-msg-hex', 'colorUserMsg');

    // Border radius
    document.getElementById('border-radius').addEventListener('input', (e) => {
        config.borderRadius = parseInt(e.target.value);
        document.getElementById('radius-value').textContent = e.target.value + 'px';
        updatePreview();
    });

    // Avatar picker
    document.querySelectorAll('.avatar-option').forEach(opt => {
        opt.addEventListener('click', () => {
            document.querySelectorAll('.avatar-option').forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            config.avatar = opt.getAttribute('data-avatar');
            updatePreview();
        });
    });

    // Position picker
    document.querySelectorAll('.position-option').forEach(opt => {
        opt.addEventListener('click', () => {
            document.querySelectorAll('.position-option').forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            config.position = opt.getAttribute('data-position');
            updatePreview();
        });
    });

    // Widget size
    document.getElementById('widget-size').addEventListener('change', (e) => {
        config.widgetSize = e.target.value;
        updatePreview();
    });

    // ---- Quick Actions ----
    function renderQuickActions() {
        const container = document.getElementById('quick-actions-list');
        if (!config.quickActions) config.quickActions = [];

        container.innerHTML = config.quickActions.map((qa, i) => `
            <div class="quick-action-item" data-index="${i}">
                <input type="text" class="qa-emoji-input" value="${qa.emoji}" maxlength="2" style="width:34px;text-align:center;flex:none;padding:6px;font-size:1rem;">
                <input type="text" class="qa-text-input" value="${qa.text}" placeholder="Texto do botão">
                <button class="qa-delete" data-index="${i}">×</button>
            </div>
        `).join('');

        // Bind events
        container.querySelectorAll('.qa-emoji-input').forEach((input, i) => {
            input.addEventListener('input', () => {
                config.quickActions[i].emoji = input.value;
                updatePreview();
            });
        });
        container.querySelectorAll('.qa-text-input').forEach((input, i) => {
            input.addEventListener('input', () => {
                config.quickActions[i].text = input.value;
                updatePreview();
            });
        });
        container.querySelectorAll('.qa-delete').forEach(btn => {
            btn.addEventListener('click', () => {
                config.quickActions.splice(parseInt(btn.getAttribute('data-index')), 1);
                renderQuickActions();
                updatePreview();
            });
        });
    }

    document.getElementById('add-quick-action').addEventListener('click', () => {
        if (!config.quickActions) config.quickActions = [];
        config.quickActions.push({ emoji: '📌', text: 'Novo Botão' });
        renderQuickActions();
        updatePreview();
    });

    // ---- FAQs ----
    function renderFAQs() {
        const container = document.getElementById('faq-list');
        if (!config.faqs) config.faqs = [];

        container.innerHTML = config.faqs.map((faq, i) => `
            <div class="faq-item-editor" data-index="${i}">
                <div class="faq-item-header">
                    <span>Pergunta #${i + 1}</span>
                    <button class="qa-delete faq-delete" data-index="${i}">×</button>
                </div>
                <div class="form-group">
                    <label>Pergunta</label>
                    <input type="text" class="faq-q-input" value="${faq.question}" placeholder="Ex: Qual o horário de funcionamento?">
                </div>
                <div class="form-group">
                    <label>Resposta</label>
                    <textarea class="faq-a-input" rows="2" placeholder="A resposta do chatbot para esta pergunta">${faq.answer}</textarea>
                </div>
            </div>
        `).join('');

        container.querySelectorAll('.faq-q-input').forEach((input, i) => {
            input.addEventListener('input', () => { config.faqs[i].question = input.value; });
        });
        container.querySelectorAll('.faq-a-input').forEach((input, i) => {
            input.addEventListener('input', () => { config.faqs[i].answer = input.value; });
        });
        container.querySelectorAll('.faq-delete').forEach(btn => {
            btn.addEventListener('click', () => {
                config.faqs.splice(parseInt(btn.getAttribute('data-index')), 1);
                renderFAQs();
            });
        });
    }

    document.getElementById('add-faq').addEventListener('click', () => {
        if (!config.faqs) config.faqs = [];
        config.faqs.push({ question: '', answer: '' });
        renderFAQs();
        // Scroll to new item
        const list = document.getElementById('faq-list');
        list.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    // ---- Live Preview ----
    function updatePreview() {
        // Header
        const header = document.getElementById('pw-header');
        header.style.background = config.colorHeader;

        // Avatar
        document.getElementById('pw-avatar').textContent = config.avatar;
        document.getElementById('fab-icon').textContent = config.avatar;

        // Name & status
        document.getElementById('pw-name').textContent = config.botName;
        document.getElementById('pw-status').innerHTML = `<span class="pw-online"></span> ${config.botSubtitle}`;

        // Welcome message
        const welcomeEl = document.getElementById('pw-welcome-msg');
        welcomeEl.innerHTML = `<p>${config.welcomeMsg}</p>`;
        welcomeEl.style.background = config.colorBotMsg;
        welcomeEl.style.borderRadius = `${config.borderRadius}px ${config.borderRadius}px ${config.borderRadius}px 4px`;

        // Quick actions
        const qaContainer = document.getElementById('pw-quick-actions');
        if (config.quickActions && config.quickActions.length > 0) {
            qaContainer.innerHTML = config.quickActions.map(qa =>
                `<button class="pw-quick-btn" style="border-color:${config.colorPrimary}33;color:${config.colorPrimary}">${qa.emoji} ${qa.text}</button>`
            ).join('');
        } else {
            qaContainer.innerHTML = '';
        }

        // Placeholder
        document.getElementById('pw-input').placeholder = config.inputPlaceholder;

        // Send button color
        document.querySelector('.pw-send-btn').style.background = `linear-gradient(135deg, ${config.colorPrimary}, ${lightenColor(config.colorPrimary, 30)})`;

        // Widget border-radius
        const widget = document.getElementById('preview-widget');
        widget.style.borderRadius = config.borderRadius + 'px';

        // FAB color
        const fab = document.getElementById('preview-fab');
        fab.style.background = `linear-gradient(135deg, ${config.colorPrimary}, ${lightenColor(config.colorPrimary, 30)})`;
    }

    function lightenColor(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }

    // ---- Save All ----
    document.getElementById('save-all-btn').addEventListener('click', () => {
        saveConfig();
        const btn = document.getElementById('save-all-btn');
        const original = btn.innerHTML;
        btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8L6.5 11.5L13 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Salvo!`;
        btn.classList.add('saved');
        setTimeout(() => {
            btn.innerHTML = original;
            btn.classList.remove('saved');
        }, 2000);
    });

    // ---- Embed Code Generation ----
    function generateEmbedCode() {
        const c = config;
        const faqsJSON = JSON.stringify(c.faqs || []);
        const qaJSON = JSON.stringify(c.quickActions || []);

        const code = `<!-- NexBot Chatbot Widget -->
<script>
(function() {
  var cfg = {
    botName: "${c.botName}",
    botSubtitle: "${c.botSubtitle}",
    avatar: "${c.avatar}",
    colorPrimary: "${c.colorPrimary}",
    colorHeader: "${c.colorHeader}",
    colorBotMsg: "${c.colorBotMsg}",
    colorUserMsg: "${c.colorUserMsg}",
    borderRadius: ${c.borderRadius},
    position: "${c.position}",
    widgetSize: "${c.widgetSize}",
    welcomeMsg: "${c.welcomeMsg.replace(/"/g, '\\"')}",
    offlineMsg: "${c.offlineMsg.replace(/"/g, '\\"')}",
    inputPlaceholder: "${c.inputPlaceholder}",
    quickActions: ${qaJSON},
    faqs: ${faqsJSON}
  };

  var sizes = { small: 340, medium: 380, large: 420 };
  var w = sizes[cfg.widgetSize] || 380;
  var pos = cfg.position === 'left' ? 'left:20px;' : 'right:20px;';

  // Inject styles
  var style = document.createElement('style');
  style.textContent = \`
    #nexbot-fab { position:fixed;bottom:20px;\${pos}width:60px;height:60px;border-radius:50%;
      background:linear-gradient(135deg,\${cfg.colorPrimary},\${cfg.colorPrimary}99);border:none;
      font-size:1.8rem;cursor:pointer;z-index:99999;box-shadow:0 4px 20px \${cfg.colorPrimary}40;
      transition:transform .3s,box-shadow .3s;display:flex;align-items:center;justify-content:center;}
    #nexbot-fab:hover{transform:scale(1.1);box-shadow:0 6px 30px \${cfg.colorPrimary}60;}
    #nexbot-widget{position:fixed;bottom:90px;\${pos}width:\${w}px;max-height:520px;border-radius:\${cfg.borderRadius}px;
      background:#0A0A0F;border:1px solid rgba(255,255,255,.06);box-shadow:0 10px 50px rgba(0,0,0,.5);
      display:none;flex-direction:column;z-index:99999;overflow:hidden;font-family:Inter,sans-serif;
      animation:nexbotSlideUp .3s ease;}
    #nexbot-widget.open{display:flex;}
    @keyframes nexbotSlideUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
    .nb-header{display:flex;align-items:center;gap:10px;padding:14px 16px;background:\${cfg.colorHeader};
      border-bottom:1px solid rgba(255,255,255,.05);}
    .nb-avatar{width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,\${cfg.colorPrimary},\${cfg.colorPrimary}99);
      display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0;}
    .nb-info{flex:1;}.nb-name{display:block;font-size:.85rem;font-weight:600;color:#fff;}
    .nb-status{display:flex;align-items:center;gap:5px;font-size:.72rem;color:rgba(255,255,255,.5);}
    .nb-online{width:6px;height:6px;border-radius:50%;background:#10B981;}
    .nb-close{background:none;border:none;color:rgba(255,255,255,.4);font-size:1.3rem;cursor:pointer;}
    .nb-messages{flex:1;padding:16px;display:flex;flex-direction:column;gap:10px;overflow-y:auto;max-height:320px;}
    .nb-msg{max-width:85%;padding:10px 14px;border-radius:\${cfg.borderRadius}px;font-size:.82rem;line-height:1.5;}
    .nb-msg.bot{background:\${cfg.colorBotMsg};color:#F1F1F6;border-bottom-left-radius:4px;align-self:flex-start;}
    .nb-msg.user{background:\${cfg.colorUserMsg};color:#fff;border-bottom-right-radius:4px;align-self:flex-end;}
    .nb-quick{display:flex;gap:6px;flex-wrap:wrap;align-self:flex-start;}
    .nb-qbtn{padding:6px 12px;background:\${cfg.colorPrimary}18;border:1px solid \${cfg.colorPrimary}33;
      border-radius:100px;font-size:.72rem;color:\${cfg.colorPrimary};cursor:pointer;transition:background .2s;}
    .nb-qbtn:hover{background:\${cfg.colorPrimary}30;}
    .nb-input-area{display:flex;align-items:center;gap:6px;padding:10px 14px;
      border-top:1px solid rgba(255,255,255,.05);background:rgba(255,255,255,.02);}
    .nb-input{flex:1;background:#1E1E2A;border:1px solid rgba(255,255,255,.06);border-radius:100px;
      padding:8px 14px;font-size:.8rem;color:#F1F1F6;outline:none;font-family:Inter,sans-serif;}
    .nb-send{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,\${cfg.colorPrimary},\${cfg.colorPrimary}99);
      border:none;color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;}
  \`;
  document.head.appendChild(style);

  // FAB
  var fab = document.createElement('button');
  fab.id = 'nexbot-fab';
  fab.innerHTML = cfg.avatar;
  document.body.appendChild(fab);

  // Widget
  var widget = document.createElement('div');
  widget.id = 'nexbot-widget';
  widget.innerHTML = '<div class="nb-header">'
    + '<div class="nb-avatar">' + cfg.avatar + '</div>'
    + '<div class="nb-info"><span class="nb-name">' + cfg.botName + '</span>'
    + '<span class="nb-status"><span class="nb-online"></span> ' + cfg.botSubtitle + '</span></div>'
    + '<button class="nb-close" onclick="document.getElementById(\\'nexbot-widget\\').classList.remove(\\'open\\')">×</button></div>'
    + '<div class="nb-messages" id="nb-messages">'
    + '<div class="nb-msg bot">' + cfg.welcomeMsg + '</div>'
    + '<div class="nb-quick">' + cfg.quickActions.map(function(q){return '<button class="nb-qbtn" data-q="'+q.text+'">'+q.emoji+' '+q.text+'</button>';}).join('') + '</div>'
    + '</div>'
    + '<div class="nb-input-area"><input class="nb-input" id="nb-input" placeholder="' + cfg.inputPlaceholder + '">'
    + '<button class="nb-send" id="nb-send"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7L12 2L7 12L5.5 8.5L2 7Z" fill="currentColor"/></svg></button></div>';
  document.body.appendChild(widget);

  fab.onclick = function(){ widget.classList.toggle('open'); };

  // Simple FAQ matching
  var faqs = cfg.faqs || [];
  function findAnswer(q) {
    q = q.toLowerCase();
    var best = null, bestScore = 0;
    faqs.forEach(function(f) {
      var words = f.question.toLowerCase().split(/\\s+/);
      var score = words.filter(function(w) { return q.indexOf(w) >= 0; }).length / words.length;
      if (score > bestScore) { bestScore = score; best = f; }
    });
    return bestScore > 0.3 ? best.answer : null;
  }

  function addMsg(text, type) {
    var msgs = document.getElementById('nb-messages');
    var d = document.createElement('div');
    d.className = 'nb-msg ' + type;
    d.textContent = text;
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function handleSend() {
    var input = document.getElementById('nb-input');
    var text = input.value.trim();
    if (!text) return;
    addMsg(text, 'user');
    input.value = '';
    setTimeout(function() {
      var ans = findAnswer(text);
      addMsg(ans || 'Obrigado pela sua mensagem! Um atendente entrará em contato em breve.', 'bot');
    }, 800);
  }

  document.getElementById('nb-send').onclick = handleSend;
  document.getElementById('nb-input').onkeypress = function(e) { if (e.key === 'Enter') handleSend(); };

  // Quick action buttons
  widget.querySelectorAll('.nb-qbtn').forEach(function(btn) {
    btn.onclick = function() {
      var q = btn.getAttribute('data-q');
      addMsg(q, 'user');
      setTimeout(function() {
        var ans = findAnswer(q);
        addMsg(ans || 'Obrigado pelo interesse! Um atendente entrará em contato em breve.', 'bot');
      }, 800);
    };
  });
})();
<\/script>`;

        document.getElementById('embed-code').textContent = code;
    }

    // Copy embed code
    document.getElementById('copy-embed').addEventListener('click', () => {
        const code = document.getElementById('embed-code').textContent;
        navigator.clipboard.writeText(code).then(() => {
            const btn = document.getElementById('copy-embed');
            const original = btn.innerHTML;
            btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8L6.5 11.5L13 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg> Copiado!';
            btn.classList.add('copied');
            setTimeout(() => { btn.innerHTML = original; btn.classList.remove('copied'); }, 2000);
        });
    });

});
