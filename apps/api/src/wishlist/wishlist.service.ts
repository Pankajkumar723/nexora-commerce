import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get or create customer wishlist with product details
   */
  async getWishlist(customerId: string) {
    let wishlist = await this.prisma.wishlist.findUnique({
      where: { customerId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { orderBy: { sortOrder: 'asc' }, take: 1 },
                category: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!wishlist) {
      wishlist = await this.prisma.wishlist.create({
        data: { customerId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: { orderBy: { sortOrder: 'asc' }, take: 1 },
                  category: true,
                },
              },
            },
          },
        },
      });
    }

    return wishlist;
  }

  /**
   * Add product to wishlist
   */
  async addItem(customerId: string, productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID "${productId}" not found.`);
    }

    const wishlist = await this.getWishlist(customerId);

    const existing = await this.prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId,
        },
      },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        productId,
      },
      include: {
        product: true,
      },
    });
  }

  /**
   * Remove product from wishlist
   */
  async removeItem(customerId: string, productId: string) {
    const wishlist = await this.prisma.wishlist.findUnique({
      where: { customerId },
    });

    if (!wishlist) {
      return { success: true };
    }

    try {
      await this.prisma.wishlistItem.delete({
        where: {
          wishlistId_productId: {
            wishlistId: wishlist.id,
            productId,
          },
        },
      });
    } catch {
      // If item was already deleted, ignore error
    }

    return { success: true };
  }
}
