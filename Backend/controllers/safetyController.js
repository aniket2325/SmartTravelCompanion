const User = require('../models/User')
const nodemailer = require('nodemailer')

// ─── Nodemailer transporter ────────────────────────────────────────────────────
// Uses Gmail. Add SMTP_USER and SMTP_PASS (App Password) to your .env
const createTransporter = () => {
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  if (!user || !pass) return null

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  })
}

// ─── GET /api/safety/contacts ─────────────────────────────────────────────────
const getContacts = async (req, res) => {
  res.json({ success: true, data: req.user.emergencyContacts })
}

// ─── POST /api/safety/contacts ────────────────────────────────────────────────
const addContact = async (req, res, next) => {
  try {
    const { name, phone, relation, email } = req.body
    if (!name || !phone)
      return res.status(400).json({ success: false, message: 'name and phone are required' })

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { emergencyContacts: { name, phone, relation: relation || 'Contact', email: email || '' } } },
      { new: true }
    )
    res.status(201).json({ success: true, data: user.emergencyContacts })
  } catch (err) {
    next(err)
  }
}

// ─── DELETE /api/safety/contacts/:contactId ───────────────────────────────────
const removeContact = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { emergencyContacts: { _id: req.params.contactId } } },
      { new: true }
    )
    res.json({ success: true, data: user.emergencyContacts })
  } catch (err) {
    next(err)
  }
}

