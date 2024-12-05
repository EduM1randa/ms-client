import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import * as https from 'https';

@Injectable()
export class AuthService {
  private axiosInstance: AxiosInstance = axios.create({
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    }),
  });

  async login(loginDto: { user: string; password: string }): Promise<any> {
    const { user, password } = loginDto;

    const basicAuth = Buffer.from(
      `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`,
    ).toString('base64');

    if (!user || !password) {
      throw new Error('User and password are required');
    }

    const params = new URLSearchParams({
      grant_type: 'password',
      username: user,
      password,
      scope: process.env.SCOPE,
    });

    const response = await this.axiosInstance.post(
      process.env.TOKEN_URL,
      params.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${basicAuth}`,
        },
      },
    );

    const token = response.data.id_token;
    return { jwt: token };
  }

  async getUserInfo(accessToken: string): Promise<any> {
    const response = await this.axiosInstance.get(process.env.PROFILE_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  }
}
