import { Body, Controller, Get, HttpCode, Post, UseGuards } from "@nestjs/common";
import { LoginDto } from "./dto/login.dto";
import { AuthService } from "./auth.service";
import { ApiBearerAuth } from "@nestjs/swagger";
import { AuthGuard } from "./auth.guard";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { IdToken } from "./dto/id-token.decorator";
import { FirebaseService } from "src/firebase/firebase.service";

@Controller('auth')
export class AuthController{
    constructor(private readonly authService: AuthService,
        private readonly firebaseService: FirebaseService
    ) {}

    @Post('login')
    @HttpCode(200)
    async login(@Body() loginDto: LoginDto){
        return this.authService.login(loginDto);
    }

    @Post('refresh-auth')
    @HttpCode(200)
    async refreshAuth(@Body() refreshTokenDto: RefreshTokenDto){
        return this.authService.refreshAuthToken(refreshTokenDto.refreshToken);
    }

    @Post('logout')
    @HttpCode(204)
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    async logout(@Body('token') token: string){
        return this.authService.logout(token);
    }

    @Get('me')
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    async profile(@IdToken() token: string){
        return await this.firebaseService.verifyIdToken(token);
  }
}