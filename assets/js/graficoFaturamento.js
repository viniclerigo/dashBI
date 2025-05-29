let dadosOriginal = [];
let mostrarLabels = false;

// Atualiza gráfico por ano selecionado
function atualizarGraficoPorAno(anoSelecionado) {
    const mesesOrdem = [
        "Janeiro", "Fevereiro", "Março", "Abril",
        "Maio", "Junho", "Julho", "Agosto",
        "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    const dadosFiltrados = (anoSelecionado === "todos"
        ? dadosOriginal
        : dadosOriginal.filter(d => d.ano == anoSelecionado)
    ).sort((a, b) => {
        return mesesOrdem.indexOf(a.mes) - mesesOrdem.indexOf(b.mes);
    });

    const labels = dadosFiltrados.map(d => d.mes);
    const valores = dadosFiltrados.map(d => d.valor_total);

    const ctx = document.getElementById("graficoFaturamento").getContext("2d");
    if (window.graficoFaturamento instanceof Chart) {
        window.graficoFaturamento.destroy();
    }

    window.graficoFaturamento = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Faturamento por Mês",
                data: valores,
                borderColor: "#3498db",
                backgroundColor: "rgba(52, 152, 219, 0.2)",
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                datalabels: {
                    display: mostrarLabels,
                    align: 'top',
                    formatter: value => `R$ ${value.toLocaleString('pt-BR')}`,
                    font: { weight: 'bold' },
                    color: '#2c3e50'
                },
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
        },
        plugins: [ChartDataLabels]
    });
}

// Checkbox de mostrar labels
document.getElementById('toggleLabels').addEventListener('change', function () {
    mostrarLabels = this.checked;
    const selectAno = document.getElementById('filtroAno');
    atualizarGraficoPorAno(selectAno.value);
});
