#!/bin/bash
# ================================================================
# SMART PCH — VPS DEPLOY SKRIPTI (Ubuntu 22.04+ / Debian 12+)
# ================================================================
# Bu skript serverni noldan sozlaydi:
#   1. Node.js 20, Nginx, PM2, SQLite3, Certbot
#   2. Loyihani /var/www/smartpch ga joylash
#   3. React frontendni build qilish
#   4. Nginx reverse proxy (HTTPS + WebSocket)
#   5. SSL sertifikat (Let's Encrypt)
#   6. PM2 bilan auto-start
#   7. Firewall (UFW) sozlash
# ================================================================
# ISHLATISH:
#   chmod +x deploy_vps.sh
#   sudo ./deploy_vps.sh
# ================================================================

set -e  # Xatolik bo'lsa to'xtash

# ==== SOZLAMALAR ====
DOMAIN="smartpch.uz"
APP_DIR="/var/www/smartpch"
APP_USER="smartpch"
NODE_VERSION="20"
PORT=6878

echo ""
echo "=========================================================="
echo "🚀 SMART PCH — DEPLOY BOSHLANDI"
echo "   Domen: $DOMAIN"
echo "   Papka: $APP_DIR"
echo "   Port:  $PORT"
echo "=========================================================="
echo ""

# ==== 1. TIZIMNI YANGILASH ====
echo "📦 [1/8] Tizim yangilanmoqda..."
apt update && apt upgrade -y

# ==== 2. PAKETLARNI O'RNATISH ====
echo "📦 [2/8] Kerakli paketlar o'rnatilmoqda..."

# Node.js
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
    apt-get install -y nodejs
fi
echo "   ✅ Node.js: $(node -v)"
echo "   ✅ npm:     $(npm -v)"

# Zaruriy paketlar
apt install -y git nginx sqlite3 build-essential certbot python3-certbot-nginx ufw

# PM2
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi
echo "   ✅ PM2:     $(pm2 -v)"

# ==== 3. FOYDALANUVCHI VA PAPKA ====
echo "📁 [3/8] Papka va foydalanuvchi tayyorlanmoqda..."

# Foydalanuvchi yaratish (agar yo'q bo'lsa)
if ! id "$APP_USER" &>/dev/null; then
    useradd -m -s /bin/bash "$APP_USER"
    echo "   ✅ Foydalanuvchi yaratildi: $APP_USER"
fi

mkdir -p "$APP_DIR"
chown -R "$APP_USER:$APP_USER" "$APP_DIR"

echo ""
echo "⚠️  MUHIM: Loyihani quyidagi usullardan biri bilan yuklang:"
echo "   A) Git: cd $APP_DIR && git clone <REPO_URL> ."
echo "   B) SCP: scp -r ./* root@<SERVER_IP>:$APP_DIR/"
echo ""

# Agar loyiha allaqachon yuklangan bo'lsa, davom etamiz
if [ -f "$APP_DIR/package.json" ]; then
    echo "   ✅ Loyiha topildi, o'rnatish davom etmoqda..."

    # ==== 4. NPM O'RNATISH VA BUILD ====
    echo "📦 [4/8] npm install va React build..."
    cd "$APP_DIR"
    sudo -u "$APP_USER" npm install --production=false
    sudo -u "$APP_USER" npm run frontend:build
    echo "   ✅ React build tayyor (dist/ papkada)"

    # ==== 5. .ENV SOZLASH ====
    echo "🔧 [5/8] .env production sozlamalari..."
    if [ ! -f "$APP_DIR/.env" ]; then
        JWT_KEY=$(node -e "console.log(require('crypto').randomBytes(48).toString('hex'))")
        cat > "$APP_DIR/.env" << ENVEOF
NODE_ENV=production
PORT=$PORT
ALLOWED_ORIGIN=https://$DOMAIN
JWT_SECRET=$JWT_KEY
WEATHER_API_KEY=
GEMINI_API_KEY=
DB_TYPE=sqlite
DB_PATH=$APP_DIR/server/smart_pch.db
ENVEOF
        echo "   ✅ .env yaratildi (JWT_SECRET avtomatik generatsiya qilindi)"
    else
        echo "   ℹ️  .env allaqachon mavjud, o'zgartirilmadi"
    fi
