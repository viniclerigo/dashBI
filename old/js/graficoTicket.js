let dadosTicket = [];

function atualizarGraficoTicket(anoSelecionado) {
    const mesesOrdem = [
        "Janeiro", "Fevereiro", "Março", "Abril",
        "Maio", "Junho", "Julho", "Agosto",
        "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    const dadosFiltrados = (anoSelecionado === "todos"
        ? dadosTicket
        : dadosTicket.filter(d => d.ano == anoSelecionado)
    ).sort((a, b) => mesesOrdem.indexOf(a.mes) - mesesOrdem.indexOf(b.mes));

    const labels = dadosFiltrados.map(d => d.mes);
    const valores = dadosFiltrados.map(d => d.ticket_medio);

    const ctx = document.getElementById("graficoTicket").getContext("2d");
    if (window.graficoTicket instanceof Chart) {
        window.graficoTicket.destroy();
    }

    window.graficoTicket = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Ticket Médio por Mês",
                data: valores,
                backgroundColor: "#f39c12"
            }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    enabled: true
                }
            },
            scales: {
                y: {
                    ticks: {
                        callback: valor => `R$ ${valor.toLocaleString('pt-BR')}`
                    }
                }
            }
        }
    });
}

fetch("./data/json/tkt_mensal.json")
    .then(res => res.json())
    .then(data => {
        dadosTicket = data;
        atualizarGraficoTicket("todos");
    });
