export const sendEmail = async (to: string, subject: string, body: string) => {
  console.log(`
--- SIMULATED EMAIL ---
To: ${to}
Subject: ${subject}
Body:
${body}
-----------------------
`);
  // In a real application, integrate with an email service like SendGrid, Nodemailer, etc.
  // Example: await sgMail.send({ to, from: 'noreply@your-app.com', subject, html: body });
};
