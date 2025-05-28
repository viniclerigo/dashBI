import pandas as pd
import json

df_vendas = pd.read_csv('data/vendas.csv')
df_vendas['preco_unitario'] = df_vendas['preco_unitario'].astype(float)
df_vendas['valor_total'] = df_vendas['valor_total'].astype(float)
df_vendas["data_venda"] = pd.to_datetime(df_vendas["data_venda"])
df_vendas["ano_mes"] = df_vendas["data_venda"].dt.to_period("M").astype(str)

kpis = {
    'faturamento': round(float(df_vendas['valor_total'].sum()), 2),
    'vendas_qtd': int(df_vendas['id_venda'].count()),
    'tkt_med': round(float(df_vendas['valor_total'].sum()), 2) / int(df_vendas['id_venda'].count()),
    'qtd_produtos': int(df_vendas['quantidade'].sum()),
    'cli_unique': int(df_vendas['id_cliente'].nunique())
}

with open("kpis.json", "w", encoding="utf-8") as f:
    json.dump(kpis, f, ensure_ascii=False, indent=4)

fat_mes = df_vendas.groupby('ano_mes')['valor_total'].sum().to_dict()

with open("graf1.json", "w", encoding="utf-8") as f:
    json.dump(fat_mes, f, ensure_ascii=False, indent=4)