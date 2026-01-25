import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const EMAIL_FROM = process.env.EMAIL_FROM || 'Eats & Beats <noreply@eatsandbeats.com>'
const APP_URL = process.env.APP_URL || 'http://localhost:3000'

interface EmailResult {
  success: boolean
  error?: string
}

/**
 * Send a greeting email when a restaurant submits a partnership request
 */
export async function sendRequestReceivedEmail(
  to: string,
  contactName: string
): Promise<EmailResult> {
  try {
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: 'We received your partnership request - Eats & Beats',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #6366f1; margin: 0;">Eats & Beats</h1>
          </div>
          
          <h2 style="color: #1f2937;">Hello ${contactName},</h2>
          
          <p>Thank you for your interest in partnering with Eats & Beats!</p>
          
          <p>We've received your partnership request and our team is reviewing it. We carefully evaluate each restaurant to ensure the best experience for our diners and partners.</p>
          
          <p>What happens next:</p>
          <ul>
            <li>Our team will review your request within 2-3 business days</li>
            <li>A member of our partnerships team may reach out for additional information</li>
            <li>Once approved, you'll receive an email with instructions to set up your restaurant profile</li>
          </ul>
          
          <p>If you have any questions in the meantime, feel free to reply to this email.</p>
          
          <p style="margin-top: 30px;">
            Best regards,<br>
            <strong>The Eats & Beats Team</strong>
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #6b7280; text-align: center;">
            © ${new Date().getFullYear()} Eats & Beats. All rights reserved.
          </p>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error('Failed to send request received email:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error('Error sending request received email:', err)
    return { success: false, error: 'Failed to send email' }
  }
}

/**
 * Send an approval email with the unique registration link
 */
export async function sendApprovalEmail(
  to: string,
  contactName: string,
  approvalCode: string
): Promise<EmailResult> {
  const registrationLink = `${APP_URL}/register/${approvalCode}`

  try {
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: 'Your partnership request has been approved! - Eats & Beats',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #6366f1; margin: 0;">Eats & Beats</h1>
          </div>
          
          <h2 style="color: #1f2937;">Congratulations, ${contactName}!</h2>
          
          <p>Great news! Your partnership request has been <strong style="color: #10b981;">approved</strong>.</p>
          
          <p>We're excited to welcome your restaurant to the Eats & Beats platform. You're now ready to set up your restaurant profile and start accepting reservations.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${registrationLink}" style="display: inline-block; background-color: #6366f1; color: white; text-decoration: none; padding: 14px 28px; border-radius: 25px; font-weight: 600; font-size: 16px;">
              Complete Your Registration
            </a>
          </div>
          
          <p style="font-size: 14px; color: #6b7280;">
            This link is unique to your restaurant and can only be used once. Please complete your registration at your earliest convenience.
          </p>
          
          <p>During registration, you'll be able to:</p>
          <ul>
            <li>Set up your restaurant profile</li>
            <li>Configure your opening hours</li>
            <li>Design your floor plan</li>
            <li>Start accepting reservations</li>
          </ul>
          
          <p style="margin-top: 30px;">
            Welcome to the family!<br>
            <strong>The Eats & Beats Team</strong>
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #6b7280; text-align: center;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${registrationLink}" style="color: #6366f1;">${registrationLink}</a>
          </p>
          
          <p style="font-size: 12px; color: #6b7280; text-align: center;">
            © ${new Date().getFullYear()} Eats & Beats. All rights reserved.
          </p>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error('Failed to send approval email:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error('Error sending approval email:', err)
    return { success: false, error: 'Failed to send email' }
  }
}

interface ReservationEmailData {
  guestName: string
  guestEmail: string
  restaurantName: string
  confirmationCode: string
  date: string // formatted date string
  time: string // formatted time string
  numberOfPeople: number
}

/**
 * Send a reservation confirmation email
 */
export async function sendReservationConfirmedEmail(
  data: ReservationEmailData
): Promise<EmailResult> {
  try {
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: data.guestEmail,
      subject: `Reservation Confirmed at ${data.restaurantName} - Eats & Beats`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #6366f1; margin: 0;">Eats & Beats</h1>
          </div>
          
          <h2 style="color: #1f2937;">Hello ${data.guestName},</h2>
          
          <p>Great news! Your reservation at <strong>${data.restaurantName}</strong> has been <strong style="color: #10b981;">confirmed</strong>.</p>
          
          <div style="background-color: #f9fafb; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #1f2937;">Reservation Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Restaurant</td>
                <td style="padding: 8px 0; font-weight: 600; text-align: right;">${data.restaurantName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Date</td>
                <td style="padding: 8px 0; font-weight: 600; text-align: right;">${data.date}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Time</td>
                <td style="padding: 8px 0; font-weight: 600; text-align: right;">${data.time}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Party Size</td>
                <td style="padding: 8px 0; font-weight: 600; text-align: right;">${data.numberOfPeople} ${data.numberOfPeople === 1 ? 'guest' : 'guests'}</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #6366f1; color: white; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
            <p style="margin: 0 0 5px 0; font-size: 14px; opacity: 0.9;">Your Confirmation Code</p>
            <p style="margin: 0; font-size: 28px; font-weight: bold; letter-spacing: 2px;">${data.confirmationCode.slice(0, 8).toUpperCase()}</p>
          </div>
          
          <p style="font-size: 14px; color: #6b7280;">Please save this confirmation code and present it when you arrive at the restaurant.</p>
          
          <p style="margin-top: 30px;">
            We look forward to seeing you!<br>
            <strong>The Eats & Beats Team</strong>
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #6b7280; text-align: center;">
            © ${new Date().getFullYear()} Eats & Beats. All rights reserved.
          </p>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error('Failed to send reservation confirmed email:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error('Error sending reservation confirmed email:', err)
    return { success: false, error: 'Failed to send email' }
  }
}

/**
 * Send a reservation pending email (awaiting approval)
 */
export async function sendReservationPendingEmail(
  data: ReservationEmailData
): Promise<EmailResult> {
  try {
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: data.guestEmail,
      subject: `Reservation Request Received - ${data.restaurantName} - Eats & Beats`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #6366f1; margin: 0;">Eats & Beats</h1>
          </div>
          
          <h2 style="color: #1f2937;">Hello ${data.guestName},</h2>
          
          <p>Thank you for your reservation request at <strong>${data.restaurantName}</strong>.</p>
          
          <p>Your reservation is currently <strong style="color: #f59e0b;">pending approval</strong> from the restaurant. You will receive a confirmation email once your reservation has been approved.</p>
          
          <div style="background-color: #f9fafb; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #1f2937;">Requested Reservation</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Restaurant</td>
                <td style="padding: 8px 0; font-weight: 600; text-align: right;">${data.restaurantName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Date</td>
                <td style="padding: 8px 0; font-weight: 600; text-align: right;">${data.date}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Time</td>
                <td style="padding: 8px 0; font-weight: 600; text-align: right;">${data.time}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Party Size</td>
                <td style="padding: 8px 0; font-weight: 600; text-align: right;">${data.numberOfPeople} ${data.numberOfPeople === 1 ? 'guest' : 'guests'}</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
            <p style="margin: 0 0 5px 0; font-size: 14px; color: #92400e;">Your Reference Code</p>
            <p style="margin: 0; font-size: 28px; font-weight: bold; letter-spacing: 2px; color: #92400e;">${data.confirmationCode.slice(0, 8).toUpperCase()}</p>
          </div>
          
          <p style="font-size: 14px; color: #6b7280;">Please save this reference code. You can use it to check the status of your reservation.</p>
          
          <p style="margin-top: 30px;">
            Thank you for choosing Eats & Beats!<br>
            <strong>The Eats & Beats Team</strong>
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #6b7280; text-align: center;">
            © ${new Date().getFullYear()} Eats & Beats. All rights reserved.
          </p>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error('Failed to send reservation pending email:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error('Error sending reservation pending email:', err)
    return { success: false, error: 'Failed to send email' }
  }
}

/**
 * Send a polite decline email
 */
export async function sendDeclineEmail(
  to: string,
  contactName: string,
  reason?: string
): Promise<EmailResult> {
  try {
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: 'Update on your partnership request - Eats & Beats',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #6366f1; margin: 0;">Eats & Beats</h1>
          </div>
          
          <h2 style="color: #1f2937;">Hello ${contactName},</h2>
          
          <p>Thank you for your interest in partnering with Eats & Beats.</p>
          
          <p>After careful review, we regret to inform you that we're unable to proceed with your partnership request at this time.</p>
          
          ${reason ? `<p style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; color: #4b5563;"><em>${reason}</em></p>` : ''}
          
          <p>This decision is not permanent. As we continue to grow and expand, we may be able to accommodate more partners in the future. We encourage you to reapply in 3-6 months, and we'll be happy to reconsider your application.</p>
          
          <p>In the meantime, we appreciate your understanding and wish you continued success with your restaurant.</p>
          
          <p style="margin-top: 30px;">
            Warm regards,<br>
            <strong>The Eats & Beats Team</strong>
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #6b7280; text-align: center;">
            © ${new Date().getFullYear()} Eats & Beats. All rights reserved.
          </p>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error('Failed to send decline email:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error('Error sending decline email:', err)
    return { success: false, error: 'Failed to send email' }
  }
}
