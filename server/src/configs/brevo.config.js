import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";

import {
    otpTemplate,
    announcementTemplate,
    announcementTemplateType2,
    commissionTemplate,
    reportTemplate,
} from "../utils/templateEmail.util.js";

const {
    BREVO_SMTP_USERNAME,
    BREVO_SMTP_PASSWORD,
    FROM_NAME,
    FROM_EMAIL
} = process.env;

if (!BREVO_SMTP_USERNAME || !BREVO_SMTP_PASSWORD) {
    throw new Error("Brevo SMTP credentials missing. Set BREVO_SMTP_USERNAME/BREVO_SMTP_PASSWORD.");
}

const formatDate = (d = new Date()) =>
    new Intl.DateTimeFormat("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    }).format(d);

const withTimestamp = (subject) => `${subject} - (${formatDate()})`;
const localPart = (email) => email.split("@")[0];
const logOk = (msg, meta = {}) => console.log("✅", msg, meta);
const logErr = (msg, meta = {}) => console.error("❌", msg, meta);

const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    auth: {
        user: BREVO_SMTP_USERNAME,
        pass: BREVO_SMTP_PASSWORD,
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
});

export async function verifyEmailTransport() {
    try {
        await transporter.verify();
        logOk("Brevo SMTP verified");
    } catch (error) {
        logErr("Brevo SMTP verify failed", { error });
        // don't throw to avoid crashing your app on transient issues
    }
}

async function sendEmail({ to, subject, html, replyTo = 'info@pastal.app' }) {
    try {
        const info = await transporter.sendMail({
            from: `BlooMart <info@pastal.app>`,
            to,
            subject,
            html,
            replyTo,
        });
        logOk("Email sent via Brevo", { to, subject, id: info.messageId });
        return info;
    } catch (error) {
        logErr("Error sending email", { to, subject, error });
        throw error;
    }
}

export async function sendOtpEmail(to, subject, message, verificationCode) {
    const html = otpTemplate(localPart(to), message, verificationCode);
    return sendEmail({ to, subject: withTimestamp(subject), html });
}

export async function sendAnnouncementEmail(to, subject, subSubject, message, orderId) {
    const html = announcementTemplate(subSubject, message, orderId);
    return sendEmail({ to, subject: withTimestamp(subject), html });
}

export async function sendAnnouncementEmailType2(to, subject, subSubject, message, url) {
    const html = announcementTemplateType2(subSubject, message, url);
    return sendEmail({ to, subject: withTimestamp(subject), html });
}

export async function sendReportEmail(to, subject, fullName, subSubject, reason) {
    const html = reportTemplate(fullName, subSubject, reason);
    return sendEmail({ to, subject: withTimestamp(subject), html });
}

export async function sendCommissionEmail(to, user, subject, subSubject, message, orderCode, price) {
    const html = commissionTemplate(user, message, subSubject, orderCode, price);
    return sendEmail({ to, subject: withTimestamp(subject), html });
}

export async function sendHtml(to, subject, html) {
    return sendEmail({ to, subject: withTimestamp(subject), html });
}
