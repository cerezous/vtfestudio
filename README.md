# Estudio VMI

Programa de estudio de pacientes en ventilación mecánica invasiva.

Stack: Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, Zod y Supabase (Auth, Postgres, RLS).

Backend: proyecto Supabase **Programa Vinko Tomicic**.

## Arranque local

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

Usuario de prueba: `mcerezo`. Contraseña: RUT **sin puntos ni guión**.

En Auth de Supabase:

- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/auth/callback`
