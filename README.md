# Hydel Marketing & Services — Industrial Sealing Solutions Platform

<p align="center">
  <img src="https://hydel.co.in/hydel.png" alt="Hydel Marketing & Services" width="220" />
</p>

<p align="center">
  <strong>Modern industrial website and secure content-management platform for Hydel Marketing & Services.</strong>
</p>

<p align="center">
  Built with Next.js, React, TypeScript, Firebase, Cloudinary, and modern web technologies.
</p>

---

## About Hydel

**Hydel Marketing & Services** is an industrial sealing-solutions business focused on gaskets, seals, and related products for demanding industrial applications.

This project provides the digital platform for presenting Hydel's products, communicating its capabilities, receiving customer inquiries, and managing website content through a protected administration system.

Website: https://hydel.co.in/

---

## What This Project Does

The application combines a public-facing corporate website with a protected administrative platform.

### Public Website

- Professional Hydel company website
- Product catalogue and product detail pages
- Product categories for industrial sealing solutions
- Company/about information
- Client and brand showcase
- Marketing carousel for featured content
- Customer inquiry/contact functionality
- WhatsApp contact integration
- SEO metadata and Open Graph configuration
- Structured data for search engines
- Responsive design for desktop and mobile devices

### Admin Platform

The protected admin area allows authorized administrators to:

- Manage products
- Create, edit, restore, and reorder products
- Manage homepage carousel content
- Review and manage customer inquiries
- Add notes to inquiries
- Manage administrative users
- Use multi-factor authentication (MFA)
- View dashboard information
- Manage website content without changing application code

---

# Technology Stack

## Frontend

| Technology | Purpose |
|---|---|
| **Next.js 16** | Full-stack React framework, routing, server rendering and API routes |
| **React 19** | Component-based user interface |
| **TypeScript** | Type-safe application development |
| **Tailwind CSS 4** | Utility-first styling |
| **Inter** | Primary interface typography |
| **Font Awesome / React Icons** | UI icons |
| **Recharts** | Dashboard/data visualization |

## Backend & Application Layer

| Technology | Purpose |
|---|---|
| **Next.js Server/API Routes** | Backend endpoints and server-side application logic |
| **Node.js 20+** | Runtime environment |
| **Zod** | Request/data validation |
| **server-only** | Helps prevent server-only modules from being used in client code |

## Database & Authentication

| Technology | Purpose |
|---|---|
| **Firebase Admin SDK** | Secure server-side access to Firebase services |
| **Cloud Firestore** | Product, inquiry, carousel and application data |
| **Firebase Authentication** | Administrative authentication |
| **TOTP MFA** | Additional authentication protection for administrator accounts |
| **Firestore Security Rules** | Defense-in-depth protection; direct browser Firestore access is denied |

The application intentionally keeps Firestore access on the server through the Firebase Admin SDK rather than exposing direct browser database operations.

## Media & Storage

**Cloudinary** is used for managed media handling and image uploads, allowing product and website media to be managed without storing large media files directly inside the application repository.

## Email

The project includes email functionality using:

- **Nodemailer**
- **Resend**
- **emailjs-com**

These services support inquiry-related email communication and notifications depending on the configured application flow.

## Security & Validation

Security-related technologies and practices used in the project include:

- Server-side Firebase Admin SDK
- Protected admin routes
- Authentication
- TOTP-based MFA
- Zod input validation
- Server-only modules
- Environment-based secrets
- Firestore deny-by-default rules
- Separate public and protected application areas
- Controlled API routes for administrative operations

> **Important:** Security depends on correct production configuration. Never commit `.env`, Firebase private keys, Cloudinary secrets, Gmail passwords/app passwords, or other credentials to source control.

---

# Architecture Overview

```text
                         ┌─────────────────────┐
                         │     Web Browser      │
                         └──────────┬──────────┘
                                    │
                         HTTPS / Next.js
                                    │
                    ┌───────────────▼───────────────┐
                    │        Next.js Application     │
                    │                               │
                    │  Public Website              │
                    │  Admin Dashboard              │
                    │  Server Components            │
                    │  API Routes                   │
                    └───────┬───────────┬───────────┘
                            │           │
                ┌───────────▼───┐   ┌──▼────────────────┐
                │ Firebase Admin │   │    Cloudinary     │
                │    / Auth      │   │ Media Management  │
                └───────┬────────┘   └───────────────────┘
                        │
                ┌───────▼────────┐
                │  Cloud Firestore│
                │ Products        │
                │ Inquiries       │
                │ Carousel Data   │
                │ Admin Data      │
                └─────────────────┘
```

---

# Project Structure

```text
Hydel-main/
├── public/
│   ├── home-images/
│   ├── products-images/
│   ├── hydel.png
│   └── hydel-logo.png
│
├── scripts/
│   ├── create-admin.ts
│   ├── enable-totp-mfa.ts
│   ├── loadEnv.ts
│   └── migrate-products.ts
│
├── src/
│   ├── app/
│   │   ├── aboutus/
│   │   ├── admin/
│   │   ├── api/
│   │   └── components/
│   │
│   ├── lib/
│   │   └── repositories/
│   │
│   └── types/
│
├── firestore.rules
├── middleware.ts
├── next.config.ts
├── package.json
├── package-lock.json
├── postcss.config.mjs
├── .env.example
└── README.md
```

