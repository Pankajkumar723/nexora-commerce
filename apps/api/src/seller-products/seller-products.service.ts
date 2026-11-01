import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSellerProductDto } from './dto/create-seller-product.dto';
import { UpdateSellerProductDto } from './dto/update-seller-product.dto';
import { AdjustSellerStockDto } from './dto/adjust-seller-stock.dto';
import { ProductStatus } from '@prisma/client';

@Injectable()
export class SellerProductsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * List products belonging exclusively to the authenticated seller
   */
  async getProducts(
    sellerId: string,
    options: {
      search?: string;
      status?: ProductStatus;
      page?: number;
      limit?: number;
    } = {},
  ) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(50, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {
      sellerId,
    };

    if (options.status) {
      where.status = options.status;
    }

    if (options.search) {
      where.OR = [
        { name: { contains: options.search, mode: 'insensitive' } },
        { description: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: { orderBy: { sortOrder: 'asc' } },
          variants: true,
          _count: { select: { reviews: true } },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Get single product ensuring seller ownership
   */
  async getProductById(sellerId: string, productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
        reviews: {
          include: { customer: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID "${productId}" not found.`);
    }

    if (product.sellerId !== sellerId) {
      throw new ForbiddenException('Access denied: You do not own this product.');
    }

    return product;
  }

  /**
   * Create a new product owned by the authenticated seller
   */
  async createProduct(sellerId: string, dto: CreateSellerProductDto) {
    const existing = await this.prisma.product.findUnique({
      where: { slug: dto.slug.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException(`Product slug "${dto.slug}" is already in use.`);
    }

    // Verify category exists
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new BadRequestException(`Category with ID "${dto.categoryId}" does not exist.`);
    }

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: dto.name,
          slug: dto.slug.toLowerCase(),
          description: dto.description,
          price: dto.price,
          compareAtPrice: dto.compareAtPrice,
          status: ProductStatus.PENDING_APPROVAL, // Submitted for admin approval
          categoryId: dto.categoryId,
          sellerId,
          ...(dto.brand && { brand: dto.brand }),
          ...(dto.metadata && { metadata: dto.metadata }),
          images: {
            create: dto.images.map((img, idx) => ({
              url: img.url,
              alt: img.alt || `${dto.name} image ${idx + 1}`,
              sortOrder: idx,
            })),
          },
          variants: {
            create:
              dto.variants && dto.variants.length > 0
                ? dto.variants.map((v) => ({
                    sku: v.sku,
                    attributes: v.attributes,
                    priceOverride: v.priceOverride,
                    stockQuantity: v.stockQuantity,
                  }))
                : [
                    {
                      sku: `${dto.slug.substring(0, 10).toUpperCase()}-DEFAULT`,
                      attributes: { option: 'Standard' },
                      stockQuantity: 10,
                    },
                  ],
          },
        },
        include: {
          images: true,
          variants: true,
          category: true,
        },
      });

      // Notification to seller
      await tx.sellerNotification.create({
        data: {
          sellerId,
          title: 'Product Submitted for Approval',
          message: `Product "${product.name}" has been created and submitted for platform review.`,
          type: 'PRODUCT',
        },
      });

      return product;
    });
  }

  /**
   * Update product with strict ownership verification
   */
  async updateProduct(sellerId: string, productId: string, dto: UpdateSellerProductDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID "${productId}" not found.`);
    }

    if (product.sellerId !== sellerId) {
      throw new ForbiddenException('Access denied: You do not own this product.');
    }

    return this.prisma.$transaction(async (tx) => {
      // If images provided, replace them
      if (dto.images && dto.images.length > 0) {
        await tx.productImage.deleteMany({ where: { productId } });
        await tx.productImage.createMany({
          data: dto.images.map((img, idx) => ({
            productId,
            url: img.url,
            alt: img.alt || `${dto.name || product.name} image ${idx + 1}`,
            sortOrder: idx,
          })),
        });
      }

      // If variants provided, update or replace
      if (dto.variants && dto.variants.length > 0) {
        await tx.productVariant.deleteMany({ where: { productId } });
        await tx.productVariant.createMany({
          data: dto.variants.map((v) => ({
            productId,
            sku: v.sku,
            attributes: v.attributes,
            priceOverride: v.priceOverride,
            stockQuantity: v.stockQuantity,
          })),
        });
      }

      return tx.product.update({
        where: { id: productId },
        data: {
          ...(dto.name && { name: dto.name }),
          ...(dto.description && { description: dto.description }),
          ...(dto.price !== undefined && { price: dto.price }),
          ...(dto.compareAtPrice !== undefined && { compareAtPrice: dto.compareAtPrice }),
          ...(dto.categoryId && { categoryId: dto.categoryId }),
          ...(dto.status && { status: dto.status }),
          ...(dto.brand !== undefined && { brand: dto.brand }),
          ...(dto.metadata !== undefined && { metadata: dto.metadata }),
        },
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          variants: true,
          category: true,
        },
      });
    });
  }

  /**
   * Delete or archive product with ownership verification
   */
  async deleteProduct(sellerId: string, productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID "${productId}" not found.`);
    }

    if (product.sellerId !== sellerId) {
      throw new ForbiddenException('Access denied: You do not own this product.');
    }

    // Mark as ARCHIVED to preserve order integrity and relational data
    return this.prisma.product.update({
      where: { id: productId },
      data: { status: ProductStatus.ARCHIVED },
    });
  }

  /**
   * Adjust variant inventory with audit log
   */
  async adjustStock(sellerId: string, productId: string, dto: AdjustSellerStockDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID "${productId}" not found.`);
    }

    if (product.sellerId !== sellerId) {
      throw new ForbiddenException('Access denied: You do not own this product.');
    }

    const variant = product.variants.find((v) => v.id === dto.variantId);
    if (!variant) {
      throw new NotFoundException(`Variant with ID "${dto.variantId}" not found on this product.`);
    }

    const newQuantity = variant.stockQuantity + dto.quantityDelta;
    if (newQuantity < 0) {
      throw new BadRequestException(
        `Cannot reduce stock by ${Math.abs(dto.quantityDelta)}. Current stock is only ${variant.stockQuantity}.`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedVariant = await tx.productVariant.update({
        where: { id: dto.variantId },
        data: { stockQuantity: newQuantity },
      });

      await tx.inventoryMovement.create({
        data: {
          variantId: dto.variantId,
          quantityDelta: dto.quantityDelta,
          reason: 'SELLER_RESTOCK',
          referenceId: sellerId,
        },
      });

      return updatedVariant;
    });
  }
}
