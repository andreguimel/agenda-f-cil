#!/bin/bash

# ============================================
# Agendaberta - Script de Instalação Automática
# ============================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}"
echo "============================================"
echo "   Agendaberta - Instalação Automática"
echo "============================================"
echo -e "${NC}"

# Configurações
DOMAIN=${1:-"agendaberta.com.br"}
APP_DIR="/var/www/agendaberta"
REPO_URL=${2:-""}

echo -e "${YELLOW}Domínio: $DOMAIN${NC}"
echo -e "${YELLOW}Diretório: $APP_DIR${NC}"
echo ""

# Função para verificar se comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 1. Atualizar sistema
echo -e "${GREEN}[1/7] Atualizando sistema...${NC}"
sudo apt update && sudo apt upgrade -y

# 2. Instalar Node.js (v20 LTS)
echo -e "${GREEN}[2/7] Instalando Node.js...${NC}"
if ! command_exists node; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi
echo "Node.js versão: $(node -v)"
echo "NPM versão: $(npm -v)"

# 3. Instalar Nginx
echo -e "${GREEN}[3/7] Instalando Nginx...${NC}"
if ! command_exists nginx; then
    sudo apt install -y nginx
fi
sudo systemctl enable nginx
sudo systemctl start nginx

# 4. Instalar Certbot para SSL
echo -e "${GREEN}[4/7] Instalando Certbot...${NC}"
if ! command_exists certbot; then
    sudo apt install -y certbot python3-certbot-nginx
fi

# 5. Criar diretório da aplicação
echo -e "${GREEN}[5/7] Configurando diretório da aplicação...${NC}"
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

# 6. Configurar Nginx
echo -e "${GREEN}[6/7] Configurando Nginx...${NC}"

sudo tee /etc/nginx/sites-available/agendaberta > /dev/null <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;

    root $APP_DIR/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing - todas as rotas vão para index.html
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
EOF

# Ativar site
sudo ln -sf /etc/nginx/sites-available/agendaberta /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Testar e recarregar Nginx
sudo nginx -t && sudo systemctl reload nginx

# 7. Instruções finais
echo -e "${GREEN}"
echo "============================================"
echo "   Instalação concluída!"
echo "============================================"
echo -e "${NC}"

echo -e "${YELLOW}Próximos passos:${NC}"
echo ""
echo "1. Copie os arquivos do projeto para a VPS:"
echo "   scp -r ./dist/* usuario@sua-vps:$APP_DIR/dist/"
echo ""
echo "2. Ou clone o repositório e faça o build:"
echo "   cd $APP_DIR"
echo "   git clone SEU_REPO ."
echo "   npm install"
echo "   npm run build"
echo ""
echo "3. Configure SSL (HTTPS):"
echo "   sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo ""
echo "4. Configure renovação automática do SSL:"
echo "   sudo certbot renew --dry-run"
echo ""
echo -e "${GREEN}Acesse: http://$DOMAIN${NC}"
