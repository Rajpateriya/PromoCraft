import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
  } from '@nestjs/common';
  import { UsersService } from './users.service';
  import { UpdateUserDto } from './dto/update-user.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { RolesGuard } from '../auth/guards/roles.guard';
  import { Roles } from '../auth/decorators/roles.decorator';
  import { Role } from '../common/enums/role.enum';
import { CreateUserDto } from './dto/create-user-dto';
  
  @Controller('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  export class UsersController {
    constructor(private readonly usersService: UsersService) {}
  
    @Post()
    @Roles(Role.ADMIN)
    create(@Body() createUserDto: CreateUserDto) {
      return this.usersService.create(createUserDto);
    }
  
    @Get()
    @Roles(Role.ADMIN)
    findAll() {
      return this.usersService.findAll();
    }
  
    @Get(':id')
    @Roles(Role.ADMIN)
    findOne(@Param('id') id: string) {
      return this.usersService.findOne(+id);
    }
  
    @Put(':id')
    @Roles(Role.ADMIN)
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
      return this.usersService.update(+id, updateUserDto);
    }
  
    @Delete(':id')
    @Roles(Role.ADMIN)
    remove(@Param('id') id: string) {
      return this.usersService.remove(+id);
    }
  }