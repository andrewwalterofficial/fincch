const express = require('express');
const router = express.Router();
const User = require("../mongodb/schema/user");
const { enSuremainUser, ensureUnauthUser } = require("../middlewares/auth");
const transfer = require("../mongodb/schema/transfar")
const DoneTransfer = require("../mongodb/schema/transferredout")

// Simulated useradmin (you should retrieve this from a database)
const useradmin = 'required1233';

const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// Configure Multer
const upload = multer({ dest: 'uploads/' });

// Configure Cloudinary
cloudinary.config({
    cloud_name: 'dfmnzt39b',
    api_key: '848569834289945',
    api_secret: 'thKiqSpd74MJFhlZmqZ7abvorNk',
});

// Render the admin login page
router.get('/', async (req, res) => {
    res.render('admin/admin', { layout: 'admin' });
});


// Handle admin login form submission


// Define a route for /admin/dashboard
router.get('/dashboard', async (req, res) => {
    const users = await User.find().lean();
    res.render('admin/dashboard', { layout: 'admindashboard', isLoggedIn: req.isAuthenticated(), users });
});

router.get('/allcustomers', async (req, res) => {
    const users = await User.find().lean();
    res.render('admin/allcustomers', { layout: 'admindashboard', isLoggedIn: req.isAuthenticated(), users });
});

router.get('/edit-customer/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).lean();
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.render('admin/edit-customer', { 
            layout: 'admindashboard', 
            isLoggedIn: req.isAuthenticated(), 
            user 
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Route to handle the update
router.post('/update-customer/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const updateData = {
            firstName: req.body.firstName,
            Lastname: req.body.Lastname,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
            dob: req.body.dob,
            nationalid: req.body.nationalid,
            profilepicture: req.body.profilepicture,
            gender: req.body.gender,
            country: req.body.country,
            state: req.body.state,
            city: req.body.city,
            address: req.body.address,
            Zipcode: req.body.Zipcode,
            AccountType: req.body.AccountType,
            BeneficiaryLegalName: req.body.BeneficiaryLegalName,
            BeneficiaryOccupation: req.body.BeneficiaryOccupation,
            BeneficiaryEmailAddress: req.body.BeneficiaryEmailAddress,
            BeneficiaryPhoneNumber: req.body.BeneficiaryPhoneNumber,
            BeneficiaryResidentialAddress: req.body.BeneficiaryResidentialAddress,
            RelationshipwithBeneficiary: req.body.RelationshipwithBeneficiary,
            BeneficiaryAge: req.body.BeneficiaryAge,
            tranfer: req.body.tranfer === 'on', // Convert checkbox value to boolean
        };

        await User.findByIdAndUpdate(userId, updateData);
        res.redirect('/admin/allcustomers');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

router.delete('/delete-customer/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        await User.findByIdAndDelete(userId);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

router.post('/login',
async (req, res) => {
  const adminid = req.body.password;
  try {
      let errors = [];

      if (!adminid) {
          errors.push('Empty');
      }

      if (adminid !== useradmin) {
          errors.push('Wrong Access Id');
      }

      if (errors.length > 0) {
          res.redirect('/admin');
      } else {
          res.redirect('/admin/dashboard', );
          console.log("successful")
      }
  } catch (error) {
      console.log(error);

  }
});


// Route to handle form submission
router.post('/createaccount', upload.single('profilepicture'), async (req, res) => {
    try {
        // Check if a file was uploaded
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }

        // Upload the image to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'user_profiles', // Optional: Organize images in a folder
        });

        // Create a new user with the Cloudinary image URL
        let newUser = new User({
            accountNumber: req.body.accountNumber,
            firstName: req.body.firstname,
            Lastname: req.body.lastname,
            email: req.body.email,
            acctBalance: req.body.acctbalance,
            phoneNumber: req.body.phonenumber,
            dob: req.body.dateofbirth,
            nationalid: req.body.nationaliD,
            profilepicture: result.secure_url, // Save the Cloudinary image URL
            gender: req.body.gender,
            country: req.body.country,
            state: req.body.state,
            city: req.body.city,
            address: req.body.residentialaddress,
            Zipcode: req.body.zipcode,
            AccountType: req.body.accounttype,
            BeneficiaryLegalName: req.body.beneficiarylegalname,
            BeneficiaryOccupation: req.body.beneficiaryoccupation,
            BeneficiaryEmailAddress: req.body.beneficiaryemailaddress,
            BeneficiaryPhoneNumber: req.body.beneficiaryphonenumber,
            BeneficiaryResidentialAddress: req.body.nextofkinresidentialaddress,
            RelationshipwithBeneficiary: req.body.pleaseselectrelationship,
            BeneficiaryAge: req.body.pleaseselectage,
            password: req.body.txtPassword,
        });

        // Save the user to the database
        await newUser.save();
        console.log('User added successfully', newUser);

        // Delete the temporary file after uploading to Cloudinary
        const fs = require('fs');
        fs.unlinkSync(req.file.path);

        // Redirect to the dashboard
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.log(error);
        res.status(500).send('Server Error');
    }
});


router.get('/addaccount', async (req, res) => {
    const transferr = await transfer.find().lean();
    res.render('admin/addaccount', { layout: 'admindashboard', isLoggedIn: req.isAuthenticated(), transferr });
});

router.get('/addtransaction', async (req, res) => {
    const doneTransfer = await DoneTransfer.find().lean()

    res.render('admin/creditdebit', { layout: 'admindashboard', isLoggedIn: req.isAuthenticated(), doneTransfer });
});



router.post("/addaccountt", async function (req, res) {
    try {
        let newUser = new transfer({
            country: req.body.country,
            bank: req.body.bankname,
            name: req.body.acctname,
            accounttno: req.body.acctnum,

            swiftcode: req.body.swiftcode
,
        });

        await newUser.save();
        console.log('added successfully');
        res.redirect('/admin/addaccount'); // Redirect to /admin/dashboard after creating a new user
    } catch (error) {
        console.log(error);
        res.redirect('/admin/addaccount');
    }
});

router.post("/createtransaction", async (req, res) => {
    try {
      const details = {
        senderAccountNo: req.body.senderaccountNumber,
        receiverAccountNo: req.body.recieveraccountNumber,
        amount: req.body.amount,
        receiverName: req.body.name,
        transacttype: req.body.transacttype,
        createdDate: req.body.datee,
      };
  
      console.log(details);
  
      // Find the sender account
      const senderAccount = await User.findOne({ accountNumber: details.senderAccountNo });
  
      if (!senderAccount) {
        // Sender account doesn't exist
        console.log('Sender account not found');
        res.redirect('/admin/addtransaction');
        return;
      }
  

  
      // Deduct the amount from the sender's account balance

      await senderAccount.save();
  
      // Create a new transaction record
      const newTransaction = new DoneTransfer({
        senderAccountNo: details.senderAccountNo,
        receiverAccountNo: details.receiverAccountNo,
        amount: details.amount,
        receiverName: details.receiverName,
        transacttype: details.transacttype,
        createdDate: details.createdDate,
        // Add other fields as needed
      });
  
      // Save the new transaction record
      await newTransaction.save();
      console.log('Transaction added successfully');
      res.redirect('/admin/addtransaction');
    } catch (error) {
      console.error(error);
      res.redirect('/admin/addtransaction');
    }
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