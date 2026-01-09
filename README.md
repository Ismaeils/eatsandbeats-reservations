# Eats & Beats Reservations

A modern restaurant-to-guest reservation management web application built with Next.js, TypeScript, Prisma, and PostgreSQL.

## Features

### Restaurant User Features
- **Authentication**: Secure JWT-based authentication with registration, login, and password reset
- **Restaurant Onboarding**: Complete onboarding flow for restaurant setup
- **Dashboard**: Real-time metrics, table status, and reservation management
- **Send Invitations**: Send reservation invitations via phone number (WhatsApp/SMS integration ready)
- **Reservation Management**: View and edit reservations, assign tables, modify time slots
- **Configuration**: Manage restaurant settings (logo, deposit, seating time, tables, cuisines)

### Guest Features (Coming Soon)
- Web form for reservation creation
- Payment integration for deposit confirmation

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: JWT (jsonwebtoken)
- **Styling**: Glass morphism design with configurable theme colors
- **Validation**: Zod

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn (for local development)
- PostgreSQL database (or use Docker)
- Docker and Docker Compose (optional, for containerized setup)

### Option 1: Docker Setup (Recommended)

The easiest way to get started is using Docker Compose:

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd eatsandbeats-reservations
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure your settings (see `.env.example` for reference)

3. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```
   
   Or use the npm script:
   ```bash
   npm run docker:up
   ```

4. **Access the application**
   Navigate to [http://localhost:3000](http://localhost:3000)

For detailed Docker instructions, see [DOCKER.md](./DOCKER.md).

### Option 2: Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd eatsandbeats-reservations
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `JWT_SECRET`: A secure random string for JWT signing
   - `NEXT_PUBLIC_APP_URL`: Your application URL (e.g., `http://localhost:3000`)

4. **Set up the database**
   ```bash
   # Generate Prisma Client
   npm run db:generate
   
   # Push schema to database (for development)
   npm run db:push
   
   # Or run migrations (for production)
   npm run db:migrate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/                    # Next.js App Router pages and API routes
│   ├── api/               # API endpoints
│   │   ├── auth/         # Authentication endpoints
│   │   ├── restaurants/  # Restaurant management
│   │   ├── invitations/  # Reservation invitations
│   │   ├── reservations/ # Reservation CRUD
│   │   └── dashboard/    # Dashboard stats
│   ├── login/            # Login page
│   ├── register/         # Registration page
│   ├── dashboard/        # Main dashboard
│   ├── invitations/      # Invitation pages
│   ├── reservations/     # Reservation pages
│   └── restaurant/       # Restaurant config
├── components/            # Reusable React components
├── lib/                   # Utility functions
│   ├── prisma.ts        # Prisma client
│   ├── auth.ts          # JWT utilities
│   ├── api-client.ts    # API client with interceptors
│   └── validations.ts   # Zod schemas
├── prisma/               # Prisma schema and migrations
│   └── schema.prisma    # Database schema
└── middleware.ts         # Next.js middleware for auth
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new restaurant user
- `POST /api/auth/login` - Login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Restaurant
- `GET /api/restaurants/me` - Get current restaurant
- `PATCH /api/restaurants/config` - Update restaurant configuration

### Invitations
- `POST /api/invitations/send` - Send reservation invitation

### Reservations
- `GET /api/reservations` - List reservations (with filters)
- `GET /api/reservations/[id]` - Get reservation details
- `PATCH /api/reservations/[id]` - Update reservation
- `POST /api/reservations/create` - Create reservation (guest endpoint)

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## Database Schema

### RestaurantUser
- User credentials and profile information

### Restaurant
- Restaurant details, configuration, and settings
- Linked to RestaurantUser

### ReservationInvitation
- Invitations sent to guests
- Contains phone number, status, and web form token

### Reservation
- Guest reservations with time slots, table assignments, and payment status

## Configuration

### Theme Colors

The application uses CSS variables for theme colors, making it easy to customize. Edit `app/globals.css` to change the color scheme:

```css
:root {
  --color-primary-500: 59 130 246; /* Your primary color */
  --color-secondary-500: 115 115 115; /* Your secondary color */
}
```

### Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT signing
- `JWT_EXPIRES_IN`: JWT expiration time (default: 7d)
- `NEXT_PUBLIC_APP_URL`: Application base URL
- `PAYMENT_GATEWAY_PROVIDER`: Payment provider (stripe, paymob, etc.)
- `MESSAGING_PROVIDER`: Messaging provider (whatsapp, sms, etc.)

## Future Integrations

The application is designed to be extensible. Integration points are prepared for:

1. **WhatsApp/SMS Integration**: The invitation system is ready for messaging service integration
2. **Payment Gateway**: Payment flow structure is in place for Stripe, Paymob, or other providers
3. **Guest User Accounts**: Schema and structure support future guest account features
4. **File Upload**: Logo upload functionality can be added (currently uses URL)

## Development

### Database Commands

```bash
# Generate Prisma Client
npm run db:generate

