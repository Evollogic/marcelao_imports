import os
import json
import glob

try:
    import instaloader
except ImportError:
    print("📦 Instalando biblioteca do Instagram...")
    os.system("pip install instaloader")
    import instaloader

# =======================================================
# ⚙️ CONFIGURAÇÃO DO INSTAGRAM
# =======================================================
PERFIL_INSTAGRAM = "marcelaoimports"
# =======================================================

pasta = 'data/reels_data'
os.makedirs(pasta, exist_ok=True)

print(f"🔎 Conectando ao Instagram para buscar os Reels de @{PERFIL_INSTAGRAM}...")

L = instaloader.Instaloader(
    dirname_pattern=pasta,
    filename_pattern="{shortcode}",
    download_pictures=False,
    download_video_thumbnails=False,
    download_geotags=False,
    download_comments=False,
    save_metadata=False,
    compress_json=False
)

metadata = {}
try:
    profile = instaloader.Profile.from_username(L.context, PERFIL_INSTAGRAM)
    baixados = 0
    print("🔄 Procurando vídeos e legendas novas...")
    
    for post in profile.get_posts():
        if post.is_video:
            shortcode = post.shortcode
            caption = post.caption if post.caption else ""
            
            # Pega a primeira frase da legenda para usar de título
            titulo = caption.split('\n')[0][:60] + "..." if caption else ""
            
            metadata[shortcode + ".mp4"] = {
                "shortcode": shortcode,
                "titulo": titulo
            }
            
            caminho_video = os.path.join(pasta, shortcode + ".mp4")
            if not os.path.exists(caminho_video):
                print(f"⬇️ Baixando Reel: {shortcode}.mp4")
                L.download_post(post, target=pasta)
            
            baixados += 1
            if baixados >= 8:  # Mantém os últimos 8 para o site ficar leve
                break
except Exception as e:
    print(f"⚠️ Aviso: Conexão anônima bloqueada ou sem internet. Usando os vídeos salvos. Detalhe: {e}")

# Limpeza: Apaga arquivos de texto/imagens que o instaloader traz junto sem querer
for arquivo in glob.glob(f"{pasta}/*"):
    if not arquivo.lower().endswith('.mp4'):
        try:
            os.remove(arquivo)
        except:
            pass

# Gera a lista inteligente para o site
videos = []
for f in os.listdir(pasta):
    if f.lower().endswith('.mp4'):
        if f in metadata:
            videos.append({
                "arquivo": f, 
                "titulo": metadata[f]["titulo"], 
                "link": f"https://www.instagram.com/reel/{metadata[f]['shortcode']}/"
            })
        else:
            # Para vídeos baixados manualmente ou antigos
            videos.append({
                "arquivo": f, 
                "titulo": "", 
                "link": f"https://www.instagram.com/{PERFIL_INSTAGRAM}/"
            })

caminho_js = 'data/index_data/lista_videos.js'
os.makedirs('data/index_data', exist_ok=True)

with open(caminho_js, 'w', encoding='utf-8') as f:
    f.write(f"const LISTA_VIDEOS_OBJ = {json.dumps(videos)};\n")

print(f"✅ Bot finalizou! {len(videos)} vídeos prontos e lincados com o Instagram.")
