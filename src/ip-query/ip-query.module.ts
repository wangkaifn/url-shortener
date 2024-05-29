import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { IpQueryService } from './ip-query.service';
import { IpQueryController } from './ip-query.controller';

@Module({
  imports: [HttpModule],
  controllers: [IpQueryController],
  providers: [IpQueryService],
  exports: [IpQueryService],
})
export class IpQueryModule {}
