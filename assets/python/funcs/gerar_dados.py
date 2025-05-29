# funcs/gerar_dados.py
from faker import Faker
import pandas as pd
import random
import numpy as np

fake = Faker('pt_BR')

def gerar_clientes(n=100):
    return pd.DataFrame([{
        "id_cliente": i,
        "nome": fake.name(),
        "email": fake.email(),
        "cidade": fake.city(),
        "estado": fake.estado_sigla()
    } for i in range(1, n+1)])

def gerar_produtos():
    produtos = [
        {"id_produto": 1, "produto": "Notebook", "categoria": "Eletrônicos", "preco": 3500},
        {"id_produto": 2, "produto": "Smartphone", "categoria": "Eletrônicos", "preco": 2000},
        {"id_produto": 3, "produto": "Fone de Ouvido", "categoria": "Acessórios", "preco": 250},
        {"id_produto": 4, "produto": "Mochila", "categoria": "Acessórios", "preco": 150},
        {"id_produto": 5, "produto": "Monitor", "categoria": "Periféricos", "preco": 800},
    ]
    return pd.DataFrame(produtos)

def gerar_vendas(clientes, produtos, n=1000):
    vendas = []
    for i in range(1, n+1):
        cliente = random.choice(clientes['id_cliente'].tolist())
        produto = produtos.sample(1).iloc[0]
        quantidade = random.randint(1, 5)
        data = fake.date_between(start_date='-6M', end_date='today')
        vendas.append({
            "id_venda": i,
            "id_cliente": cliente,
            "id_produto": produto['id_produto'],
            "quantidade": quantidade,
            "data_venda": data,
            "preco_unitario": produto['preco'],
            "valor_total": round(quantidade * produto['preco'], 2)
        })
    return pd.DataFrame(vendas)
