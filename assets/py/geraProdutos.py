import pandas as pd
import random

# 1. Categorias e nomes de produtos por categoria
categorias = {
    "Eletrônicos": ["Fone Bluetooth", "Mouse sem fio", "Teclado mecânico", "Carregador rápido", "Caixa de som"],
    "Moda": ["Camiseta básica", "Calça jeans", "Tênis esportivo", "Jaqueta corta-vento", "Vestido casual"],
    "Beleza": ["Perfume", "Shampoo", "Hidratante facial", "Base líquida", "Sabonete esfoliante"],
    "Casa": ["Toalha de banho", "Jogo de lençóis", "Travesseiro ortopédico", "Panela antiaderente", "Cortina blackout"],
    "Livros": ["Romance", "Autoajuda", "Suspense", "Fantasia", "Negócios"],
    "Esportes": ["Bola de futebol", "Caneleira", "Camisa de time", "Luvas de academia", "Garrafa térmica"]
}

# 2. Criar fornecedores (2 por categoria, exclusivos)
fornecedores = []
categoria_to_fornecedores = {}
id_fornecedor = 1

for categoria in categorias:
    fornecedores_categoria = []
    for _ in range(2):  # Sempre 2 por categoria
        fornecedores_categoria.append(id_fornecedor)
        fornecedores.append({
            'id_fornecedor': id_fornecedor,
            'nome': f"Fornec {categoria[:3].upper()} {id_fornecedor}"
        })
        id_fornecedor += 1
    categoria_to_fornecedores[categoria] = fornecedores_categoria

# 3. Gerar produtos com base nas categorias e fornecedores
produtos = []
id_produto = 1

for categoria, nomes_base in categorias.items():
    for nome_base in nomes_base:
        produto = {
            'id_produto': id_produto,
            'nome': f"{nome_base} {random.choice(['X', 'Plus', 'Pro', 'Max', ''])}".strip(),
            'categoria': categoria,
            'preco_unitario': round(random.uniform(30, 500), 2),
            'id_fornecedor': random.choice(categoria_to_fornecedores[categoria])
        }
        produtos.append(produto)
        id_produto += 1

# 4. Criar DataFrames
df_produtos = pd.DataFrame(produtos)
df_produtos['id_produto'] = df_produtos['id_produto'].astype(str)
df_produtos['id_fornecedor'] = df_produtos['id_fornecedor'].astype(str)

df_fornecedores = pd.DataFrame(fornecedores)
df_fornecedores['id_fornecedor'] = df_fornecedores['id_fornecedor'].astype(str)

# 5. Salvar tabela
df_produtos.to_json('data/prod_master.json', orient='records', indent=4, force_ascii=False)
df_fornecedores.to_json('data/fornec_master.json', orient='records', indent=4, force_ascii=False)