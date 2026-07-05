import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Local dev workaround: some antivirus/network tools (common on Windows)
  // inject a self-signed certificate into HTTPS/SMTP traffic for inspection,
  // which Node rejects by default. Safe to disable for local development;
  // remove this in production or once the root cause is fixed.
  tls: {
    rejectUnauthorized: false,
  },
});

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

const formatPrice = (price) =>
  price ? `${price.currency === 'INR' ? '₹' : price.currency + ' '}${price.amount?.toLocaleString('en-IN')}` : '';

// price.amount on a Package is PER PERSON — multiply by groupSize for the actual total charge
const calculateTotalPrice = (price, groupSize) => {
  if (!price?.amount || !groupSize) return null;
  return { amount: price.amount * groupSize, currency: price.currency };
};

const approvedTemplate = (booking) => ({
  subject: `Booking Confirmed — ${booking.package?.title || 'Your Trek'} (${booking.bookingId})`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1f2937;">
      <div style="background: #0a1628; padding: 28px 24px; text-align: center;">
        <h1 style="color: #fbbf24; margin: 0; font-size: 20px;">Matrika</h1>
      </div>
      <div style="padding: 28px 24px;">
        <h2 style="color: #0a1628; margin-top: 0;">Your booking is confirmed! 🎉</h2>
        <p>Hi ${booking.contactPerson?.name || 'there'},</p>
        <p>Great news — your booking for <strong>${booking.package?.title || 'your trek'}</strong> has been confirmed.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr><td style="padding: 8px 0; color: #6b7280;">Booking ID</td><td style="padding: 8px 0; font-weight: 600;">${booking.bookingId}</td></tr>
          <tr><td style="padding: 8px 0; color: #6b7280;">Trek Date</td><td style="padding: 8px 0; font-weight: 600;">${formatDate(booking.trekDate)}</td></tr>
          <tr><td style="padding: 8px 0; color: #6b7280;">Group Size</td><td style="padding: 8px 0; font-weight: 600;">${booking.groupSize}</td></tr>
          ${booking.package?.price ? `<tr><td style="padding: 8px 0; color: #6b7280;">Price per Person</td><td style="padding: 8px 0; font-weight: 600;">${formatPrice(booking.package.price)}</td></tr>` : ''}
          ${booking.package?.price ? `<tr><td style="padding: 8px 0; color: #6b7280;">Total Price (${booking.groupSize} ${booking.groupSize === 1 ? 'person' : 'people'})</td><td style="padding: 8px 0; font-weight: 700;">${formatPrice(calculateTotalPrice(booking.package.price, booking.groupSize))}</td></tr>` : ''}
        </table>
        ${booking.adminNotes ? `<p style="background: #f9fafb; padding: 12px 16px; border-radius: 8px; font-size: 14px;"><strong>Note from our team:</strong> ${booking.adminNotes}</p>` : ''}
        <p>We're excited to have you on this trek. If you have any questions, just reply to this email.</p>
         <p><strong> Contact : +91 9027378308</strong></p>
        <p><strong> Mail : matrikatoursandtravels3@gmail.com</strong></p>
      </div>
    </div>
  `,
});

const cancelledTemplate = (booking) => ({
  subject: `Booking Update — ${booking.package?.title || 'Your Trek'} (${booking.bookingId})`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1f2937;">
      <div style="background: #0a1628; padding: 28px 24px; text-align: center;">
        <h1 style="color: #fbbf24; margin: 0; font-size: 20px;">Matrika</h1>
      </div>
      <div style="padding: 28px 24px;">
        <h2 style="color: #0a1628; margin-top: 0;">Booking Update</h2>
        <p>Hi ${booking.contactPerson?.name || 'there'},</p>
        <p>We're writing to let you know that your booking for <strong>${booking.package?.title || 'your trek'}</strong> (${booking.bookingId}) has been cancelled.</p>
        ${booking.cancelReason ? `<p style="background: #fef2f2; padding: 12px 16px; border-radius: 8px; font-size: 14px; color: #b91c1c;"><strong>Reason:</strong> ${booking.cancelReason}</p>` : ''}
        <p>If you believe this is a mistake or have any questions, please reply to this email and we'll sort it out.</p>
        <p style="margin-top: 28px; color: #6b7280; font-size: 13px;">— The Matrika Team</p>
        <p><strong> Contact : +91 9027378308</strong></p>
        <p><strong> Mail : matrikatoursandtravels3@gmail.com</strong></p>
      </div>
    </div>
  `,
});

const completedTemplate = (booking) => ({
  subject: `Thank You for Trekking With Us! (${booking.bookingId})`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1f2937;">
      <div style="background: #0a1628; padding: 28px 24px; text-align: center;">
        <h1 style="color: #fbbf24; margin: 0; font-size: 20px;">Matrika </h1>
      </div>
      <div style="padding: 28px 24px;">
        <h2 style="color: #0a1628; margin-top: 0;">Hope you had an amazing trek! 🏔️</h2>
        <p>Hi ${booking.contactPerson?.name || 'there'},</p>
        <p>Your trek — <strong>${booking.package?.title || 'this journey'}</strong> (${booking.bookingId}) — is now marked complete. Thank you for choosing Matrika !</p>
        <p>We'd love to hear about your experience. Feel free to reply with any feedback.</p>
        <p style="margin-top: 28px; color: #6b7280; font-size: 13px;">— The Matrika Team</p>
        <p><strong> Contact : +91 9027378308</strong></p>
        <p><strong> Mail : matrikatoursandtravels3@gmail.com</strong></p>
      </div>
    </div>
  `,
});

const templates = {
  Approved: approvedTemplate,
  Cancelled: cancelledTemplate,
  Completed: completedTemplate,
};

// Sends a status-update email for a booking. Deliberately swallows all errors —
// a failed email must never block or fail the booking status update itself.
export const sendBookingStatusEmail = async (booking) => {
  try {
    const buildTemplate = templates[booking.status];
    if (!buildTemplate) return; // e.g. 'Pending' has no email

    const to = booking.contactPerson?.email;
    if (!to) {
      console.warn(`No contact email on booking ${booking.bookingId}, skipping email`);
      return;
    }

    const { subject, html } = buildTemplate(booking);

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
    });

    console.log(`Status email sent for booking ${booking.bookingId} (${booking.status})`);
  } catch (err) {
    console.error(`Failed to send status email for booking ${booking.bookingId}:`, err.message);
  }
};