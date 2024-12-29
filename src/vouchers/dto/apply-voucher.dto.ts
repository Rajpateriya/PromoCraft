import { IsString, IsNumber, Min } from 'class-validator';

export class ApplyVoucherDto {
  @IsString()
  code: string;

  @IsNumber()
  @Min(0)
  cartAmount: number;
}