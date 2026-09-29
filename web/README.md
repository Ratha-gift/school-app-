# School Admin (Next.js)

Admin website for the school app. It talks to the Laravel API in `../api`.

## Run it

1. Start Laravel (in another terminal):

   ```bash
   cd api
   php artisan serve --host=0.0.0.0 --port=8000
   ```

2. Configure and start the website:

   ```bash
   cd web
   cp .env.example .env.local   # only the first time; edit API_URL if needed
   npm install                  # only the first time
   npm run dev
   ```

3. Open http://localhost:3000 and log in with **admin@school.com / password**
   (created by `php artisan migrate:fresh --seed` in `api/`).

## How it works

- **Auth:** `/login` runs a Server Action that calls `POST /api/login`.
  Only users with role `admin` are accepted. The Sanctum token is stored in
  an **httpOnly** cookie (`admin_token`), so browser JavaScript can never read it.
- **API calls** happen on the Next.js server (`src/lib/api.ts`), which adds
  `Authorization: Bearer <token>`. The browser never talks to Laravel
  directly, so CORS is not involved and `API_URL` is never exposed.
- **`src/proxy.ts`** (Next.js 16's new name for `middleware.ts`) redirects to
  `/login` when there is no cookie. If Laravel answers 401 (token revoked),
  the cookie is deleted and you are sent back to `/login`.
- **Pages** are Server Components that fetch data; forms are small Client
  Components using Server Actions + `useActionState` (Laravel 422 errors are
  shown under each field, 409 messages in a red alert).

## Folders

```
src/
  proxy.ts                 login check before every request
  lib/                     api client, types, Khmer labels, form helpers
  components/              sidebar, tables, buttons, pagination...
  app/
    login/                 login page + form
    session-expired/       deletes an invalid cookie, then -> /login
    (admin)/               everything behind login (sidebar layout)
      page.tsx             dashboard
      users/ classes/ students/ subjects/ reports/
```

## Scripts

- `npm run dev` – development server
- `npm run lint` – ESLint
- `npm run build` – production build (`npm start` to run it)
