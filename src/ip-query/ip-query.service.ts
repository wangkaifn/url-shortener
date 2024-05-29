// src/ip-query/ip-query.service.ts
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { catchError, map } from 'rxjs/operators';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';
// import { HttpService } from '@nestjs/axios';

@Injectable()
export class IpQueryService {
  private readonly host = 'https://qryip.market.alicloudapi.com';
  private readonly path = '/lundear/qryip';
  private readonly appCode = 'ea023f84a24a43f99230502f51811db8';

  constructor(private readonly HttpService: HttpService) {}

  queryIp(ip: string): Observable<any> {
    const headers = {
      Authorization: `APPCODE ${this.appCode}`,
    };
    const params = {
      ip,
    };
    const response = this.HttpService.get(`${this.host}${this.path}`, {
      headers,
      params,
    }).pipe(
      map((response: AxiosResponse) => {
        // return response.data;
        const { status, message, result } = response.data || {};
        if (status === 0) {
          return {
            // lat：纬度
            // lng：经度
            // nation：国家
            // province：省
            // city：市
            // district：区
            status,
            message,
            data: {
              ip: result?.ip,
              province: result.ad_info?.province,
              city: result?.ad_info?.city,
              district: result?.ad_info?.district,
              locationLat: result?.location?.lat,
              locationLng: result?.location?.lng,
            },
          };
        }
        return {
          status,
          message,
          data: {},
        };
      }),
      catchError((error) => {
        console.error('Error querying IP:', error);
        throw new HttpException(
          '查询IP信息失败',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }),
    );

    return response;
  }

  async getIpInfo(ip: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.queryIp(ip).subscribe(
        (data) => resolve(data),
        (error) => reject(error),
      );
    });
  }
}
