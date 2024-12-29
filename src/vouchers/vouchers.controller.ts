import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
    Request,
  } from '@nestjs/common';
  import { VouchersService } from './vouchers.service';
  import { CreateVoucherDto } from './dto/create-voucher.dto';
  import { UpdateVoucherDto } from './dto/update-voucher.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { RolesGuard } from '../auth/guards/roles.guard';
  import { Roles } from '../auth/decorators/roles.decorator';
  import { Role } from '../common/enums/role.enum';
import { ApplyVoucherDto } from './dto/apply-voucher.dto';
  
  @Controller('vouchers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  export class VouchersController {
    constructor(private readonly vouchersService: VouchersService) {}
  
    @Post()
    @Roles(Role.ADMIN)
    create(@Body() createVoucherDto: CreateVoucherDto) {
      return this.vouchersService.create(createVoucherDto);
    }
  
    @Get()
    findAll() {
      return this.vouchersService.findAll();
    }
  
    @Get(':id')
    findOne(@Param('id') id: string) {
      return this.vouchersService.findOne(+id);
    }
  
    @Put(':id')
    @Roles(Role.ADMIN)
    update(@Param('id') id: string, @Body() updateVoucherDto: UpdateVoucherDto) {
      return this.vouchersService.update(+id, updateVoucherDto);
    }
  
    @Delete(':id')
    @Roles(Role.ADMIN)
    remove(@Param('id') id: string) {
      return this.vouchersService.remove(+id);
    }
  
    @Post('apply')
    applyVoucher(@Body() applyVoucherDto: ApplyVoucherDto, @Request() req) {
      return this.vouchersService.applyVoucher(
        applyVoucherDto.code,
        applyVoucherDto.cartAmount,
        req.user.id,
      );
    }
  }