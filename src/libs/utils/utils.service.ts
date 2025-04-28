// src/utils/utils.service.ts

import { HttpException, Injectable } from '@nestjs/common';

@Injectable()
export class UtilsService {
  // Function to standardize phone numbers to the Iran format
  standardizePhoneNumber(value: string): string {
    const cleanedNumber = value.replace(/\D/g, '');

    if (cleanedNumber.startsWith('0')) {
      return `+98${cleanedNumber.slice(1)}`;
    } else if (cleanedNumber.startsWith('0098')) {
      return `+98${cleanedNumber.slice(4)}`;
    } else if (cleanedNumber.startsWith('98')) {
      return `+98${cleanedNumber.slice(2)}`;
    } else if (cleanedNumber.startsWith('9')) {
      return `+98${cleanedNumber}`;
    } else {
      return cleanedNumber;
    }
  }

  // Add other utility functions here
  formatDate(date: Date): string {
    return date.toISOString();
  }

  throwError(
    message: string = 'An unexpected error occurred',
    code: number = 400,
  ) {
    console.log('Error', message, code);
    throw new HttpException(message, code);
  }

  formatDateTimeString(date: Date | null = null): string {
    if (date === null) {
      date = new Date();
    }
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-indexed
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  generateRandomString(length: number): string {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }
    return result;
  }

  // Example of other reusable functions
  isEmailValid(email: string): boolean {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
  }
}
