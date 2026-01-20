# Marmita Express - Sistema de Gestão de Pedidos

## Overview
A web-based meal ordering system ("marmita" means lunch box in Portuguese) built with React, TypeScript, and Vite. The system allows customers to place orders for customized meal boxes and includes an admin panel for menu management and order reports.

## Features
- Order placement with customizable meal options (Principal, Mistura, Guarnição, Salada)
- Admin login for restricted access to reports and settings
- Menu management with AI-powered suggestions (requires Gemini API key)
- Order reports and daily tracking
- Employee management
- Company name customization
- Mobile-responsive design

## Tech Stack
- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS (via CDN)
- **Icons**: Lucide React
- **AI Integration**: Google Gemini API (optional)

## Project Structure
```
/
├── index.html          # Entry HTML file
├── index.tsx           # React entry point
├── App.tsx             # Main application component
├── types.ts            # TypeScript type definitions
├── constants.ts        # Initial menu and config data
├── components/
│   ├── Login.tsx       # Admin login component
│   ├── MenuManager.tsx # Menu and settings management
│   ├── OrderForm.tsx   # Customer order form
│   └── OrderList.tsx   # Order reports list
└── services/
    └── geminiService.ts # Gemini AI integration
```

## Running the App
The app runs on port 5000 using Vite's development server:
```bash
npm run dev
```

## Environment Variables
- `GEMINI_API_KEY` - (Optional) Google Gemini API key for AI-powered menu suggestions

## Deployment
The app is configured for static deployment. Build with:
```bash
npm run build
```
Output is in the `dist` directory.

## Data Persistence
- All data is stored in browser localStorage
- Orders reset daily
- Login session uses sessionStorage
