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

**Neon (recommended)** — [Neon Console](https://console.neon.tech/app/projects/odd-sky-70753765) → Connection string → paste into `.env`:

```env
DATABASE_URL=postgresql://USER:PASSWORD@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require
GEMINI_API_KEY=your_key
VITE_API_BASE_URL=http://YOUR_SERVER_IP:3001
```

**Local PostgreSQL in Docker** — leave `DATABASE_URL` empty and use `--profile local-db`:

```env
PGPASSWORD=your_strong_password
GEMINI_API_KEY=your_key
VITE_API_BASE_URL=http://YOUR_SERVER_IP:3001
```

```bash
docker compose --profile prod --profile local-db up -d --build
```

## 2b. Neon setup (local dev without Docker DB)

1. Open [your Neon project](https://console.neon.tech/app/projects/odd-sky-70753765).
2. Copy **Connection string** (Node.js or psql) — it must include `?sslmode=require`.
3. Create `.env` from `.env.example` and set `DATABASE_URL=...`.
4. Run API + frontend:

```powershell
# Windows PowerShell
$env:DATABASE_URL='postgresql://...'; $env:API_PORT='3001'; $env:VITE_API_BASE_URL='http://localhost:3001'; npm run dev
```

Tables are created automatically on first API start (`initDb` in `server.js`).

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

## 5. Watchtower (Docker auto-update)

[Watchtower](https://containrrr.dev/watchtower/) watches Docker and can pull newer images from a registry and restart containers.

### With your current setup (GitHub Actions + `docker compose build`)

| Tool | Role |
|------|------|
| **GitHub Actions** | Deploys when you `git push` — pulls code, rebuilds images, restarts app |
| **Watchtower** | Only updates containers with label `com.centurylinklabs.watchtower.enable=true` |

`api`, `web-prod`, and `db` are labeled **`enable=false`** so Watchtower does **not** restart them automatically. Your main deploy path stays **GitHub Actions**.

Watchtower is included in `--profile prod` for later use (e.g. if you publish images to GitHub Container Registry).

### Enable Watchtower for a service (advanced)

Only if you pull images from Docker Hub / GHCR (not only local `build`):

```yaml
labels:
  - "com.centurylinklabs.watchtower.enable=true"
```

### Settings (`.env`)

```env
WATCHTOWER_POLL_INTERVAL=86400
TZ=Asia/Phnom_Penh
```

`86400` = check once per 24 hours.

**Warning:** Do not auto-update PostgreSQL in production without backups.

---

## 6. Local development (Docker)

```bash
cp .env.example .env
docker compose --profile dev up --build
```
