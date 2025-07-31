import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const ALLOWED_ORIGINS = [
  'http://localhost:8080', 
  'http://localhost:3000', 
  'https://portfolio-sigma-ten-81.vercel.app', 
  'https://nithin-dev-vitbhopal.vercel.app'
];

function setCorsHeaders(response, origin) {
  if (ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
}

export async function POST(request) {
  const origin = request.headers.get('origin');
  
  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      const response = NextResponse.json(
        { message: 'Missing required fields (name, email, message).' },
        { status: 400 }
      );
      return setCorsHeaders(response, origin);
    }

    // ✅ FIXED: Use createTransport (not createTransporter)
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Verify connection
    await transporter.verify();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'nithin958595@gmail.com',
      subject: `New Message from your Portfolio - ${name}`,
      html: `
        <p>You've received a new message from your portfolio contact form:</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
        <br/>
        <p>---</p>
        <p>This email was sent from your portfolio contact form.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    const response = NextResponse.json(
      { message: 'Email sent successfully!' },
      { status: 200 }
    );
    return setCorsHeaders(response, origin);

  } catch (error) {
    console.error('Error sending email:', error);
    const response = NextResponse.json(
      { message: 'Failed to send message', error: error.message },
      { status: 500 }
    );
    return setCorsHeaders(response, origin);
  }
}

export async function OPTIONS(request) {
  const origin = request.headers.get('origin');
  const response = new NextResponse(null, { status: 204 });
  return setCorsHeaders(response, origin);
}
``