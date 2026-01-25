import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const EMAIL_FROM = process.env.EMAIL_FROM || 'Eats & Beats <noreply@eatsandbeats.com>'

/**
 * Get the base URL for email links
 * Checks multiple environment variables in order of priority
 */
function getBaseUrl(): string {
  // Explicit APP_URL takes highest priority
  if (process.env.APP_URL) {
    return process.env.APP_URL
  }
  // Vercel provides VERCEL_URL for preview/staging deployments
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  // Fallback for local development
  return 'http://localhost:3000'
}

// Theme colors matching the app's design
const COLORS = {
  primary: '#706459',      // Warm brown
  primaryDark: '#5a504a',  // Darker brown for buttons
  success: '#5a8a5a',      // Muted green
  warning: '#b8963d',      // Warm amber
  warningLight: '#faf6ed', // Light amber background
  warningBorder: '#e8d4a8',// Amber border
  error: '#a34a3a',        // Muted red
  accent: '#b2a798',       // Beige
  background: '#f8f6f3',   // Warm off-white
  cardBg: '#ffffff',       // Card background
  border: '#e8e4df',       // Warm gray border
  textDark: '#3d3833',     // Dark text
  textMuted: '#706459',    // Muted text (same as primary)
  textLight: '#958d84',    // Light text
}

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
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: ${COLORS.textDark}; max-width: 600px; margin: 0 auto; padding: 20px; background-color: ${COLORS.background};">
          <div style="background-color: ${COLORS.cardBg}; border-radius: 20px; padding: 40px; border: 1px solid ${COLORS.border};">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="${getBaseUrl()}/uploads/eatsnbeats-dark.png" alt="Eats & Beats" style="height: 50px; width: auto; margin-bottom: 10px;">
              <p style="color: ${COLORS.textLight}; margin: 0; font-size: 14px;">Restaurant Reservations</p>
            </div>
            
            <h2 style="color: ${COLORS.textDark}; margin-bottom: 20px;">Hello ${contactName},</h2>
            
            <p style="color: ${COLORS.textMuted};">Thank you for your interest in partnering with Eats & Beats!</p>
            
            <p style="color: ${COLORS.textMuted};">We've received your partnership request and our team is reviewing it. We carefully evaluate each restaurant to ensure the best experience for our diners and partners.</p>
            
            <div style="background-color: ${COLORS.background}; border-radius: 12px; padding: 20px; margin: 25px 0; border: 1px solid ${COLORS.border};">
              <p style="color: ${COLORS.textDark}; font-weight: 600; margin: 0 0 15px 0;">What happens next:</p>
              <ul style="color: ${COLORS.textMuted}; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Our team will review your request within 2-3 business days</li>
                <li style="margin-bottom: 8px;">A member of our partnerships team may reach out for additional information</li>
                <li>Once approved, you'll receive an email with instructions to set up your restaurant profile</li>
              </ul>
            </div>
            
            <p style="color: ${COLORS.textMuted};">If you have any questions in the meantime, feel free to reply to this email.</p>
            
            <p style="margin-top: 30px; color: ${COLORS.textMuted};">
              Best regards,<br>
              <strong style="color: ${COLORS.textDark};">The Eats & Beats Team</strong>
            </p>
          </div>
          
          <p style="font-size: 12px; color: ${COLORS.textLight}; text-align: center; margin-top: 20px;">
            &copy; ${new Date().getFullYear()} Eats & Beats. All rights reserved.
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
  const baseUrl = getBaseUrl()
  const registrationLink = `${baseUrl}/register/${approvalCode}`

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
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: ${COLORS.textDark}; max-width: 600px; margin: 0 auto; padding: 20px; background-color: ${COLORS.background};">
          <div style="background-color: ${COLORS.cardBg}; border-radius: 20px; padding: 40px; border: 1px solid ${COLORS.border};">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="${getBaseUrl()}/uploads/eatsnbeats-dark.png" alt="Eats & Beats" style="height: 50px; width: auto; margin-bottom: 10px;">
              <p style="color: ${COLORS.textLight}; margin: 0; font-size: 14px;">Restaurant Reservations</p>
            </div>
            
            <h2 style="color: ${COLORS.textDark}; margin-bottom: 20px;">Congratulations, ${contactName}!</h2>
            
            <p style="color: ${COLORS.textMuted};">Great news! Your partnership request has been <strong style="color: ${COLORS.success};">approved</strong>.</p>
            
            <p style="color: ${COLORS.textMuted};">We're excited to welcome your restaurant to the Eats & Beats platform. You're now ready to set up your restaurant profile and start accepting reservations.</p>
            
            <div style="text-align: center; margin: 35px 0;">
              <a href="${registrationLink}" style="display: inline-block; background-color: ${COLORS.primary}; color: white; text-decoration: none; padding: 16px 32px; border-radius: 25px; font-weight: 600; font-size: 16px;">
                Complete Your Registration
              </a>
            </div>
            
            <p style="font-size: 14px; color: ${COLORS.textLight}; text-align: center;">
              This link is unique to your restaurant and can only be used once.
            </p>
            
            <div style="background-color: ${COLORS.background}; border-radius: 12px; padding: 20px; margin: 25px 0; border: 1px solid ${COLORS.border};">
              <p style="color: ${COLORS.textDark}; font-weight: 600; margin: 0 0 15px 0;">During registration, you'll be able to:</p>
              <ul style="color: ${COLORS.textMuted}; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Set up your restaurant profile</li>
                <li style="margin-bottom: 8px;">Configure your opening hours</li>
                <li style="margin-bottom: 8px;">Add photos and description</li>
                <li>Start accepting reservations</li>
              </ul>
            </div>
            
            <p style="margin-top: 30px; color: ${COLORS.textMuted};">
              Welcome to the family!<br>
              <strong style="color: ${COLORS.textDark};">The Eats & Beats Team</strong>
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <p style="font-size: 12px; color: ${COLORS.textLight};">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${registrationLink}" style="color: ${COLORS.primary}; word-break: break-all;">${registrationLink}</a>
            </p>
            <p style="font-size: 12px; color: ${COLORS.textLight}; margin-top: 15px;">
              &copy; ${new Date().getFullYear()} Eats & Beats. All rights reserved.
            </p>
          </div>
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
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: ${COLORS.textDark}; max-width: 600px; margin: 0 auto; padding: 20px; background-color: ${COLORS.background};">
          <div style="background-color: ${COLORS.cardBg}; border-radius: 20px; padding: 40px; border: 1px solid ${COLORS.border};">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="${getBaseUrl()}/uploads/eatsnbeats-dark.png" alt="Eats & Beats" style="height: 50px; width: auto; margin-bottom: 10px;">
              <p style="color: ${COLORS.textLight}; margin: 0; font-size: 14px;">Restaurant Reservations</p>
            </div>
            
            <h2 style="color: ${COLORS.textDark}; margin-bottom: 20px;">Hello ${data.guestName},</h2>
            
            <p style="color: ${COLORS.textMuted};">Great news! Your reservation at <strong style="color: ${COLORS.textDark};">${data.restaurantName}</strong> has been <strong style="color: ${COLORS.success};">confirmed</strong>.</p>
            
            <div style="background-color: ${COLORS.background}; border-radius: 12px; padding: 20px; margin: 25px 0; border: 1px solid ${COLORS.border};">
              <h3 style="margin: 0 0 15px 0; color: ${COLORS.textDark}; font-size: 16px;">Reservation Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; color: ${COLORS.textLight}; border-bottom: 1px solid ${COLORS.border};">Restaurant</td>
                  <td style="padding: 10px 0; font-weight: 600; text-align: right; color: ${COLORS.textDark}; border-bottom: 1px solid ${COLORS.border};">${data.restaurantName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: ${COLORS.textLight}; border-bottom: 1px solid ${COLORS.border};">Date</td>
                  <td style="padding: 10px 0; font-weight: 600; text-align: right; color: ${COLORS.textDark}; border-bottom: 1px solid ${COLORS.border};">${data.date}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: ${COLORS.textLight}; border-bottom: 1px solid ${COLORS.border};">Time</td>
                  <td style="padding: 10px 0; font-weight: 600; text-align: right; color: ${COLORS.textDark}; border-bottom: 1px solid ${COLORS.border};">${data.time}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: ${COLORS.textLight};">Party Size</td>
                  <td style="padding: 10px 0; font-weight: 600; text-align: right; color: ${COLORS.textDark};">${data.numberOfPeople} ${data.numberOfPeople === 1 ? 'guest' : 'guests'}</td>
                </tr>
              </table>
            </div>
            
            <div style="background-color: ${COLORS.primary}; color: white; border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 14px; opacity: 0.9;">Your Confirmation Code</p>
              <p style="margin: 0; font-size: 32px; font-weight: bold; letter-spacing: 3px;">${data.confirmationCode.slice(0, 8).toUpperCase()}</p>
            </div>
            
            <p style="font-size: 14px; color: ${COLORS.textLight}; text-align: center;">Please save this confirmation code and present it when you arrive at the restaurant.</p>
            
            <p style="margin-top: 30px; color: ${COLORS.textMuted};">
              We look forward to seeing you!<br>
              <strong style="color: ${COLORS.textDark};">The Eats & Beats Team</strong>
            </p>
          </div>
          
          <p style="font-size: 12px; color: ${COLORS.textLight}; text-align: center; margin-top: 20px;">
            &copy; ${new Date().getFullYear()} Eats & Beats. All rights reserved.
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
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: ${COLORS.textDark}; max-width: 600px; margin: 0 auto; padding: 20px; background-color: ${COLORS.background};">
          <div style="background-color: ${COLORS.cardBg}; border-radius: 20px; padding: 40px; border: 1px solid ${COLORS.border};">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="${getBaseUrl()}/uploads/eatsnbeats-dark.png" alt="Eats & Beats" style="height: 50px; width: auto; margin-bottom: 10px;">
              <p style="color: ${COLORS.textLight}; margin: 0; font-size: 14px;">Restaurant Reservations</p>
            </div>
            
            <h2 style="color: ${COLORS.textDark}; margin-bottom: 20px;">Hello ${data.guestName},</h2>
            
            <p style="color: ${COLORS.textMuted};">Thank you for your reservation request at <strong style="color: ${COLORS.textDark};">${data.restaurantName}</strong>.</p>
            
            <p style="color: ${COLORS.textMuted};">Your reservation is currently <strong style="color: ${COLORS.warning};">pending approval</strong> from the restaurant. You will receive a confirmation email once your reservation has been approved.</p>
            
            <div style="background-color: ${COLORS.background}; border-radius: 12px; padding: 20px; margin: 25px 0; border: 1px solid ${COLORS.border};">
              <h3 style="margin: 0 0 15px 0; color: ${COLORS.textDark}; font-size: 16px;">Requested Reservation</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; color: ${COLORS.textLight}; border-bottom: 1px solid ${COLORS.border};">Restaurant</td>
                  <td style="padding: 10px 0; font-weight: 600; text-align: right; color: ${COLORS.textDark}; border-bottom: 1px solid ${COLORS.border};">${data.restaurantName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: ${COLORS.textLight}; border-bottom: 1px solid ${COLORS.border};">Date</td>
                  <td style="padding: 10px 0; font-weight: 600; text-align: right; color: ${COLORS.textDark}; border-bottom: 1px solid ${COLORS.border};">${data.date}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: ${COLORS.textLight}; border-bottom: 1px solid ${COLORS.border};">Time</td>
                  <td style="padding: 10px 0; font-weight: 600; text-align: right; color: ${COLORS.textDark}; border-bottom: 1px solid ${COLORS.border};">${data.time}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: ${COLORS.textLight};">Party Size</td>
                  <td style="padding: 10px 0; font-weight: 600; text-align: right; color: ${COLORS.textDark};">${data.numberOfPeople} ${data.numberOfPeople === 1 ? 'guest' : 'guests'}</td>
                </tr>
              </table>
            </div>
            
            <div style="background-color: ${COLORS.warningLight}; border: 1px solid ${COLORS.warningBorder}; border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: ${COLORS.warning};">Your Reference Code</p>
              <p style="margin: 0; font-size: 32px; font-weight: bold; letter-spacing: 3px; color: ${COLORS.warning};">${data.confirmationCode.slice(0, 8).toUpperCase()}</p>
            </div>
            
            <p style="font-size: 14px; color: ${COLORS.textLight}; text-align: center;">Please save this reference code. You can use it to check the status of your reservation.</p>
            
            <p style="margin-top: 30px; color: ${COLORS.textMuted};">
              Thank you for choosing Eats & Beats!<br>
              <strong style="color: ${COLORS.textDark};">The Eats & Beats Team</strong>
            </p>
          </div>
          
          <p style="font-size: 12px; color: ${COLORS.textLight}; text-align: center; margin-top: 20px;">
            &copy; ${new Date().getFullYear()} Eats & Beats. All rights reserved.
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
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: ${COLORS.textDark}; max-width: 600px; margin: 0 auto; padding: 20px; background-color: ${COLORS.background};">
          <div style="background-color: ${COLORS.cardBg}; border-radius: 20px; padding: 40px; border: 1px solid ${COLORS.border};">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="${getBaseUrl()}/uploads/eatsnbeats-dark.png" alt="Eats & Beats" style="height: 50px; width: auto; margin-bottom: 10px;">
              <p style="color: ${COLORS.textLight}; margin: 0; font-size: 14px;">Restaurant Reservations</p>
            </div>
            
            <h2 style="color: ${COLORS.textDark}; margin-bottom: 20px;">Hello ${contactName},</h2>
            
            <p style="color: ${COLORS.textMuted};">Thank you for your interest in partnering with Eats & Beats.</p>
            
            <p style="color: ${COLORS.textMuted};">After careful review, we regret to inform you that we're unable to proceed with your partnership request at this time.</p>
            
            ${reason ? `
            <div style="background-color: ${COLORS.background}; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid ${COLORS.accent};">
              <p style="color: ${COLORS.textMuted}; margin: 0; font-style: italic;">${reason}</p>
            </div>
            ` : ''}
            
            <p style="color: ${COLORS.textMuted};">This decision is not permanent. As we continue to grow and expand, we may be able to accommodate more partners in the future. We encourage you to reapply in 3-6 months, and we'll be happy to reconsider your application.</p>
            
            <p style="color: ${COLORS.textMuted};">In the meantime, we appreciate your understanding and wish you continued success with your restaurant.</p>
            
            <p style="margin-top: 30px; color: ${COLORS.textMuted};">
              Warm regards,<br>
              <strong style="color: ${COLORS.textDark};">The Eats & Beats Team</strong>
            </p>
          </div>
          
          <p style="font-size: 12px; color: ${COLORS.textLight}; text-align: center; margin-top: 20px;">
            &copy; ${new Date().getFullYear()} Eats & Beats. All rights reserved.
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
