const express = require('express');
const router = express.Router();

// Logout route: Destroys the session and redirects to the login page
router.get('/', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error during logout:', err);
            return res.status(500).send('Failed to log out.');
        }
        // Redirect to the login page after session is destroyed
        res.redirect('/login');
    });
});

module.exports = router;
