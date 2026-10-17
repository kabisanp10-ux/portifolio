# Kabisan P | Personal Portfolio

> **BBA Student | Business Development | Leadership & Strategy**  
> PSG College of Arts and Science, Coimbatore

A modern, executive personal portfolio engineered with **TypeScript**, **Three.js**, **Vite**, and **Vanilla CSS**. Designed with an executive **60-30-10** color palette (Off-White, Deep Corporate Navy, and Matte Gold) and verified credential integration.

---

## ✨ Features

- **Executive Aesthetic**: 60% Off-White (`#F8F9FA`), 30% Deep Corporate Navy (`#0F172A`), and 10% Matte Gold (`#C6A15B`) luxury highlights.
- **Interactive 3D WebGL Background**: Custom Three.js particles and geometric wave field dynamically responsive to cursor motion and scroll velocity.
- **Verified Credentials & PDF Viewers**: Direct static asset links for official government, institutional, and university certificates:
  - ISO/IEC 17025:2017 Internal Auditor (MSME CFTI, Ministry of MSME, Govt. of India)
  - Wadhwani Foundation Ignite India 5.0 (NEN Course - 42 Hours)
  - NPTEL: Foundations of Accounting and Finance (IIT Madras & Swayam, MoE)
  - AICTE IDE Bootcamp Edition 3 (Phase 3), Ministry of Education, Shillong
  - Operations Lead Certificate of Recognition (PSG CAS CII&E)
- **Responsive Layout**: Zero horizontal overflow on mobile viewports, adaptive hamburger navigation drawer, and 3D card tilt interactions.
- **Contact Backend Integration**: Functional contact form with validation and local message queuing at `/api/contact`.

---

## 📁 Project Architecture

```
portifolio/
├── docs/                 # Documentation & high-resolution portrait assets
├── public/               # Verified certificates (PDFs) & web icons
├── src/
│   ├── components/       # UI Controllers (Navigation, ContactForm, CardTilt)
│   ├── styles/           # Modular CSS Design System (tokens, base, nav, sections, responsive)
│   ├── three/            # Interactive Three.js 3D WebGL Engine
│   ├── types/            # TypeScript data contracts & interfaces
│   ├── main.ts           # Orchestrator entry point
│   └── vite-env.d.ts     # Vite environment types
├── index.html            # Semantic HTML5 executive layout
├── vite.config.ts        # Bundler configuration with Three.js manual chunking
├── tsconfig.json         # Strict TypeScript configuration
└── package.json          # Package manifest & scripts
```

---

## 🛠️ Tech Stack

- **Core**: HTML5, TypeScript, Vanilla CSS
- **3D Graphics**: Three.js
- **Build Tool**: Vite
- **Typography**: Syne, Outfit, Plus Jakarta Sans (Google Fonts)

---

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (v18+) installed.

### Installation

```bash
# Clone the repository
git clone https://github.com/kabisanp10-ux/portifolio.git

# Navigate to project directory
cd portifolio

# Install dependencies
npm install
```

### Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Production Build

```bash
npm run build
```

The production assets will be output to the `dist/` directory.

---

## 📄 License

This project is personal and proprietary to Kabisan P. All rights reserved.
