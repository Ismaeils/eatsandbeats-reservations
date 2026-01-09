# Docker Setup Guide

This guide explains how to run the Eats & Beats Reservations application using Docker and Docker Compose.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+

## Quick Start

### 1. Create Environment File

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-password
POSTGRES_DB=eatsandbeats
POSTGRES_PORT=5432

# Application Configuration
APP_PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Payment and Messaging
PAYMENT_GATEWAY_PROVIDER=stripe
PAYMENT_GATEWAY_API_KEY=
MESSAGING_PROVIDER=whatsapp
MESSAGING_API_KEY=
```

### 2. Build and Start Services

```bash
# Build and start all services
docker-compose up -d

# Or use the npm script
npm run docker:up
```

This will:
- Build the Next.js application
- Start PostgreSQL database
- Run database migrations
- Start the application on port 3000

### 3. Access the Application

- **Application**: http://localhost:3000
- **Database**: localhost:5432

### 4. View Logs

```bash
# View all logs
docker-compose logs -f

# View app logs only
docker-compose logs -f app

# Or use the npm script
npm run docker:logs
```

## Development Setup

For development, you can run only the PostgreSQL database and pgAdmin in Docker and run the Next.js app locally:

```bash
# Start PostgreSQL and pgAdmin
docker-compose -f docker-compose.dev.yml up -d

# Or use the npm script
npm run docker:dev

# Run the app locally
npm install
npm run db:push
npm run dev
```

### Accessing pgAdmin

Once the containers are running, you can access pgAdmin at:
- **URL**: http://localhost:5050 (or the port specified in `PGADMIN_PORT`)
- **Email**: `admin@admin.com` (or your `PGADMIN_EMAIL`)
- **Password**: `admin` (or your `PGADMIN_PASSWORD`)

### Connecting to Database in pgAdmin

1. Right-click on "Servers" in the left panel
2. Select "Create" → "Server"
3. In the "General" tab:
   - Name: `Eats & Beats Dev` (or any name)
4. In the "Connection" tab:
   - Host name/address: `postgres` (the service name in docker-compose)
   - Port: `5432`
   - Maintenance database: `eatsandbeats`
   - Username: `postgres`
   - Password: `postgres` (or your `POSTGRES_PASSWORD`)
5. Click "Save"

## Docker Commands

### Build Images

```bash
docker-compose build
# Or
npm run docker:build
```

### Start Services

```bash
docker-compose up -d
# Or
npm run docker:up
```

### Stop Services

```bash
docker-compose down
# Or
npm run docker:down
```

### View Logs

```bash
docker-compose logs -f
# Or
npm run docker:logs
```

### Access Database

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U postgres -d eatsandbeats

# Or use Prisma Studio
docker-compose exec app npx prisma studio
```

### Run Database Migrations

```bash
# Run migrations in the container
docker-compose exec app npx prisma migrate deploy

# Or push schema changes
docker-compose exec app npx prisma db push
```

## Troubleshooting

### Database Connection Issues

If the app can't connect to the database:

1. Check if PostgreSQL is running:
   ```bash
   docker-compose ps
   ```

2. Check database logs:
   ```bash
   docker-compose logs postgres
   ```

3. Verify the DATABASE_URL in the app container:
   ```bash
   docker-compose exec app printenv DATABASE_URL
   ```

### Application Won't Start

1. Check application logs:
   ```bash
   docker-compose logs app
   ```

2. Rebuild the image:
   ```bash
   docker-compose build --no-cache app
   docker-compose up -d app
   ```

### Reset Everything

To completely reset and start fresh:

```bash
# Stop and remove containers, networks, and volumes
docker-compose down -v

# Rebuild and start
docker-compose up -d --build
```

## Production Considerations

For production deployment:

1. **Use strong passwords**: Update `POSTGRES_PASSWORD` and `JWT_SECRET` with secure values
2. **Use environment-specific configs**: Create separate `.env.production` file
3. **Enable SSL**: Configure PostgreSQL with SSL certificates
4. **Resource limits**: Add resource limits to docker-compose.yml:
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '1'
         memory: 1G
   ```
5. **Backup strategy**: Set up regular database backups
6. **Monitoring**: Add health checks and monitoring tools
7. **Reverse proxy**: Use nginx or similar for SSL termination

## Volume Persistence

The PostgreSQL data is persisted in a Docker volume named `postgres_data`. To backup:

```bash
# Backup
docker run --rm -v eatsandbeats-reservations_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-backup.tar.gz /data

# Restore
docker run --rm -v eatsandbeats-reservations_postgres_data:/data -v $(pwd):/backup alpine sh -c "cd /data && tar xzf /backup/postgres-backup.tar.gz"
```

## Clean Up

To remove all containers, networks, and volumes:

```bash
docker-compose down -v
```

To also remove the built images:

```bash
docker-compose down -v --rmi all
```

