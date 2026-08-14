import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export async function sendOTPEmail(to: string, name: string, otp: string) {
  const digits = otp.split('')

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>EduLMS - Email Verification</title>
</head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:20px;overflow:hidden;box-shadow:0 25px 50px rgba(0,0,0,0.5);">

          <!-- Header with gradient -->
          <tr>
            <td style="background:linear-gradient(135deg,#16a34a 0%,#15803d 40%,#166534 100%);padding:48px 40px 36px;text-align:center;">
              <!-- Logo -->
              <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:16px;padding:12px 24px;margin-bottom:20px;backdrop-filter:blur(10px);">
                <span style="font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
                  📚 Edu<span style="color:#bbf7d0;">LMS</span>
                </span>
              </div>
              <h1 style="margin:0;font-size:26px;font-weight:700;color:#ffffff;line-height:1.3;">
                ইমেইল ভেরিফিকেশন কোড
              </h1>
              <p style="margin:8px 0 0;font-size:15px;color:#bbf7d0;font-weight:400;">
                Email Verification Code
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#1e293b;padding:40px 40px 32px;">

              <!-- Greeting -->
              <p style="margin:0 0 24px;font-size:16px;color:#94a3b8;line-height:1.6;">
                হ্যালো <strong style="color:#e2e8f0;">${name}</strong>,
              </p>
              <p style="margin:0 0 32px;font-size:15px;color:#94a3b8;line-height:1.7;">
                আপনার EduLMS অ্যাকাউন্ট ভেরিফাই করতে নিচের <strong style="color:#4ade80;">৬-ডিজিটের কোড</strong>টি ব্যবহার করুন।
                <br/>
                <span style="color:#64748b;font-size:13px;">Use the 6-digit code below to verify your EduLMS account.</span>
              </p>

              <!-- OTP Box -->
              <div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);border:2px solid #16a34a;border-radius:16px;padding:32px 24px;text-align:center;margin-bottom:32px;position:relative;">
                <p style="margin:0 0 16px;font-size:12px;font-weight:600;color:#4ade80;text-transform:uppercase;letter-spacing:3px;">Your OTP Code</p>
                <div style="display:flex;justify-content:center;gap:12px;margin:0 auto;">
                  ${digits.map(d => `
                  <span style="
                    display:inline-block;
                    width:48px;
                    height:64px;
                    background:linear-gradient(135deg,#16a34a,#15803d);
                    border-radius:12px;
                    font-size:32px;
                    font-weight:800;
                    color:#ffffff;
                    line-height:64px;
                    text-align:center;
                    box-shadow:0 4px 15px rgba(22,163,74,0.4);
                    letter-spacing:0;
                  ">${d}</span>`).join('')}
                </div>
                <p style="margin:20px 0 0;font-size:13px;color:#64748b;">
                  Copy this code: <strong style="color:#e2e8f0;letter-spacing:6px;font-size:18px;">${otp}</strong>
                </p>
              </div>

              <!-- Expiry Warning -->
              <div style="background:#422006;border:1px solid #92400e;border-radius:12px;padding:16px 20px;margin-bottom:32px;display:flex;align-items:center;">
                <span style="font-size:20px;margin-right:12px;">⏱️</span>
                <div>
                  <p style="margin:0;font-size:14px;font-weight:600;color:#fbbf24;">এই কোডটি ১০ মিনিট পর মেয়াদোত্তীর্ণ হবে</p>
                  <p style="margin:4px 0 0;font-size:12px;color:#92400e;">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
                </div>
              </div>

              <!-- Security Note -->
              <div style="background:#0f172a;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
                <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#475569;text-transform:uppercase;letter-spacing:1px;">🔒 Security Note</p>
                <p style="margin:0;font-size:13px;color:#475569;line-height:1.6;">
                  আপনি যদি এই অনুরোধ না করে থাকেন, তাহলে এই ইমেইলটি উপেক্ষা করুন।
                  <br/>If you did not request this, please ignore this email. Your account is safe.
                </p>
              </div>

              <hr style="border:none;border-top:1px solid #1e293b;margin:0 0 24px;"/>

              <!-- CTA -->
              <p style="margin:0;font-size:14px;color:#64748b;text-align:center;line-height:1.6;">
                সাহায্যের জন্য আমাদের সাথে যোগাযোগ করুন<br/>
                <a href="mailto:support@edulms.com" style="color:#4ade80;text-decoration:none;">support@edulms.com</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#0f172a;padding:24px 40px;text-align:center;border-top:1px solid #1e293b;">
              <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#334155;">
                📚 EduLMS — বাংলাদেশের সেরা অনলাইন শিক্ষা প্ল্যাটফর্ম
              </p>
              <p style="margin:0;font-size:11px;color:#334155;">
                © ${new Date().getFullYear()} EduLMS. All rights reserved. &nbsp;|&nbsp;
                <a href="#" style="color:#475569;text-decoration:none;">Privacy Policy</a> &nbsp;|&nbsp;
                <a href="#" style="color:#475569;text-decoration:none;">Terms of Service</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'EduLMS <noreply@gmail.com>',
    to,
    subject: `${otp} — আপনার EduLMS Verification Code`,
    html,
  })
}

