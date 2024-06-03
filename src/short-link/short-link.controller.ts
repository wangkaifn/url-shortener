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
import { IpQueryService } from 'src/ip-query/ip-query.service';
import { getUseragentInfo } from 'src/utils';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('短链')
@Controller('short-link')
export class ShortLinkController {
  constructor(
    private readonly shortLinkService: ShortLinkService,
    private readonly prisma: PrismaService,
    private readonly ipQueryService: IpQueryService,
  ) {}

  @ApiOperation({
    summary: '生成短链',
    description: '生成短链',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '短链生成成功',
    type: String,
  })
  @ApiBody({
    type: CreateShortLinkDto,
  })
  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() createShortLinkDto: CreateShortLinkDto) {
    return await this.shortLinkService.createShortLink(createShortLinkDto);
  }

  /**
   * 访问记录
   * @param shortCode 短链
   * @returns 访问记录
  //  */
  @Get('/accessLinkRecord')
  async accessLinkRecord() {
    return await this.prisma.shortLink.findMany({
      include: {
        visits: true,
      },
    });
  }

  /**
   *  查询所有短链
   * @returns 所有短链
   */
  @Get('/getAllShortLink')
  async AllShortLink() {
    return this.prisma.shortLink.findMany();
  }

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

    const ipInfo =
      {} || (await this.ipQueryService.getIpInfo(ipAddress as string));

    const userAgent = request.headers['user-agent'];

    const ua = getUseragentInfo(userAgent);

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

    await this.prisma.visit.create({
      data: {
        shortLinkId: originalUrl.id,
        ...ipInfo.data,
        ...ua,
      },
    });
    return {
      url: originalUrl.originalUrl,
      statusCode: HttpStatus.FOUND,
    };
  }
}
