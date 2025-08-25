# Lowkey Kava Orders

An invite-only ordering site for Kava and Kratom beverages, built with Next.js 14, Supabase, and Tailwind CSS.

## Features

- **Invite-only Access**: Users can only sign up with valid invite codes
- **Authentication**: Email-based magic link authentication via Supabase
- **Product Menu**: Browse and add Kava/Kratom products to cart
- **Manual Payment**: Cash App and Zelle payment instructions
- **Order Management**: Track order status and confirmation codes
- **Subscriptions**: Weekly/monthly recurring orders
- **Admin Panel**: Manage orders, invites, products, and subscriptions
- **Age Verification**: 21+ age gate with compliance notices

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with magic links
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Validation**: Zod
- **Forms**: React Hook Form
- **Hosting**: Vercel (free tier)

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (free tier)
- Vercel account (free tier)

## Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo>
cd lowkeysite
npm install
```

### 2. Environment Configuration

Copy the example environment file and fill in your values:

```bash
cp env.example .env.local
```

Update `.env.local` with your actual values:

```env
NEXT_PUBLIC_SITE_NAME=Lowkey Kava Orders
NEXT_PUBLIC_SUPPORT_EMAIL=support@yourdomain.com
NEXT_PUBLIC_CONTACT_PHONE=555-555-5555
NEXT_PUBLIC_CASHAPP_TAG=$yourcashtag
NEXT_PUBLIC_ZELLE_CONTACT=your@email.com
NEXT_PUBLIC_AGE_MIN=21

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email (Resend recommended for free tier)
EMAIL_PROVIDER=resend
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=orders@yourdomain.com
ADMIN_NOTIFY_EMAIL=you@yourdomain.com

# App
NODE_ENV=development
APP_URL=http://localhost:3000
```

### 3. Supabase Setup

1. Create a new Supabase project
2. Go to SQL Editor and run the migration from `supabase/migrations/001_initial_schema.sql`
3. Copy your project URL and anon key to `.env.local`
4. Enable Row Level Security (RLS) is already configured in the migration

### 4. Email Setup (Resend - Free Tier)

1. Sign up at [resend.com](https://resend.com)
2. Verify your domain or use the sandbox domain
3. Get your API key and add to `.env.local`

### 5. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 6. Create Admin User

1. Sign up with an invite code
2. Go to Supabase dashboard → SQL Editor
3. Run: `INSERT INTO public.admins (user_id) VALUES ('your-user-uuid');`

### 7. Create Invite Codes

In Supabase SQL Editor:

```sql
INSERT INTO public.invites (code, max_uses, expires_at) 
VALUES ('WELCOME2024', 100, '2024-12-31');
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication routes
│   ├── menu/              # Product menu
│   ├── checkout/          # Checkout process
│   ├── order/             # Order status
│   ├── subscriptions/     # Subscription management
│   └── admin/             # Admin panel
├── components/            # React components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and configurations
│   ├── supabase/         # Supabase clients
│   ├── types.ts          # TypeScript types
│   ├── validations.ts    # Zod schemas
│   └── utils.ts          # Helper functions
└── styles/               # Global styles
```

## Key Components

- **AgeGate**: 21+ verification modal
- **ProductList**: Displays products from database
- **CartSheet**: Shopping cart sidebar
- **CheckoutForm**: Order submission and payment
- **PaymentInstructions**: Cash App/Zelle instructions
- **AdminTable**: Admin management interface

## Database Schema

The app uses these main tables:
- `profiles`: User profile information
- `invites`: Invite code management
- `products`: Product catalog
- `orders`: Customer orders
- `plans`: Subscription plans
- `subscriptions`: User subscriptions
- `admins`: Admin user management

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Ensure all environment variables are set in your hosting platform, especially:
- Supabase credentials
- Email provider API keys
- Site URLs and contact information

## Compliance & Legal

- Age verification (21+)
- No medical claims
- Local legality disclaimers
- Terms of Service and Privacy Policy required

## Cost Breakdown

- **Vercel**: Free tier (up to 100GB bandwidth)
- **Supabase**: Free tier (500MB database, 50MB file storage)
- **Resend**: Free tier (3,000 emails/month)
- **Total**: $0/month to start

## Future Enhancements

- Stripe payment processing
- SMS notifications (Twilio)
- Delivery scheduling
- Inventory management
- Tax automation
- Address validation

## Support

For issues or questions:
1. Check the Supabase logs
2. Review browser console errors
3. Verify environment variables
4. Check database RLS policies

## License

[Your License Here]
