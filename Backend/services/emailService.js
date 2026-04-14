/**
 * Smart Travel Companion — Email Notification Service
 * Handles trip-related email notifications using Nodemailer (Gmail SMTP)
 */

const nodemailer = require('nodemailer')

// ── Reusable Transporter ─────────────────────────────────────────────────────
let transporter = null

function getTransporter() {
  if (transporter) return transporter
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  if (!user || !pass) return null

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  })
  return transporter
}

// ── Email Templates ──────────────────────────────────────────────────────────

const buildTripGeneratedEmail = ({ userName, destination, days, budget, currency, tripType, travelers, totalEstimatedCost, tripId }) => {
  const currencySymbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£', JPY: '¥', AED: 'د.إ', SGD: 'S$', AUD: 'A$', CAD: 'C$', THB: '฿' }
  const sym = currencySymbols[currency] || currency

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;color:#0f172a;">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#3b82f6,#2563eb);padding:32px;text-align:center;">
      <p style="margin:0 0 8px;font-size:36px;">✈️</p>
      <h1 style="margin:0;font-size:24px;color:#fff;font-weight:800;letter-spacing:-0.5px;">Your Trip is Ready!</h1>
      <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,0.8);font-weight:600;">AI-powered itinerary generated successfully</p>
    </div>
    
    <!-- Content -->
    <div style="padding:32px;">
      <p style="font-size:15px;margin:0 0 20px;color:#334155;">Hi <strong>${userName}</strong>,</p>
      <p style="font-size:14px;color:#475569;margin:0 0 24px;line-height:1.6;">
        Great news! Your AI-powered travel itinerary has been generated. Here's a quick summary:
      </p>
      
      <!-- Trip Card -->
      <div style="background:linear-gradient(135deg,#eff6ff,#f0f9ff);border-radius:16px;padding:24px;margin:0 0 24px;border:1px solid #bfdbfe;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;font-size:12px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Destination</td>
            <td style="padding:8px 0;font-size:15px;font-weight:800;color:#1e40af;text-align:right;">${destination}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-size:12px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Duration</td>
            <td style="padding:8px 0;font-size:14px;font-weight:700;color:#334155;text-align:right;">${days} day${days > 1 ? 's' : ''}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-size:12px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Trip Type</td>
            <td style="padding:8px 0;font-size:14px;font-weight:700;color:#334155;text-align:right;">${tripType}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-size:12px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Travelers</td>
            <td style="padding:8px 0;font-size:14px;font-weight:700;color:#334155;text-align:right;">${travelers} person${travelers > 1 ? 's' : ''}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-size:12px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Budget</td>
            <td style="padding:8px 0;font-size:14px;font-weight:700;color:#334155;text-align:right;">${sym}${Number(budget).toLocaleString()}</td>
          </tr>
          ${totalEstimatedCost ? `
          <tr>
            <td colspan="2" style="padding:12px 0 0;border-top:1px solid #93c5fd;"></td>
          </tr>
          <tr>
            <td style="padding:4px 0;font-size:12px;color:#2563eb;font-weight:800;text-transform:uppercase;">Estimated Cost</td>
            <td style="padding:4px 0;font-size:18px;font-weight:900;color:#1e40af;text-align:right;">${sym}${Number(totalEstimatedCost).toLocaleString()}</td>
          </tr>` : ''}
        </table>
      </div>
      
      <!-- CTA -->
      <div style="text-align:center;margin:28px 0;">
        <a href="${process.env.CLIENT_URL || 'https://smart-travel-comp.vercel.app'}/dashboard/bookings" 
           style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#2563eb);color:#fff;padding:14px 32px;border-radius:12px;text-decoration:none;font-size:14px;font-weight:800;box-shadow:0 4px 15px rgba(37,99,235,0.3);">
          ✨ View Your Trip in Bookings
        </a>
      </div>
      
      <!-- Tips -->
      <div style="background:#f8fafc;border-radius:12px;padding:16px;border:1px solid #e2e8f0;">
        <p style="margin:0 0 8px;font-size:12px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">💡 Quick Tips</p>
        <ul style="margin:0;padding:0 0 0 16px;font-size:13px;color:#475569;line-height:1.8;">
          <li>Share your itinerary with travel companions</li>
          <li>Use the Budget Tracker to monitor expenses</li>
          <li>Set up emergency contacts in SOS Safety</li>
          <li>Check visa requirements for ${destination}</li>
        </ul>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background:#f8fafc;padding:20px;text-align:center;border-top:1px solid #e2e8f0;">
      <p style="margin:0;font-size:11px;color:#94a3b8;font-weight:600;">
        Smart Travel Companion — Your AI-powered travel partner 🌍
      </p>
      <p style="margin:4px 0 0;font-size:10px;color:#cbd5e1;">
        You're receiving this because you generated a trip itinerary. Manage notifications in Profile & Settings.
      </p>
    </div>
  </div>
