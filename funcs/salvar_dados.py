# funcs/salvar_dados.py
def salvar_csv(df, nome_arquivo):
    df.to_csv(f"data/{nome_arquivo}.csv", index=False)
