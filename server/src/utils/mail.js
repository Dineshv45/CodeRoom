import nodemailer from "nodemailer";

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS?.replace(/\s+/g, '');

if (!EMAIL_USER || !EMAIL_PASS) {
    console.warn("[MAIL] Warning: EMAIL_USER or EMAIL_PASS not set. Email functionality will fail.");
}

const port = Number(process.env.EMAIL_PORT) || 465;
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: port,
    secure: port === 465, // true for 465, false for 587
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    },
    logger: true,
    debug: true,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
    tls: {
        rejectUnauthorized: false
    }
});

// Verify connection configuration
transporter.verify(function (error, success) {
    if (error) {
        console.error("[MAIL] Transporter verification failed:", error.message);
        console.error("TIP: If you're in production, make sure you've added EMAIL_USER and EMAIL_PASS to your dashboard.");
    } else {
        console.log("[MAIL] Server is ready to take our messages");
    }
});

export const sendVerificationMail = async (email, token) => {
    try {
        const backendUrl = process.env.BACKEND_URL
            ? process.env.BACKEND_URL.replace(/\/$/, '')
            : "http://localhost:3000";

        const verificationUrl = `${backendUrl}/api/users/verify-email/${token}`;

        await transporter.sendMail({
            from: `"CodeRoom" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Verify Your CodeRoom Account",
            html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
                <h2>Welcome to CodeRoom</h2>
                <p>Please verify your email by clicking the link below:</p>
                <a href="${verificationUrl}" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
                <p>Or copy and paste this link: <br/> ${verificationUrl}</p>
                <p>This link expires in 24 hours.</p>
            </div>
            `
        });
        // console.log(`[SUCCESS] Verification email sent to ${email}`);
    } catch (error) {
        console.error(`[ERROR] Failed to send verification email to ${email}:`, error.message);
        if (error.message.includes('Invalid login')) {
            console.error("TIP: This usually means you need to use a Google App Password, not your regular password.");
        }
        throw error;
    }
}

export const sendInviteMail = async (email, link, roomName) => {
    try {
        await transporter.sendMail({
            from: `"${roomName}" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `You've been Invited to ${roomName}`,
            html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
                <h2>You're Invited to ${roomName} from CodeRoom</h2>
                <p>Click on the link below to accept the invite and join the room:</p>
                <a href="${link}" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Join Room</a>
                <p>Or copy and paste this link: <br/> ${link}</p>
                <p>This link expires in 24 hours.</p>
            </div>
            `
        });
        console.log(`[SUCCESS] Invite email sent to ${email} for room ${roomName}`);
    } catch (error) {
        console.error(`[ERROR] Failed to send invite email to ${email}:`, error.message);
        throw error;
    }
}