import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { Prisma } from '@prisma/client';

export interface CalculatedCart {
  id: string;
  customerId: string;
  items: any[];
  itemCount: number;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calculate server-authoritative totals for cart
   */
  calculateCartTotals(cart: any): CalculatedCart {
    let subtotalDecimal = new Prisma.Decimal(0);
    let totalItems = 0;

    const formattedItems = (cart.items || []).map((item: any) => {
      const variant = item.productVariant;
      const product = variant.product;
      const unitPrice = variant.priceOverride || product.price;
      const itemSubtotal = unitPrice.mul(new Prisma.Decimal(item.quantity));

      subtotalDecimal = subtotalDecimal.add(itemSubtotal);
      totalItems += item.quantity;

      return {
        id: item.id,
        productVariantId: item.productVariantId,
        quantity: item.quantity,
        sku: variant.sku,
        attributes: variant.attributes,
        unitPrice: Number(unitPrice),
        itemTotal: Number(itemSubtotal),
        availableStock: variant.stockQuantity,
        product: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          image: product.images?.[0]?.url || null,
        },
      };
    });

    const subtotal = Number(subtotalDecimal);
    // Free shipping above ₹1,999, else standard ₹150 flat shipping
    const shipping = subtotal >= 1999 || subtotal === 0 ? 0 : 150;
    // GST included or accounted for (standard 18%)
    const tax = Number((subtotal * 0.18).toFixed(2));
    const total = Number((subtotal + shipping).toFixed(2));

    return {
      id: cart.id,
      customerId: cart.customerId,
      items: formattedItems,
      itemCount: totalItems,
      subtotal,
      shipping,
      tax,
      total,
    };
  }

  /**
   * Get or create customer cart
   */
  async getOrCreateCart(customerId: string): Promise<CalculatedCart> {
    let cart = await this.prisma.cart.findUnique({
      where: { customerId },
      include: {
        items: {
          include: {
            productVariant: {
              include: {
                product: {
                  include: {
                    images: { orderBy: { sortOrder: 'asc' }, take: 1 },
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { customerId },
        include: {
          items: {
            include: {
              productVariant: {
                include: {
                  product: {
                    include: {
                      images: { orderBy: { sortOrder: 'asc' }, take: 1 },
                    },
                  },
                },
              },
            },
          },
        },
      });
    }

    return this.calculateCartTotals(cart);
  }

  /**
   * Add variant to cart with stock validation
   */
  async addItem(customerId: string, dto: AddCartItemDto): Promise<CalculatedCart> {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: dto.productVariantId },
    });

    if (!variant) {
      throw new NotFoundException(`Product variant with ID "${dto.productVariantId}" not found.`);
    }

    const cart = await this.prisma.cart.findUnique({
      where: { customerId },
    });

    const cartId =
      cart?.id ||
      (await this.prisma.cart.create({ data: { customerId } })).id;

    // Check existing cart item for same variant
    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productVariantId: {
          cartId,
          productVariantId: dto.productVariantId,
        },
      },
    });

    const requestedQuantity = dto.quantity || 1;
    const finalQuantity = existingItem
      ? existingItem.quantity + requestedQuantity
      : requestedQuantity;

    if (finalQuantity > variant.stockQuantity) {
      throw new BadRequestException(
        `Insufficient stock for SKU ${variant.sku}. Requested ${finalQuantity}, available: ${variant.stockQuantity}.`,
      );
    }

    if (existingItem) {
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: finalQuantity },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId,
          productVariantId: dto.productVariantId,
          quantity: requestedQuantity,
        },
      });
    }

    return this.getOrCreateCart(customerId);
  }

  /**
   * Update quantity of an item in cart
   */
  async updateItem(
    customerId: string,
    cartItemId: string,
    dto: UpdateCartItemDto,
  ): Promise<CalculatedCart> {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        cart: true,
        productVariant: true,
      },
    });

    if (!item || item.cart.customerId !== customerId) {
      throw new NotFoundException('Cart item not found or unauthorized.');
    }

    if (dto.quantity > item.productVariant.stockQuantity) {
      throw new BadRequestException(
        `Insufficient stock for SKU ${item.productVariant.sku}. Requested ${dto.quantity}, available: ${item.productVariant.stockQuantity}.`,
      );
    }

    await this.prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity: dto.quantity },
    });

    return this.getOrCreateCart(customerId);
  }

  /**
   * Remove item from cart
   */
  async removeItem(customerId: string, cartItemId: string): Promise<CalculatedCart> {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true },
    });

    if (!item || item.cart.customerId !== customerId) {
      throw new NotFoundException('Cart item not found or unauthorized.');
    }

    await this.prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    return this.getOrCreateCart(customerId);
  }

  /**
   * Empty entire cart for customer
   */
  async clearCart(customerId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { customerId },
    });

    if (cart) {
      await this.prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }

    return { cleared: true };
  }
}
