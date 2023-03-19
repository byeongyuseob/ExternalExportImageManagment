import express from 'express';
import path from 'path';

const app = express();

// Enable JSON parsing middleware
app.use(express.json());

// Set up middleware for serving static files
const __dirname = path.dirname(new URL(import.meta.url).pathname);
app.use(express.static(path.join(__dirname, 'public')));

// Start server on port 3000
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
