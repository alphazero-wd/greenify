import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto, FindManyProductsDto, UpdateProductDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { PrismaError } from '../prisma/prisma-error';
import { UploadFileDto } from '../files/dto';
import { FilesService } from '../files/files.service';
import { removeWhiteSpaces } from '../common/utils';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private filesService: FilesService,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const newProduct = await this.prisma.product.create({
        data: createProductDto,
      });
      return newProduct;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === PrismaError.UniqueViolation)
          throw new BadRequestException({
            success: false,
            message: 'Product with the given name already exists',
          });
        if (error.code === PrismaError.RecordNotFound)
          throw new BadRequestException({
            success: false,
            message:
              'Cannot create product because of unknown category provided',
          });
      }
      throw new InternalServerErrorException({
        success: false,
        message: error.message,
      });
    }
  }

  async uploadImages(productId: number, uploadFilesDto: UploadFileDto[]) {
    await this.filesService.createMany(uploadFilesDto, productId);
  }

  async findAll({
    limit = 10,
    categoryIds,
    offset = 0,
    q = '',
    sortBy = 'id',
    order = 'asc',
    price,
    status,
    inStock,
    refIds,
  }: FindManyProductsDto) {
    try {
      const where: Prisma.ProductWhereInput = {};
      where.name = q
        ? {
            search: removeWhiteSpaces(q).split(' ').join(' & '),
            mode: 'insensitive',
          }
        : undefined;
      if (status) where.status = status;
      if (categoryIds) where.categoryId = { in: categoryIds };
      if (price) {
        where.price = {};
        if (price[0]) where.price.gte = price[0];
        if (price[1]) where.price.lte = price[1];
      }
      if (inStock !== undefined)
        where.inStock = inStock ? { gt: 0 } : { equals: 0 };
      if (refIds) where.id = { not: { in: refIds } };

      let orderBy: Prisma.ProductOrderByWithRelationAndSearchRelevanceInput =
        {};
      if (sortBy === 'orders') orderBy = { orders: { _count: order } };
      else orderBy = { [sortBy]: order };

      const products = await this.prisma.product.findMany({
        take: limit,
        skip: offset,
        orderBy,
        where,
        select: {
          id: true,
          name: true,
          inStock: true,
          price: true,
          createdAt: true,
          updatedAt: true,
          desc: true,
          status: true,
          images: { select: { id: true }, orderBy: { id: 'asc' }, take: 1 },
          category: true,
          _count: { select: { orders: true } },
        },
      });

      const whereStatusGroups = { ...where };
      delete whereStatusGroups.status;
      const statusGroups = await this.prisma.product.groupBy({
        by: ['status'],
        _count: { id: true },
        where: whereStatusGroups,
      });

      const whereCategoryGroups = { ...where };
      delete whereCategoryGroups.categoryId;
      const categoryGroups = await this.prisma.product.groupBy({
        by: ['categoryId'],
        _count: { id: true },
        where: whereCategoryGroups,
      });

      const whereInStockGroups = { ...where };
      delete whereInStockGroups.inStock;
      const inStockGroups = await this.prisma.product.groupBy({
        by: ['inStock'],
        _count: { id: true },
        where: whereInStockGroups,
      });
      const count = await this.prisma.product.count({ where });
      return {
        count,
        products,
        statusGroups,
        inStockGroups,
        categoryGroups,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        success: false,
        message: 'Something went wrong',
      });
    }
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        images: { select: { id: true }, orderBy: { id: 'asc' } },
        category: true,
      },
    });
    if (!product)
      throw new NotFoundException({
        success: false,
        message: 'Product not found',
      });
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    try {
      const updatedProduct = await this.prisma.product.update({
        where: { id },
        data: updateProductDto,
      });
      return updatedProduct;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === PrismaError.UniqueViolation)
          throw new BadRequestException({
            success: false,
            message: 'Product with the given name already exists',
          });
        if (error.code === PrismaError.RecordNotFound)
          throw new BadRequestException({
            success: false,
            message:
              'Cannot create product because either it is not found or category provided is unknown',
          });
      }
      throw new InternalServerErrorException({
        success: false,
        message: error.message,
      });
    }
  }

  async removeImages(productId: number, imageIds: number[]) {
    const product = await this.findOne(productId);
    const productImageIds = product.images.map((img) => img.id);
    if (imageIds.some((id) => !productImageIds.includes(id)))
      throw new NotFoundException({
        success: false,
        message: 'Cannot delete images because some of which are not found',
      });
    if (imageIds.length === product.images.length)
      throw new ForbiddenException({
        success: false,
        message: 'Cannot delete all images of the product',
      });
    await this.filesService.remove(imageIds);
  }

  async remove(ids: number[]) {
    return this.prisma.$transaction(async (transactionClient) => {
      try {
        const images = await transactionClient.product.findMany({
          where: { id: { in: ids } },
          select: { images: { select: { id: true } } },
        });
        if (images.length !== ids.length)
          throw new NotFoundException({
            success: false,
            message: `${
              ids.length - images.length
            } products were not deleted because they were not found`,
          });
        const imageIds = images.flatMap((img) =>
          img.images.flatMap(({ id }) => id),
        );
        await this.filesService.remove(imageIds);
        await transactionClient.product.deleteMany({
          where: { id: { in: ids } },
        });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError)
          if (error instanceof NotFoundException) throw error;
        throw new InternalServerErrorException({
          success: false,
          message: 'Something went wrong',
        });
      }
    });
  }
}
