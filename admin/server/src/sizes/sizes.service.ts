import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateSizeDto, UpdateSizeDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { PrismaError } from '../prisma/prisma-error';
import { removeWhiteSpaces } from '../common/utils';

@Injectable()
export class SizesService {
  constructor(private prisma: PrismaService) {}

  async create({ label, ...createSizeDto }: CreateSizeDto) {
    try {
      const newSize = await this.prisma.size.create({
        data: { label: removeWhiteSpaces(label), ...createSizeDto },
      });
      return newSize;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        switch (error.code) {
          case PrismaError.UniqueViolation:
            throw new BadRequestException({
              success: false,
              message: 'The provided size already exists in the store',
            });
          case PrismaError.ForeignViolation:
            throw new BadRequestException({
              success: false,
              message:
                'Cannot create size because the store with the given `storeId` is not found',
            });
          default:
            break;
        }
      throw new InternalServerErrorException({
        success: false,
        message: 'Something went wrong',
      });
    }
  }

  async update(id: number, { label, ...updateSizeDto }: UpdateSizeDto) {
    try {
      const updatedSize = await this.prisma.size.update({
        where: { id },
        data: { ...updateSizeDto, label: removeWhiteSpaces(label) },
      });
      return updatedSize;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        switch (error.code) {
          case PrismaError.UniqueViolation:
            throw new BadRequestException({
              success: false,
              message: 'The provided size already exists in the store',
            });
          case PrismaError.RecordNotFound:
            throw new BadRequestException({
              success: false,
              message:
                'Cannot update size because the size with the given `id` is not found',
            });
          default:
            break;
        }
      throw new InternalServerErrorException({
        success: false,
        message: 'Something went wrong',
      });
    }
  }

  async remove(ids: number[]) {
    const { count } = await this.prisma.size.deleteMany({
      where: { id: { in: ids } },
    });
    if (count === 0)
      throw new NotFoundException({
        success: false,
        message: 'Please select 1 or more records to delete',
      });
  }
}
