import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { RolesGuard } from "./roles.guard";

@Controller('roles')
export class RolesController {
    @Get('collaborator')
    @ApiOperation({ summary: 'Endpoint para colaboradores' })
    @ApiResponse({ status: 200, description: 'Acesso de colaborador' })
    @UseGuards(RolesGuard('collaborator', 'companyAdmin', 'systemAdmin', 'master'))
    @ApiBearerAuth()
    collaborator(){
        return 'If you can see this, you are a collaborator';
    }

    @Get('companyAdmin')
    @ApiOperation({ summary: 'Endpoint para administradores de empresa' })
    @ApiResponse({ status: 200, description: 'Acesso de company admin' })
    @UseGuards(RolesGuard('companyAdmin', 'systemAdmin', 'master'))
    @ApiBearerAuth()
    companyAdmin(){
        return 'If you can see this, you are a company admin';
    }

    @Get('systemAdmin')
    @ApiOperation({ summary: 'Endpoint para administradores do sistema' })
    @ApiResponse({ status: 200, description: 'Acesso de system admin' })
    @UseGuards(RolesGuard('systemAdmin', 'master'))
    @ApiBearerAuth()
    systemAdmin(){
        return 'If you can see this, you are a system admin';
    }

    @Get('master')
    @ApiOperation({ summary: 'Endpoint para master' })
    @ApiResponse({ status: 200, description: 'Acesso de master' })
    @UseGuards(RolesGuard('master'))
    @ApiBearerAuth()
    master(){
        return 'If you can see this, you are a master';
    }
}