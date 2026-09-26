import { createClient, OAuthStrategy } from 'https://esm.sh/@wix/sdk@latest';
import { products } from 'https://esm.sh/@wix/stores@latest';

const CLIENT_ID = 'af0efa30-5a54-4813-a964-e064f08f8065';

// ==========================================
// FORMATAÇÃO E INTEGRAÇÃO COM WIX
// ==========================================
function formatarImagemWix(wixUrl) {
    if (!wixUrl) return 'https://via.placeholder.com/300x300/ffffff/555555?text=Sem+Imagem';
    if (wixUrl.startsWith('http')) return wixUrl;
    if (wixUrl.startsWith('wix:image://v1/')) {
        const arquivo = wixUrl.split('/')[3].split('#')[0];
        return `https://static.wixstatic.com/media/${arquivo}`;
    }
    return 'https://via.placeholder.com/300x300/ffffff/555555?text=Sem+Imagem';
}

async function carregarProdutosWix() {
    try {
        const wixClient = createClient({
            modules: { products },
            auth: OAuthStrategy({ clientId: CLIENT_ID })
        });

        // Busca até 50 produtos direto da sua loja
        const resposta = await wixClient.products.queryProducts().limit(50).find();
        
        let produtosDinamicos = [];

        resposta.items.forEach(p => {
            // Lógica de Preços do Wix
            let precoOriginal = p.priceData?.formatted?.price || '0,00';
            let precoDesconto = p.priceData?.formatted?.discountedPrice;
            
            let pNovo = precoOriginal;
            let pAntigo = null;

            // Se tem preço descontado e é diferente, então está em OFERTA
            if (precoDesconto && precoDesconto !== precoOriginal) {
                pNovo = precoDesconto;
                pAntigo = precoOriginal;
            }

            // Remove o R$ para encaixar no nosso HTML sem duplicar
            pNovo = pNovo.replace('R$', '').replace('\u00A0', '').trim();
            if (pAntigo) pAntigo = pAntigo.replace('R$', '').replace('\u00A0', '').trim();

            const imgUrl = formatarImagemWix(p.media?.mainMedia?.image?.url || p.media?.items?.[0]?.image?.url);
            
            // Pega a descrição limpa sem tags HTML (até 65 letras pra não quebrar o card)
            const desc = p.description ? p.description.replace(/<[^>]*>?/gm, '').substring(0, 65) + '...' : 'Qualidade e procedência garantida.';

            produtosDinamicos.push({
                nome: p.name || 'Produto',
                desc: desc,
                img: imgUrl,
                precoNovo: pNovo,
                precoAntigo: pAntigo,
                badge: p.ribbon || '' // Puxa a faixa do Wix (se não tiver, fica vazio)
            });
        });

        window.baseProdutos = produtosDinamicos;
        renderizarProdutos();
    } catch (e) {
        console.error("❌ Erro ao conectar com o Wix:", e);
        window.baseProdutos = []; // Se o Wix cair, esvazia os cards mas o site não quebra
        renderizarProdutos();
    }
}

// ==========================================
// RENDERIZAÇÃO DINÂMICA DE PRODUTOS
// ==========================================
function renderizarProdutos() {
    const promoSection = document.getElementById('promocoes');
    const promoContainer = document.getElementById('promo-carousel-container');
    const catalogoContainer = document.getElementById('catalogo-grid');

    if (!promoSection || !promoContainer || !catalogoContainer || !window.baseProdutos) return;

    let ofertas = window.baseProdutos.filter(p => p.precoAntigo);
    let normais = window.baseProdutos.filter(p => !p.precoAntigo);

    // Estilo IMAGEM QUADRADA WIX perfeita
    const imgStyle = `
        width: 100%; 
        aspect-ratio: 1 / 1; 
        display: flex; 
        justify-content: center; 
        align-items: center; 
        background: #ffffff; 
        border-radius: 8px; 
        margin-bottom: 12px; 
        overflow: hidden;
    `;

    // 1. Regra das Ofertas (Só aparece se o Wix enviar produtos com Desconto)
    if (ofertas.length > 0) {
        promoSection.style.display = 'block';
        promoContainer.innerHTML = ofertas.map(p => `
            <div class="product-card promo-card">
                ${p.badge ? `<div class="promo-pulse-badge">${p.badge}</div>` : ''}
                <div style="${imgStyle}">
                    <img src="${p.img}" alt="${p.nome}" style="width: 100%; height: 100%; object-fit: contain; padding: 10px;">
                </div>
                <h3 class="product-title">${p.nome}</h3>
                <p class="product-desc">${p.desc}</p>
                <div class="price-box-highlight"><span class="price-old">De R$ ${p.precoAntigo}</span><span class="price-new">Por R$ ${p.precoNovo}</span></div>
                <a href="#" class="btn-buy" onclick="chamarZap('${p.nome.replace(/'/g, "\\'")}'); return false;">Chamar no WhatsApp</a>
            </div>
        `).join('');
    } else {
        promoSection.style.display = 'none';
    }

    // 2. Regra do Catálogo na Home (Máximo 6)
    let maxCatalogo = normais.slice(0, 6);
    if (maxCatalogo.length > 0) {
        catalogoContainer.innerHTML = maxCatalogo.map(p => `
            <div class="product-card normal-card">
                ${p.badge ? `<span class="badge-stock badge-lancamento">${p.badge}</span>` : ''}
                <div style="${imgStyle}">
                    <img src="${p.img}" alt="${p.nome}" style="width: 100%; height: 100%; object-fit: contain; padding: 10px;">
                </div>
                <h3 class="product-title">${p.nome}</h3>
                <p class="product-desc">${p.desc}</p>
                <div class="price-box-highlight normal-price"><span class="price-new" style="font-size: 1.5rem; color: #fff;">R$ ${p.precoNovo}</span></div>
                <a href="#" class="btn-buy" onclick="chamarZap('${p.nome.replace(/'/g, "\\'")}'); return false;">Chamar no WhatsApp</a>
            </div>
        `).join('');
    }

    destacarMaisBuscado();
    iniciarCarrosselOfertas();
}

