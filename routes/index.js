const express = require('express');
const router = express.Router();


router.get('/', async (req, res) => {

    res.render('welcome', { title: "Home Page - Fincch BankPay"});
});

router.get('/about', (req, res) => {
    return res.render('about', { title: "About Page - Fincch BankPay"} );
})

router.get("/contact", (req, res) => {
    return res.render("contact", { title: "Contact Page - Fincch BankPay"});
  });

router.get('/logout', (req, res) => {
    // Destroy the user's session
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        } else {
            // Redirect the user to the login page or any
            // Redirect the user to the login page or any other appropriate page
            res.redirect('/admin');
        }
    });
});

module.exports = router;