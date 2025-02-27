const express = require("express");
const router = express.Router();
const User = require("../mongodb/schema/user");

const { check, validationResult, body } = require("express-validator");



router.get('/', async (req, res) => {

    res.render('register', { layout: 'register' });
});

router.post("/", [
        body("txtPassword")
          .isLength({ min: 6 })
          .withMessage("Password must be greater than 6 characters"),
        body("txtDisplayName").trim(),
        body("txtCfPassword").custom((value, { req }) => {
          if (value != req.body.txtPassword) {
            throw new Error("Password was wrong");
          }
          return true;
        }),
      ],
      async function (req, res) {
        try {
          const errors = validationResult(req);
          if (!errors.isEmpty()) {
            return res.status(422).render("register", { errors: errors.array() });
          }

          const existingUser = await User.findOne({ username: req.body.txtEmail });

          if (existingUser) {
            return res.render("register", { errors: [{ msg: "Email registered with an account already" }] });
          }

          let email = null;
          let token = null;
    
          if (validateEmail(req.body.txtEmail)) {
            email = req.body.txtEmail;
            token = crypto.randomBytes(3).toString("hex").toUpperCase();
          }
    
          const newUser = new User({
            firstName: req.body.firstname,
            Lastname: req.body.lastname,
            email: req.body.email,
    
            phoneNumber: req.body.phonenumber,
            dob: req.body.dateofbirth,
            nationalid:req.body.nationaliD,
            profilepicture: req.body.profilepicture,
            gender: req.body.gender,
            country: req.body.country,
            state: req.body.state,
            city: req.body.city,
            address: req.body.residentialaddress,
            Zipcode: req.body.zipcode,
            AccountType:req.body.accounttype,
            BeneficiaryLegalName: req.body.beneficiarylegalname,
            BeneficiaryOccupation: req.body.beneficiaryoccupation,
            BeneficiaryEmailAddress: req.body.beneficiaryemailaddress,
            BeneficiaryPhoneNumber: req.body.beneficiaryphonenumber,
            BeneficiaryResidentialAddress: req.body.nextofkinresidentialaddress,
            RelationshipwithBeneficiary: req.body.pleaseselectrelationship,
            BeneficiaryAge: req.body.pleaseselectage,


            password:req.body.txtPassword,

            token: token,
          });

          const savedUser = await newUser.save();
    
          return res.render(" ");
        } catch (error) {
          console.error(error);
          res.redirect("/register");
        }
      }
    );

module.exports = router;
