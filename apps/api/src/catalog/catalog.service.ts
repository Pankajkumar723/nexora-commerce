import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma, ProductStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProductSortOption, QueryProductsDto } from './dto/query-products.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Search, filter, sort and paginate products
   */
  async findProducts(query: QueryProductsDto) {
    const { search, category, minPrice, maxPrice, sort = ProductSortOption.NEWEST } = query;
    const skip = query.skip;
    const take = query.take;

    const where: Prisma.ProductWhereInput = {
      status: ProductStatus.ACTIVE,
    };

    if (search && search.trim() !== '') {
      const term = search.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
      ];
    }

    if (category && category.trim() !== '') {
      where.category = {
        slug: category.trim(),
      };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
        where.price.gte = new Prisma.Decimal(minPrice);
      }
      if (maxPrice !== undefined) {
        where.price.lte = new Prisma.Decimal(maxPrice);
      }
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    switch (sort) {
      case ProductSortOption.PRICE_ASC:
        orderBy = { price: 'asc' };
        break;
      case ProductSortOption.PRICE_DESC:
        orderBy = { price: 'desc' };
        break;
      case ProductSortOption.NAME_ASC:
        orderBy = { name: 'asc' };
        break;
      case ProductSortOption.NEWEST:
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          images: {
            orderBy: { sortOrder: 'asc' },
          },
          variants: {
            select: {
              id: true,
              sku: true,
              attributes: true,
              priceOverride: true,
              stockQuantity: true,
            },
          },
          reviews: {
            where: { moderationStatus: 'APPROVED' },
            select: { rating: true },
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    // Format products with computed review averages and aggregate stock
    const formattedItems = items.map((p) => {
      const reviewCount = p.reviews.length;
      const avgRating =
        reviewCount > 0
          ? Number((p.reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount).toFixed(1))
          : 5.0;
      const totalStock = p.variants.reduce((acc, v) => acc + v.stockQuantity, 0);

      const { reviews: _r, ...rest } = p;
      return {
        ...rest,
        rating: avgRating,
        reviewCount,
        inStock: totalStock > 0,
        totalStock,
      };
    });

    return {
      items: formattedItems,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit) || 1,
      },
    };
  }

  /**
   * Find product by unique slug
   */
  async findProductBySlug(slug: string) {
    if (!slug) {
      throw new BadRequestException('Product slug is required');
    }

    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        variants: true,
        reviews: {
          where: { moderationStatus: 'APPROVED' },
          include: {
            customer: {
              select: { name: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with slug "${slug}" not found`);
    }

    const reviewCount = product.reviews.length;
    const avgRating =
      reviewCount > 0
        ? Number((product.reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount).toFixed(1))
        : 5.0;
    const totalStock = product.variants.reduce((acc, v) => acc + v.stockQuantity, 0);

    return {
      ...product,
      rating: avgRating,
      reviewCount,
      inStock: totalStock > 0,
      totalStock,
    };
  }

  /**
   * Get all categories with product counts
   */
  async findAllCategories() {
    const categories = await this.prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      image: cat.image,
      productCount: cat._count.products,
    }));
  }

  /**
   * Create a new category
   */
  async createCategory(dto: CreateCategoryDto) {
    const slug =
      dto.slug ||
      dto.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    const existing = await this.prisma.category.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException(`Category with slug "${slug}" already exists`);
    }

    return this.prisma.category.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        image: dto.image,
        parentId: dto.parentId,
      },
    });
  }

  /**
   * Create product with images and variants (Admin)
   */
  async createProduct(dto: CreateProductDto) {
    const slug =
      dto.slug ||
      dto.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    const existing = await this.prisma.product.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException(`Product with slug "${slug}" already exists`);
    }

    return this.prisma.product.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        price: new Prisma.Decimal(dto.price),
        compareAtPrice: dto.compareAtPrice ? new Prisma.Decimal(dto.compareAtPrice) : null,
        status: dto.status || ProductStatus.ACTIVE,
        categoryId: dto.categoryId,
        images: dto.images && dto.images.length > 0 ? { create: dto.images } : undefined,
        variants:
          dto.variants && dto.variants.length > 0
            ? {
                create: dto.variants.map((v) => ({
                  sku: v.sku,
                  attributes: v.attributes,
                  priceOverride: v.priceOverride ? new Prisma.Decimal(v.priceOverride) : null,
                  stockQuantity: v.stockQuantity,
                })),
              }
            : undefined,
      },
      include: {
        category: true,
        images: true,
        variants: true,
      },
    });
  }

  /**
   * Update product (Admin)
   */
  async updateProduct(id: string, dto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        ...(dto.name ? { name: dto.name } : {}),
        ...(dto.description ? { description: dto.description } : {}),
        ...(dto.price !== undefined ? { price: new Prisma.Decimal(dto.price) } : {}),
        ...(dto.compareAtPrice !== undefined
          ? { compareAtPrice: dto.compareAtPrice ? new Prisma.Decimal(dto.compareAtPrice) : null }
          : {}),
        ...(dto.status ? { status: dto.status } : {}),
        ...(dto.categoryId ? { categoryId: dto.categoryId } : {}),
      },
      include: {
        category: true,
        images: true,
        variants: true,
      },
    });
  }

  /**
   * Delete product (Admin)
   */
  async deleteProduct(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    return this.prisma.product.delete({
      where: { id },
    });
  }
}
