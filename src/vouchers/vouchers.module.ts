import { Module } from '@nestjs/common';
import { VouchersService } from './vouchers.service';
import { VouchersController } from './vouchers.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [VouchersService, PrismaService],
  controllers: [VouchersController],
  exports: [VouchersService],
})
export class VouchersModule {}