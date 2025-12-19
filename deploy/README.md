# Deploy Agendaberta na VPS

## Requisitos
- Ubuntu 20.04+ ou Debian 11+
- Acesso root ou sudo
- Domínio apontando para o IP da VPS

## Instalação Rápida

### 1. Conecte na VPS
```bash
ssh usuario@sua-vps
```

### 2. Baixe e execute o instalador
```bash
# Baixe os scripts
curl -O https://raw.githubusercontent.com/SEU_USUARIO/SEU_REPO/main/deploy/install.sh
curl -O https://raw.githubusercontent.com/SEU_USUARIO/SEU_REPO/main/deploy/deploy.sh

# Dê permissão de execução
chmod +x install.sh deploy.sh

# Execute a instalação (substitua pelo seu domínio)
./install.sh agendaberta.com.br
```

### 3. Copie os arquivos do projeto

**Opção A - Via SCP (do seu computador):**
```bash
# Primeiro, gere o build localmente
npm run build

# Copie para a VPS
scp -r dist/* usuario@sua-vps:/var/www/agendaberta/dist/
```

**Opção B - Via Git (na VPS):**
```bash
cd /var/www/agendaberta
git clone https://github.com/SEU_USUARIO/SEU_REPO .
npm install
npm run build
```

### 4. Configure HTTPS (SSL)
```bash
sudo certbot --nginx -d agendaberta.com.br -d www.agendaberta.com.br
```

## Variáveis de Ambiente

As variáveis já estão configuradas no build:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

## Atualizações

Para atualizar a aplicação após mudanças:
```bash
cd /var/www/agendaberta
./deploy.sh
```

Ou manualmente:
```bash
git pull
npm install
npm run build
sudo systemctl reload nginx
```

## Estrutura de Arquivos
```
/var/www/agendaberta/
├── dist/           # Arquivos de produção (servidos pelo Nginx)
├── src/            # Código fonte (se usar git)
├── deploy.sh       # Script de atualização
└── ...
```

## Nginx

Configuração: `/etc/nginx/sites-available/agendaberta`

### Comandos úteis
```bash
# Testar configuração
sudo nginx -t

# Recarregar
sudo systemctl reload nginx

# Ver logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

## SSL/HTTPS

O certificado é renovado automaticamente pelo Certbot.

### Verificar renovação
```bash
sudo certbot renew --dry-run
```

## Troubleshooting

### Página em branco
- Verifique se os arquivos estão em `/var/www/agendaberta/dist/`
- Verifique permissões: `sudo chown -R www-data:www-data /var/www/agendaberta`

### Erro 404 nas rotas
- Confirme que o Nginx está redirecionando para `index.html`
- Teste: `sudo nginx -t`

### Problemas de conexão com Supabase
- Verifique se as variáveis de ambiente estão no build
- Limpe o cache do navegador
