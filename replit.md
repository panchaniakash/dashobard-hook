# Overview

This is a full-stack analytics dashboard application built with React/TypeScript on the frontend and Express/Node.js on the backend. The application displays business analytics data with interactive filtering capabilities and real-time data visualization. It features a modern UI built with shadcn/ui components and Tailwind CSS, with performance optimizations including caching, lazy loading, and debounced interactions.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Routing**: wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management with built-in caching
- **UI Framework**: shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **Performance**: Custom hooks for performance monitoring, frontend caching layer, and debounced user interactions

## Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Database Integration**: SQL Server with connection pooling via mssql package
- **API Design**: RESTful endpoints with POST-based data fetching for complex filter parameters
- **Caching Strategy**: Server-side in-memory caching with TTL for frequently accessed data
- **Middleware**: Compression, custom logging, and CORS handling

## Data Storage Solutions
- **Primary Database**: Microsoft SQL Server for analytics data storage
- **ORM/Query Builder**: Drizzle ORM configured for PostgreSQL (though currently using SQL Server via direct queries)
- **Caching**: Multi-layer caching with both frontend and backend in-memory stores
- **Session Management**: Configured for PostgreSQL session storage via connect-pg-simple

## Authentication and Authorization
- **User Management**: Basic user schema with username/password authentication
- **Session Handling**: Express sessions with PostgreSQL store
- **Authorization**: Bucket-based access control with user-level filtering
- **Security**: CORS configuration with allowed origins for production deployments

## External Dependencies
- **Database**: Neon Database (PostgreSQL) for user data and sessions
- **UI Components**: Radix UI for accessible component primitives
- **Charts/Visualization**: Configured for chart libraries (ApexCharts references in CSS)
- **Styling**: Tailwind CSS with custom design system variables
- **Build Tools**: Vite with React plugin and TypeScript support
- **Development**: Replit-specific plugins for development environment integration

The application follows a component-based architecture with clear separation of concerns between data fetching, state management, and UI rendering. The system is optimized for performance with strategic caching at multiple levels and implements modern React patterns for efficient rendering and user experience.