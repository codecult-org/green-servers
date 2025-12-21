# 🌱 Green Servers

A full-stack server monitoring platform for tracking CPU, memory, and disk usage across multiple servers with real-time alerts.

![Architecture](https://img.shields.io/badge/Architecture-Microservices-blue)
![Backend](https://img.shields.io/badge/Backend-Motia-green)
![Frontend](https://img.shields.io/badge/Frontend-Next.js_16-black)
![Agent](https://img.shields.io/badge/Agent-Python-yellow)

## 📋 Overview

Green Servers is a lightweight server monitoring solution consisting of three main components:

| Component | Technology | Description |
|-----------|------------|-------------|
| **API** | [Motia](https://motia.dev) + TypeScript | Event-driven backend with REST APIs |
| **Dashboard** | Next.js 16 + React 19 | Real-time metrics visualization |
| **Watcher** | Python CLI | Lightweight agent for collecting & pushing metrics |

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Dashboard     │     │      API        │     │    Watcher      │
│   (Next.js)     │────▶│    (Motia)      │◀────│   (Python)      │
│   Port: 3001    │     │   Port: 3000    │     │   CLI Agent     │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                        ┌────────▼────────┐
                        │    Supabase     │
                        │   (Database)    │
                        └─────────────────┘
```

### Data Flow

1. **Watcher Agent** collects system metrics (CPU, memory, disk, uptime)
2. **API** receives metrics via REST endpoint and stores in Supabase
3. **Event System** monitors thresholds and triggers email alerts
4. **Dashboard** displays real-time metrics and historical data

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.8+
- Redis (for Motia event queue)
- Supabase account (for database)
- Resend account (for email alerts)

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/green-servers.git
cd green-servers
```

### 2. Start Redis

```bash
# Using Docker
docker run -d --name redis -p 6379:6379 redis

# Or install locally (Ubuntu/Debian)
sudo apt install redis-server && sudo systemctl start redis
```

### 3. Setup API

```bash
cd api

# Install dependencies
npm install

# Configure environment variables
cp .env.sample .env
# Edit .env with your Supabase and Resend credentials

# Start development server
npm run dev
```

The API will be available at `http://localhost:3000` with the Motia Workbench for debugging workflows.

### 4. Setup Dashboard

```bash
cd app

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The dashboard will be available at `http://localhost:3001`.

### 5. Setup Watcher Agent

```bash
cd watcher

# Install as CLI tool
pip install -e .

# Login to your account
green-watcher login

# Start collecting metrics
green-watcher start
```

## 📁 Project Structure

```
green-servers/
├── api/                    # Motia backend API
│   ├── src/
│   │   ├── auth/           # Authentication endpoints
│   │   │   ├── login.step.ts
│   │   │   ├── register.step.ts
│   │   │   └── watcher-login.step.ts
│   │   ├── metrics/        # Metrics endpoints
│   │   │   ├── push-metrics.step.ts
│   │   │   ├── fetch-metrics.step.ts
│   │   │   ├── list-servers.step.ts
│   │   │   └── set-server-threshold.step.ts
│   │   ├── events/         # Event handlers
│   │   │   ├── monitor-metrics-event.step.ts
│   │   │   └── watcher-login-event.step.ts
│   │   ├── lib/            # Shared utilities
│   │   └── middlewares/    # Auth middleware
│   └── motia.config.ts     # Motia configuration
│
├── app/                    # Next.js dashboard
│   ├── app/
│   │   ├── dashboard/      # Metrics dashboard
│   │   └── login/          # Authentication
│   ├── components/         # React components
│   └── hooks/              # Custom hooks
│
├── watcher/                # Python monitoring agent
│   ├── main.py             # CLI entry point
│   ├── agent.py            # Metrics collection & pushing
│   ├── auth.py             # Authentication logic
│   └── config.py           # Configuration management
│
└── types/                  # Shared TypeScript types
```

## 🔌 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/login` | User authentication | ❌ |
| `POST` | `/register` | User registration | ❌ |
| `POST` | `/watcher-login` | Watcher agent authentication | ❌ |
| `POST` | `/push_metrics` | Push server metrics | ✅ |
| `GET` | `/fetch_metrics/:days` | Get metrics history | ✅ |
| `GET` | `/list_servers` | List monitored servers | ✅ |
| `POST` | `/set_server_threshold` | Configure alert thresholds | ✅ |

## ⚙️ Configuration

### Environment Variables

#### API (`api/.env`)

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-anon-key

# Resend (Email)
RESEND_API_KEY=re_your-api-key

# Redis (optional - defaults shown)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

#### Watcher (`~/.green-watcher/config.json`)

```json
{
  "endpoint": "http://localhost:3000",
  "interval": 10,
  "token": "your-jwt-token"
}
```

## 📊 Features

### Dashboard
- 📈 Real-time CPU, memory, and disk usage charts
- 🖥️ Multi-server monitoring
- 🎨 Beautiful animated UI with Framer Motion
- 🔐 JWT-based authentication

### Alert System
- ⚡ Event-driven threshold monitoring
- 📧 Email notifications via Resend
- 🎯 Customizable per-user thresholds

### Watcher Agent
- 🪶 Lightweight Python CLI
- 🔄 Automatic metric collection
- 🔑 Secure token-based authentication
- ⏱️ Configurable push intervals

## 🛠️ Development

### API Development

```bash
cd api

# Start with hot reload
npm run dev

# Generate TypeScript types from step configs
npm run generate-types

# Build for production
npm run build
```

### Dashboard Development

```bash
cd app

# Start development server
pnpm dev

# Build for production
pnpm build

# Run linting
pnpm lint
```

### Watcher Development

```bash
cd watcher

# Install in development mode
pip install -e .

# Run directly
python main.py start
```

## 🗄️ Database Schema (Supabase)

### Tables

**users** - Managed by Supabase Auth

**servers**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| userId | uuid | Foreign key to users |
| server_name | text | Hostname |
| created_at | timestamp | Creation date |

**server_metrics**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| server_id | uuid | Foreign key to servers |
| cpu | float | CPU usage % |
| memory | float | Memory usage % |
| disk | float | Disk usage % |
| uptime | int | Uptime in seconds |
| timestamp | timestamp | Metric timestamp |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Motia](https://motia.dev) - Unified backend framework
- [Next.js](https://nextjs.org) - React framework
- [Supabase](https://supabase.com) - Backend as a service
- [Resend](https://resend.com) - Email API
- [Framer Motion](https://www.framer.com/motion/) - Animation library