---

# Requirements

Before running the project locally, install:

- **Node.js 20.19.0 or newer**
- **npm**
- A Firebase project
- A Cloudinary account/configuration
- An email provider configuration if email notifications are required

The required Node.js version is defined in `package.json`.

---

# Installation

Clone or obtain the project source, then install dependencies:

```bash
npm install
```

Create your local environment file:

```bash
cp .env.example .env.local
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Fill in the required environment variables in `.env.local`.

---

# Environment Configuration

The project uses environment variables for external services and secrets.

Important configuration areas include:

### Firebase

```text
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

### Cloudinary

```text
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

### Email

```text
GMAIL_USER
GMAIL_PASSWORD
INQUIRY_NOTIFICATION_EMAIL
```

Refer to `.env.example` for the complete configuration template.

**Never publish real secret values in GitHub, screenshots, documentation, issues, or public deployments.**

---

# Development

Start the development server:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

The project uses the Next.js development server with Turbopack.

---

# Production Build

Create a production build:

```bash
npm run build
```

Start the production server:

```bash
npm run start
```

---

# Available Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run linting |
| `npm run migrate:products` | Run the product migration script |
| `npm run admin:create` | Create/configure an admin account |
| `npm run admin:enable-mfa` | Enable TOTP MFA for an admin account |

---

# Administration & MFA

The project includes a dedicated protected administration system.

Administrative functionality includes:

- Authentication
- Protected admin routes
- Product management
- Carousel management
- Inquiry management
- User management
- TOTP-based MFA enrollment
- Dashboard functionality

Administrative access should only be granted to trusted personnel.

---

# SEO & Web Presence

The website includes several SEO-oriented features:

- Page metadata
- Canonical URLs
- Open Graph metadata
- Robots configuration
- Organization structured data
- Hydel branding and logo metadata
- Product and company-focused keywords
- Responsive layouts
- Semantic page sections

The Hydel logo is also used as the site's favicon/Open Graph branding where configured.

---

# Branding

The project is built specifically for **Hydel Marketing & Services**.

Hydel logo:

https://hydel.co.in/hydel.png

Hydel website:

https://hydel.co.in/

The Hydel name, logo, trademarks, product photography, marketing assets, written content, and other proprietary brand materials remain the property of their respective owners and are not granted for reuse under this repository's code license.

---

# Deployment

This is a Next.js application and can be deployed on a compatible Node.js hosting platform.

For production deployment:

1. Configure all required environment variables.
2. Configure Firebase Authentication and Firestore.
3. Configure Firebase Admin credentials securely.
4. Configure Cloudinary.
5. Configure email services.
6. Deploy the application.
7. Verify admin authentication and MFA.
8. Verify Firestore access rules.
9. Test product management and customer inquiries.
10. Confirm that no secrets are exposed in the client bundle or repository.

---

# Security Notice

This repository contains application source code that handles authentication, administrative functionality, customer inquiries, database access, and external service credentials.

Before production deployment:

- Use strong administrator credentials.
- Enable MFA.
- Keep Firebase service-account credentials private.
- Keep Cloudinary API secrets private.
- Use secure production environment variables.
- Do not commit `.env.local`.
- Review API authorization.
- Review Firebase configuration.
- Keep dependencies updated.
- Use HTTPS in production.
- Restrict administrative access to authorized personnel.

---

# License & Copyright

## PROPRIETARY — ALL RIGHTS RESERVED

**Copyright © 2026 Hydel Marketing & Services. All rights reserved.**

This software and its source code are **proprietary and confidential**.

**No permission is granted to any person or organization to use, copy, reproduce, modify, adapt, merge, publish, distribute, sublicense, sell, lease, transfer, reverse engineer, or create derivative works from this source code or any substantial portion of it, whether commercially or non-commercially, without prior written permission from the copyright owner.**

Access to this repository or source code does **not** grant any license or ownership rights.

The following are also protected and may not be reused without authorization:

- Source code
- Application architecture
- UI/UX implementation
- Website design
- Hydel branding
- Hydel logo
- Product images and media
- Marketing content
- Database structure
- Administrative system
- Custom components
- API implementation
- Configuration and deployment logic

Any unauthorized use, copying, redistribution, publication, modification, or commercial exploitation is prohibited.

For licensing or authorized use, contact the copyright owner directly.

**This project is not open source.**

---

# Third-Party Software

This project uses third-party open-source packages. Those packages remain subject to their own respective licenses.

The proprietary license in this repository applies to the **Hydel application source code and proprietary assets**, and does not attempt to override the licenses of third-party dependencies.

See `package.json` and `package-lock.json` for the dependency set.

---

# Ownership

**Project:** Hydel Marketing & Services Website & Admin Platform  
**Organization:** Hydel Marketing & Services  
**Website:** https://hydel.co.in/  
**Copyright:** © 2026 Hydel Marketing & Services  
**License:** Proprietary — All Rights Reserved

---

<p align="center">
  <strong>Hydel Marketing & Services</strong><br />
  Industrial Gaskets • Sealing Solutions • Industrial Products
</p>
