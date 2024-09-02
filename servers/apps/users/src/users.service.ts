import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/Prisma.service';
import { RegisterDto, activationDto, LoginDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService, JwtVerifyOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { EmailService } from './email/email.service';
import { TokenSender } from './utils/sendToken';
interface UserData {
  name: string;
  email: string;
  phone_number: string;
  password: string;
}
@Injectable()
export class UsersService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}
  async register(registerDto: RegisterDto, response: Response) {
    const { name, email, password, phone_number } = registerDto;
    const existingEmail = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingEmail) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
      name,
      email,
      password: hashedPassword,
      phone_number,
    };

    const activationToken = await this.createActivationToken(user);
    const activationCode = activationToken.activationCode;
    await this.emailService.sendMail({
      email,
      subject: 'Activate your account',
      template: './activation-email',
      name,
      activationCode,
    });

    return { activationToken: activationToken.token, response };
  }
  //create activation token
  async createActivationToken(user: UserData) {
    const activationCode = Math.floor(1000 * Math.random() * 9000).toString();
    const token = this.jwtService.sign(
      {
        user,
        activationCode,
      },
      {
        secret: this.configService.get<string>('ACTIVATION_SECRET'),
        expiresIn: '10m',
      },
    );
    return {
      token,
      activationCode,
    };
  }

  async activation(activationDto: activationDto, response: Response) {
    const { activationToken, activationCode } = activationDto;
    const newUser: { user: UserData; activationCode: string } =
      this.jwtService.verify(activationToken, {
        secret: this.configService.get<string>('ACTIVATION_SECRET'),
      } as JwtVerifyOptions) as { user: UserData; activationCode: string };
    if (newUser.activationCode != activationCode) {
      throw new BadRequestException('Invalid activation code');
    }
    const { name, email, password, phone_number } = newUser.user;
    const existUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existUser) {
      throw new BadRequestException('User already exist with this email');
    }
    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password,
        phone_number,
      },
    });
    return { user, response };
  }
  //login with email and password
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (user && (await this.comparedPassword(password, user.password))) {
      const tokenSender = new TokenSender(this.configService, this.jwtService);
      return tokenSender.sendToken(user);
    } else {
      return {
        user: null,
        accessToken: null,
        refreshToken: null,
        error: {
          message: 'Invalid email or password',
        },
      };
    }
  }
  //compared with hached password
  async comparedPassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  // get logged in user
  async getLoggedIn(req: any) {
    const user = req.user;
    const accessToken = req.accesstoken;
    const refreshToken = req.refreshtoken;
    console.log({ user, refreshToken, accessToken });
    return { user, refreshToken, accessToken };
  }

  //log out user
  async logout(req: any) {
    req.user = null;
    req.accesstoken = null;
    req.refreshtoken = null;
    return { message: 'Logged out successfully' };
  }
  async getUsers() {
    return this.prisma.user.findMany({});
  }
}
