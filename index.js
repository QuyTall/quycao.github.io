const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcrypt');
const User = require('./models/User'); // Import the User model

// Import other routers
const bookRouter = require('./routers/bookRouter');
const employeeRouter = require('./routers/employeeRouter');
const memberRouter = require('./routers/memberRouter');
const borrowingRouter = require('./routers/borrowingRouter');
const Book = require('./models/Book');

// Initialize Express app
const app = express();

// === Database Connection ===
mongoose.connect('mongodb://localhost/library-system', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// === Middleware Configuration ===
// Parse request body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Set view engine to EJS and static file directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use(express.static('public'));
// Configure session management
app.use(session({
  secret: 'your-secret-key', // Replace with a secure key in production
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set secure: true when using HTTPS in production
}));

// === Authentication Middleware ===
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }
  res.redirect('/login');
}

// === Routes ===

// Redirect root to login or books
app.get('/', (req, res) => {
  req.session.user ? res.redirect('/books') : res.redirect('/login');
});

// Render login page
app.get('/login', (req, res) => {
  res.render('login', { errorMessage: null }); // Pass errorMessage as null by default
});

// Render registration page
app.get('/register', (req, res) => {
  res.render('register', { errorMessage: null }); // Pass errorMessage as null by default
});

// Handle login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.render('login', { errorMessage: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render('login', { errorMessage: 'Invalid password' });
    }

    req.session.user = user; // Store user in session
    res.redirect('/books');
  } catch (err) {
    console.error(err);
    res.status(500).render('login', { errorMessage: 'Server error. Please try again.' });
  }
});

// Handle registration
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('register', { errorMessage: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    req.session.user = newUser; // Auto-login after registration
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.status(500).render('register', { errorMessage: 'Server error. Please try again.' });
  }
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error(err);
      return res.status(500).send('Failed to log out.');
    }
    res.redirect('/login');
  });
});
app.post('/books/edit/:id', async (req, res) => {
  try {
      const { id } = req.params; // Lấy ID sách từ URL
      const updatedBook = {
          title: req.body.title,
          author: req.body.author,
          genre: req.body.genre,
          year: req.body.publishedYear,
          description: req.body.description,
      };

      // Nếu có upload ảnh
      if (req.file) {
          updatedBook.image = `/uploads/${req.file.filename}`;
      }

      // Cập nhật sách trong cơ sở dữ liệu
      const book = await Book.findByIdAndUpdate(id, updatedBook, { new: true });

      if (!book) {
          return res.status(404).send('Book not found');
      }

      res.redirect(`/books/${id}`);
  } catch (error) {
      console.error('Error updating book:', error);
      res.status(500).send('Error updating book');
  }
});
app.get('/books/edit/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params; // Lấy ID sách từ URL
    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).send('Book not found');
    }

    res.render('book/editBook', { book }); // Truyền thông tin sách vào giao diện
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).send('Server error');
  }
});


// Use protected routers
app.use('/books', isAuthenticated, bookRouter);
app.use('/employees', isAuthenticated, employeeRouter);
app.use('/members', isAuthenticated, memberRouter);
app.use('/borrowings', isAuthenticated, borrowingRouter);

// === Error Handling for Unknown Routes ===
app.use((req, res) => {
  res.status(404).render('404', { errorMessage: 'Page not found' });
});

// === Start the Server ===
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
