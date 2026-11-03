import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
  Header,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import { QueryProductsDto } from './dto/query-products.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { apiSuccess } from '../common/dto/api-response.dto';

@ApiTags('Catalog')
@Controller()
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('products')
  @Header('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600')
  @ApiOperation({ summary: 'Search, filter, sort and paginate catalog products' })
  @ApiResponse({ status: 200, description: 'Paginated product list' })
  async getProducts(@Query() query: QueryProductsDto) {
    const result = await this.catalogService.findProducts(query);
    return apiSuccess(result.items, result.meta, 'Products retrieved successfully');
  }

  @Get('products/:slug')
  @Header('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600')
  @ApiOperation({ summary: 'Get full product detail by URL slug' })
  @ApiParam({ name: 'slug', description: 'Product unique slug' })
  @ApiResponse({ status: 200, description: 'Product detail' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getProductBySlug(@Param('slug') slug: string) {
    const product = await this.catalogService.findProductBySlug(slug);
    return apiSuccess(product, null, 'Product retrieved successfully');
  }

  @Get('categories')
  @Header('Cache-Control', 'public, max-age=120, s-maxage=600, stale-while-revalidate=1200')
  @ApiOperation({ summary: 'List all categories with product counts' })
  @ApiResponse({ status: 200, description: 'Category list' })
  async getCategories() {
    const categories = await this.catalogService.findAllCategories();
    return apiSuccess(categories, null, 'Categories retrieved successfully');
  }

  @Post('categories')
  @ApiOperation({ summary: 'Create a new catalog category' })
  @ApiResponse({ status: 201, description: 'Category created' })
  async createCategory(@Body() dto: CreateCategoryDto) {
    const category = await this.catalogService.createCategory(dto);
    return apiSuccess(category, null, 'Category created successfully');
  }

  @Post('admin/products')
  @ApiOperation({ summary: 'Create a new product with images and variants' })
  @ApiResponse({ status: 201, description: 'Product created' })
  async createProduct(@Body() dto: CreateProductDto) {
    const product = await this.catalogService.createProduct(dto);
    return apiSuccess(product, null, 'Product created successfully');
  }

  @Patch('admin/products/:id')
  @ApiOperation({ summary: 'Update existing product' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({ status: 200, description: 'Product updated' })
  async updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    const product = await this.catalogService.updateProduct(id, dto);
    return apiSuccess(product, null, 'Product updated successfully');
  }

  @Delete('admin/products/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete product by ID' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({ status: 200, description: 'Product deleted' })
  async deleteProduct(@Param('id') id: string) {
    const deleted = await this.catalogService.deleteProduct(id);
    return apiSuccess(deleted, null, 'Product deleted successfully');
  }
}
