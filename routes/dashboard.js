const express = require('express');
const router = express.Router();
const users = require("../mongodb/schema/user");
const { enSuremainUser, ensureUnauthUser } = require("../middlewares/auth");
const transfer = require("../mongodb/schema/transfar")
const DoneTransfer = require("../mongodb/schema/transferredout")
const nodemailer = require('nodemailer');

// Create a transporter for Zoho Mail
const transporter = nodemailer.createTransport({
  service: 'smtp.zoho.com',
  host: "smtp.zoho.com",
  port: 465,
  secure: true,
  logger: true,
  debug: true,
  secureConnection: false,
  auth: {
    user: 'fincch@zohomail.com', 
    pass: 'czXA7R0c7xve', 
  },
});



// Render the admin login page
router.get('/', async (req, res) => {
  try {
    // Check if the user is authenticated
    if (!req.isAuthenticated()) {
      // Handle the case where the user is not authenticated
      return res.status(401).send('User not authenticated');
    }

    // Access user data from req.user
    const user = await users.findOne({ _id: req.user._id }).lean()
    const doneTransfer = await DoneTransfer.find().lean()

    if (user || doneTransfer) {
      let formattedBalance;
      let formattedamount;

      if (typeof user.acctBalance === 'number') {
          // If it's a number, convert it to a string with commas
          formattedBalance = user.acctBalance.toLocaleString('en-US', { minimumFractionDigits: 2 });

      }else if (doneTransfer.amount === 'number'){
        formattedamount = doneTransfer.amount.toLocaleString('en-US', { minimumFractionDigits: 2 });
      }
      else {
          // Assume it's already a string
          formattedBalance = user.acctBalance;
          formattedamount = doneTransfer.amount
      }
    // Render the user's dashboard with their details
    res.render('user/dashboard', { layout: 'userdashboard', user, doneTransfer, formattedBalance, formattedamount });}
  } catch (error) {
    console.error(error);
    // Handle errors appropriately, e.g., render an error page
    res.status(500).send('Internal Server Error');
  }
});

router.get('/tranfertofincch', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send('User not authenticated');
  }

  const user = await users.findOne({ _id: req.user._id }).lean();
  const errorMessage = req.query.errorMessage;

  if (user) {
    // Check if the user's transfer is disabled
    if (user.tranfer === false) {
      const transferErrorMessage = 'Your account has been locked. Please contact support for assistance.';
      return res.render('user/transfar', { layout: 'userdashboard', user, errorMessage: transferErrorMessage, formattedBalance: user.acctBalance });
    }

    let formattedBalance;
    if (typeof user.acctBalance === 'number') {
      formattedBalance = user.acctBalance.toLocaleString('en-US', { minimumFractionDigits: 2 });
    } else {
      formattedBalance = user.acctBalance;
    }

    res.render('user/transfar', { layout: 'userdashboard', user, errorMessage, formattedBalance });
  }
});

router.get('/tranfertocommercialbank', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send('User not authenticated');
  }

  const user = await users.findOne({ _id: req.user._id }).lean();
  const errorMessage = req.query.errorMessage;

  if (user) {
    // Check if the user's transfer is disabled
    if (user.tranfer === false) {
      const transferErrorMessage = 'Your account has been locked. Please contact support for assistance.';
      return res.render('user/commercialbank', { layout: 'userdashboard', user, errorMessage: transferErrorMessage, formattedBalance: user.acctBalance });
    }

    let formattedBalance;
    if (typeof user.acctBalance === 'number') {
      formattedBalance = user.acctBalance.toLocaleString('en-US', { minimumFractionDigits: 2 });
    } else {
      formattedBalance = user.acctBalance;
    }

    res.render('user/commercialbank', { layout: 'userdashboard', user, errorMessage, formattedBalance });
  }
});

