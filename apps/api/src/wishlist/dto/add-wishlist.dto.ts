import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AddWishlistDto {
  @ApiProperty({ example: 'prod-uuid-or-id' })
  @IsString()
  @IsNotEmpty()
  productId: string;
}
