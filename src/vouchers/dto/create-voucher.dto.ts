import { IsString, IsEnum, IsNumber, IsDateString, IsArray, IsOptional, Min, Max } from 'class-validator';
import { VoucherType } from '../../common/enums/voucher-type.enum';

export class CreateVoucherDto {
  @IsString()
  code: string;

  @IsEnum(VoucherType)
  type: VoucherType;

  @IsNumber()
  @Min(0)
  @Max(100)
  amount: number;

  @IsNumber()
  @Min(0)
  minPurchase: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPurchase?: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsNumber()
  categoryId: number;

  @IsOptional()
  @IsArray()
  allowedUserIds?: number[];
}