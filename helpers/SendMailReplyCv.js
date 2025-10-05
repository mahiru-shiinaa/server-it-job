const nodemailer = require("nodemailer");

module.exports.sendMailReplyCV = async (cvData, companyData, jobName, replyMessage) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const subject = `IT JOB - Phản hồi từ ${companyData.companyName}`;
  
  const emailContent = `
    <div style="max-width: 600px; margin: auto; border: 1px solid #eee; padding: 30px; font-family: Arial, sans-serif; background-color: #f9f9f9;">
      <div style="text-align: center; padding-bottom: 20px;">
        <h1 style="color: #2e5aac; margin-bottom: 5px;">IT JOB</h1>
        <p style="margin: 0; color: #555;">Nền tảng kết nối việc làm ngành CNTT</p>
      </div>
      
      <div style="background-color: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
        <h2 style="color: #333;">Phản hồi từ nhà tuyển dụng</h2>
        <p style="font-size: 16px; color: #555;">Xin chào <strong>${cvData.name}</strong>,</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-left: 4px solid #2e5aac; margin: 20px 0;">
          <p style="margin: 0;"><strong>Vị trí ứng tuyển:</strong> ${jobName}</p>
          <p style="margin: 10px 0 0 0;"><strong>Công ty:</strong> ${companyData.companyName}</p>
          <p style="margin: 10px 0 0 0;"><strong>Email liên hệ:</strong> ${companyData.email}</p>
          ${
            companyData.phone
              ? `<p style="margin: 10px 0 0 0;"><strong>Số điện thoại:</strong> ${companyData.phone}</p>`
              : ""
          }
        </div>
        
        <div style="background-color: #fff; border: 1px solid #ddd; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #2e5aac;">Nội dung phản hồi:</h3>
          <p style="line-height: 1.6; color: #333; white-space: pre-line;">${replyMessage}</p>
        </div>
        
        <p style="color: #777; margin-top: 30px;">
          Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ trực tiếp với công ty qua thông tin bên trên.
        </p>
        
        <p style="margin-top: 30px; color: #999;">
          Trân trọng,<br/>
          Đội ngũ <strong>IT JOB</strong>
        </p>
      </div>
      
      <div style="text-align: center; font-size: 12px; color: #aaa; margin-top: 30px;">
        © ${new Date().getFullYear()} IT JOB. All rights reserved.
      </div>
    </div>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: cvData.email,
    subject: subject,
    html: emailContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Reply email sent successfully:", info.response);
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("Error sending reply email:", error);
    throw error;
  }
};