import { IsPhoneNumber, IsString, Length } from 'class-validator';

export class SmsQueryDto {
  @IsString()
  @Length(1, 160)
  text: string;

  @IsString()
  @IsPhoneNumber(null)
  recipient: string;
}
