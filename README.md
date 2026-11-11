# ClubsHub

**A campus club discovery and management platform for the University of Eastern Africa, Baraton (UEAB).** Students can discover clubs, request membership, and keep up with events and announcements. Club administrators can manage their communities from one place.

- **Live demo:** [clubshub.vercel.app](https://clubshub.vercel.app/)
- **Business model:** [One-page business model (PDF)](docs/Business_Model.pdf)
- **Business model source:** [docs/Business_Model.md](docs/Business_Model.md)

## Team

| Name                 | Registration number | Role        |
| -------------------- | ------------------- | ----------- |
| Joshua Mwalimu       | SMWAJO2212          | Team leader |
| Lynn Jepkemboi Bitok | SLYNJE2311          | Team member |
| Keith Kiplagat       | SKEIKI2411          | Team member |

## Problem and research

UEAB students do not have one reliable place to find campus clubs. Many hear about a club only when an event happens and miss other ways to participate. Club leaders also lack a simple channel to reach prospective members between events.

We interviewed **12 students** about how they discover and join clubs. The number of first-year students was not recorded, so this report makes no first-year-specific claim. Students are the primary users; club administrators maintain club information and respond to membership requests.

## Proposed solution

ClubsHub brings campus clubs together in a searchable directory. Students can explore clubs without an account, personalize discovery with interests, view club details, request to join, and track their request. They can also browse events and announcements, manage memberships, receive notifications, and use campus lost-and-found features. Students can propose a new club.

Club administrators manage their club profile, review join requests, maintain members and roles, publish announcements, and organize events. Public announcements and club information help students discover activity before attending an event.

## Screenshots and demo

The screenshots below show the working prototype. View the [live demo](https://clubshub.vercel.app/) for the current experience.

### Landing page

![ClubsHub landing page](screenshots/landing-page.png)

### Club discovery

![Browse and filter clubs](screenshots/club-discovery.png)

### Student dashboard

![Student dashboard](screenshots/student-dashboard.png)

### Club administrator dashboard

![Club administrator dashboard](screenshots/club-admin-dashboard.png)

### Sign in

![ClubsHub sign-in page](screenshots/sign-in.png)

## System design

### Architecture

```mermaid
flowchart LR
    Student[Student browser] --> Web[Next.js App Router]
    Admin[Club admin browser] --> Web
    SuperAdmin[Super admin browser] --> Web
    Web --> Auth[NextAuth and Google sign-in]
    Web --> Modules[Feature modules: discovery, clubs, requests, events, announcements, lost and found]
    Modules --> Prisma[Prisma ORM]
    Prisma --> DB[(PostgreSQL)]
    Modules --> Media[Cloudinary media uploads]
```

Routes compose the experience, feature modules hold domain services and repositories, and server-side authorization checks gate protected actions. Prisma models and SQL migrations are maintained in [`prisma/`](prisma/).

### Core entity relationship diagram

```mermaid
erDiagram
    USER ||--o{ CLUB : creates
    USER ||--o{ MEMBERSHIP : holds
    CLUB ||--o{ MEMBERSHIP : has
    USER ||--o{ USER_INTEREST : selects
    INTEREST ||--o{ USER_INTEREST : selected
    CLUB ||--o{ CLUB_INTEREST : tagged
    INTEREST ||--o{ CLUB_INTEREST : describes
    CLUB ||--o{ EVENT : hosts
    USER ||--o{ EVENT_REGISTRATION : registers
    EVENT ||--o{ EVENT_REGISTRATION : receives
    CLUB ||--o{ ANNOUNCEMENT : publishes
    USER ||--o{ ANNOUNCEMENT : authors
    USER ||--o{ AUDIT_LOG : performs
    USER ||--o{ LOST_FOUND_ITEM : reports
    USER ||--o{ NOTIFICATION : receives
```

### Request flow

```mermaid
flowchart LR
    A[Student explores clubs] --> B[Views club profile]
    B --> C[Submits join request]
    C --> D{Server checks role and request}
    D --> E[Club admin reviews request]
    E --> F{Decision}
    F -->|Approve| G[Membership activated]
    F -->|Decline| H[Request status updated]
    G --> I[Student sees status and club updates]
    H --> I
```

## Technology stack

- **Web:** Next.js 15 App Router, React 19, TypeScript
- **Styling and components:** Tailwind CSS 4, Radix UI components
- **Database:** PostgreSQL with Prisma ORM and versioned SQL migrations
- **Authentication:** NextAuth with Google provider
- **Validation:** Zod
- **Media:** Cloudinary uploads
- **Code quality:** ESLint, Prettier, Vitest, Testing Library, Playwright
- **Package manager:** pnpm 10

## Run locally

### Requirements

- Node.js 20 or newer
- pnpm 10
- PostgreSQL database
- Google OAuth credentials for sign-in
- Cloudinary credentials for image uploads (optional for core local development)

### Setup

1. Clone the repository and enter its directory.
2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Copy `.env.example` to `.env.local` and fill in the values:

   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/clubshub?schema=public"
   DIRECT_URL="postgresql://USER:PASSWORD@localhost:5432/clubshub?schema=public"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="generate-a-long-random-secret"
   GOOGLE_CLIENT_ID="your-google-oauth-client-id"
   GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"
   SUPER_ADMIN_EMAIL="admin@example.edu"
   CLOUDINARY_CLOUD_NAME=""
   CLOUDINARY_API_KEY=""
   CLOUDINARY_API_SECRET=""
   ```

4. Generate the Prisma client and apply migrations to the configured database:

   ```bash
   pnpm db:generate
   pnpm db:migrate:deploy
   ```

5. Start the development server:

   ```bash
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000).

Google OAuth must be configured with `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI. Keep credentials in `.env.local`; never commit them.

### Useful commands

```bash
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
```

## Repository layout

```text
src/app/          Next.js routes and page composition
src/components/   Shared UI and feature components
src/modules/      Domain services, repositories, and validation
src/lib/          Authentication, database, and shared infrastructure
prisma/           Prisma models and SQL migrations
screenshots/      Working prototype screenshots used in this report
docs/             Project documentation and business model
```

## Privacy, security, and risks

ClubsHub stores account details needed to operate the service, including a student's name and university email, and uses role-based server authorization. Students can access their own requests; club administrators are limited to their club; super administrators have system-wide access. Join-request records may include registration details. Access should remain limited to the people who need it, and credentials must be kept out of source control. The project has not claimed a formal compliance certification.

Key product risks include clubs keeping their listings up to date and students choosing separate club-built websites instead of one directory. ClubsHub addresses fragmentation by making discovery campus-wide. A previous departmental hackathon produced a club website that was not taken forward; this is a relevant adoption precedent, and ClubsHub's broader campus scope is its response. See the [one-page business model](docs/Business_Model.pdf) for cost, adoption, and funding assumptions.
