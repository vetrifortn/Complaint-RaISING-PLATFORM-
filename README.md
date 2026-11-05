This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Deploying to Vercel

1. Import this repository into Vercel and use the default Next.js build settings. The build command is `npm run build`; dependencies are installed from the committed `package-lock.json`.
2. Add the following environment variables in the Vercel project settings for every environment you deploy (Production, Preview, and Development as needed):
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` — connection details for a reachable PostgreSQL database. The database must be hosted somewhere Vercel can access; local database defaults do not work in a Vercel deployment.
   - `ADMIN_USERNAME`, `ADMIN_PASSWORD` — credentials for the administrator login.
   - `AUTH_SECRET` — a private, randomly generated secret used to sign admin sessions. Generate one locally, for example with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Do not commit or publish it.
3. Ensure the database schema and required tables are initialized before using the deployed app.
4. Redeploy after adding or changing environment variables.

The `.env.local` file is for local development and is not included in deployments. Never commit its secrets.


First, run the development server:


npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev


Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
