# Deploy with GitHub Actions (CI/CD)

Repository: [SokHun-Mao/Khmer_Doc_Reader](https://github.com/SokHun-Mao/Khmer_Doc_Reader)

Every push to `main` runs `.github/workflows/deploy.yml`, SSHs into your server, pulls latest code, and runs Docker Compose (production profile).

## 1. GitHub Secrets

In the repo: **Settings → Secrets and variables → Actions → New repository secret**

| Secret | Example | Description |
|--------|---------|-------------|
| `SERVER_HOST` | `123.45.67.89` | Server IP or domain |
| `SERVER_USER` | `ubuntu` | SSH user |
| `SERVER_SSH_KEY` | `-----BEGIN OPENSSH PRIVATE KEY-----...` | Private SSH key (full content) |
| `SERVER_DEPLOY_PATH` | `/var/www/khmer-lesson-doc` | Optional. Default: `/var/www/khmer-lesson-doc` |

## 2. First-time setup on the server

```bash
sudo mkdir -p /var/www/khmer-lesson-doc
sudo chown $USER:$USER /var/www/khmer-lesson-doc
git clone https://github.com/SokHun-Mao/Khmer_Doc_Reader.git /var/www/khmer-lesson-doc
cd /var/www/khmer-lesson-doc
cp .env.example .env
# Edit .env: PGPASSWORD, GEMINI_API_KEY, VITE_API_BASE_URL (public API URL)
docker compose --profile prod up -d --build
```

Install on the server if needed: [Docker](https://docs.docker.com/engine/install/) and [Docker Compose](https://docs.docker.com/compose/install/).

### `.env` on the server (not in Git)

```env
PGPASSWORD=your_strong_password
GEMINI_API_KEY=your_key
VITE_API_BASE_URL=http://YOUR_SERVER_IP:3001
```

## 3. Deploy from your machine

```bash
git add .
git commit -m "update feature"
git push origin main
```

Watch progress: **GitHub → Actions** tab.

## 4. URLs after deploy

| Service | Port |
|---------|------|
| Web app | `http://SERVER_IP:3000` |
| API | `http://SERVER_IP:3001` |

Open firewall ports `3000` and `3001` (or put Nginx in front with HTTPS).

## 5. Local development (Docker)

```bash
cp .env.example .env
docker compose --profile dev up --build
```
