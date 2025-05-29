fetch('./data/json/vendas_estado.json')
    .then(res => res.json())
    .then(data => {
        console.log('Dados do graficoEstado:', data);
        if (!Array.isArray(data)) {
            console.error('Erro: dados do graficoEstado não é array');
            return;
        }
        if (data.length === 0) {
            console.warn('Dados do graficoEstado estão vazios');
            return;
        }

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
                        anchor: 'end',
                        align: 'right',
                        formatter: valor => `R$ ${valor.toLocaleString('pt-BR')}`
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            callback: valor => `R$ ${valor.toLocaleString('pt-BR')}`
                        }
                    }
                }
            },
            plugins: [ChartDataLabels]
        });
    })
    .catch(err => console.error('Erro ao carregar graficoEstado.json:', err));
