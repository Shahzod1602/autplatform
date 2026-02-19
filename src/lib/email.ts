import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/verify?token=${token}`;

  await transporter.sendMail({
    from: `"AUT Platform" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Verify your email - AUT Platform",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563EB;">AUT Platform</h2>
        <p>Hello!</p>
        <p>Click the button below to complete your registration:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}"
             style="background-color: #2563EB; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Verify Email
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">If the button doesn't work, copy the link below into your browser:</p>
        <p style="color: #2563EB; font-size: 14px; word-break: break-all;">${verifyUrl}</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">This link is valid for 24 hours.</p>
      </div>
    `,
  });
}
