# Intern Diary 📔

A comprehensive platform for managing internship applications, tracking opportunities, and organizing your interview preparation.

## Features

- **🎯 Opportunity Dashboard**: Browse and filter internships, hackathons, and webinars
- **📝 Application Tracker**: Monitor your application status and deadlines
- **✅ Preparation Planner**: Organize interview prep tasks by category (DSA, Resume, Applications)
- **👤 Profile Management**: Upload resumes and manage your profile
- **🔐 Secure Authentication**: JWT-based authentication with role-based access
- **⚙️ Admin Panel**: Post, edit, and manage opportunities (admin only)

## Tech Stack

### Frontend
- React 18
- React Router v6
- Tailwind CSS
- Custom Premium Dark Theme

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcrypt for password hashing

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB

### Installation

1. Clone the repository:
```bash
git clone https://github.com/AbhigyanSr/InternDiary.git
cd InternDiary
```

2. Install dependencies:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Set up environment variables:

Create a `.env` file in the `server` directory:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

4. Start the development servers:

```bash
# Start backend server (from server directory)
cd server
node server.js

# Start frontend (from client directory)
cd client
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure

```
intern-diary/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React context (Auth)
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service
│   │   └── utils/         # Utility functions
│   └── package.json
├── server/                # Express backend
│   ├── config/           # Database configuration
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Auth & admin middleware
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   └── package.json
├── THEME_GUIDE.md       # Theme documentation
└── README.md
```

## Theme

Intern Diary features a **Premium Dark Theme** with:
- Modern SaaS-inspired aesthetics
- Amber accent color (#F59E0B)
- Smooth animations and transitions
- Excellent readability and accessibility

See [THEME_GUIDE.md](THEME_GUIDE.md) for detailed theme documentation.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC

## Author

Created with ❤️ by [AbhigyanSr](https://github.com/AbhigyanSr)
