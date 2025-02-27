// const express = require("express");
// const router = express.Router();
// const User = require("../services/user");
// var errors = [];

// const bcrypt = require("bcrypt");

// router.get("/", async (req, res) => {
//   if (req.session.fgEmail) {
//     const found = await User.findByEmail(req.session.fgEmail);

//     if (found) {
//       return res.render("confirmForgotPassword", { errors });
//     }
//     delete req.session.fgEmail;
//   }
//   return res.render("forgotPassword", { errors });
// });
// router.post("/", async (req, res) => {
//   const txtCode = req.body.txtCode || null;
//   const txtEmail = req.session.fgEmail || req.body.txtEmail || null;
//   let found = null;
//   if (req.session.fgEmail) {
//     found = await User.findByEmail(req.session.fgEmail);
//     if (!found) {
//       delete req.session.fgEmail;
//       errors = [
//         { msg: "Không tìm thấy tài khoản phù hợp với mail bạn vừa nhập" },
//       ];
//       return res.redirect("/forgot-password");
//     }
//   }

//   if (txtCode) {
//     delete req.session.fgEmail;
//     if (found) {
//       errors = [];
//       if (await found.confirmForgotCode(txtCode)) {
//         const newPassword = bcrypt.hashSync("123456", 10);
//         found.password = newPassword;
//         found.save();
//         return res.status(200).redirect("/alert/resetPasswordSuccess");
//       }
//       errors = [{ msg: "Code không hợp lệ" }];

//       return res.render("confirmForgotPassword", { errors });
//     }
//     errors = [{ msg: "Đã xảy ra lỗi" }];

//     return res.end(txtCode);
//   }

//   if (txtEmail) {
//     delete req.session.fgEmail;

//     req.session.fgEmail = txtEmail;
//     found = await User.findByEmail(txtEmail);
//     if (found) {
//       errors = [];
//       found.forgotPassword();
//       return res.render("confirmForgotPassword", { errors });
//     }
//     errors = [
//       { msg: "Không tìm thấy tài khoản phù hợp với mail bạn vừa nhập" },
//     ];
//     return res.redirect("/forgot-password");
//   }
// });
// module.exports = router;
