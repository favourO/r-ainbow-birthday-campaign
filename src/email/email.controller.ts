import { Controller, Get } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
    constructor(private readonly emailService: EmailService) {}
    @Get('test')
    async email () {
        const options = {
            email: 'fojiaku9@gmail.com', 
            name: 'Favour', 
            code: '3839393', 
            recommendedProducts: ['Products']
        }
        return await this.emailService.sendBirthdayEmail(options)
    }
}
