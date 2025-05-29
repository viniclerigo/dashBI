// Carrega os KPIs
fetch("./data/json/kpis.json")
    .then(res => res.json())
    .then(data => {
        document.getElementById("faturamento").innerText = `R$ ${data.faturamento.toLocaleString("pt-BR")}`;
        document.getElementById("vendas").innerText = data.vendas_qtd;
        document.getElementById("ticket").innerText = `R$ ${data.tkt_med.toLocaleString("pt-BR")}`;
        document.getElementById("produtos").innerText = data.qtd_produtos;
        document.getElementById("clientes").innerText = data.cli_unique;
    });
