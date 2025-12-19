#!/bin/bash

# ============================================
# Agendaberta - Instalador Automático Completo
# Uso: ./install.sh [domínio] [--update]
# ============================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configurações
REPO_URL="https://github.com/andreguimel/agenda-f-cil.git"
APP_DIR="/var/www/agendaberta"
UPDATE_ONLY=false
DOMAIN="agendaberta.com.br"

# Processar argumentos
for arg in "$@"; do
    case $arg in
        --update|-u)
            UPDATE_ONLY=true
            ;;
        *)
            DOMAIN="$arg"
            ;;
    esac
done

# Função de atualização rápida
do_update() {
    echo -e "${GREEN}"
    echo "============================================"
    echo "   Agendaberta - Atualização Rápida"
    echo "============================================"
    echo -e "${NC}"
    
    cd $APP_DIR
    echo -e "${BLUE}[1/3] Baixando atualizações...${NC}"
    git pull origin main
    
    echo -e "${BLUE}[2/3] Instalando dependências...${NC}"
    npm ci --production=false
    
    echo -e "${BLUE}[3/3] Compilando aplicação...${NC}"
    npm run build
    
    sudo systemctl reload nginx
    
    echo -e "${GREEN}"
    echo "============================================"
    echo "   Atualização concluída!"
    echo "============================================"
    echo -e "${NC}"
    exit 0
}

# Se --update, executar apenas atualização
if [ "$UPDATE_ONLY" = true ]; then
    do_update
fi

# Função para verificar se comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

echo -e "${GREEN}"
echo "============================================"
echo "   Agendaberta - Instalador Automático"
echo "============================================"
echo -e "${NC}"
echo -e "${YELLOW}Domínio: $DOMAIN${NC}"
echo -e "${YELLOW}Repositório: $REPO_URL${NC}"
echo ""

# 1. Atualizar sistema
echo -e "${BLUE}[1/7] Atualizando sistema...${NC}"
sudo apt update && sudo apt upgrade -y

# 2. Instalar Git
echo -e "${BLUE}[2/7] Instalando Git...${NC}"
if ! command_exists git; then
    sudo apt install -y git
fi

# 3. Instalar Node.js (v20 LTS)
echo -e "${BLUE}[3/7] Instalando Node.js...${NC}"
if ! command_exists node; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi
echo "Node.js: $(node -v) | NPM: $(npm -v)"

# 4. Instalar Nginx
echo -e "${BLUE}[4/7] Instalando Nginx...${NC}"
if ! command_exists nginx; then
    sudo apt install -y nginx
fi
sudo systemctl enable nginx
sudo systemctl start nginx

# 5. Instalar Certbot
echo -e "${BLUE}[5/7] Instalando Certbot...${NC}"
if ! command_exists certbot; then
    sudo apt install -y certbot python3-certbot-nginx
fi

# 6. Clonar/Atualizar repositório e fazer build
echo -e "${BLUE}[6/7] Baixando e compilando aplicação...${NC}"
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

if [ -d "$APP_DIR/.git" ]; then
    echo "Atualizando repositório existente..."
    cd $APP_DIR
    git pull origin main
else
    echo "Clonando repositório..."
    git clone $REPO_URL $APP_DIR
    cd $APP_DIR
fi

npm ci --production=false
npm run build

# 7. Configurar Nginx
echo -e "${BLUE}[7/7] Configurando Nginx...${NC}"

sudo tee /etc/nginx/sites-available/agendaberta > /dev/null <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;

    root $APP_DIR/dist;
    index index.html;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript;

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
EOF

sudo ln -sf /etc/nginx/sites-available/agendaberta /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

echo -e "${GREEN}"
echo "============================================"
echo "   Instalação concluída com sucesso!"
echo "============================================"
echo -e "${NC}"
echo -e "${YELLOW}Para ativar HTTPS, execute:${NC}"
echo "sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo ""
echo -e "${GREEN}Acesse: http://$DOMAIN${NC}"
