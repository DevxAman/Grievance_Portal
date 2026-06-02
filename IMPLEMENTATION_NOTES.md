# GNDEC Grievance Redressal Portal - Supabase Implementation

## Overview

This document provides an overview of the Supabase implementation for the GNDEC Grievance Redressal Portal.

## Architecture

1. **Frontend**: React with TypeScript and Vite
2. **Database & Backend**: Supabase (PostgreSQL)
3. **Authentication**: Supabase Auth
4. **Storage**: Supabase Storage
5. **Styling**: Tailwind CSS
6. **Real-time Updates**: Supabase Realtime

## Database Schema

### Tables

1. **users**
   - id (UUID, PK)
   - email (TEXT)
   - name (TEXT)
   - role ('student' | 'clerk' | 'admin' | 'dsw')
   - phone_number (TEXT)
   - college_roll_number (TEXT, optional)
   - created_at (TIMESTAMP)

2. **grievances**
   - id (UUID, PK)
   - user_id (UUID, FK to users)
   - title (TEXT)
   - description (TEXT)
   - category ('academic' | 'infrastructure' | 'administrative' | 'financial' | 'other')
   - status ('pending' | 'under-review' | 'in-progress' | 'resolved' | 'rejected')
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)
   - assigned_to (UUID, FK to users, optional)
   - documents (TEXT[])
   - feedback (TEXT, optional)

3. **responses**
   - id (UUID, PK)
   - grievance_id (UUID, FK to grievances)
   - admin_id (UUID, FK to users)
   - response_text (TEXT)
   - created_at (TIMESTAMP)

4. **statistics**
   - id (UUID, PK)
   - resolution_rate (NUMERIC)
   - avg_response_time (NUMERIC)
   - grievances_resolved (INTEGER)
   - user_satisfaction (NUMERIC)
   - last_updated (TIMESTAMP)

## Row-Level Security (RLS)

### User Policies
- Users can view and update only their own profiles
- Admins and DSW users can view all user profiles

### Grievance Policies
- Students can view and update only their own grievances
- Staff (admin, clerk, DSW) can view and manage all grievances

### Response Policies
- Students can view only responses to their grievances
- Staff can add and view all responses

### Statistics Policies
- Everyone can view statistics
- Only admins can update statistics

## Triggers and Functions

1. **update_updated_at_column**: Automatically updates the `updated_at` timestamp on grievances when they're modified

2. **update_statistics_on_resolution**: Automatically updates statistics when a grievance is marked as resolved

## Real-time Features

1. **Grievance Updates**: Real-time updates to grievance statuses and responses using Supabase Realtime

2. **Statistics Updates**: Real-time updates to portal statistics with auto-refresh every 2 minutes

## UI/UX Enhancements

1. **Hero Section**: Added a blurred campus background with modern glass morphism effects

2. **Statistics Section**: Added a live statistics section with refresh functionality

3. **Cards and Buttons**: Enhanced with gradients, hover effects, and micro-interactions

4. **Animations**: Added spring animations for smooth content transitions

## Setup Instructions

1. **Supabase Setup**
   - Create a new Supabase project
   - Run the migration in `supabase/migrations/20230101000000_initial_schema.sql`
   - Create a storage bucket named `grievance-documents` with public access
   - (Optional) Run `supabase/init.sql` for test data

2. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Add your Supabase URL and anon key

3. **Installation**
   - Run `npm install`
   - Run `npm run dev` for development

## Conclusion

This implementation provides a complete solution for the GNDEC Grievance Redressal Portal using Supabase as the backend. The system maintains all the existing features while adding real-time capabilities and enhanced security through Row-Level Security policies. 