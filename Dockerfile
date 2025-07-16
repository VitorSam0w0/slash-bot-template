FROM node:18

# Instala o FFmpeg
RUN apt-get update && apt-get install -y ffmpeg && apt-get clean && rm -rf /var/lib/apt/lists/*

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos do projeto
COPY package*.json ./
RUN npm install
COPY . .

# Comando para iniciar o bot
CMD ["node", "index.js"]