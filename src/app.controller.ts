import { Controller, Post, Body, Req } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { MenderService } from './services/mender.service';
import { NginxService } from './services/nginx.service';
import * as requestIp from 'request-ip';
import { LogService } from './services/logs.service';

@Controller()
export class AppController {
  constructor(
    private readonly menderService: MenderService,
    private readonly nginxService: NginxService,
    private readonly authService: AuthService,
    private readonly logsService: LogService,
  ) {}

  @Post('authenticate')
  async authenticate( 
    @Req() req,
    @Body() loginDto: { user: string; password: string },
  ) {
    try {
      // WSO2
      const jwtoken = await this.authService.login(loginDto);
      console.log('Auth_token: ', jwtoken);
      const userInfo = await this.authService.getUserInfo(jwtoken.jwt);
      console.log('User_info: ', userInfo);

      // Mender
      const token = await this.menderService.authenticateUser();
      const jwtokenMender = await this.menderService.createToken(token);

      console.log('Token_mender: ', jwtokenMender);

      const clientIp = requestIp.getClientIp(req);
      const macAddress = await this.menderService.getMacAddress();

      const isDevice =
        await this.menderService.isDeviceRegistered(jwtokenMender);

      console.log('');
      console.log(isDevice);
      console.log('');

      if (!isDevice) {
        console.log(
          `El cliente ${clientIp} no es un dispositivo registrado: ${isDevice}`,
        );
      }
      console.log(
        `El cliente ${clientIp} es un dispositivo registrado: ${isDevice}`,
      );
      console.log(`Client mender ${clientIp} authenticated with token`);

      // Guardar log en la base de datos
      await this.logsService.createLog(
        loginDto.user,
        loginDto.password,
        clientIp,
        macAddress,
      );

      return { jwtoken };
    } catch (error) {
      console.error('Error during authentication:', error);
      throw error;
    }
  }

  // Para futuras llamadas
  @Post('send-to-nginx')
  async sendToNginx(@Body() data: { jwt: string }) {
    const response = await this.nginxService.sendDataToNginx(data.jwt);
    return response.data;
  }
}
