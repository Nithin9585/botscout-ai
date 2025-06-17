import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// --- IMPORTANT: CONFIGURE YOUR FRONTEND ORIGIN ---
// In development, this will typically be your frontend's dev server URL (e.g., http://localhost:5173 for Vite, or http://localhost:3000 if your frontend IS the Next.js app).
// In production, this MUST be your actual deployed frontend domain (e.g., 'https://your-portfolio-domain.com').
// It's safer to be explicit than using '*' in production for security.
const FRONTEND_ORIGIN = process.env.NODE_ENV === 'development'
  ? 'http://localhost:8080' // <--- **REMOVE THE TRAILING SLASH HERE IF YOUR FRONTEND URL DOESN'T HAVE IT**
  : 'https://portfolio-sigma-ten-81.vercel.app'; // <--- **SET THIS TO YOUR ACTUAL DEPLOYED PORTFOLIO URL**

// Function to set CORS headers on the response
// We explicitly type 'response' here for better TypeScript support, if you're using it.
function setCorsHeaders(response) {
  response.headers.set('Access-Control-Allow-Origin', FRONTEND_ORIGIN);
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Include any custom headers your frontend might send
  response.headers.set('Access-Control-Max-Age', '86400'); // Cache preflight response for 24 hours
  return response;
}

// Handle POST requests for sending the email
export async function POST(request) { // Add Request type for clarity
  try {
    const { name, email, message } = await request.json();

    // Basic validation
    if (!name || !email || !message) {
      const response = NextResponse.json(
        { message: 'Missing required fields (name, email, message).' },
        { status: 400 }
      );
      return setCorsHeaders(response); // Apply CORS headers even on error responses
    }

    // 1. Configure your email transporter using environment variables
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', // For Gmail. Change if using another service.
      port: 587,
      secure: false, // Use 'false' for port 587 with STARTTLS; 'true' for port 465 with SSL/TLS
      auth: {
        user: process.env.EMAIL_USER, // Your email address from .env.local
        pass: process.env.EMAIL_PASSWORD, // Your App Password from .env.local
      },
    });

    // 2. Define email content
    const mailOptions = {
      from: process.env.EMAIL_USER,    // Sender address (your Gmail)
      to: 'nithin958595@gmail.com',  // Your personal email where you want to receive messages
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

    // 3. Send the email
    await transporter.sendMail(mailOptions);

    const response = NextResponse.json(
      { message: 'Email sent successfully!' },
      { status: 200 }
    );
    return setCorsHeaders(response); // Apply CORS headers on success

  } catch (error) {
    console.error('Error sending email:', error);
    const response = NextResponse.json(
      { message: 'Failed to send message', error: error.message }, // Ensure error is cast to Error
      { status: 500 }
    );
    return setCorsHeaders(response); // Apply CORS headers on error
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(request) { // Add Request type for clarity
  // *** THE FIX IS HERE ***
  // For a 204 No Content, use new NextResponse() directly.
  const response = new NextResponse(null, { status: 204 }); // Correct way to send 204 without body
  return setCorsHeaders(response);
}