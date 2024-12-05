import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Log } from 'src/entities/log.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LogService {
  constructor(
    @InjectRepository(Log)
    private logRepository: Repository<Log>,
  ) {}

  async createLog(
    user: string,
    password: string,
    ip: string,
    mac: string,
  ): Promise<Log> {
    const log = this.logRepository.create({ user, password, ip, mac });
    return this.logRepository.save(log);
  }
}