#!/bin/bash
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive

echo "=== Waiting for apt lock ==="
for i in $(seq 1 30); do
  if ! fuser /var/lib/apt/lists/lock /var/lib/dpkg/lock /var/lib/dpkg/lock-frontend >/dev/null 2>&1; then
    break
  fi
  echo "Apt is locked, waiting... ($i/30)"
  sleep 5
done

echo "=== Installing Node.js 22 ==="
for i in 1 2 3; do
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && break
  echo "Retry $i: nodesource setup failed"
  sleep 5
done
apt-get install -y nodejs nginx

echo "=== Cloning repo ==="
cd /opt
rm -rf app
for i in 1 2 3 4 5; do
  git clone https://github.com/puppies-inc/storejs.git app && break
  echo "Retry $i: git clone failed"
  rm -rf app
  sleep 10
done

cd app
echo "=== Checking out PR #${PR_NUMBER} ==="
git fetch origin "pull/${PR_NUMBER}/head:pr-branch"
git checkout pr-branch

echo "=== Installing dependencies ==="
npm install --production

echo "=== Creating systemd service ==="
cat > /etc/systemd/system/storejs.service << 'EOF'
[Unit]
Description=StoreJS
After=network.target
[Service]
Type=simple
User=root
WorkingDirectory=/opt/app
ExecStart=/usr/bin/node src/server.js
Restart=always
Environment=PORT=3000
Environment=NODE_ENV=production
[Install]
WantedBy=multi-user.target
EOF

echo "=== Configuring nginx ==="
cat > /etc/nginx/sites-available/storejs << 'EOF'
server {
    listen 80 default_server;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF

rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/storejs /etc/nginx/sites-enabled/

echo "=== Starting services ==="
systemctl daemon-reload
systemctl enable storejs nginx
systemctl restart storejs
sleep 2
systemctl restart nginx

echo "=== Health check ==="
HTTP_STATUS=000
for i in $(seq 1 30); do
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ || true)
  if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "302" ]; then
    break
  fi
  sleep 2
done

if [ "$HTTP_STATUS" != "200" ] && [ "$HTTP_STATUS" != "302" ]; then
  echo "Preview setup FAILED - health check returned HTTP $HTTP_STATUS"
  systemctl status storejs --no-pager -l || true
  journalctl -u storejs -n 40 --no-pager || true
  exit 1
fi

echo "SETUP_COMPLETE"
