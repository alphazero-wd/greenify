import { Controller, Get, Body, Patch, Param, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { FindManyOrdersDto, UpdateOrderDto } from './dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}
  @Get()
  async findAll(@Query() findManyOrdersDto: FindManyOrdersDto) {
    const response = await this.ordersService.findAll(findManyOrdersDto);
    return { ...response, success: true };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const order = await this.ordersService.findOne(id);
    return { data: order, success: true };
  }

  @Patch(':id')
  async updateStatus(
    @Param('id') id: string,
    @Body() { deliveredAt }: UpdateOrderDto,
  ) {
    const deliveredOrder = await this.ordersService.update(id, { deliveredAt });
    return { data: deliveredOrder, success: true };
  }
}