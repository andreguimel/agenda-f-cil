#!/bin/bash

# ============================================
# Agendaberta - Script de Deploy/Atualização
# ============================================

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

APP_DIR="/var/www/agendaberta"

echo -e "${GREEN}"
echo "============================================"
echo "   Agendaberta - Deploy"
echo "============================================"
echo -e "${NC}"

cd $APP_DIR

# 1. Pull das alterações (se usar git)
if [ -d ".git" ]; then
    echo -e "${GREEN}[1/4] Baixando alterações do repositório...${NC}"
    git pull origin main
else
    echo -e "${YELLOW}[1/4] Repositório git não encontrado, pulando...${NC}"
fi

# 2. Instalar dependências
echo -e "${GREEN}[2/4] Instalando dependências...${NC}"
npm ci --production=false

# 3. Build da aplicação
echo -e "${GREEN}[3/4] Gerando build de produção...${NC}"
npm run build

# 4. Recarregar Nginx
echo -e "${GREEN}[4/4] Recarregando Nginx...${NC}"
sudo systemctl reload nginx

echo -e "${GREEN}"
echo "============================================"
echo "   Deploy concluído com sucesso!"
echo "============================================"
echo -e "${NC}"

echo "Última atualização: $(date)"
