# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/6eaf3054-2a20-4681-bc1b-6c20122b605f

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/6eaf3054-2a20-4681-bc1b-6c20122b605f) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Stripe environment variables

Copy `.env.example` to `.env` and set the following variables so the application can
properly communicate with Stripe:

- `VITE_STRIPE_PK`
- `VITE_STRIPE_MONTHLY_PRICE_ID`
- `VITE_STRIPE_ANNUAL_PRICE_ID`
- `VITE_STRIPE_SUCCESS_URL`
- `VITE_STRIPE_CANCEL_URL`

If `VITE_STRIPE_PK` is missing or empty the application will show
`IntegrationError: Please call Stripe() with your publishable key` in the
browser console. Using the values from `.env.example` is enough for local
development.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/6eaf3054-2a20-4681-bc1b-6c20122b605f) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Storage signed URL API

A helper API is available to sign private Supabase Storage files for preview/download in admin:

- Endpoint: `POST /api/storage/sign-url`
- Body: `{ "urlOrPath": "bucket/path/to/object.ext", "expiresIn": 300 }`
- Returns: `{ "signedUrl": "https://..." }`

Notes:
- If `urlOrPath` is already a full `http(s)` URL, it is returned as-is.
- The server uses `SUPABASE_SERVICE_ROLE_KEY` and never exposes it to the browser.
- Configure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in your environment.
