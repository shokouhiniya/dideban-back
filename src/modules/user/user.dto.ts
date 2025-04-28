import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { UtilsService } from '../../libs/utils/utils.service';

const utilsService = new UtilsService();

export class userCreateDto {
  name: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^(\+98|0)?9\d{9}$/, {
    message:
      'Phone number must be a valid Iranian standard number (e.g., 09123456789 or +989123456789)',
  })
  @Transform(
    ({ value }) => utilsService.standardizePhoneNumber(String(value)),
    {
      toClassOnly: true,
    },
  )
  phone: string;
}
