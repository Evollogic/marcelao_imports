import os
import glob

def atualizar_lista_videos():
    pasta_videos = 'data/reels_data'
    arquivo_js = 'data/index_data/lista_videos.js'
    
    os.makedirs(pasta_videos, exist_ok=True)
    os.makedirs(os.path.dirname(arquivo_js), exist_ok=True)
    
    videos = glob.glob(os.path.join(pasta_videos, '*.mp4'))
    
    js_content = "// Arquivo gerado automaticamente pelo bot_videos.py\n"
    js_content += "const videosLista = [\n"
    
    for video in videos:
        caminho_web = video.replace('\\', '/')
        # Apenas o vídeo. Nada de thumb.
        js_content += f'    {{ src: "{caminho_web}" }},\n'
        
    js_content += "];\n"
    
    with open(arquivo_js, 'w', encoding='utf-8') as f:
        f.write(js_content)
        
    print(f"✅ Sucesso! {len(videos)} vídeos encontrados e adicionados.")

if __name__ == '__main__':
    atualizar_lista_videos()
