import { UsersService } from './users.service';
import { Args, Mutation, Resolver, Query, Context } from '@nestjs/graphql';
import { RegisterDto, activationDto } from './dto/user.dto';
import {
  ActivationResponse,
  LoginResponse,
  LogoutResponse,
  RegisterResponse,
} from './types/user.types';
import { BadRequestException, UseGuards } from '@nestjs/common';
import { User } from './entities/user.entity';
import { Response, Request } from 'express';
import { AuthGuard } from './guards/auth.guard';

@Resolver('User')
export class UsersResolver {
  constructor(private readonly userService: UsersService) {}

  @Mutation(() => RegisterResponse) // Correct return type
  async register(
    @Args('registerDto') registerDto: RegisterDto,
    @Context() context: { res: Response },
  ): Promise<RegisterResponse> {
    if (!registerDto.name || !registerDto.email || !registerDto.password) {
      throw new BadRequestException('Please fill all the required fields');
    }
    const { activationToken: activation_token } =
      await this.userService.register(registerDto, context.res);
    return { activation_token };
  }
  @Mutation(() => ActivationResponse)
  async activation(
    @Args('activationDto') activationDto: activationDto,
    @Context() context: { res: Response },
  ): Promise<ActivationResponse> {
    return await this.userService.activation(activationDto, context.res);
  }
  @Mutation(() => LoginResponse)
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
  ): Promise<LoginResponse> {
    return await this.userService.login({ email, password });
  }
  @Query(() => LoginResponse)
  @UseGuards(AuthGuard)
  async getLoggedInUser(@Context() context: { req: Request }) {
    return await this.userService.getLoggedIn(context.req);
  }

  @Query(() => LogoutResponse)
  @UseGuards(AuthGuard)
  async LogoutUser(@Context() context: { req: Request }) {
    return await this.userService.logout(context.req);
  }

  @Query(() => [User])
  async getUsers() {
    return await this.userService.getUsers();
  }
}
