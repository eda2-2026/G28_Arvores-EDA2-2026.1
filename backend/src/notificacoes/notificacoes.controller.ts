import {
  Body,
  Controller,
  Post,
  Get,
  Delete,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { NotificacoesDto } from './dto/notificacoes.dto';
import { NotificacoesDtoUpdate } from './dto/update-notificacoes.dto';
import { NotificacoesService } from './notificacoes.service';
import { IsPublic } from 'src/auth/decorators/is-public.decorator';

@Controller('notificacoes')
export class NotificacoesController {
  constructor(private readonly notificacoesService: NotificacoesService) {}

  @IsPublic()
  @Post()
  async create(@Body() data: NotificacoesDto) {
    return this.notificacoesService.create(data);
  }

  @IsPublic()
  @Get()
  async findAll() {
    return this.notificacoesService.findAll();
  }

  // @IsPublic() usado para testar merge sort
  @Get('user/:userId')
  async findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.notificacoesService.findByUser(userId);
  }

  @IsPublic()
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.notificacoesService.findByUser(id);
  }

  @Get('count/nao-lidas/:userId')
  countNaoLidas(@Param('userId') userId: number) {
    return this.notificacoesService.countNaoLidas(Number(userId));
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.notificacoesService.delete(id);
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateData: NotificacoesDtoUpdate) {
    return this.notificacoesService.update(id, updateData);
  }

  @Patch('marcar-todas-lidas/:userId')
  async marcarTodasComoLidas(@Param('userId', ParseIntPipe) userId: number) {
    return this.notificacoesService.marcarTodasComoLidas(userId);
  }
}
