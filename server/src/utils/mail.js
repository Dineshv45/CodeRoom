
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const EMAIL_USER = process.env.EMAIL_USER;

if (!BREVO_API_KEY) {
    console.warn("[MAIL] Warning: BREVO_API_KEY not set. Email functionality will fail.");
}

/**
 * Helper to send email via Brevo API
 */
const sendEmail = async ({ to, subject, htmlContent, senderName = "CodeRoom" }) => {
    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': process.env.BREVO_API_KEY,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: { name: senderName, email: process.env.EMAIL_USER },
                to: [{ email: to }],
                subject: subject,
                htmlContent: htmlContent
            })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || `Brevo API error: ${response.status}`);
        }
        return data;
    } catch (error) {
        console.error(`[MAIL ERROR] ${error.message}`);
        throw error;
    }
};

// Log readiness (simulating the old verify logic)
if (BREVO_API_KEY) {
    console.log("[MAIL] Brevo API is configured and ready.");
}

export const sendVerificationMail = async (email, token) => {
    const backendUrl = process.env.BACKEND_URL
        ? process.env.BACKEND_URL.replace(/\/$/, '')
        : "http://localhost:3000";

    const verificationUrl = `${backendUrl}/api/users/verify-email/${token}`;

    const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
        <h2>Welcome to CodeRoom</h2>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verificationUrl}" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
        <p>Or copy and paste this link: <br/> ${verificationUrl}</p>
        <p>This link expires in 24 hours.</p>
    </div>
    `;

    return await sendEmail({
        to: email,
        subject: "Verify Your CodeRoom Account",
        htmlContent
    });
}

export const sendInviteMail = async (email, link, roomName) => {
    const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
        <h2>You're Invited to ${roomName} from CodeRoom</h2>
        <p>Click on the link below to accept the invite and join the room:</p>
        <a href="${link}" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Join Room</a>
        <p>Or copy and paste this link: <br/> ${link}</p>
        <p>This link expires in 24 hours.</p>
    </div>
    `;

    return await sendEmail({
        to: email,
        subject: `You've been Invited to ${roomName}`,
        htmlContent,
        senderName: roomName
    });
}