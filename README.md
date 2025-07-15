# Email AI Assistant

A conversational AI assistant for managing emails through natural voice and text interactions. Built with React, Vite, Tailwind CSS, shadcn/ui, and Supabase.

## Features

- 🎤 **Voice-First Interface**: Primary interaction through speech using ElevenLabs
- 📧 **Email Management**: Triage, reply, summarize, and automate email tasks
- 🤖 **Natural Conversations**: Context-aware AI responses
- 📱 **Mobile-First Design**: Responsive UI optimized for all devices
- 🔐 **Secure Authentication**: User sessions managed with Supabase
- ⚡ **Real-time Updates**: Live conversation history and email sync

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (Auth, Database, Real-time)
- **Voice**: ElevenLabs (Speech-to-Text & Text-to-Speech)
- **Email Automation**: PicaOS integration
- **State Management**: React Context + Custom hooks

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- ElevenLabs API key
- PicaOS API access

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd email-ai-assistant
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Fill in your API keys and configuration:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `VITE_ELEVENLABS_API_KEY`: Your ElevenLabs API key
- `VITE_PICAOS_API_KEY`: Your PicaOS API key

4. Start the development server:
```bash
npm run dev
```

### Supabase Setup

1. Create a new Supabase project
2. Set up authentication (email/password)
3. Create the necessary database tables (see `/supabase/migrations`)
4. Configure Row Level Security (RLS) policies

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── ui/             # shadcn/ui components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and configurations
├── types/              # TypeScript type definitions
├── App.tsx             # Main application component
└── main.tsx            # Application entry point
```

## Key Features

### Voice Interaction
- Real-time speech-to-text using ElevenLabs
- Natural language processing for email commands
- Text-to-speech responses for accessibility

### Email Management
- Connect to Gmail and other email providers via PicaOS
- Intelligent email triage and categorization
- Automated responses and scheduling
- Email summarization and insights

### Conversation History
- Persistent chat history stored in Supabase
- Context-aware responses based on previous interactions
- Search and filter past conversations

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding New Components

Use shadcn/ui CLI to add new components:
```bash
npx shadcn-ui@latest add [component-name]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.