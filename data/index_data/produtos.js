// BANCO DE DADOS DE PRODUTOS (Puxe via CMS no futuro, ou edite aqui)
// Se tiver "precoAntigo", o sistema joga automaticamente para as Ofertas.
const baseProdutos = [
    { nome: "iPhone 14 Pro 128GB", desc: "Seminovo Premium. Bateria 100%, impecável.", img: "data/phones/iphone14pro.png", precoNovo: "4.299,00", precoAntigo: "4.800,00", badge: "🔥 Queima de Estoque" },
    { nome: "Xiaomi 13T Pro", desc: "Câmeras Leica, 120W de carga e Smartwatch grátis.", img: "data/phones/xiaomi13t.png", precoNovo: "3.100,00", precoAntigo: "3.500,00", badge: "🔥 Queima de Estoque" },
    { nome: "PlayStation 5 Slim", desc: "Versão com leitor de disco, lacrado, 1 ano de garantia.", img: "data/phones/ps5.png", precoNovo: "3.750,00", precoAntigo: "4.200,00", badge: "🔥 Queima de Estoque" },
    { nome: "iPhone 16 Pro 256GB", desc: "O mais novo lançamento da Apple.", img: "data/phones/iphone16pro.png", precoNovo: "7.150,00", badge: "🚀 Lançamento", badgeClass: "badge-lancamento" },
    { nome: "Xiaomi 14 Ultra", desc: "Poder fotográfico Leica absoluto.", img: "data/phones/xiaomi14ultra.png", precoNovo: "6.300,00", badge: "🚀 Lançamento", badgeClass: "badge-lancamento" },
    { nome: "iPhone 13 128GB", desc: "O campeão de vendas. Novo e lacrado.", img: "data/phones/iphone13.png", precoNovo: "2.899,00", badge: "🎯 Oferta", badgeClass: "badge-oferta" },
    { nome: "Nintendo Switch OLED", desc: "Tela vibrante e diversão garantida.", img: "data/phones/switch.png", precoNovo: "1.850,00", badge: "⚠️ Pouco Estoque", badgeClass: "badge-pouco-estoque" },
    { nome: "POCO X7 Pro 5G", desc: "O monstro do custo-benefício.", img: "data/phones/pocox7.png", precoNovo: "1.950,00", badge: "Pronta Entrega", badgeClass: "badge-stock" },
    { nome: "AirPods Pro 2ª Geração", desc: "Cancelamento de ruído absurdo.", img: "data/phones/airpodspro2.png", precoNovo: "1.450,00", badge: "Pronta Entrega", badgeClass: "badge-stock" }
];