router.get('/transactionreciept', async (req, res) => {
  if (!req.isAuthenticated()) {
    // Handle the case where the user is not authenticated
    return res.status(401).send('User not authenticated');
  }

  const user = await users.findOne({ _id: req.user._id }).lean()

  // Retrieve the doneTransfer details from the query parameter and parse it
  const doneTransfer = JSON.parse(req.query.doneTransfer);
  if (doneTransfer) {
    let formattedBalance;

    if (typeof doneTransfer.amount === 'number') {
        // If it's a number, convert it to a string with commas
        formattedBalance = doneTransfer.amount.toLocaleString('en-US', { minimumFractionDigits: 2 });
    } else {
        // Assume it's already a string
        formattedBalance = user.acctBalance;
    }

  res.render('user/processedtransfer', { layout: 'processtransfer', user, doneTransfer, formattedBalance });}
});



router.post('/transferToOtherBank', async (req, res) => {
  const { otherbankBankName, otherbankAcctNo, otherBankAmount, description, transactionpin } = req.body;

  const user = await users.findOne({ _id: req.user._id });

  let errorMessage = '';

  // Perform validations
  if (otherBankAmount > user.acctBalance) {
    errorMessage = 'INSUFFICIENT BALANCE';
  } else if (!otherbankBankName || !otherbankAcctNo || !otherBankAmount) {
    errorMessage = 'Please fill in all required fields!';
  } else if (transactionpin !== "12356") {
    errorMessage = 'Incorrect Transaction Pin';
  } else {
    // Calculate the remaining balance
    const remainingBalance = user.acctBalance - otherBankAmount;

    // Update the user's current balance in the database
    user.acctBalance = remainingBalance;
    await user.save();

    // Create a new DoneTransfer document
    const doneTransfer = new DoneTransfer({
      senderAccountNo: user.accountNumber,
      receiverBank: otherbankBankName,
      receiverAccountNo: otherbankAcctNo,
      amount: parseFloat(otherBankAmount),
      Description: description,
    });

    try {
      // Save the new DoneTransfer document
      await doneTransfer.save();
      console.log(`Transfer done: ${doneTransfer}`);

      // Send email to the user
      const mailOptions = {
        from: '"FincchBankPay" <fincch@zohomail.com>',
        to: user.email, // Recipient address (user's email)
        subject: 'Transaction Successful', // Email subject
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #4CAF50; text-align: center;">Transaction Successful</h2>
            <p>Dear ${user.firstName} ${user.Lastname},</p>
            <p>Your transaction has been successfully processed. Below are the details:</p>
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <tr>
                <th style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9;">Sender Account</th>
                <td style="padding: 10px; border: 1px solid #ddd;">${user.accountNumber}</td>
              </tr>
              <tr>
                <th style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9;">Receiver Bank</th>
                <td style="padding: 10px; border: 1px solid #ddd;">${otherbankBankName}</td>
              </tr>
              <tr>
                <th style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9;">Receiver Account</th>
                <td style="padding: 10px; border: 1px solid #ddd;">${otherbankAcctNo}</td>
              </tr>
              <tr>
                <th style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9;">Amount</th>
                <td style="padding: 10px; border: 1px solid #ddd;">$${parseFloat(otherBankAmount).toFixed(2)}</td>
              </tr>
              <tr>
                <th style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9;">Description</th>
                <td style="padding: 10px; border: 1px solid #ddd;">${description}</td>
              </tr>
            </table>
            <p style="margin-top: 20px;">Thank you for using our services. If you have any questions, please contact our support team.</p>
            <p>Best regards,<br>FincchBankPay</p>
          </div>
        `,
      };

      // Send the email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
        } else {
          console.log('Email sent:', info.response);
        }
      });

      // Redirect to the transaction receipt page
      return res.redirect('/dashboard/transactionreciept?doneTransfer=' + encodeURIComponent(JSON.stringify(doneTransfer)));
    } catch (error) {
      console.log(error);
      errorMessage = 'Error saving the transaction';
    }
  }

  // Check if an error message is set
  if (errorMessage) {
    res.redirect('/dashboard/tranfertofincch?errorMessage=' + encodeURIComponent(errorMessage));
  }
});

router.post('/transfertocommercialbank', async (req, res) => {
  const transactionpin = "12356";
  let Fortransfers = {
    receivcountry: req.body.receivercountry,
    receivebaank: req.body.receiverbank,
    receivname: req.body.receivername,
    receivacct: req.body.receiveraccounttno,
    receivswiftcode: req.body.receiverswiftcode,
    amount: parseFloat(req.body.receiveramount),
    descriptionn: req.body.description,
    transactionpin: req.body.transactionpin,
  };

  const user = await users.findOne({ _id: req.user._id });
  const transferr = await transfer.findOne({ country: Fortransfers.receivcountry }).lean();

  let errorMessage = '';

  if (Fortransfers.amount > user.acctBalance) {
    errorMessage = 'INSUFFICIENT BALANCE';
  } else {
    // Calculate the remaining balance
    const remainingBalance = user.acctBalance - Fortransfers.amount;

    // Update the user's current balance in the database
    user.acctBalance = remainingBalance;
    await user.save();

    // Create a new DoneTransfer document
    const doneTransfer = new DoneTransfer({
      senderAccountNo: user.accountNumber,
      receiverCountry: Fortransfers.receivcountry,
      receiverBank: Fortransfers.receivebaank,
      receiverName: Fortransfers.receivname,
      receiverAccountNo: Fortransfers.receivacct,
      receiverSwiftCode: Fortransfers.receivswiftcode,
      amount: Fortransfers.amount,
      Description: Fortransfers.descriptionn,
    });

    try {
      // Save the new DoneTransfer document
      await doneTransfer.save();
      console.log(`Transfer done: ${doneTransfer}`);

      // Send email to the user
      const mailOptions = {
        from: '"FincchBankPay" <fincch@zohomail.com>',
        to: user.email, // Recipient address (user's email)
        subject: 'Transaction Successful', // Email subject
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #4CAF50; text-align: center;">Transaction Successful</h2>
            <p>Dear ${user.firstName} ${user.Lastname},</p>
            <p>Your transaction has been successfully processed. Below are the details:</p>
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <tr>
                <th style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9;">Sender Account</th>
                <td style="padding: 10px; border: 1px solid #ddd;">${user.accountNumber}</td>
              </tr>
              <tr>
                <th style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9;">Receiver Name</th>
                <td style="padding: 10px; border: 1px solid #ddd;">${Fortransfers.receivname}</td>
              </tr>
              <tr>
                <th style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9;">Receiver Account</th>
                <td style="padding: 10px; border: 1px solid #ddd;">${Fortransfers.receivacct}</td>
              </tr>
              <tr>
                <th style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9;">Amount</th>
                <td style="padding: 10px; border: 1px solid #ddd;">$${Fortransfers.amount.toFixed(2)}</td>
              </tr>
              <tr>
                <th style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9;">Description</th>
                <td style="padding: 10px; border: 1px solid #ddd;">${Fortransfers.descriptionn}</td>
              </tr>
            </table>
            <p style="margin-top: 20px;">Thank you for using our services. If you have any questions, please contact our support team.</p>
            <p>Best regards,<br>FincchBankPay</p>
          </div>
        `,
      };

      // Send the email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
        } else {
          console.log('Email sent:', info.response);
        }
      });

      // Redirect to the transaction receipt page
      return res.redirect('/dashboard/transactionreciept?doneTransfer=' + encodeURIComponent(JSON.stringify(doneTransfer)));
    } catch (error) {
      console.log(error);
      errorMessage = 'Error saving the transaction';
    }
  }

  // Check if an error message is set
  if (errorMessage) {
    res.redirect('/dashboard/tranfertocommercialbank?errorMessage=' + encodeURIComponent(errorMessage));
  }
});


router.get('/logoutuser', (req, res) => {
  // Destroy the user's session
  req.session.destroy((err) => {
      if (err) {
          console.error('Error destroying session:', err);
      } else {
          // Redirect the user to the login page or any
          // Redirect the user to the login page or any other appropriate page
          res.redirect('/');
      }
  });
});



module.exports = router;
