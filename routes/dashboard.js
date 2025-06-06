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
  } else if (transactionpin !== "0707") {
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
        subject: 'Transaction Successful ✅', // Email subject with checkmark emoji
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Transaction Confirmation</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; background-color: #f7f7f7;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.05); margin-top: 20px; margin-bottom: 20px;">
              <!-- HEADER -->
              <tr>
                <td align="center" bgcolor="#2D5BFF" style="padding: 30px 0; border-radius: 8px 8px 0 0;">
                  <img src="https://yourwebsite.com/img/logo_white.png" alt="Fincch BankPay" width="180" style="display: block;">
                </td>
              </tr>
              
              <!-- TRANSACTION STATUS -->
              <tr>
                <td align="center" style="padding: 30px 30px 20px 30px;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td align="center">
                        <div style="background-color: #E7F3FF; width: 80px; height: 80px; border-radius: 50%; display: inline-block; margin-bottom: 15px;">
                          <img src="https://yourwebsite.com/img/checkmark.png" alt="Success" width="40" style="margin-top: 20px;">
                        </div>
                        <h1 style="color: #333333; font-size: 24px; margin: 0;">Transaction Successful</h1>
                        <p style="color: #666666; font-size: 16px; margin-top: 5px;">Your transfer has been completed</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- AMOUNT -->
              <tr>
                <td align="center" style="padding: 0 30px 30px 30px;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F9F9F9; border-radius: 8px; padding: 20px;">
                    <tr>
                      <td align="center">
                        <p style="color: #666666; font-size: 14px; margin: 0 0 5px 0;">Transaction Amount</p>
                        <h2 style="color: #2D5BFF; font-size: 32px; margin: 0;">$${parseFloat(otherBankAmount).toFixed(2)}</h2>
                        <p style="color: #666666; font-size: 14px; margin: 10px 0 0 0;">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' })}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- TRANSACTION DETAILS -->
              <tr>
                <td style="padding: 0 30px 30px 30px;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td>
                        <h3 style="color: #333333; font-size: 18px; margin: 0 0 15px 0; border-bottom: 1px solid #eeeeee; padding-bottom: 10px;">Transaction Details</h3>
                      </td>
                    </tr>
                    
                    <tr>
                      <td style="padding: 10px 0;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td width="40%" style="color: #666666; font-size: 14px;">From Account</td>
                            <td width="60%" style="color: #333333; font-size: 14px; font-weight: 600;">${user.accountNumber}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <tr>
                      <td style="padding: 10px 0; border-top: 1px solid #eeeeee;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td width="40%" style="color: #666666; font-size: 14px;">To Account</td>
                            <td width="60%" style="color: #333333; font-size: 14px; font-weight: 600;">${otherbankAcctNo}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <tr>
                      <td style="padding: 10px 0; border-top: 1px solid #eeeeee;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td width="40%" style="color: #666666; font-size: 14px;">Receiver Bank</td>
                            <td width="60%" style="color: #333333; font-size: 14px; font-weight: 600;">${otherbankBankName}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <tr>
                      <td style="padding: 10px 0; border-top: 1px solid #eeeeee;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td width="40%" style="color: #666666; font-size: 14px;">Description</td>
                            <td width="60%" style="color: #333333; font-size: 14px; font-weight: 600;">${description}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <tr>
                      <td style="padding: 10px 0; border-top: 1px solid #eeeeee;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td width="40%" style="color: #666666; font-size: 14px;">Transaction ID</td>
                            <td width="60%" style="color: #333333; font-size: 14px; font-weight: 600;">${Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- DOWNLOAD BUTTON -->
              <tr>
                <td style="padding: 0 30px 30px 30px;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td align="center">
                        <a href="#" style="background-color: #2D5BFF; color: #ffffff; display: inline-block; font-size: 14px; font-weight: bold; text-decoration: none; padding: 14px 25px; border-radius: 8px;">Download Receipt</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- FOOTER -->
              <tr>
                <td align="center" bgcolor="#f7f7f7" style="padding: 20px 30px; border-radius: 0 0 8px 8px; color: #666666; font-size: 12px;">
                  <p style="margin: 0 0 10px 0;">If you have any questions, please contact our support team.</p>
                  <p style="margin: 0 0 10px 0;">© 2025 Fincch-BankPay Ltd. All rights reserved.</p>
                  <p style="margin: 0;"><a href="#" style="color: #2D5BFF; text-decoration: underline;">Terms of Service</a> | <a href="#" style="color: #2D5BFF; text-decoration: underline;">Privacy Policy</a></p>
                </td>
              </tr>
            </table>
          </body>
          </html>
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
  // Hardcoded transaction PIN (replace with user.transactionPin in production)
  const validTransactionPin = "0707"; // Should be user.transactionPin from DB

  let Fortransfers = {
    receivercountry: req.body.receivercountry,
    receiverbank: req.body.receiverbank,
    receivername: req.body.receivername,
    receiveraccounttno: req.body.receiveraccounttno,
    receiverswiftcode: req.body.receiverswiftcode,
    amount: parseFloat(req.body.receiveramount),
    description: req.body.description,
    transactionpin: req.body.transactionpin,
  };

  let errorMessage = '';

  try {
    // Find the user
    const user = await users.findOne({ _id: req.user._id });
    if (!user) {
      errorMessage = 'User not found';
      return res.redirect('/dashboard/tranfertocommercialbank?errorMessage=' + encodeURIComponent(errorMessage));
    }

    // Check if account is locked for transfers
    if (user.tranfer === false) {
      errorMessage = 'Your account has been locked. Please contact support for assistance.';
      return res.redirect('/dashboard/tranfertocommercialbank?errorMessage=' + encodeURIComponent(errorMessage));
    }

    // Validate transaction PIN
    if (Fortransfers.transactionpin !== validTransactionPin) {
      errorMessage = 'Invalid transaction PIN';
      return res.redirect('/dashboard/tranfertocommercialbank?errorMessage=' + encodeURIComponent(errorMessage));
    }

    // Find transfer details (if needed)
    const transferr = await transfer.findOne({ country: Fortransfers.receivercountry }).lean();

    // Check for sufficient balance
    if (Fortransfers.amount > user.acctBalance) {
      errorMessage = 'INSUFFICIENT BALANCE';
      return res.redirect('/dashboard/tranfertocommercialbank?errorMessage=' + encodeURIComponent(errorMessage));
    }

    // Calculate remaining balance
    const remainingBalance = user.acctBalance - Fortransfers.amount;

    // Update user's balance
    user.acctBalance = remainingBalance;
    await user.save();

    // Create a new DoneTransfer document
    const doneTransfer = new DoneTransfer({
      senderAccountNo: user.accountNumber,
      receiverCountry: Fortransfers.receivercountry,
      receiverBank: Fortransfers.receiverbank,
      receiverName: Fortransfers.receivername,
      receiverAccountNo: Fortransfers.receiveraccounttno,
      receiverSwiftCode: Fortransfers.receiverswiftcode,
      amount: Fortransfers.amount,
      Description: Fortransfers.description,
    });

    // Save the transfer
    await doneTransfer.save();
    console.log(`Transfer done: ${doneTransfer}`);

    // Send email to the user
    const mailOptions = {
      from: '"FincchBankPay" <fincch@zohomail.com>',
      to: user.email,
      subject: 'Transaction Successful',
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
              <td style="padding: 10px; border: 1px solid #ddd;">${Fortransfers.receivername}</td>
            </tr>
            <tr>
              <th style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9;">Receiver Account</th>
              <td style="padding: 10px; border: 1px solid #ddd;">${Fortransfers.receiveraccounttno}</td>
            </tr>
            <tr>
              <th style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9;">Amount</th>
              <td style="padding: 10px; border: 1px solid #ddd;">$${Fortransfers.amount.toFixed(2)}</td>
            </tr>
            <tr>
              <th style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9;">Description</th>
              <td style="padding: 10px; border: 1px solid #ddd;">${Fortransfers.description || 'N/A'}</td>
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
    console.error('Error processing transfer:', error);
    errorMessage = 'Error saving the transaction';
    return res.redirect('/dashboard/tranfertocommercialbank?errorMessage=' + encodeURIComponent(errorMessage));
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
