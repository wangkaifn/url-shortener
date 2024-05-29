import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Redirect,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ShortLinkService } from './short-link.service';
import { CreateShortLinkDto } from './dto/create-short-link.dto';
import { PrismaService } from 'nestjs-prisma';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import * as useragent from 'express-useragent';
import { IpQueryService } from 'src/ip-query/ip-query.service';

@Controller('short-link')
export class ShortLinkController {
  constructor(
    private readonly shortLinkService: ShortLinkService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly ipQueryService: IpQueryService,
  ) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() createShortLinkDto: CreateShortLinkDto) {
    // 找到没有被使用的短链码
    const shortCode = await this.prisma.uniqueShortCode.findFirst({
      where: {
        isEnabled: false,
      },
    });
    const BASE_URL = this.configService.get('BASE_URL');
    if (!shortCode) {
      const newShortCode = await this.shortLinkService.createUniqueShortCode();
      await this.prisma.uniqueShortCode.create({
        data: {
          code: newShortCode,
          isEnabled: true,
        },
      });

      await this.prisma.shortLink.create({
        data: {
          originalUrl: createShortLinkDto.originalUrl,
          shortCode: newShortCode,
        },
      });
      return {
        message: '短链接生成成功',
        data: `${BASE_URL}/short-link/${newShortCode}`,
      };
    }
    // 更新短链码状态
    await this.prisma.uniqueShortCode.update({
      where: {
        code: shortCode.code,
      },
      data: {
        isEnabled: true,
      },
    });
    await this.prisma.shortLink.create({
      data: {
        originalUrl: createShortLinkDto.originalUrl,
        shortCode: shortCode.code,
      },
    });

    return {
      message: '短链接生成成功',
      data: `${BASE_URL}/short-link/${shortCode.code}`,
    };
  }

  /**
   * 访问记录
   * @param shortCode 短链
   * @returns 访问记录
  //  */
  // @Get('/accessLinkRecord')
  // async accessLinkRecord() {
  //   return await this.prisma.shortLink.findMany({
  //     include: {
  //       visits: true,
  //     },
  //   });
  // }

  /**
   * 通过短链获取原始链接
   * @param shortCode 短链
   * @returns 原始链接
   */
  @Get('/:shortCode')
  @Redirect()
  async getOriginalUrl(
    @Param('shortCode') shortCode: string,
    @Req() request: Request,
  ) {
    const ipAddress =
      '111.0.233.63' ||
      request.ip ||
      request.headers['x-forwarded-for'] ||
      request.connection.remoteAddress;
    const ipInfo = await this.ipQueryService.getIpInfo(ipAddress as string);
    const userAgent = request.headers['user-agent'] || 'unknown';

    const ua = useragent.parse(userAgent);

    const browserMap = {
      Chrome: 'CHROME',
      Firefox: 'FIREFOX',
      Safari: 'SAFARI',
      Edge: 'EDGE',
      Opera: 'OPERA',
      IE: 'IE',
    };

    // const deviceMap = {
    //   true: 'MOBILE',
    //   false: 'DESKTOP',
    // };

    const osMap = {
      Windows: 'WINDOWS',
      'Apple Mac': 'MACOS',
      Linux: 'LINUX',
      Android: 'ANDROID',
      iOS: 'IOS',
    };

    console.log(ipAddress, useragent.parse(userAgent), ipInfo);

    const originalUrl = await this.prisma.shortLink.findFirst({
      where: {
        shortCode,
      },
    });

    if (!originalUrl) {
      return {
        url: '/',
        statusCode: HttpStatus.NOT_FOUND,
      };
    }

    await this.prisma.shortLink.update({
      where: {
        id: originalUrl.id,
      },
      data: {
        visitTimes: originalUrl.visitTimes + 1,
      },
    });

    // 更新记录访问

    const browser = browserMap[ua.browser] || 'OTHER';
    const device = ua.isMobile ? 'MOBILE' : ua.isTablet ? 'TABLET' : 'DESKTOP';
    const os = osMap[ua.platform] || 'OTHER';
    await this.prisma.visit.create({
      data: {
        shortLinkId: originalUrl.id,
        ...ipInfo.data,
        browser,
        device,
        os,
      },
    });

    return {
      url: originalUrl.originalUrl,
      statusCode: HttpStatus.FOUND,
    };
  }

  /**
   *  短链
   * @returns 所有的短链
   */
  @Get('/allShortCodes')
  async batchGenerateShortCode() {
    return this.prisma.uniqueShortCode.findMany();
  }
}
