# main.py
from funcs.gerar_dados import gerar_clientes, gerar_produtos, gerar_vendas
from funcs.salvar_dados import salvar_csv

def main():
    clientes = gerar_clientes(200)
    produtos = gerar_produtos()
    vendas = gerar_vendas(clientes, produtos, n=1500)

    salvar_csv(clientes, "clientes")
    salvar_csv(produtos, "produtos")
    salvar_csv(vendas, "vendas")

    print("Dados gerados com sucesso!")

if __name__ == "__main__":
    main()
