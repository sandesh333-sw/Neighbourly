# Neighbourly 🏠

A community-powered rental platform built with Node.js, Express, and MongoDB.

## Features

- 🏘️ Browse and create rental listings
- 👥 Community forums and discussions
- 💬 AI-powered chat assistant (optional)
- 🔐 User authentication and authorization
- 📱 Responsive modern UI

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or remote)

### Installation

1. Clone and navigate to the project:
```bash
cd Neighbourly
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

5. Visit http://localhost:8080

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `SESSION_SECRET` | Yes | Secret key for session encryption |
| `PORT` | No | Server port (default: 8080) |
| `NODE_ENV` | No | Environment (development/production) |
| `DEEPSEEK_API_KEY` | No | API key for AI chat feature |

## Health Check

Check server status at: `http://localhost:8080/health`

## Project Structure

```
Neighbourly/
├── controllers/     # Route controllers
├── models/         # Mongoose models
├── routes/         # Express routes
├── views/          # EJS templates
├── middleware/     # Custom middleware
├── public/         # Static files
└── app.js          # Main application file
```

## Security Features

- ✅ HttpOnly cookies
- ✅ Session encryption
- ✅ Environment-based security settings
- ✅ Protected sensitive files (.env in .gitignore)

## License

ISC

