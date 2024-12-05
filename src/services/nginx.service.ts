import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';

@Injectable()
export class NginxService {
  constructor(private readonly httpService: HttpService) {}

  async sendDataToNginx(jwt: string): Promise<AxiosResponse<any>> {
    const url = process.env.NGINX_URL; 
    const headers = {
      'Content-Type': 'application/json',
    };

    return this.httpService.post(url, {
      token: jwt,
      fecha: new Date().toISOString(),
    }, { headers }).toPromise();
  }
}