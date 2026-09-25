// ==========================================
// CONFIGURAÇÕES GERAIS
// ==========================================
const MEU_WHATSAPP = "5541900000000";



    // 2. CHAMA O WHATSAPP COM O IDIOMA CERTO
    let lang = localStorage.getItem('siteLang') || 'pt';
    let msg = `Oi, estou interessado no produto ${produto}`;
    if (lang === 'es') msg = `Hola, estoy interesado en el producto ${produto}`;
    if (lang === 'en') msg = `Hi, I am interested in the product ${produto}`;
    let link = `https://wa.me/${MEU_WHATSAPP}?text=${encodeURIComponent(msg)}`;
    window.open(link, '_blank');
}

// ==========================================
// SISTEMA DE DESTAQUE INTELIGENTE (MAIS CLICADO)
// ==========================================
function destacarMaisBuscado() {
    let cliques = JSON.parse(localStorage.getItem('cliquesProdutos')) || {};
    if (Object.keys(cliques).length === 0) return; // Se nunca clicou em nada, não faz nada

    // Descobre qual é o produto com o maior número
    let produtoTop = Object.keys(cliques).reduce((a, b) => cliques[a] > cliques[b] ? a : b);

    // Procura o botão do produto na tela
    let botoes = document.querySelectorAll('.btn-buy');
    for (let btn of botoes) {
        let onclickAttr = btn.getAttribute('onclick');
        if (onclickAttr && onclickAttr.includes(produtoTop)) {
            let card = btn.closest('.product-card');
            let container = card.parentElement;

            // Remove a tag de promoção antiga se tiver
            let tagAntiga = card.querySelector('.promo-pulse-badge');
            if(tagAntiga) tagAntiga.remove();

            // Cria a tag dourada de Mais Buscado
            let badge = document.createElement('div');
            badge.className = 'promo-pulse-badge badge-popular';
            
            let lang = localStorage.getItem('siteLang') || 'pt';
            if(lang === 'pt') badge.innerText = '🏆 Mais Buscado';
            if(lang === 'es') badge.innerText = '🏆 Más Buscado';
            if(lang === 'en') badge.innerText = '🏆 Most Wanted';
            
            card.prepend(badge);

            // Move a carta do produto para a PRIMEIRA posição do catálogo ou carrossel
            container.prepend(card);
            
            // Dá um pequeno destaque visual na borda
            card.style.borderColor = '#d4af37';
            card.style.boxShadow = '0 10px 30px rgba(212, 175, 55, 0.2)';
            break; 
        }
    }
}

// ==========================================
// DICIONÁRIO DE IDIOMAS
// ==========================================
const traducoes = {
    pt: {
        nav_ofertas: "⚡ Ofertas", nav_catalogo: "Catálogo", nav_entregas: "Entregas",
        hero_t1: "O SEU NOVO APARELHO", hero_t2: "ESTÁ AQUI.",
        hero_p: "Trabalhamos apenas com a linha de elite da Apple, Xiaomi e Consoles. Qualidade, procedência e entrega garantida.",
        search_placeholder: "Busque por iPhone 15, Xiaomi, PS5...",
        promo_title: "⚡ Ofertas Relâmpago", promo_subtitle: "Deslize para o lado para ver mais ofertas ➔",
        cat_title: "Catálogo Completo", garantia_title: "Nossa Garantia em Ação", visitar_title: "Venha nos Visitar",
        btn_oferta: "Garantir Oferta", btn_zap: "Chamar no WhatsApp",
        pronta_entrega: "Pronta Entrega", queima_estoque: "🔥 Queima de Estoque",
        com_brinde: "🎁 Com Brinde", ultima_unidade: "⚡ Última Unidade", lang_label: "Mudar Idioma do Site:"
    },
    es: {
        nav_ofertas: "⚡ Ofertas", nav_catalogo: "Catálogo", nav_entregas: "Envíos",
        hero_t1: "TU NUEVO DISPOSITIVO", hero_t2: "ESTÁ AQUÍ.",
        hero_p: "Trabajamos solo con la línea de élite de Apple, Xiaomi y Consolas. Calidad, procedencia y entrega garantizada.",
        search_placeholder: "Buscar iPhone 15, Xiaomi, PS5...",
        promo_title: "⚡ Ofertas Relámpago", promo_subtitle: "Desliza hacia el lado para ver más ofertas ➔",
        cat_title: "Catálogo Completo", garantia_title: "Nuestra Garantía en Acción", visitar_title: "Vení a Visitarnos",
        btn_oferta: "Asegurar Oferta", btn_zap: "Contactar por WhatsApp",
        pronta_entrega: "Entrega Inmediata", queima_estoque: "🔥 Liquidación",
        com_brinde: "🎁 Con Regalo", ultima_unidade: "⚡ Última Unidad", lang_label: "Cambiar Idioma del Sitio:"
    },
    en: {
        nav_ofertas: "⚡ Offers", nav_catalogo: "Catalog", nav_entregas: "Shipping",
        hero_t1: "YOUR NEW DEVICE", hero_t2: "IS RIGHT HERE.",
        hero_p: "We work exclusively with elite lines from Apple, Xiaomi, and Consoles. Certified quality and guaranteed delivery.",
        search_placeholder: "Search for iPhone 15, Xiaomi, PS5...",
        promo_title: "⚡ Flash Deals", promo_subtitle: "Swipe to the side to see more deals ➔",
        cat_title: "Full Catalog", garantia_title: "Our Guarantee in Action", visitar_title: "Visit Our Stores",
        btn_oferta: "Claim Deal", btn_zap: "Chat on WhatsApp",
        pronta_entrega: "In Stock", queima_estoque: "🔥 Clearance",
        com_brinde: "🎁 Free Gift", ultima_unidade: "⚡ Last Unit", lang_label: "Change Site Language:"
    }
};

