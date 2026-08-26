import nodemailer, { Transporter } from 'nodemailer';

let transporterPromise: Promise<{ transporter: Transporter; user: string }> | null = null;

export async function getEtherealTransporter(): Promise<{ transporter: Transporter; user: string }> {
  if (transporterPromise) {
    return transporterPromise;
  }

  transporterPromise = (async () => {
    let user = process.env.ETHEREAL_USER;
    let pass = process.env.ETHEREAL_PASS;

    if (!user || !pass) {
      console.log('🔄 Creating new Ethereal Email test account...');
      const testAccount = await nodemailer.createTestAccount();
      user = testAccount.user;
      pass = testAccount.pass;
      console.log(`✉️ Ethereal Test Account Created: ${user}`);
    }

    const transporter = nodemailer.createTransport({
      host: process.env.ETHEREAL_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.ETHEREAL_PORT || '587', 10),
      secure: false,
      auth: {
        user,
        pass,
      },
    });

    return { transporter, user };
  })();

  return transporterPromise;
}

export function getPreviewUrl(info: any): string | false {
  return nodemailer.getTestMessageUrl(info);
}
