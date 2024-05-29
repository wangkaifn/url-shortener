import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class ShortLinkService {
  @Inject(PrismaService)
  private readonly prisma: PrismaService;

  async createUniqueShortCode() {
    const shortCodes = await this.generateShortCode(6);
    const isExist = this.prisma.uniqueShortCode.findUnique({
      where: {
        code: shortCodes,
      },
    });
    if (!isExist) {
      await this.prisma.uniqueShortCode.create({
        data: {
          code: shortCodes,
        },
      });
      return shortCodes;
    }
    this.createUniqueShortCode;
  }

  // @Cron(CronExpression.EVERY_5_SECONDS)
  async batchGenerateShortCode() {}

  /**
   * 生成指定长度的短链码
   * @param length 生成的短链码的长度
   * @returns 生成的短链码
   */
  async generateShortCode(length = 6): Promise<string> {
    // 排除一些相似性的字符
    const characters =
      '23456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';

    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }
    return result;
  }
}
