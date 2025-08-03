# Overview

This is a high-performance analytics dashboard application built with React/JavaScript on the frontend and Express/Node.js on the backend. The application displays business analytics data with interactive filtering capabilities and real-time data visualization. It features comprehensive performance optimizations including multi-layer caching, connection pooling, debounced operations, and lazy loading for maximum responsiveness.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with JavaScript (ES6+) using Vite as the build tool
- **Routing**: wouter for lightweight client-side routing
- **State Management**: Custom state management with React hooks and context
- **UI Framework**: shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **Performance**: Advanced performance optimizations including:
  - Client-side caching with localStorage persistence
  - Debounced filter updates (300ms delay)
  - Lazy loading with Intersection Observer
  - Performance tracking and metrics
  - Memory management utilities
  - Request batching and optimization

## Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Database Integration**: Microsoft SQL Server with advanced connection pooling
  - Pool configuration: 10 max connections, 30s idle timeout
  - Query optimization with indexed column usage
  - Connection retry logic and error handling
- **API Design**: RESTful endpoints optimized for performance
- **Caching Strategy**: Multi-layer caching system:
  - Server-side in-memory cache with TTL (5 minutes default)
  - Automatic cache cleanup and size management
  - Cache hit/miss tracking for performance monitoring
- **Performance Optimizations**:
  - Request compression with configurable thresholds
  - Debounced API calls to prevent overload
  - Query optimization with proper indexing
  - Connection pooling with retry mechanisms

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

The application follows a component-based architecture with clear separation of concerns between data fetching, state management, and UI rendering. The system is heavily optimized for performance with strategic caching at multiple levels, implements modern React patterns for efficient rendering, and includes comprehensive performance monitoring and optimization utilities.

## Recent Performance Optimizations (January 2025)
- **Database Layer**: Implemented connection pooling with 10 max connections and 30s idle timeout
- **Caching System**: Multi-layer caching with server-side (5min TTL) and client-side (localStorage persistence)
- **Filter Performance**: Added 300ms debouncing to prevent excessive API calls during rapid filter changes
- **UI Responsiveness**: Smooth loading states with cache indicators and performance metrics display
- **Memory Management**: Client-side cache cleanup and memory usage monitoring
- **Request Optimization**: Batch processing, timeout handling, and retry mechanisms
- **Performance Tracking**: Real-time metrics for load times, cache hits, API calls, and filter updates

## Key Performance Features
- Cache hit rate monitoring and display
- Real-time performance metrics in dashboard header
- Optimized SQL queries using indexed columns
- Lazy loading with Intersection Observer
- Request batching and throttling
- Memory usage tracking and cleanup
- Smooth transitions and loading states