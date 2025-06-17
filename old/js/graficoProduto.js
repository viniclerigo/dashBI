fetch('./data/json/vendas_produtos.json')
    .then(res => res.json())
    .then(data => {
        const produtos = data.map(item => item.produto);
        const valores = data.map(item => item.valor_total);

        const ctx = document.getElementById('graficoProduto').getContext('2d');

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: produtos,
                datasets: [{
                    label: 'Faturamento (R$)',
                    data: valores,
                    backgroundColor: '#3498db'
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: ctx => `R$ ${ctx.raw.toLocaleString('pt-BR')}`
                        }
                    },
                    datalabels: {
                        display: true,
                        anchor: 'end',
                        align: 'right',
                        formatter: valor => `R$ ${valor.toLocaleString('pt-BR')}`,
                        color: '#2c3e50',
                        font: { weight: 'bold' }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: {
                            callback: valor => `R$ ${valor.toLocaleString('pt-BR')}`
                        }
                    },
                    y: {
                        grid: { display: false }
                    }
                }
            },
            plugins: [ChartDataLabels]
        });
    });
