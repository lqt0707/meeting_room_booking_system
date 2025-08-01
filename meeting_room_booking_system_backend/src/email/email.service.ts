import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Transporter, createTransport } from 'nodemailer';

@Injectable()
export class EmailService {
  transporter: Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = createTransport({
      host: this.configService.get('email_host'),
        port: this.configService.get('email_port'),
        secure: this.configService.get('email_secure') === 'true',
        auth: {
          user: this.configService.get('email_user'),
          pass: this.configService.get('email_pass'),
        },
    });
  }

  async sendMail({ to, subject, html }) {
    await this.transporter.sendMail({
      from: {
        name: this.configService.get('email_from_name'),
        address: this.configService.get('email_from'),
      },
      to,
      subject,
      html,
    });
  }
}
