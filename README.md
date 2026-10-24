# BrightSmile Booking Studio

An appointment booking system for a fictional dental clinic: customers pick a service and dentist, choose an available time slot, and manage their booking from a private link. Staff get a calendar, booking management and a simple dashboard.

This is a portfolio demo. The clinic is fictional and all data is sample data.

## Status

The interface is built. A real backend (Neon Postgres, Drizzle, server-side booking rules) is being added in stages.

## Features

- Mobile-first booking flow: service, dentist (or anyone available), date and time, details, confirmation
- Cancel and reschedule
- Staff area: day and week calendar, booking details and statuses, services, dentists and working hours, dashboard

## Tech stack

React, TypeScript, TanStack Start, Vite, Tailwind CSS, Nitro (deployed on Vercel). Planned: PostgreSQL on Neon with Drizzle ORM.

## Local development

    npm install
    npm run dev

Requires Node 22.

## Deployment

(Keep the Vercel settings section from your current local README here.)