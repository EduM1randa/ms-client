import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import * as macaddress from 'macaddress';

@Injectable()
export class MenderService {
  private axiosInstance: AxiosInstance = axios.create({
    baseURL: process.env.BASE_URL,
  });

  async authenticateUser(): Promise<string> {
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-MEN-Signature': 'string',
    };

    const response: AxiosResponse = await this.axiosInstance.post(
      '/auth/login',
      {},
      {
        headers,
        auth: {
          username: process.env.MENDER_USER,
          password: process.env.MENDER_PASSWORD,
        },
      },
    );

    return response.data;
  }

  async createToken(jwtTemp: string): Promise<string> {
    const unique = Math.random().toString(36).substring(7);
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${jwtTemp}`,
    };

    const body = {
      name: `demo-pat-${unique}`,
      expires_in: 7200,
    };

    const response: AxiosResponse = await this.axiosInstance.post(
      '/settings/tokens',
      body,
      { headers },
    );
    return response.data;
  }

  async getDevices(jwt: string): Promise<any[]> {
    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${jwt}`,
    };

    const response: AxiosResponse = await this.axiosInstance.get(
      `${process.env.DEVICE_URL}/devices`,
      { headers },
    );
    return response.data;
  }

  async isDeviceRegistered(jwt: string): Promise<boolean> {
    const devices = await this.getDevices(jwt);

    console.log(devices);

    const macAddress = await this.getMacAddress();

    console.log('Mac: ', macAddress);

    const device = devices.find(
      (device) => device.identity_data.mac === macAddress,
    );

    console.log(device);

    if (!device) {
      return false;
    }
    return true;
  }

  async getMacAddress(): Promise<string> {
    return new Promise((resolve, reject) => {
      macaddress.all((err, all: { [key: string]: { mac: string } }) => {
        if (err) {
          return reject('Unable to get MAC address');
        }
        const mac = Object.values(all)[0].mac;
        resolve(mac);
      });
    });
  }
}
