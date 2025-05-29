// Carrega dados do gráfico de faturamento e popula o filtro de ano
fetch("./data/json/faturamento_mensal.json")
    .then(res => res.json())
    .then(data => {
        dadosOriginal = data;
        const anosUnicos = [...new Set(data.map(d => d.ano))];

        const select = document.getElementById("filtroAno");
        anosUnicos.forEach(ano => {
            const option = document.createElement("option");
            option.value = ano;
            option.textContent = ano;
            select.appendChild(option);
        });

        select.addEventListener("change", () => {
            atualizarGraficoPorAno(select.value);
        });

        atualizarGraficoPorAno("todos");
    });
