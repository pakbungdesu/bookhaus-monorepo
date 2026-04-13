import { Module } from '@nestjs/common';
import { InfoController } from './info-service.controller';
import { InfoService } from './info-service.service';

@Module({
  imports: [],
  controllers: [InfoController],
  providers: [InfoService],
})
export class InfoServiceModule {}
