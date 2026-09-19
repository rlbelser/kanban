# Deployment (Docker, LAN)

The board lives entirely in the browser (localStorage + import/export), so the
server only serves the static Next.js build. No database is required.

## Prerequisites

- Docker and Docker Compose on the target server
- Node 22 (only needed to build the image; already bundled in the image)

## Build and run

From the repo root:

```bash
docker compose up -d --build
```

The app listens on port 3000. From another device on the LAN, open:

```
http://<server-ip>:3000
```

Check status:

```bash
docker compose ps
docker compose logs -f kanban
```

Stop it:

```bash
docker compose down
```

## Run on boot

`restart: unless-stopped` in `docker-compose.yml` already starts the container
when Docker starts. To make Docker itself start at boot:

```bash
sudo systemctl enable docker
```

After a reboot, Docker starts and restarts the `kanban` container automatically.
You can verify the policy with:

```bash
docker inspect --format='{{.HostConfig.RestartPolicy.Name}}' kanban
```

## Update after code changes

Rebuild and recreate the container:

```bash
docker compose up -d --build
```

## Notes

- To keep the app local-only (not visible on the LAN), change the port mapping
  in `docker-compose.yml` from `0.0.0.0:3000:3000` to `127.0.0.1:3000:3000`.
- Board data is stored per browser. Use the Export button to save a
  `kanban-board.json` file and Import it on another machine.
