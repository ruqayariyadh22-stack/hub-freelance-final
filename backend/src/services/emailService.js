import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { AppError } from '../utils/appError.js';
import { PASSWORD_RESET_TOKEN_TTL_MINUTES } from '../utils/resetToken.js';

const EMAIL_DELIVERY_ERROR = 'Unable to send password reset email';
const CONTACT_DELIVERY_ERROR = 'Unable to send contact message';

let emailSendOverride = null;

export const setPasswordResetEmailForTests = (fn) => {
  emailSendOverride = fn;
};

const throwDeliveryError = () => {
  throw new AppError(EMAIL_DELIVERY_ERROR, 503);
};

const resolveEmailFrom = () => env.smtpFrom || env.emailFrom;

const isSmtpSecure = () => {
  const configured =
    typeof process.env.SMTP_SECURE === 'string' ? process.env.SMTP_SECURE.trim().toLowerCase() : '';

  if (configured === 'true') {
    return true;
  }

  if (configured === 'false') {
    return false;
  }

  return env.smtpPort === 465;
};

const requireMailTransport = () => {
  const from = resolveEmailFrom();

  if (!env.smtpHost || !env.smtpUser || !env.smtpPassword || !from) {
    throwDeliveryError();
  }

  return {
    transporter: nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: isSmtpSecure(),
      auth: {
        user: env.smtpUser,
        pass: env.smtpPassword,
      },
    }),
    from,
  };
};

export const buildPasswordResetUrl = (resetToken) => {
  if (!env.appBaseUrl || typeof resetToken !== 'string' || !resetToken) {
    throwDeliveryError();
  }

  const resetUrl = new URL(
    '/reset-password',
    `${env.appBaseUrl.replace(/\/+$/, '')}/`,
  );
  resetUrl.searchParams.set('token', resetToken);
  return resetUrl.toString();
};

export const buildPasswordResetEmailContent = (resetUrl) => {
  const subject = 'Reset your Hub Freelance password';
  const text = [
    'A password reset was requested for your Hub Freelance account.',
    '',
    'Open this link to choose a new password:',
    resetUrl,
    '',
    `This link expires after ${PASSWORD_RESET_TOKEN_TTL_MINUTES} minutes.`,
    '',
    'If you did not request a password reset, you can ignore this email.',
  ].join('\n');
  const html = [
    '<p>A password reset was requested for your Hub Freelance account.</p>',
    `<p><a href="${resetUrl}">Reset your password</a></p>`,
    `<p>This link expires after ${PASSWORD_RESET_TOKEN_TTL_MINUTES} minutes.</p>`,
    '<p>If you did not request a password reset, you can ignore this email.</p>',
  ].join('');

  return { subject, text, html };
};

export const sendPasswordResetEmail = async ({ to, resetToken }) => {
  const sendWithOverride = async () => {
    const resetUrl = env.appBaseUrl
      ? buildPasswordResetUrl(resetToken)
      : '';
    const content = resetUrl
      ? buildPasswordResetEmailContent(resetUrl)
      : { subject: 'Reset your Hub Freelance password', text: '', html: '' };
    await emailSendOverride({
      to,
      resetToken,
      resetUrl,
      subject: content.subject,
      text: content.text,
      html: content.html,
    });
  };

  if (typeof emailSendOverride === 'function') {
    try {
      await sendWithOverride();
      return;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throwDeliveryError();
    }
  }

  const resetUrl = buildPasswordResetUrl(resetToken);
  const { subject, text, html } = buildPasswordResetEmailContent(resetUrl);

  try {
    const { transporter, from } = requireMailTransport();
    await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throwDeliveryError();
  }
};

const throwContactDeliveryError = () => {
  throw new AppError(CONTACT_DELIVERY_ERROR, 503);
};

const buildContactEmailContent = ({ name, email, message }) => {
  const subject = 'Contact Form Message';
  const text = [
    'Contact Form Message',
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    '',
    'Message:',
    message,
  ].join('\n');
  const html = [
    '<p>Contact Form Message</p>',
    `<p>Name: ${name}</p>`,
    `<p>Email: ${email}</p>`,
    '<p>Message:</p>',
    `<p>${message}</p>`,
  ].join('');

  return { subject, text, html };
};

export const sendContactEmail = async ({ name, email, message }) => {
  if (!env.contactEmail) {
    throwContactDeliveryError();
  }

  const { subject, text, html } = buildContactEmailContent({ name, email, message });

  try {
    const { transporter, from } = requireMailTransport();
    await transporter.sendMail({
      from,
      to: env.contactEmail,
      replyTo: email,
      subject,
      text,
      html,
    });
  } catch (error) {
    throwContactDeliveryError();
  }
};