export async function sendWelcomeEmail(to: string, name: string) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to EduLMS!</title>
</head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:20px;overflow:hidden;box-shadow:0 25px 50px rgba(0,0,0,0.5);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#7c3aed 0%,#6d28d9 40%,#4c1d95 100%);padding:48px 40px 36px;text-align:center;">
              <div style="font-size:64px;margin-bottom:16px;">🎉</div>
              <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:16px;padding:12px 24px;margin-bottom:20px;">
                <span style="font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
                  📚 Edu<span style="color:#ddd6fe;">LMS</span>
                </span>
              </div>
              <h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;">স্বাগতম, ${name}!</h1>
              <p style="margin:8px 0 0;font-size:15px;color:#ddd6fe;">Welcome to EduLMS — Your Learning Journey Begins!</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#1e293b;padding:40px;">
              <p style="margin:0 0 20px;font-size:16px;color:#94a3b8;line-height:1.7;">
                আপনার অ্যাকাউন্ট সফলভাবে ভেরিফাই করা হয়েছে! 🎊<br/>
                <span style="color:#64748b;font-size:14px;">Your account has been successfully verified!</span>
              </p>

              <!-- Features -->
              <div style="background:#0f172a;border-radius:16px;padding:24px;margin-bottom:28px;">
                <p style="margin:0 0 16px;font-size:14px;font-weight:600;color:#a78bfa;text-transform:uppercase;letter-spacing:2px;">আপনি এখন পাবেন</p>
                ${[
                  ['📖', 'হাজারো নোট ও গাইড', 'Thousands of notes & guides'],
                  ['🎥', 'ভিডিও লেকচার', 'HD Video lectures'],
                  ['📝', 'MCQ ও সৃজনশীল প্রশ্ন', 'MCQ & Creative questions'],
                  ['🏆', 'লাইভ পরীক্ষা ও লিডারবোর্ড', 'Live exams & leaderboard'],
                ].map(([icon, bn, en]) => `
                <div style="display:flex;align-items:center;margin-bottom:12px;">
                  <span style="font-size:22px;margin-right:14px;">${icon}</span>
                  <div>
                    <span style="font-size:14px;font-weight:600;color:#e2e8f0;">${bn}</span>
                    <span style="font-size:12px;color:#475569;margin-left:8px;">${en}</span>
                  </div>
                </div>`).join('')}
              </div>

              <!-- CTA Button -->
              <div style="text-align:center;margin-bottom:32px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://edulms.com'}/dashboard"
                   style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#6d28d9);color:#ffffff;font-size:16px;font-weight:700;padding:16px 40px;border-radius:12px;text-decoration:none;box-shadow:0 4px 15px rgba(124,58,237,0.4);">
                  শেখা শুরু করুন →
                </a>
              </div>

              <hr style="border:none;border-top:1px solid #1e293b;margin:0 0 20px;"/>
              <p style="margin:0;font-size:13px;color:#475569;text-align:center;">
                সাহায্যের জন্য: <a href="mailto:support@edulms.com" style="color:#a78bfa;text-decoration:none;">support@edulms.com</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#0f172a;padding:24px 40px;text-align:center;border-top:1px solid #1e293b;">
              <p style="margin:0;font-size:11px;color:#334155;">
                © ${new Date().getFullYear()} EduLMS. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'EduLMS <noreply@gmail.com>',
    to,
    subject: `🎉 স্বাগতম! আপনার EduLMS অ্যাকাউন্ট সক্রিয় হয়েছে`,
    html,
  })
}