// ==========================================
// SISTEMA DE DESTAQUE INTELIGENTE (MAIS CLICADO)
// ==========================================
function destacarMaisBuscado() {
    let cliques = JSON.parse(localStorage.getItem('cliquesProdutos')) || {};
    if (Object.keys(cliques).length === 0) return;
    
    let produtoTop = Object.keys(cliques).reduce((a, b) => cliques[a] > cliques[b] ? a : b);
    let botoes = document.querySelectorAll('.btn-buy');
    for (let btn of botoes) {
        let onclickAttr = btn.getAttribute('onclick');
        if (onclickAttr && onclickAttr.includes(produtoTop)) {
            let card = btn.closest('.product-card');
            let container = card.parentElement;
            
            let tagAntiga = card.querySelector('.promo-pulse-badge');
            if(tagAntiga) tagAntiga.remove();

            let badge = document.createElement('div');
            badge.className = 'promo-pulse-badge badge-popular';
            
            let lang = localStorage.getItem('siteLang') || 'pt';
            if(lang === 'pt') badge.innerText = '🏆 Mais Buscado';
            if(lang === 'es') badge.innerText = '🏆 Más Buscado';
            if(lang === 'en') badge.innerText = '🏆 Most Wanted';
            
            card.prepend(badge);
            container.prepend(card);
            
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
        nav_ofertas: "Ofertas", nav_catalogo: "Catálogo", nav_entregas: "Entregas",
        hero_t1: "O SEU NOVO APARELHO", hero_t2: "ESTÁ AQUI.",
        hero_p: "Trabalhamos apenas com a linha de elite da Apple, Xiaomi e Consoles. Qualidade, procedência e entrega garantida.",
        search_placeholder: "Busque por iPhone 15, Xiaomi, PS5...",
        promo_title: "Ofertas Relâmpago", promo_subtitle: "Deslize para o lado para ver mais ofertas ➔",
        cat_title: "Catálogo Completo", garantia_title: "Nossa Garantia em Ação", visitar_title: "Venha nos Visitar",
        lang_label: "Mudar Idioma do Site:"
    },
    es: {
        nav_ofertas: "Ofertas", nav_catalogo: "Catálogo", nav_entregas: "Envíos",
        hero_t1: "TU NUEVO DISPOSITIVO", hero_t2: "ESTÁ AQUÍ.",
        hero_p: "Trabajamos solo con la línea de élite de Apple, Xiaomi y Consolas. Calidad, procedencia y entrega garantizada.",
        search_placeholder: "Buscar iPhone 15, Xiaomi, PS5...",
        promo_title: "Ofertas Relámpago", promo_subtitle: "Desliza hacia el lado para ver más ofertas ➔",
        cat_title: "Catálogo Completo", garantia_title: "Nuestra Garantía en Acción", visitar_title: "Vení a Visitarnos",
        lang_label: "Cambiar Idioma del Sitio:"
    },
    en: {
        nav_ofertas: "Offers", nav_catalogo: "Catalog", nav_entregas: "Shipping",
        hero_t1: "YOUR NEW DEVICE", hero_t2: "IS RIGHT HERE.",
        hero_p: "We work exclusively with elite lines from Apple, Xiaomi, and Consoles. Certified quality and guaranteed delivery.",
        search_placeholder: "Search for iPhone 15, Xiaomi, PS5...",
        promo_title: "Flash Deals", promo_subtitle: "Swipe to the side to see more deals ➔",
        cat_title: "Full Catalog", garantia_title: "Our Guarantee in Action", visitar_title: "Visit Our Stores",
        lang_label: "Change Site Language:"
    }
};

window.mudarIdioma = function(lang) {
    localStorage.setItem('siteLang', lang);
    aplicarIdioma(lang);
};

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
// RENDERIZAÇÃO DOS SHORTS (Sem vídeos falsos)
// ==========================================
let currentVideoIndex = 0;
const modal = document.getElementById('video-modal');
const videoPlayer = document.getElementById('modal-video-player');

function renderizarReels() {
    const reelsContainer = document.querySelector('.reels-container');
    if (!reelsContainer) return;
    
    let videos = (typeof videosLista !== 'undefined') ? videosLista : [];

    if (videos.length === 0) return; 

    window.videosData = videos;
    reelsContainer.innerHTML = '';
    
    videos.forEach((video, index) => {
        const item = document.createElement('div');
        item.className = 'reel-item';
        item.onclick = () => abrirVideo(index);
        item.innerHTML = `
            <div class="reel-thumb-box" style="position: relative; width: 160px; height: 280px; background: #111; border: 1px solid #333; border-radius: 12px; overflow: hidden; cursor: pointer;">
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.6); border-radius: 50%; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; z-index: 2;">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="#d4af37"><path d="M8 5v14l11-7z"/></svg>
                </div>
                <video src="${video.src}#t=0.1" preload="metadata" muted playsinline style="width: 100%; height: 100%; object-fit: cover; pointer-events: none;"></video>
            </div>
        `;
        reelsContainer.appendChild(item);
    });
}

window.abrirVideo = function(index) {
    if (!window.videosData || !window.videosData[index]) return;
    currentVideoIndex = index;
    if (modal) modal.style.display = 'block';
    if (videoPlayer) {
        videoPlayer.src = window.videosData[currentVideoIndex].src;
        videoPlayer.play().catch(e => console.log("Bloqueio autoplay:", e));
    }
}

window.fecharModal = function(e) {
    if (e && e.target) {
        if (e.target.closest('#video-wrapper') && !e.target.classList.contains('mini-close-btn')) {
            return;
        }
    }
    if (modal) modal.style.display = 'none';
    if (videoPlayer) {
        videoPlayer.pause();
        videoPlayer.src = '';
    }
}

window.proximoVideo = function(e) {
    if (e) e.stopPropagation();
    if (!window.videosData || window.videosData.length === 0) return;
    currentVideoIndex = (currentVideoIndex + 1) % window.videosData.length;
    videoPlayer.src = window.videosData[currentVideoIndex].src;
    videoPlayer.play().catch(e => console.log(e));
}

window.voltarVideo = function(e) {
    if (e) e.stopPropagation();
    if (!window.videosData || window.videosData.length === 0) return;
    currentVideoIndex = (currentVideoIndex - 1 + window.videosData.length) % window.videosData.length;
    videoPlayer.src = window.videosData[currentVideoIndex].src;
    videoPlayer.play().catch(e => console.log(e));
}

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

// ==========================================
// WHATSAPP BLINDADO - SEM ERRO = SEM MENSAGEM
// ==========================================
async function obterNumeroDoTxt() {
    try {
        const resposta = await fetch('whatsapp.txt?v=' + new Date().getTime());
        if (!resposta.ok) return null;
        const texto = await resposta.text();
        return texto.replace(/\D/g, '');
    } catch (erro) {
        return null;
    }
}

window.chamarZap = async function(produto) {
    let numero = await obterNumeroDoTxt();
    
    if (typeof NUMERO_WHATSAPP !== 'undefined') { 
        let jsNum = NUMERO_WHATSAPP.replace(/\D/g, ''); 
        if (jsNum) numero = jsNum;
    }

    if (!numero || numero.length < 10) {
        console.error("❌ ERRO GRAVE: Nenhum número válido encontrado. Abortando mensagem.");
        return; 
    }

    if (!numero.startsWith('55') && numero.length <= 11) { 
        numero = '55' + numero; 
    }

    let cliques = JSON.parse(localStorage.getItem('cliquesProdutos')) || {};
    cliques[produto] = (cliques[produto] || 0) + 1;
    localStorage.setItem('cliquesProdutos', JSON.stringify(cliques));

    let lang = localStorage.getItem('siteLang') || 'pt';
    let msg = `Olá, Marcelão Imports! Tenho interesse no: ${produto}`;
    
    if (lang === 'es') msg = `¡Hola, Marcelão Imports! Estoy interesado en: ${produto}`;
    else if (lang === 'en') msg = `Hi, Marcelão Imports! I am interested in: ${produto}`;

    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(msg)}`, '_blank');
};

document.addEventListener("DOMContentLoaded", function() {
    inicializarIdioma();
    carregarProdutosWix(); // Chama o Wix em vez da array fantasma
    renderizarReels();
});
