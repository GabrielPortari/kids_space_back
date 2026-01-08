import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { RolesGuard } from "./roles.guard";

@Controller('roles')
export class RolesController {
    @Get('collaborator')
    @UseGuards(RolesGuard('collaborator', 'companyAdmin', 'systemAdmin', 'master'))
    @ApiBearerAuth()
    collaborator(){
        return 'If you can see this, you are a collaborator';
    }

    @Get('companyAdmin')
    @UseGuards(RolesGuard('companyAdmin', 'systemAdmin', 'master'))
    @ApiBearerAuth()
    companyAdmin(){
        return 'If you can see this, you are a company admin';
    }

    @Get('systemAdmin')
    @UseGuards(RolesGuard('systemAdmin', 'master'))
    @ApiBearerAuth()
    systemAdmin(){
        return 'If you can see this, you are a system admin';
    }

    @Get('master')
    @UseGuards(RolesGuard('master'))
    @ApiBearerAuth()
    master(){
        return 'If you can see this, you are a master';
    }
}