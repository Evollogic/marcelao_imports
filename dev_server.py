from livereload import Server

# Cria o servidor
server = Server()

# Manda o servidor vigiar as mudanças nestes arquivos
server.watch('index.html')
server.watch('data/index_data/*.css')
server.watch('data/index_data/*.js')

print("Servidor Live Reload rodando!")
print("Acesse: http://localhost:8000")
print("Deixe este terminal aberto. O navegador vai atualizar sozinho quando você salvar um arquivo.")

# Inicia o servidor na porta 8000
server.serve(port=8000, host='0.0.0.0')