else
    echo "   ⚠️  package.json topilmadi. Avval loyihani yuklang, keyin qayta ishga tushiring."
fi

# ==== 6. NGINX SOZLASH ====
echo "🌐 [6/8] Nginx reverse proxy sozlanmoqda..."

cat > /etc/nginx/sites-available/smartpch << NGINXEOF
# ==================================================
# SMART PCH — Nginx Reverse Proxy
# ==================================================

# HTTP → HTTPS yo'naltirish
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;

    # Let's Encrypt tekshiruvi uchun
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # Qolgan barcha so'rovlarni HTTPS ga yo'naltirish
    location / {
        return 301 https://\$host\$request_uri;
    }
}

# HTTPS — Asosiy server bloki
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    # SSL sertifikatlar (Certbot tomonidan avtomatik qo'yiladi)
    # ssl_certificate     /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    # Xavfsizlik headerlari
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip siqish (tezlik uchun)
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;

    # Upload hajmi (25MB gacha)
    client_max_body_size 25M;

    # API va WebSocket — Node.js serverga proxy
    location / {
        proxy_pass http://127.0.0.1:$PORT;
        proxy_http_version 1.1;

        # WebSocket uchun zarur
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";

        # Asl mijoz ma'lumotlari
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # Proxy timeoutlar
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # Cache sozlamalari
        proxy_cache_bypass \$http_upgrade;
    }

    # Socket.IO alohida yo'l (WebSocket long-polling uchun)
    location /socket.io/ {
        proxy_pass http://127.0.0.1:$PORT/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # WebSocket uzoq kutish (Socket.IO heartbeat uchun)
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    # Statik fayllar uchun kesh (1 yil — hashed fayllarga)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://127.0.0.1:$PORT;
        proxy_set_header Host \$host;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
}
NGINXEOF

# Symlink yaratish
ln -sf /etc/nginx/sites-available/smartpch /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Nginx testdan o'tkazish
nginx -t && systemctl restart nginx
echo "   ✅ Nginx sozlandi va qayta ishga tushdi"

# ==== 7. SSL SERTIFIKAT (Let's Encrypt) ====
echo "🔐 [7/8] SSL sertifikat olish..."
echo ""
echo "   Quyidagi buyruqni serverdagi DNS tayyor bo'lgandan keyin bajaring:"
echo ""
echo "   sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos -m admin@$DOMAIN"
echo ""
echo "   Yoki hoziroq ishga tushiring (DNS tayyor bo'lsa):"
read -p "   SSL hozir olinsinmi? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos -m "admin@$DOMAIN" || {
        echo "   ⚠️  SSL olib bo'lmadi. DNS sozlamalarini tekshiring."
        echo "   DNS A record: $DOMAIN → Server IP manzili"
    }
fi

# ==== 8. PM2 VA FIREWALL ====
echo "🔥 [8/8] PM2 va Firewall sozlanmoqda..."

if [ -f "$APP_DIR/package.json" ]; then
    cd "$APP_DIR"
    sudo -u "$APP_USER" pm2 start ecosystem.config.js --env production
    sudo -u "$APP_USER" pm2 save
    # Tizim qayta ishga tushganda avtomatik start
    env PATH=$PATH:/usr/bin pm2 startup systemd -u "$APP_USER" --hp "/home/$APP_USER"
    echo "   ✅ PM2 ishga tushdi va startup sozlandi"
fi

# UFW Firewall
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable
echo "   ✅ Firewall yoqildi (SSH + HTTP/HTTPS)"

echo ""
echo "=========================================================="
echo "🎉 DEPLOY MUVAFFAQIYATLI YAKUNLANDI!"
echo "=========================================================="
echo ""
echo "   🌐 Sayt:     https://$DOMAIN"
echo "   🔌 API:      https://$DOMAIN/api"
echo "   📊 PM2:      pm2 status / pm2 logs"
echo "   🔐 SSL:      certbot renew (avtomatik)"
echo ""
echo "   📱 MOBIL: Telefondan https://$DOMAIN ni oching,"
echo "       keyin 'Bosh ekranga qo'shish' tugmasini bosing."
echo ""
echo "=========================================================="
