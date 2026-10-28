import { HttpExceptionFilter } from './http-exception.filter';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should catch HttpException and return formatted JSON error response', () => {
    const statusMock = jest.fn().mockReturnThis();
    const jsonMock = jest.fn();

    const mockResponse = {
      status: statusMock,
      json: jsonMock,
    };

    const mockRequest = {
      url: '/api/v1/test',
    };

    const mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as any;

    const exception = new HttpException('Resource not found', HttpStatus.NOT_FOUND);
    filter.catch(exception, mockHost);

    expect(statusMock).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: HttpStatus.NOT_FOUND,
        path: '/api/v1/test',
        message: 'Resource not found',
      }),
    );
  });

  it('should handle unhandled standard Error with 500 status code', () => {
    const statusMock = jest.fn().mockReturnThis();
    const jsonMock = jest.fn();

    const mockResponse = {
      status: statusMock,
      json: jsonMock,
    };

    const mockRequest = {
      url: '/api/v1/error',
    };

    const mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as any;

    const exception = new Error('Database crash');
    filter.catch(exception, mockHost);

    expect(statusMock).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      }),
    );
  });
});
