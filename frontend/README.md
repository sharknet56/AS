# Image Sharing Application - Frontend

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Access the application at: http://localhost:3000

## Features

### Authentication
- **Register**: Create a new account with username and password (min 6 characters)
- **Login**: Login with your credentials to access the platform
- **Logout**: Securely logout from the application

### My Images
- Upload new images with title and description
- View all your uploaded images
- Edit image title and description
- Delete your images
- View comments on your images

### Explore
- Browse images uploaded by other users
- View image details
- Comment on other users' images

### Image Detail
- View full-size images
- Read all comments
- Post new comments
- Delete your own images (if you're the owner)

## Technology Stack

- **React 18** - UI library
- **React Router 6** - Navigation and routing
- **Axios** - HTTP client for API calls
- **Vite** - Build tool and development server
- **CSS3** - Custom styling with modern features

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          # Navigation bar
│   │   └── PrivateRoute.jsx    # Protected route wrapper
│   ├── pages/
│   │   ├── Home.jsx            # Landing page
│   │   ├── Login.jsx           # Login page
│   │   ├── Register.jsx        # Registration page
│   │   ├── MyImages.jsx        # User's images management
│   │   ├── Explore.jsx         # Browse other users' images
│   │   └── ImageDetail.jsx     # Image detail with comments
│   ├── services/
│   │   └── api.js              # API service layer
│   ├── App.jsx                 # Main app component
│   ├── App.css                 # Global styles
│   └── main.jsx                # Entry point
├── index.html
├── package.json
└── vite.config.js
```

## Security Features (Frontend Implementation)

1. **JWT Token Storage**: Access tokens stored in localStorage
2. **Protected Routes**: Private routes require authentication
3. **Automatic Token Inclusion**: API requests automatically include auth token
4. **Form Validation**: Client-side validation for user inputs
5. **Password Confirmation**: Register form includes password confirmation

## Usage Flow

1. **First Time Users**:
   - Register a new account
   - Login with credentials
   - Upload images from "My Images" page
   
2. **Existing Users**:
   - Login with credentials
   - Navigate to "My Images" to manage your content
   - Navigate to "Explore" to see other users' images
   - Click on any image to view details and comments

3. **Image Management**:
   - Upload: Click "Upload Image" button, select file, add title/description
   - Edit: Click "Edit" on your image to modify title/description
   - Delete: Click "Delete" to remove your image

4. **Commenting**:
   - Click on any image to view details
   - Scroll to comments section
   - Type your comment and click "Post Comment"
