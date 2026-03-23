import {
  BadRequestException,
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CompanyService } from './company.service';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Role } from '../constants/roles';
import { RolesGuard } from '../roles/roles.guard';
import { IdToken } from '../auth/dto/id-token.decorator';
import { FirebaseService } from '../firebase/firebase.service';
import { UpdateCompanyAdminDto } from './dto/update-company-admin.dto';
import { FindCompaniesQueryDto } from './dto/find-companies-query.dto';
import { CompanyOwnerOrAdminGuard } from './guards/company-owner-or-admin.guard';

@Controller('v2/companies')
export class CompanyController {
  constructor(
    private readonly companyService: CompanyService,
    private readonly firebaseService: FirebaseService,
  ) {}

  @Get('me')
  @UseGuards(RolesGuard(Role.COMPANY))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtem os dados da company autenticada' })
  @ApiResponse({ status: 200, description: 'Dados da company autenticada.' })
  async findMe(@IdToken() token: string) {
    if (!token) {
      throw new BadRequestException('id token is required');
    }

    const { uid } = await this.firebaseService.verifyIdToken(token, true);
    return this.companyService.findOne(uid);
  }

  @Patch('me')
  @UseGuards(RolesGuard(Role.COMPANY))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualiza os dados da company autenticada' })
  @ApiResponse({ status: 200, description: 'Company atualizada com sucesso.' })
  async updateMe(
    @IdToken() token: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ) {
    if (!token) {
      throw new BadRequestException('id token is required');
    }

    const { uid } = await this.firebaseService.verifyIdToken(token, true);
    return this.companyService.updateMe(uid, updateCompanyDto);
  }

  @Get()
  @UseGuards(RolesGuard(Role.ADMIN))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lista companies (admin)' })
  @ApiResponse({ status: 200, description: 'Lista de companies retornada.' })
  findAll(@Query() query: FindCompaniesQueryDto) {
    return this.companyService.findAll(query);
  }

  @Get(':companyId')
  @UseGuards(RolesGuard(Role.COMPANY, Role.ADMIN), CompanyOwnerOrAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtem dados de uma company por companyId' })
  @ApiResponse({ status: 200, description: 'Dados da company retornados.' })
  findOne(@Param('companyId') companyId: string) {
    return this.companyService.findOne(companyId);
  }

  @Patch(':companyId')
  @UseGuards(RolesGuard(Role.COMPANY, Role.ADMIN), CompanyOwnerOrAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualiza dados de uma company por companyId' })
  @ApiResponse({ status: 200, description: 'Company atualizada com sucesso.' })
  updateByCompanyId(
    @Req() request: any,
    @Param('companyId') companyId: string,
    @Body() updateCompanyDto: UpdateCompanyAdminDto,
  ) {
    const userRoles = [
      ...(Array.isArray(request?.user?.roles) ? request.user.roles : []),
      ...(request?.user?.role ? [request.user.role] : []),
    ];

    return this.companyService.updateByActor(
      companyId,
      updateCompanyDto,
      userRoles,
    );
  }
}
