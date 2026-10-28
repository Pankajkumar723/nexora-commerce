import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all addresses for a customer
   */
  async getAddresses(customerId: string) {
    return this.prisma.address.findMany({
      where: { customerId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  /**
   * Add a new customer address
   */
  async createAddress(customerId: string, dto: CreateAddressDto) {
    if (dto.isDefault) {
      // Unset previous defaults
      await this.prisma.address.updateMany({
        where: { customerId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.create({
      data: {
        customerId,
        label: dto.label || 'Home',
        line1: dto.line1,
        line2: dto.line2,
        city: dto.city,
        state: dto.state,
        postalCode: dto.postalCode,
        country: dto.country || 'India',
        isDefault: dto.isDefault ?? false,
      },
    });
  }

  /**
   * Delete an address by ID ensuring customer ownership
   */
  async deleteAddress(customerId: string, addressId: string) {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, customerId },
    });

    if (!address) {
      throw new NotFoundException('Address not found or unauthorized.');
    }

    return this.prisma.address.delete({
      where: { id: addressId },
    });
  }

  /**
   * Update customer profile info
   */
  async updateProfile(customerId: string, dto: UpdateProfileDto) {
    const profile = await this.prisma.customerProfile.findUnique({
      where: { id: customerId },
    });

    if (!profile) {
      throw new NotFoundException('Customer profile not found.');
    }

    return this.prisma.customerProfile.update({
      where: { id: customerId },
      data: {
        ...(dto.name ? { name: dto.name } : {}),
        ...(dto.phone ? { phone: dto.phone } : {}),
      },
    });
  }
}
