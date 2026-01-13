import { Body, Controller, Get, HttpCode, Post, UseGuards } from "@nestjs/common";
import { LoginDto } from "./dto/login.dto";
import { AuthService } from "./auth.service";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { AuthGuard } from "./auth.guard";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { IdToken } from "./dto/id-token.decorator";
import { FirebaseService } from "src/firebase/firebase.service";

@Controller('auth')
export class AuthController{
    constructor(private readonly authService: AuthService,
        private readonly firebaseService: FirebaseService
    ) {}

    @ApiOperation({ summary: 'Realiza login de um usuário' })
    @ApiBody({ type: LoginDto })
    @ApiResponse({ status: 200, description: 'Login realizado com sucesso.' })
    @Post('login')
    @HttpCode(200)
    async login(@Body() loginDto: LoginDto){
        return this.authService.login(loginDto);
    }

    @Post('refresh-auth')
    @ApiOperation({ summary: 'Renova token de autenticação' })
    @ApiBody({ type: RefreshTokenDto })
    @ApiResponse({ status: 200, description: 'Token renovado com sucesso.' })
    @HttpCode(200)
    async refreshAuth(@Body() refreshTokenDto: RefreshTokenDto){
        return this.authService.refreshAuthToken(refreshTokenDto.refreshToken);
    }

    @Post('logout')
    @ApiOperation({ summary: 'Finaliza sessão do usuário (logout)' })
    @ApiResponse({ status: 204, description: 'Logout realizado com sucesso.' })
    @HttpCode(204)
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    async logout(@IdToken() token: string){
        return this.authService.logout(token);
    }

    @Get('me')
    @ApiOperation({ summary: 'Retorna dados do usuário autenticado' })
    @ApiResponse({ status: 200, description: 'Dados do usuário retornados.' })
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    async profile(@IdToken() token: string){
        return await this.firebaseService.verifyIdToken(token);
  }
}