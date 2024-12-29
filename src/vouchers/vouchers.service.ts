import { 
    Injectable, 
    NotFoundException, 
    BadRequestException,
    ConflictException
  } from '@nestjs/common';
  import { PrismaService } from '../prisma/prisma.service';
  import { CreateVoucherDto } from './dto/create-voucher.dto';
  import { UpdateVoucherDto } from './dto/update-voucher.dto';
  import { VoucherType } from '../common/enums/voucher-type.enum';
  
  @Injectable()
  export class VouchersService {
    constructor(private prisma: PrismaService) {}
  
    async create(createVoucherDto: CreateVoucherDto) {
      // Check if voucher code already exists
      const existingVoucher = await this.prisma.voucher.findUnique({
        where: { code: createVoucherDto.code },
      });
  
      if (existingVoucher) {
        throw new ConflictException('Voucher code already exists');
      }
  
      // Validate category exists
      const category = await this.prisma.category.findUnique({
        where: { id: createVoucherDto.categoryId },
      });
  
      if (!category) {
        throw new NotFoundException('Category not found');
      }
  
      // Validate date range
      if (new Date(createVoucherDto.endDate) <= new Date(createVoucherDto.startDate)) {
        throw new BadRequestException('End date must be after start date');
      }
  
      // Validate purchase range
      if (createVoucherDto.maxPurchase && 
          createVoucherDto.minPurchase >= createVoucherDto.maxPurchase) {
        throw new BadRequestException('Minimum purchase must be less than maximum purchase');
      }
  
      try {
        return await this.prisma.voucher.create({
          data: {
            ...createVoucherDto,
            allowedUsers: createVoucherDto.allowedUserIds?.length
              ? {
                  connect: createVoucherDto.allowedUserIds.map(id => ({ id })),
                }
              : undefined,
          },
          include: {
            category: true,
            allowedUsers: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        });
      } catch (error) {
        if (error.code === 'P2025') {
          throw new BadRequestException('One or more allowed users not found');
        }
        throw error;
      }
    }
  
    async findAll() {
      return this.prisma.voucher.findMany({
        include: {
          category: true,
          _count: {
            select: { allowedUsers: true },
          },
        },
      });
    }
  
    async findOne(id: number) {
      const voucher = await this.prisma.voucher.findUnique({
        where: { id },
        include: {
          category: true,
          allowedUsers: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });
  
      if (!voucher) {
        throw new NotFoundException(`Voucher with ID ${id} not found`);
      }
  
      return voucher;
    }
  
    async update(id: number, updateVoucherDto: UpdateVoucherDto) {
      // Check if voucher exists
      await this.findOne(id);
  
      if (updateVoucherDto.code) {
        const existingVoucher = await this.prisma.voucher.findFirst({
          where: { 
            code: updateVoucherDto.code,
            NOT: { id },
          },
        });
  
        if (existingVoucher) {
          throw new ConflictException('Voucher code already exists');
        }
      }
  
      if (updateVoucherDto.categoryId) {
        const category = await this.prisma.category.findUnique({
          where: { id: updateVoucherDto.categoryId },
        });
  
        if (!category) {
          throw new NotFoundException('Category not found');
        }
      }
  
      try {
        return await this.prisma.voucher.update({
          where: { id },
          data: {
            ...updateVoucherDto,
            allowedUsers: updateVoucherDto.allowedUserIds
              ? {
                  set: updateVoucherDto.allowedUserIds.map(id => ({ id })),
                }
              : undefined,
          },
          include: {
            category: true,
            allowedUsers: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        });
      } catch (error) {
        if (error.code === 'P2025') {
          throw new BadRequestException('One or more allowed users not found');
        }
        throw error;
      }
    }
  
    async remove(id: number) {
      // Check if voucher exists
      await this.findOne(id);
  
      return this.prisma.voucher.delete({
        where: { id },
      });
    }
  
    async applyVoucher(code: string, cartAmount: number, userId: number) {
      const voucher = await this.prisma.voucher.findUnique({
        where: { code },
        include: {
          allowedUsers: true,
        },
      });
  
      if (!voucher) {
        throw new NotFoundException('Voucher not found');
      }
  
      if (!voucher.isActive) {
        throw new BadRequestException('Voucher is inactive');
      }
  
      // Check date validity
      const currentDate = new Date();
      if (currentDate < new Date(voucher.startDate) || 
          currentDate > new Date(voucher.endDate)) {
        throw new BadRequestException('Voucher is not valid at this time');
      }
  
      // Check if voucher is restricted to specific users
      if (voucher.allowedUsers.length > 0 && 
          !voucher.allowedUsers.some(user => user.id === userId)) {
        throw new BadRequestException('Voucher not available for this user');
      }
  
      // Validate purchase amount
      if (cartAmount < voucher.minPurchase || 
          (voucher.maxPurchase && cartAmount > voucher.maxPurchase)) {
        throw new BadRequestException(
          `Cart amount must be between ${voucher.minPurchase} and ${
            voucher.maxPurchase || 'unlimited'
          }`
        );
      }
  
      // Calculate discount
      let discount = 0;
      if (voucher.type === VoucherType.PERCENTAGE) {
        discount = (cartAmount * voucher.amount) / 100;
      } else {
        discount = voucher.amount;
      }
  
      return {
        originalAmount: cartAmount,
        discountType: voucher.type,
        discountValue: voucher.amount,
        discountAmount: discount,
        finalAmount: cartAmount - discount,
      };
    }
  }