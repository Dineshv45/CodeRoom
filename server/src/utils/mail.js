import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASS
    },
});

export const sendVerificationMail = async (email, token) =>{
    const verificationUrl = `${process.env.BACKEND_URL}/api/users/verify-email/${token}`;

    await transporter.sendMail({
        from:"'CodeRoom' <${process.env.EMAIL_USER}>",
        to:email,
        subject:"Verify Your CodeRoom Account",
        html:`
        <h2>Welcome to CodeRoom 🚀</h2>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verificationUrl}">${verificationUrl}</a>
        <p>This link expires in 24 hours.</p>
        `
    })
}