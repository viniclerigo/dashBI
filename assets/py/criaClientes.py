from faker import Faker
import pandas as pd
import random
from datetime import datetime

# 1. Inicializa o gerador de dados
fake = Faker('pt_BR')

# 2. Canais de origem possíveis
canais_origem = ["Google Ads", "Instagram", "Indicação", "Orgânico", "Facebook", "LinkedIn"]

# 3. Função para calcular idade
def calcular_idade(data_nasc):
    hoje = datetime.today()
    return hoje.year - data_nasc.year - ((hoje.month, hoje.day) < (data_nasc.month, data_nasc.day))

# 4. Geração dos dados
def gerar_clientes(n=1000):
    clientes = []
    for i in range(1, n + 1):
        data_nasc = fake.date_of_birth(minimum_age=18, maximum_age=70)
        data_cadastro = fake.date_between(start_date='-3y', end_date='today')
        clientes.append({
            'id_cliente': i,                                           # ID numérico sequencial
            'nome': fake.name(),
            'sexo': random.choice(['M', 'F']),
            'data_nascimento': data_nasc,
            'idade': calcular_idade(data_nasc),
            'cidade': fake.city(),
            'estado': fake.estado_sigla(),
            'data_cadastro': data_cadastro,
            'origem_cadastro': random.choice(canais_origem)
        })
    return pd.DataFrame(clientes)

# 5. Geração
df_clientes = gerar_clientes(1000)

# 6. Salvando tabela
df_clientes.to_json('data/cli_master.json', orient='records', indent=4, force_ascii=False)