import pandas as pd
import random
from datetime import datetime, timedelta

# Impotando tabelas
df_clientes = pd.read_json('data/cli_master.json')
df_produtos = pd.read_json('data/prod_master.json')

# Parâmetros
num_vendas = 10000  # quantidade de vendas a gerar
data_inicio = datetime(2022, 1, 1)
data_fim = datetime(2025, 5, 31)

# Função para gerar datas aleatórias
def data_aleatoria(inicio, fim):
    delta = fim - inicio
    dias_aleatorios = random.randint(0, delta.days)
    return inicio + timedelta(days=dias_aleatorios)

# Gerar vendas
vendas = []
for id_venda in range(1, num_vendas + 1):
    cliente = df_clientes.sample(1).iloc[0]
    produto = df_produtos.sample(1).iloc[0]

    quantidade = random.randint(1, 5)
    preco_unitario = produto['preco_unitario']
    total = round(quantidade * preco_unitario, 2)

    venda = {
        'id_venda': id_venda,
        'id_cliente': cliente['id_cliente'],
        'canal_aquisicao': cliente['canal_aquisicao'],
        'id_produto': produto['id_produto'],
        'data_venda': data_aleatoria(data_inicio, data_fim).date(),
        'quantidade': quantidade,
        'preco_unitario': preco_unitario,
        'total': total
    }
    vendas.append(venda)

# Criar DataFrame final
df_vendas = pd.DataFrame(vendas)
df_vendas['id_venda'] = df_vendas['id_venda'].astype(str)
df_vendas['id_cliente'] = df_vendas['id_cliente'].astype(str)
df_vendas['id_produto'] = df_vendas['id_produto'].astype(str)
df_vendas['data_venda'] = df_vendas['data_venda'].astype(str)

# Salvar tabela
df_vendas.to_json('data/vendas.json', orient='records', indent=4, force_ascii=False, date_format='iso')