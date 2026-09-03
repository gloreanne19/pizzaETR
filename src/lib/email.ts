import nodemailer from 'nodemailer';
import { env } from '@/server/env';

const transporter = nodemailer.createTransport({
  host: env.email.host,
  port: Number(env.email.port) || 587,
  secure: Number(env.email.port) === 465,
  auth: {
    user: env.email.user,
    pass: env.email.pass,
  },
  tls: {
    // Avoids certificate validation issues on macOS/local dev environments
    rejectUnauthorized: false,
  },
});

export interface OrderEmailData {
  orderId: number;
  customerName: string;
  customerEmail: string;
  totalPrice: number;
  items: Array<{ name: string; quantity: number; price: number }>;
}

export async function sendOrderConfirmationEmail(data: OrderEmailData): Promise<boolean> {
  if (!env.email.user || !env.email.pass || !data.customerEmail) {
    return false;
  }

  const itemsHtml = data.items
    .map((item) => `<li><strong>${item.name}</strong> x ${item.quantity} - ₱${Number(item.price).toFixed(2)}</li>`)
    .join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #008C3B; text-align: center;">${env.email.fromName} - Order Confirmation</h2>
      <p>Hi <strong>${data.customerName}</strong>,</p>
      <p>Thank you for your order! Your delicious pizza is being prepared.</p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Order #${data.orderId}</h3>
        <ul>${itemsHtml}</ul>
        <p style="font-size: 16px; font-weight: bold; color: #008C3B;">Total Price: ₱${Number(data.totalPrice).toFixed(2)}</p>
      </div>
      
      <p>If you have any questions, please reply to this email.</p>
      <p>Best regards,<br><strong>${env.email.fromName} Team</strong></p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"${env.email.fromName}" <${env.email.user}>`,
      to: data.customerEmail,
      subject: `Order #${data.orderId} Confirmation - ${env.email.fromName}`,
      html,
    });
    console.log(`Order confirmation email sent to ${data.customerEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending order email:', error);
    return false;
  }
}
