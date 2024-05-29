import { Controller, Get, Query } from '@nestjs/common';
import { IpQueryService } from './ip-query.service';
import { Observable } from 'rxjs';
import { AxiosResponse } from 'axios';

@Controller('ip-query')
export class IpQueryController {
  constructor(private readonly ipQueryService: IpQueryService) {}

  @Get()
  queryIp(@Query('ip') ip: string): Observable<AxiosResponse<any>> {
    return this.ipQueryService.queryIp(ip);
  }
}
