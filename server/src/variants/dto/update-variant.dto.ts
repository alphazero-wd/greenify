import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateVariantDto } from './create-variant.dto';

export class UpdateVariantDto extends PartialType(
  OmitType(CreateVariantDto, ['productId', 'sizeId', 'colorId']),
) {}