</body>
</html>`
}

const buildWelcomeEmail = ({ userName }) => {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;color:#0f172a;">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#3b82f6,#8b5cf6);padding:40px 32px;text-align:center;">
      <p style="margin:0 0 12px;font-size:48px;">🌍</p>
      <h1 style="margin:0;font-size:26px;color:#fff;font-weight:800;">Welcome to Smart Travel!</h1>
      <p style="margin:10px 0 0;font-size:14px;color:rgba(255,255,255,0.85);font-weight:600;">Your AI-powered travel companion is ready</p>
    </div>
    
    <!-- Content -->
    <div style="padding:32px;">
      <p style="font-size:16px;margin:0 0 16px;color:#334155;">Hey <strong>${userName}</strong>! 👋</p>
      <p style="font-size:14px;color:#475569;margin:0 0 28px;line-height:1.7;">
        Welcome aboard! You now have access to the most advanced AI travel planning platform. Here's what you can do:
      </p>
      
      <!-- Features -->
      <div style="display:flex;flex-direction:column;gap:12px;margin:0 0 28px;">
        ${[
          { emoji: '✨', title: 'AI Trip Planner', desc: 'Generate complete itineraries with Gemini AI' },
          { emoji: '💰', title: 'Budget Tracker', desc: 'Track expenses across all currencies' },
          { emoji: '🗺️', title: 'GPS Finder', desc: 'Find nearby restaurants, hospitals & more' },
          { emoji: '🆘', title: 'SOS Safety', desc: 'Emergency alerts with live GPS location' },
          { emoji: '📄', title: 'Doc Vault', desc: 'Store passports & travel documents securely' },
          { emoji: '🌤️', title: 'Weather', desc: '7-day forecasts for any destination' },
        ].map(f => `
          <div style="display:flex;align-items:center;gap:12px;background:#f8fafc;border-radius:12px;padding:12px;border:1px solid #e2e8f0;">
            <span style="font-size:24px;flex-shrink:0;">${f.emoji}</span>
            <div>
              <p style="margin:0;font-size:13px;font-weight:800;color:#1e293b;">${f.title}</p>
              <p style="margin:2px 0 0;font-size:11px;color:#64748b;">${f.desc}</p>
            </div>
          </div>
        `).join('')}
      </div>
      
      <!-- CTA -->
      <div style="text-align:center;margin:28px 0;">
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard/planner" 
           style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#2563eb);color:#fff;padding:14px 36px;border-radius:12px;text-decoration:none;font-size:15px;font-weight:800;box-shadow:0 4px 15px rgba(37,99,235,0.3);">
          🚀 Plan Your First Trip
        </a>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background:#f8fafc;padding:20px;text-align:center;border-top:1px solid #e2e8f0;">
      <p style="margin:0;font-size:11px;color:#94a3b8;font-weight:600;">
        Smart Travel Companion — Your AI-powered travel partner 🌍
      </p>
    </div>
  </div>
</body>
</html>`
}

// ── Send Functions ───────────────────────────────────────────────────────────

async function sendTripGeneratedEmail({ to, userName, destination, days, budget, currency, tripType, travelers, totalEstimatedCost, tripId }) {
  const t = getTransporter()
  if (!t) {
    console.log('📧 Email skipped — SMTP not configured')
    return { sent: false, reason: 'SMTP not configured' }
  }

  try {
    await t.sendMail({
      from: `"Smart Travel ✈️" <${process.env.SMTP_USER}>`,
      to,
      subject: `✈️ Your ${destination} itinerary is ready!`,
      html: buildTripGeneratedEmail({ userName, destination, days, budget, currency, tripType, travelers, totalEstimatedCost, tripId }),
    })
    console.log(`📧 Trip email sent to ${to} for ${destination}`)
    return { sent: true }
  } catch (err) {
    console.error('📧 Trip email failed:', err.message)
    return { sent: false, reason: err.message }
  }
}

async function sendWelcomeEmail({ to, userName }) {
  const t = getTransporter()
  if (!t) {
    console.log('📧 Welcome email skipped — SMTP not configured')
    return { sent: false, reason: 'SMTP not configured' }
  }

  try {
    await t.sendMail({
      from: `"Smart Travel 🌍" <${process.env.SMTP_USER}>`,
      to,
      subject: `Welcome to Smart Travel Companion, ${userName}! 🎉`,
      html: buildWelcomeEmail({ userName }),
    })
    console.log(`📧 Welcome email sent to ${to}`)
    return { sent: true }
  } catch (err) {
    console.error('📧 Welcome email failed:', err.message)
    return { sent: false, reason: err.message }
  }
}

module.exports = { sendTripGeneratedEmail, sendWelcomeEmail }