function mudarIdioma(lang) {
    localStorage.setItem('siteLang', lang);
    aplicarIdioma(lang);
}

function aplicarIdioma(lang) {
    let t = traducoes[lang] || traducoes['pt'];

    document.querySelectorAll('[data-i18n]').forEach(el => {
        let chave = el.getAttribute('data-i18n');
        if (t[chave]) el.innerText = t[chave];
    });

    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
        let chave = el.getAttribute('data-i18n-ph');
        if (t[chave]) el.setAttribute('placeholder', t[chave]);
    });

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-lang') === lang) btn.classList.add('active');
    });
    
    // Atualiza o texto do badge se ele existir
    let badge = document.querySelector('.badge-popular');
    if(badge) {
        if(lang === 'pt') badge.innerText = '🏆 Mais Buscado';
        if(lang === 'es') badge.innerText = '🏆 Más Buscado';
        if(lang === 'en') badge.innerText = '🏆 Most Wanted';
    }
}

function inicializarIdioma() {
    let savedLang = localStorage.getItem('siteLang');
    if (!savedLang) {
        let userLang = (navigator.language || navigator.userLanguage || 'pt').toLowerCase().slice(0, 2);
        savedLang = ['es', 'en', 'pt'].includes(userLang) ? userLang : 'pt';
        localStorage.setItem('siteLang', savedLang);
    }
    aplicarIdioma(savedLang);
}

// ==========================================
// RENDERIZAÇÃO DOS SHORTS E MODAL
// ==========================================
let currentVideoIndex = 0;
const modal = document.getElementById('video-modal');
const videoPlayer = document.getElementById('modal-video-player');

function renderizarReels() {
    const reelsContainer = document.querySelector('.reels-container');
    if (!reelsContainer) return;
    
    let videos = (typeof videosLista !== 'undefined') ? videosLista : [];
    
    if (videos.length === 0) {
        videos = [
            { src: "https://www.w3schools.com/html/mov_bbb.mp4" },
            { src: "https://www.w3schools.com/html/mov_bbb.mp4" }
        ];
    }
    
    window.videosData = videos;
    reelsContainer.innerHTML = '';

    videos.forEach((video, index) => {
        const item = document.createElement('div');
        item.className = 'reel-item';
        item.onclick = () => abrirVideo(index);
        item.innerHTML = `
            <div class="reel-thumb-box">
                <span class="play-icon">▶</span>
                <video src="${video.src}#t=0.1" preload="metadata" muted playsinline style="width: 100%; height: 100%; object-fit: cover; pointer-events: none;"></video>
            </div>
        `;
        reelsContainer.appendChild(item);
    });
}

function abrirVideo(index) {
    if (!window.videosData || !window.videosData[index]) return;
    currentVideoIndex = index;
    modal.style.display = 'flex';
    videoPlayer.src = window.videosData[currentVideoIndex].src;
    videoPlayer.play();
}

function fecharModal(e) {
    if (e.target === modal || e.target.classList.contains('close-modal') || e.target.classList.contains('mini-close-btn')) {
        modal.style.display = 'none';
        videoPlayer.pause();
        videoPlayer.src = '';
    }
}

function proximoVideo(e) {
    if (e) e.stopPropagation();
    if (!window.videosData || window.videosData.length === 0) return;
    currentVideoIndex = (currentVideoIndex + 1) % window.videosData.length;
    videoPlayer.src = window.videosData[currentVideoIndex].src;
    videoPlayer.play();
}

function voltarVideo(e) {
    if (e) e.stopPropagation();
    if (!window.videosData || window.videosData.length === 0) return;
    currentVideoIndex = (currentVideoIndex - 1 + window.videosData.length) % window.videosData.length;
    videoPlayer.src = window.videosData[currentVideoIndex].src;
    videoPlayer.play();
}

// ==========================================
// CARROSSEL HORIZONTAL
// ==========================================
function iniciarCarrosselOfertas() {
    const carousel = document.querySelector('.promo-carousel');
    if (!carousel) return;
    
    setInterval(() => {
        if (carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 15) {
            carousel.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
            let card = carousel.querySelector('.promo-card');
            let largura = card ? card.clientWidth + 20 : 300;
            carousel.scrollBy({ left: largura, behavior: 'smooth' });
        }
    }, 3500);
}

// Inicializa tudo ao abrir o site
document.addEventListener("DOMContentLoaded", function() {
    inicializarIdioma();
    renderizarReels();
    iniciarCarrosselOfertas();
    destacarMaisBuscado(); // Chama a função que reordena o mais popular
});


// --- NOVA FUNÇÃO WHATSAPP DINÂMICA ---
async function obterNumeroDoTxt() {
    try {
        const resposta = await fetch('whatsapp.txt?v=' + new Date().getTime());
        const texto = await resposta.text();
        return texto.replace(/\D/g, ''); 
    } catch (erro) {
        console.error("Erro ler txt:", erro);
        return "5541992595757"; 
    }
}

async function chamarZap(produto) {
    let numero = await obterNumeroDoTxt();
    if (!numero.startsWith('55') && numero.length <= 11) {
        numero = '55' + numero;
    }
    const msg = encodeURIComponent(`Olá, Marcelão Imports! Tenho interesse no: ${produto}`);
    window.open(`https://wa.me/${numero}?text=${msg}`, '_blank');
}
// --------------------------------------