# Push schema changes (development)
npm run db:push

# Create and run migrations (production)
npm run db:migrate

# Open Prisma Studio (database GUI)
npm run db:studio
```

### Linting

```bash
npm run lint
```

## Security Considerations

- Passwords are hashed using bcrypt
- JWT tokens are used for authentication
- API routes are protected by middleware
- Input validation using Zod schemas
- SQL injection protection via Prisma ORM

## Error Handling

The application includes comprehensive error handling:
- API responses follow a consistent format
- Frontend displays user-friendly error messages
- Validation errors are properly surfaced
- Edge cases are handled (expired tokens, missing data, etc.)

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

[Your License Here]

## System Design Considerations

### Current Architecture
- **Monolithic Next.js App**: Frontend and backend in a single Next.js application
- **Database**: PostgreSQL with Prisma ORM for type-safe database access
- **Authentication**: JWT-based stateless authentication
- **API Design**: RESTful API following conventional patterns

### Scalability Considerations

The current design is optimized for small to medium-scale operations. For larger scale, consider:

1. **Database Optimization**
   - Add indexes on frequently queried fields (restaurantId, timeFrom, status)
   - Consider read replicas for dashboard queries
   - Implement pagination for large reservation lists

2. **Caching Strategy**
   - Cache dashboard stats with TTL
   - Cache restaurant configuration
   - Use Redis for session management if moving away from JWT

3. **Message Queue**
   - Use a message queue (RabbitMQ, AWS SQS) for WhatsApp/SMS sending
   - Handle payment webhooks asynchronously

4. **File Storage**
   - Move logo uploads to cloud storage (S3, Cloudinary)
   - Implement CDN for static assets

5. **Microservices (Future)**
   - Separate messaging service
   - Separate payment service
   - Separate notification service

### Security Enhancements

- [ ] Rate limiting on API endpoints
- [ ] CSRF protection
- [ ] Input sanitization beyond Zod validation
- [ ] SQL injection protection (already handled by Prisma)
- [ ] XSS protection (React handles this, but review)
- [ ] HTTPS enforcement in production
- [ ] Secure password reset flow with email verification

### Edge Cases Handled

- ✅ Expired invitation tokens
- ✅ Already used invitations
- ✅ Invalid table assignments
- ✅ Missing restaurant configuration
- ✅ Token expiration and refresh
- ✅ Concurrent reservation conflicts (basic - could be enhanced with locking)

### Potential Improvements

1. **Reservation Conflicts**: Implement table availability checking with time overlap validation
2. **Guest Accounts**: Add guest user accounts for reservation history
3. **Notifications**: Email/SMS notifications for reservation confirmations and reminders
4. **Analytics**: More detailed analytics and reporting
5. **Multi-restaurant Support**: Support for restaurant chains with multiple locations
6. **Waitlist Management**: Queue system for fully booked time slots
7. **Reservation Cancellation**: Allow guests to cancel reservations
8. **Payment Refunds**: Handle deposit refunds for cancellations

## Support

For issues and questions, please open an issue in the repository.

