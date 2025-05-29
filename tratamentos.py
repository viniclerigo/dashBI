import pandas as pd
import json

# CARREGANDO TABELAS NOS DATAFRAMES
df_vendas = pd.read_csv('data/csv/vendas.csv')
df_produtos = pd.read_csv('data/csv/produtos.csv')
df_clientes = pd.read_csv('data/csv/clientes.csv')

# TRATANDO VENDAS
df_vendas['preco_unitario'] = df_vendas['preco_unitario'].astype(float)
df_vendas['valor_total'] = df_vendas['valor_total'].astype(float)
df_vendas["data_venda"] = pd.to_datetime(df_vendas["data_venda"])
df_vendas["ano"] = df_vendas["data_venda"].dt.year.astype(str)
df_vendas["mes"] = df_vendas["data_venda"].dt.month_name(locale='pt_BR')

# GERA OBJETO DE KPI'S
kpis = {
    'faturamento': round(float(df_vendas['valor_total'].sum()), 2),
    'vendas_qtd': int(df_vendas['id_venda'].count()),
    'tkt_med': round(float(df_vendas['valor_total'].sum()), 2) / int(df_vendas['id_venda'].count()),
    'qtd_produtos': int(df_vendas['quantidade'].sum()),
    'cli_unique': int(df_vendas['id_cliente'].nunique())
}
# SALVA OBJETO DE KPI'S
with open("./data/kpis.json", "w", encoding="utf-8") as f:
    json.dump(kpis, f, ensure_ascii=False, indent=4)

# GERA DATAFRAME DE VALOR TOTAL AGRUPADO POR ANO E MES
df_agrupado = (
    df_vendas.groupby(["ano", "mes"])["valor_total"]
    .sum()
    .round(2)
    .reset_index()
)
fat_mensal = df_agrupado.to_dict(orient='records')
del df_agrupado

with open("./data/faturamento_mensal.json", "w", encoding="utf-8") as f:
    json.dump(fat_mensal, f, ensure_ascii=False, indent=4)
    
# GERA DATAFRAME DE QUANTIDADE AGRUPADO POR ANO E MES
df_agrupado = (
    df_vendas.groupby(["ano", "mes"])["quantidade"]
    .sum()
    .round(2)
    .reset_index()
)
vendas_mensal = df_agrupado.to_dict(orient='records')
del df_agrupado

with open("./data/vendas_mensal.json", "w", encoding="utf-8") as f:
    json.dump(vendas_mensal, f, ensure_ascii=False, indent=4)

# GERA DATAFRAME DE TICKET MÉDIO AGRUPADO POR ANO E MES
df_agrupado = (
    df_vendas
    .groupby(["ano", "mes"])[["valor_total", "quantidade"]]
    .sum()
    .assign(ticket_medio=lambda x: (x["valor_total"] / x["quantidade"]).round(2))
    .reset_index()[["ano", "mes", "ticket_medio"]]
)

tkt_mensal = df_agrupado.to_dict(orient='records')    
del df_agrupado

with open("./data/tkt_mensal.json", "w", encoding="utf-8") as f:
    json.dump(tkt_mensal, f, ensure_ascii=False, indent=4)

# GERA DATAFRAME DE VENDAS POR PRODUTOS DETALHADO
vendas_produtos = (
    df_vendas.groupby('id_produto')[['quantidade','valor_total']]
    .sum()
    .reset_index()
)
vendas_produtos = pd.merge(df_produtos, vendas_produtos, on="id_produto", how="left")
vendas_produtos = vendas_produtos.drop(columns='preco')
vendas_produtos = vendas_produtos.to_dict(orient='records')

with open("./data/vendas_produtos.json", "w", encoding="utf-8") as f:
    json.dump(vendas_produtos, f, ensure_ascii=False, indent=4)

# GERA DATAFRAME DE VENDAS POR ESTADO
vendas_estado = (
    df_vendas.groupby('id_cliente')[['quantidade','valor_total']]
    .sum()
    .reset_index()
)
vendas_estado = pd.merge(df_clientes, vendas_estado, on="id_cliente", how="left")
vendas_estado = vendas_estado.drop(columns=['nome', 'email', 'cidade'])
vendas_estado = vendas_estado.to_dict(orient='records')

with open("./data/vendas_estado.json", "w", encoding="utf-8") as f:
    json.dump(vendas_estado, f, ensure_ascii=False, indent=4)

# DELTANDO OBJETOS
del df_vendas
del df_clientes
del df_produtos
del kpis
del fat_mensal
del vendas_mensal
del tkt_mensal