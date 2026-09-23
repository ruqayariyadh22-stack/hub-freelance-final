# Freelance Hub — Unified React Project

This project combines the Client, Freelancer, and Admin interfaces into one Vite + React application.

## Workspaces
- `/` — Welcome / Login for Client and Freelancer
- `/client` — Client workspace
- `/freelancer` — Freelancer workspace
- `/admin/dashboard` — Separate Admin workspace

## Run
```bash
npm install
npm run dev
```

## Login
The login page uses a demo role selector. Enter any valid email and password, then continue as Client or Freelancer. The selected role is stored in localStorage and protects the corresponding workspace route.
