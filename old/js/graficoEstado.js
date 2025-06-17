fetch('./data/json/vendas_estado.json')
    .then(res => res.json())
    .then(data => {
        if (!Array.isArray(data) || data.length === 0) return;

        const estados = data.map(item => item.estado);
        const valores = data.map(item => item.valor_total);

        const ctx = document.getElementById('graficoEstado').getContext('2d');

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: estados,
                datasets: [{
                    label: 'Faturamento (R$)',
                    data: valores,
                    backgroundColor: '#2ecc71'
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
    })
    .catch(err => console.error('Erro ao carregar graficoEstado.json:', err));
