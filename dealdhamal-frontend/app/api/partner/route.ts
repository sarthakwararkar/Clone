import { NextResponse } from 'next/server'
import { z } from 'zod'

const partnerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  company: z.string().min(2, 'Company name is required'),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  type: z.string().min(1, 'Partnership type is required'),
  message: z.string().min(10, 'Message details are required'),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = partnerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation Error', details: parsed.error.format() },
        { status: 400 }
      )
    }

    const { name, email, company, website, type, message } = parsed.data
    const apiKey = process.env.RESEND_API_KEY

    if (!apiKey) {
      console.error('RESEND_API_KEY is not defined in the environment variables.')
      return NextResponse.json(
        { success: false, error: 'Email service is not configured' },
        { status: 500 }
      )
    }

    const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev'
    const toEmail = 'beastultra59@gmail.com'

    // Construct email content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Partnership Proposal</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f3f4f6;
            margin: 0;
            padding: 20px;
            color: #1f2937;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            border: 1px solid #e5e7eb;
          }
          .header {
            background-color: #E84141;
            padding: 30px 20px;
            text-align: center;
            color: #ffffff;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 800;
            letter-spacing: -0.5px;
          }
          .header p {
            margin: 5px 0 0;
            font-size: 14px;
            opacity: 0.9;
          }
          .content {
            padding: 30px 25px;
          }
          .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
          }
          .info-table td {
            padding: 10px 0;
            border-bottom: 1px solid #f3f4f6;
          }
          .info-table td.label {
            font-weight: 700;
            color: #4b5563;
            width: 35%;
            font-size: 14px;
          }
          .info-table td.value {
            color: #1f2937;
            font-size: 14px;
          }
          .message-box {
            background-color: #f9fafb;
            border: 1px solid #f3f4f6;
            border-radius: 8px;
            padding: 15px;
            font-size: 14px;
            line-height: 1.6;
            white-space: pre-wrap;
            color: #374151;
          }
          .footer {
            background-color: #f9fafb;
            padding: 15px 25px;
            text-align: center;
            font-size: 12px;
            color: #9ca3af;
            border-top: 1px solid #f3f4f6;
          }
          .footer a {
            color: #E84141;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Partner Proposal</h1>
            <p>New request from DealDhamal</p>
          </div>
          <div class="content">
            <table class="info-table">
              <tr>
                <td class="label">Contact Name</td>
                <td class="value">${name}</td>
              </tr>
              <tr>
                <td class="label">Business Email</td>
                <td class="value"><a href="mailto:${email}">${email}</a></td>
              </tr>
              <tr>
                <td class="label">Company / Brand</td>
                <td class="value">${company}</td>
              </tr>
              <tr>
                <td class="label">Website</td>
                <td class="value">${website ? `<a href="${website}" target="_blank" rel="noopener noreferrer">${website}</a>` : 'Not provided'}</td>
              </tr>
              <tr>
                <td class="label">Partnership Type</td>
                <td class="value"><strong>${type}</strong></td>
              </tr>
            </table>
            
            <p style="font-weight: 700; font-size: 14px; color: #4b5563; margin-bottom: 10px;">Proposal Details:</p>
            <div class="message-box">${message}</div>
          </div>
          <div class="footer">
            <p>This message was sent from the DealDhamal Partnership form.</p>
            <p>You can reply directly to this email to contact <strong>${name}</strong>.</p>
          </div>
        </div>
      </body>
      </html>
    `

    // Call Resend REST API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: toEmail,
        reply_to: email, // Enable replying directly to the partner
        subject: `[Partner Proposal] ${company} - ${type}`,
        html: emailHtml,
      }),
    })

    if (!response.ok) {
      const errBody = await response.json() as any
      console.error('Resend API response error:', errBody)
      return NextResponse.json(
        { success: false, error: errBody?.message || 'Failed to dispatch email' },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true, message: 'Proposal submitted successfully' })
  } catch (error: any) {
    console.error('Error in partner route handler:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
