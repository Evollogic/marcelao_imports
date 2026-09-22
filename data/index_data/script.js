const NUMERO_WHATSAPP = "5541900000000";

const frasesDinamicas = [
    "Aparelho na Mão 🔥", "Cliente Satisfeito 💯", "Mais um Enviado 📦",
    "Loja Lotada 🚀", "Entrega Garantida ✅", "Qualidade Premium 💎"
];

let videosValidos = []; // Agora armazena objetos {arquivo, titulo, link}
let indexVideoAtual = 0;
let animacaoBarra = null;
let isDragging = false; 
let isAnimatingTransition = false; 

function chamarZap(produto) {
    const mensagem = `Olá Marcelão Imports! Tenho interesse no ${produto}. Qual o valor e disponibilidade?`;
    window.open(`https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensagem)}`, '_blank');
}

const player = document.getElementById('modal-video-player');
const wrapper = document.getElementById('video-wrapper');
const progress = document.getElementById('video-progress');
const timeAtual = document.getElementById('current-time');
const timeTotal = document.getElementById('total-time');
const modal = document.getElementById('video-modal');
const igLinkBtn = document.getElementById('ig-link-btn');

function formatarTempo(segundos) {
    if (isNaN(segundos)) return "0:00";
    const min = Math.floor(segundos / 60);
    const seg = Math.floor(segundos % 60);
    return `${min}:${seg < 10 ? '0' : ''}${seg}`;
}

function abrirVideo(index) {
    if (index < 0 || index >= videosValidos.length) return;
    indexVideoAtual = index;
    const videoData = videosValidos[indexVideoAtual];
    
    wrapper.className = ''; 
    player.src = `data/reels_data/${videoData.arquivo}`;
    igLinkBtn.href = videoData.link; // Atualiza o link do botão pro vídeo atual no Insta
    
    modal.style.display = "flex";
    player.play();
    iniciarBarraSuave();
}

function trocarVideoAnimado(novoIndex, direcao) {
    if (isAnimatingTransition) return;
    isAnimatingTransition = true;
    
    const classOut = direcao === 'next' ? 'anim-out-next' : 'anim-out-prev';
    const classIn = direcao === 'next' ? 'anim-in-next' : 'anim-in-prev';

    wrapper.classList.add(classOut);

    setTimeout(() => {
        indexVideoAtual = novoIndex;
        const videoData = videosValidos[indexVideoAtual];
        
        player.src = `data/reels_data/${videoData.arquivo}`;
        igLinkBtn.href = videoData.link;
        player.play();

        wrapper.classList.remove(classOut);
        wrapper.classList.add(classIn);

        setTimeout(() => {
            wrapper.classList.remove(classIn);
            isAnimatingTransition = false;
        }, 250); 
    }, 250); 
}

function proximoVideo(event) {
    if(event) event.stopPropagation();
    if (videosValidos.length > 0) {
        let novoIndex = indexVideoAtual + 1;
        if (novoIndex >= videosValidos.length) novoIndex = 0;
        trocarVideoAnimado(novoIndex, 'next');
    }
}

function voltarVideo(event) {
    if(event) event.stopPropagation();
    if (videosValidos.length > 0) {
        let novoIndex = indexVideoAtual - 1;
        if (novoIndex < 0) novoIndex = videosValidos.length - 1;
        trocarVideoAnimado(novoIndex, 'prev');
    }
}

player.addEventListener('ended', proximoVideo);

function fecharModal(event) {
    if (event) event.stopPropagation();
    if (!event || event.target.id === 'video-modal' || event.target.classList.contains('close-modal') || event.target.classList.contains('mini-close-btn') || event.target.id === 'modal-content-area') {
        modal.style.display = "none";
        player.pause();
        player.src = "";
        wrapper.className = ''; 
        cancelAnimationFrame(animacaoBarra);
    } else if (event.target.id === 'modal-video-player') {
        if (player.paused) player.play();
        else player.pause();
    }
}

player.addEventListener('loadedmetadata', () => {
    timeTotal.textContent = formatarTempo(player.duration);
});

function iniciarBarraSuave() {
    if (!isDragging && player.duration) {
        progress.value = (player.currentTime / player.duration) * 100;
        timeAtual.textContent = formatarTempo(player.currentTime);
    }
    if (modal.style.display === "flex") {
        animacaoBarra = requestAnimationFrame(iniciarBarraSuave);
    }
}

progress.addEventListener('input', () => {
    isDragging = true;
    if (player.duration) {
        timeAtual.textContent = formatarTempo((progress.value / 100) * player.duration);
    }
});

progress.addEventListener('change', () => {
    if (player.duration) player.currentTime = (progress.value / 100) * player.duration;
    isDragging = false;
});

let toqueInicialY = 0;
let toqueFinalY = 0;

wrapper.addEventListener('touchstart', e => {
    toqueInicialY = e.changedTouches[0].screenY;
}, { passive: true });

wrapper.addEventListener('touchend', e => {
    toqueFinalY = e.changedTouches[0].screenY;
    calcularSwipe();
});

function calcularSwipe() {
    const distancia = 50; 
    if (toqueInicialY - toqueFinalY > distancia) {
        proximoVideo(); 
    } else if (toqueFinalY - toqueInicialY > distancia) {
        voltarVideo(); 
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const container = document.querySelector('.reels-container');
    
    // Agora lemos a LISTA_VIDEOS_OBJ criada pelo bot Python
    if (typeof LISTA_VIDEOS_OBJ !== 'undefined') {
        
        // Embaralha para ficar sempre dinâmico
        for (let i = LISTA_VIDEOS_OBJ.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [LISTA_VIDEOS_OBJ[i], LISTA_VIDEOS_OBJ[j]] = [LISTA_VIDEOS_OBJ[j], LISTA_VIDEOS_OBJ[i]];
        }

        LISTA_VIDEOS_OBJ.forEach((videoData) => {
            const urlCompleta = `data/reels_data/${videoData.arquivo}`;
            
            const videoTeste = document.createElement('video');
            videoTeste.preload = "metadata";
            videoTeste.src = urlCompleta;
            
            videoTeste.onloadedmetadata = () => {
                if (videoTeste.videoHeight > videoTeste.videoWidth) {
                    
                    const currentIndex = videosValidos.length;
                    videosValidos.push(videoData); // Guarda o objeto completo
                    
                    // Se o bot não achou título, usa a frase aleatória
                    const fraseEscolhida = videoData.titulo ? videoData.titulo : frasesDinamicas[currentIndex % frasesDinamicas.length];
                    
                    const cardHTML = `
                        <div class="reel-card" onclick="abrirVideo(${currentIndex})">
                            <video src="${urlCompleta}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; pointer-events: none;" muted loop onmouseover="this.play()" onmouseout="this.pause()"></video>
                            <div class="play-icon"></div>
                            <div class="reel-info">
                                <h4>${fraseEscolhida}</h4>
                                <p class="gold-text">★★★★★</p>
                            </div>
                        </div>
                    `;
                    container.insertAdjacentHTML('beforeend', cardHTML);
                }
            };
        });
    }
});
