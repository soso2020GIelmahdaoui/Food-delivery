import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
@InputType()
export class RegisterDto {
  @Field()
  @IsNotEmpty({ message: 'name is reequired' })
  @IsString({ message: 'name must be a string' })
  name: string;

  @Field()
  @IsNotEmpty({ message: 'email is required' })
  @IsString({ message: 'email must be a string' })
  @IsEmail({}, { message: 'email is not valid' })
  email: string;

  @Field()
  @IsNotEmpty({ message: 'phone number is required' })
  @IsString({ message: 'phone number must be a string' })
  @MinLength(10, { message: 'phone number must be at ' })
  phone_number: string;

  @Field()
  @IsNotEmpty({ message: 'password is required' })
  @IsString({ message: 'password must be a string' })
  @MinLength(8, { message: 'password must be at least 8 characters' })
  password: string;
}
@InputType()
export class activationDto {
  @Field()
  @IsNotEmpty({ message: 'activation Token is required' })
  activationToken: string;

  @Field()
  @IsNotEmpty({ message: 'activation Code is required' })
  activationCode: string;
}

@InputType()
export class LoginDto {
  @Field()
  @IsNotEmpty({ message: 'email is required' })
  @IsString({ message: 'email must be a string' })
  @IsEmail({}, { message: 'email is not valid' })
  email: string;

  @Field()
  @IsNotEmpty({ message: 'password is required' })
  @IsString({ message: 'password must be a string' })
  @MinLength(8, { message: 'password must be at least 8 characters' })
  password: string;
}
