# Registration Backend

This project is a backend application for handling user registration using Node.js, Express, and MongoDB. It provides endpoints for user registration and retrieving registered users.

## Project Structure

```
registration-backend
├── src
│   ├── controllers
│   │   └── registrationController.js
│   ├── models
│   │   └── registrationModel.js
│   ├── routes
│   │   └── registrationRoutes.js
│   ├── app.js
│   └── config
│       └── db.js
├── package.json
├── .env
└── README.md
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd registration-backend
   ```

2. Install the dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add your MongoDB connection string:
   ```
   MONGODB_URI=<your-mongodb-connection-string>
   ```

## Usage

1. Start the server:
   ```
   npm start
   ```

2. The server will run on `http://localhost:5000`.

## API Endpoints

- `POST /register`: Register a new user.
- `GET /users`: Retrieve all registered users.
