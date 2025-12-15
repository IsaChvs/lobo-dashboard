import pandas as pd
from sklearn.linear_model import LinearRegression
import joblib

# Carregar dados
df = pd.read_csv("dados.csv")

X = df[["tipo_ocorrencia", "distancia_km"]]
y = df["tempo_resposta"]

# Treinar modelo
modelo = LinearRegression()
modelo.fit(X, y)

# Salvar modelo
joblib.dump(modelo, "modelo.pkl")

print("Modelo treinado e salvo com sucesso!")
