# Shree Durga Cloth Store — O2O Deadstock Clearance & 24h Reservation Platform

A 100% free-tier, zero-recurring-cost Online-to-Offline (O2O) clearance clothing platform built with Cloudflare Workers (Hono), Cloudflare D1 (SQLite), React, Tailwind CSS, and Capacitor.

## Architecture

- **`backend/`**: Cloudflare Workers API server running on Hono, backed by Cloudflare D1 SQLite database.
- **`customer-app/`**: Consumer clearance storefront with Flipkart/Amazon style bottom navigation, 24-hour free token reservation, instant discount + counter cashback calculation, and light/dark mode switch.
- **`merchant-portal/`**: Isolated admin portal for the showroom owner with dual photo upload (Camera Shot + Gallery/Files), stock management (delete/mark sold), and in-store QR token counter scanner.

## Tech Stack

- **Cloudflare Workers & D1**: 100% serverless, zero server cost.
- **React 18 & Vite**: Fast frontend bundling.
- **Tailwind CSS**: Clean responsive design with mobile-first layout.
- **Capacitor**: Android APK generation without web framework changes.
