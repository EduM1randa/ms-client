import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthService } from './services/auth.service';
import { PassportModule } from '@nestjs/passport';
import { MenderService } from './services/mender.service';
import { HttpModule } from '@nestjs/axios';
import { NginxService } from './services/nginx.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './config/database.module';

@Module({
  imports: [
    PassportModule, 
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [
    AuthService, 
    MenderService,
    NginxService,
  ],
})
export class AppModule {}
