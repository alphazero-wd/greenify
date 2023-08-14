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
import { FindManyDto } from '../common/dto';

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
          default:
            break;
        }
      throw new InternalServerErrorException({
        success: false,
        message: 'Something went wrong',
      });
    }
  }

  async findAll({ limit, order, sortBy, offset, q }: FindManyDto) {
    const categories = await this.prisma.size.findMany({
      take: limit,
      orderBy: { [sortBy || 'id']: order || 'asc' },
      skip: offset,
      where: q ? { label: { startsWith: q, mode: 'insensitive' } } : undefined,
    });
    const count = await this.prisma.size.count({
      where: q ? { label: { startsWith: q, mode: 'insensitive' } } : undefined,
    });
    return { count, categories };
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
    return this.prisma.$transaction(async (transactionClient) => {
      const { count } = await transactionClient.size.deleteMany({
        where: { id: { in: ids } },
      });
      if (count !== ids.length)
        throw new NotFoundException({
          success: false,
          message: `${
            ids.length - count
          } sizes were not deleted because they were not found`,
        });
    });
  }
}