// ─── Build HTML email body ────────────────────────────────────────────────────
const buildSOSEmail = ({ senderName, senderEmail, lat, lng, message, contactName }) => {
  const mapsUrl = lat && lng
    ? `https://www.google.com/maps?q=${lat},${lng}`
    : null

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:Arial,sans-serif;color:#e2e8f0;">
  <div style="max-width:560px;margin:40px auto;background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid #ef4444;">
    <div style="background:#ef4444;padding:24px;text-align:center;">
      <h1 style="margin:0;font-size:32px;color:#fff;letter-spacing:2px;">🆘 SOS EMERGENCY ALERT</h1>
    </div>
    <div style="padding:28px;">
      <p style="font-size:16px;margin:0 0 12px;">Hi <strong>${contactName}</strong>,</p>
      <p style="font-size:15px;color:#fca5a5;margin:0 0 20px;">
        <strong>${senderName}</strong> has triggered an SOS emergency alert and needs urgent help!
      </p>
      <div style="background:#0f172a;border-radius:10px;padding:16px;margin:0 0 20px;border-left:4px solid #ef4444;">
        <p style="margin:0 0 8px;font-size:13px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Message</p>
        <p style="margin:0;font-size:15px;">${message}</p>
      </div>
      ${mapsUrl ? `
      <div style="background:#0f172a;border-radius:10px;padding:16px;margin:0 0 20px;border-left:4px solid #14b8a6;">
        <p style="margin:0 0 8px;font-size:13px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">📍 Last Known Location</p>
        <p style="margin:0 0 8px;font-size:14px;">Lat: ${lat?.toFixed(5)}, Lng: ${lng?.toFixed(5)}</p>
        <a href="${mapsUrl}" style="display:inline-block;background:#14b8a6;color:#fff;padding:8px 16px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:bold;">Open in Google Maps →</a>
      </div>` : ''}
      <div style="background:#0f172a;border-radius:10px;padding:16px;border-left:4px solid #3b82f6;">
        <p style="margin:0 0 8px;font-size:13px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Contact Info</p>
        <p style="margin:0;font-size:14px;">Name: <strong>${senderName}</strong></p>
        <p style="margin:4px 0 0;font-size:14px;">Email: <strong>${senderEmail}</strong></p>
        <p style="margin:4px 0 0;font-size:12px;color:#64748b;">Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
      </div>
      <p style="font-size:12px;color:#475569;margin:20px 0 0;text-align:center;">
        This alert was sent automatically by Smart Travel Companion. Please respond immediately.
      </p>
    </div>
  </div>
</body>
</html>`
}

// ─── POST /api/safety/sos ─────────────────────────────────────────────────────
const triggerSOS = async (req, res, next) => {
  try {
    const { lat, lng, message } = req.body
    const user = await User.findById(req.user._id)

    const contacts = user.emergencyContacts || []
    if (!contacts.length) {
      return res.status(400).json({
        success: false,
        message: 'No emergency contacts found. Add at least one contact before sending SOS.',
      })
    }

    const sosMessage = message || `SOS Alert from ${user.name}. Please help immediately.`
    const transporter = createTransporter()

    let emailSent = 0
    let emailFailed = 0
    const results = []

    // 1. Always email the account owner themselves
    if (transporter) {
      try {
        await transporter.sendMail({
          from: `"Smart Travel SOS 🆘" <${process.env.SMTP_USER}>`,
          to: user.email,
          subject: `🆘 SOS Triggered — ${user.name}`,
          html: buildSOSEmail({
            senderName: user.name,
            senderEmail: user.email,
            lat, lng,
            message: sosMessage,
            contactName: user.name,
          }),
        })
        emailSent++
        results.push({ to: user.email, type: 'self-copy', status: 'sent' })
      } catch (e) {
        emailFailed++
        results.push({ to: user.email, type: 'self-copy', status: 'failed', error: e.message })
      }
    }

    // 2. Email each emergency contact that has an email address
    if (transporter) {
      for (const contact of contacts) {
        if (contact.email && contact.email.trim()) {
          try {
            await transporter.sendMail({
              from: `"Smart Travel SOS 🆘" <${process.env.SMTP_USER}>`,
              to: contact.email.trim(),
              subject: `🆘 URGENT: ${user.name} needs help NOW!`,
              html: buildSOSEmail({
                senderName: user.name,
                senderEmail: user.email,
                lat, lng,
                message: sosMessage,
                contactName: contact.name,
              }),
            })
            emailSent++
            results.push({ to: contact.email, name: contact.name, type: 'contact', status: 'sent' })
          } catch (e) {
            emailFailed++
            results.push({ to: contact.email, name: contact.name, type: 'contact', status: 'failed', error: e.message })
          }
        } else {
          results.push({ name: contact.name, phone: contact.phone, type: 'contact', status: 'no-email', note: 'No email address on file for this contact' })
        }
      }
    }

    const sosEvent = {
      triggeredBy: user.name,
      email: user.email,
      location: lat && lng ? { lat, lng } : null,
      message: sosMessage,
      contacts,
      timestamp: new Date(),
      email_results: results,
    }
    console.log('🆘 SOS Event:', JSON.stringify(sosEvent, null, 2))

    // Build response message
    let responseMessage
    if (!transporter) {
      responseMessage = '⚠️ SOS logged but email not configured. Add SMTP_USER and SMTP_PASS to Backend/.env to enable email alerts.'
    } else if (emailSent > 0) {
      responseMessage = `✅ SOS email alert sent to ${emailSent} address(es)${emailFailed ? `, ${emailFailed} failed` : ''}.`
    } else {
      responseMessage = `⚠️ SOS logged but email delivery failed. Check SMTP credentials or add email to contacts.`
    }

    res.json({
      success: true,
      message: responseMessage,
      data: sosEvent,
    })
  } catch (err) {
    next(err)
  }
}

// ─── GET /api/safety/numbers ─────────────────────────────────────────────────
const getEmergencyNumbers = async (req, res) => {
  const numbers = {
    India:        { police: '100', ambulance: '102', fire: '101', emergency: '112' },
    USA:          { police: '911', ambulance: '911', fire: '911', emergency: '911' },
    UK:           { police: '999', ambulance: '999', fire: '999', emergency: '999' },
    Japan:        { police: '110', ambulance: '119', fire: '119', emergency: '110' },
    Germany:      { police: '110', ambulance: '112', fire: '112', emergency: '112' },
    Australia:    { police: '000', ambulance: '000', fire: '000', emergency: '000' },
    France:       { police: '17',  ambulance: '15',  fire: '18',  emergency: '112' },
    UAE:          { police: '999', ambulance: '998', fire: '997', emergency: '999' },
    Singapore:    { police: '999', ambulance: '995', fire: '995', emergency: '999' },
    Thailand:     { police: '191', ambulance: '1669', fire: '199', emergency: '191' },
    Canada:       { police: '911', ambulance: '911', fire: '911', emergency: '911' },
    'New Zealand':{ police: '111', ambulance: '111', fire: '111', emergency: '111' },
  }

  const { country } = req.query
  if (country && numbers[country]) {
    return res.json({ success: true, data: { [country]: numbers[country] } })
  }
  res.json({ success: true, data: numbers })
}

module.exports = { getContacts, addContact, removeContact, triggerSOS, getEmergencyNumbers }