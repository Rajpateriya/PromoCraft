import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
  } from '@nestjs/common';
  import { CategoriesService } from './categories.service';
  import { CreateCategoryDto } from './dto/create-category.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { RolesGuard } from '../auth/guards/roles.guard';
  import { Roles } from '../auth/decorators/roles.decorator';
  import { Role } from '../common/enums/role.enum';
  
  @Controller('categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) {}
  
    @Post()
    @Roles(Role.ADMIN)
    create(@Body() createCategoryDto: CreateCategoryDto) {
      return this.categoriesService.create(createCategoryDto);
    }
  
    @Get()
    findAll() {
      return this.categoriesService.findAll();
    }
  
    @Get(':id')
    findOne(@Param('id') id: string) {
      return this.categoriesService.findOne(+id);
    }
  }
  