const nodemailer = require("nodemailer");

module.exports.sendMail = (email, subject, otpCode) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true cho port 465, false cho 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false
    },
    // Thêm các timeout
    connectionTimeout: 10000, // 10 giây
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: subject,
    html: `
    <div style="max-width: 600px; margin: auto; border: 1px solid #eee; padding: 30px; font-family: Arial, sans-serif; background-color: #f9f9f9;">
      <div style="text-align: center; padding-bottom: 20px;">
        <h1 style="color: #2e5aac; margin-bottom: 5px;">IT JOB</h1>
        <p style="margin: 0; color: #555;">Nền tảng kết nối việc làm ngành CNTT</p>
      </div>
      <div style="background-color: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
        <h2 style="color: #333;">Mã xác thực OTP của bạn</h2>
        <p style="font-size: 16px; color: #555;">Xin chào,</p>
        <p style="font-size: 16px; color: #555;">Bạn đang thực hiện hành động cần xác minh qua OTP. Vui lòng sử dụng mã dưới đây:</p>
        <div style="text-align: center; margin: 20px 0;">
          <span style="display: inline-block; padding: 12px 24px; font-size: 24px; font-weight: bold; background-color: #2e5aac; color: #fff; border-radius: 6px;">
            ${otpCode}
          </span>
        </div>
        <p style="color: #777;">Mã OTP này sẽ hết hạn sau <strong>5 phút</strong>. Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email.</p>
        <p style="margin-top: 30px; color: #999;">Trân trọng,<br/>Đội ngũ <strong>IT JOB</strong></p>
      </div>
      <div style="text-align: center; font-size: 12px; color: #aaa; margin-top: 30px;">
        © ${new Date().getFullYear()} IT JOB. All rights reserved.
      </div>
    </div>
  `,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};