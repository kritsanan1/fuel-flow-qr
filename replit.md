# Project Documentation

## Overview
This is a full-stack JavaScript application that has been migrated from Lovable to Replit. The project uses:
- **Frontend**: React with TypeScript, Wouter for routing, TanStack Query for data fetching, Tailwind CSS + shadcn/ui for styling
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Environment**: Replit with proper client/server separation

## Project Architecture
- `client/`: React frontend application
  - `src/pages/`: Application pages (Index, NotFound)
  - `src/components/ui/`: shadcn/ui components
  - `src/lib/`: Utility functions and query client setup
  - `src/hooks/`: Custom React hooks
- `server/`: Express.js backend
  - `index.ts`: Main server setup
  - `routes.ts`: API route definitions
  - `storage.ts`: Database interface and memory storage implementation
  - `vite.ts`: Vite development server integration
- `shared/`: Shared types and schemas
  - `schema.ts`: Drizzle database schema definitions

## Recent Changes
- **January 20, 2025**: Successfully migrated from Lovable to Replit
  - Removed Supabase dependencies and configuration
  - Updated routing from React Router DOM to Wouter
  - Set up PostgreSQL database with Drizzle ORM
  - Configured proper client/server separation
  - All core dependencies installed and working

## User Preferences
- No specific user preferences recorded yet

## Database Schema
Currently contains a basic users table with:
- id (serial primary key)
- username (text, unique, not null)
- password (text, not null)

The application is ready for development with a clean foundation.