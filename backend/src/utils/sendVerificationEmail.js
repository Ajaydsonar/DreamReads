import nodemailer from "nodemailer";

const sendVerificationEmail = async function (email, token) {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "devanandsonar787@gmail.com",
      pass: `vfvk vccf cjqs hgqr`,
    },
  });

  let info = await transporter.sendMail({
    from: "Dream Reads team <noreply@dreamreads.com>",
    to: email,
    subject: "Verify Your Email",
    text: `Please click on this link to verify your email: http://localhost:8080/api/v1/author/verify-email/${token}`,

    html: `<p>Please click on this link to verify your email: <a href="http://localhost:8080/api/v1/author/verify-email/${token}">Verify Email</a></p>`,
  });

  // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
};

export { sendVerificationEmail };
