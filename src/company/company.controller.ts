import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CompanyService } from './company.service';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Role } from 'src/constants/roles';
import { RolesGuard } from 'src/roles/roles.guard';
import { IdToken } from 'src/auth/dto/id-token.decorator';
import { FirebaseService } from 'src/firebase/firebase.service';
import { CompanyOwnerOrAdminGuard } from './guards/company-owner-or-admin.guard';
import { UpdateCompanyComplianceDto } from './dto/update-company-compliance.dto';

@Controller('company')
export class CompanyController {
  constructor(
    private readonly companyService: CompanyService,
    private readonly firebaseService: FirebaseService,
  ) {}

  @Get('me')
  @UseGuards(RolesGuard(Role.COMPANY))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtém os dados do negócio autenticado' })
  @ApiResponse({ status: 200, description: 'Dados do negócio autenticado.' })
  async findMe(@IdToken() token: string) {
    const { uid } = await this.firebaseService.verifyIdToken(token, true);
    return this.companyService.findOne(uid);
  }

  @Patch('me')
  @UseGuards(RolesGuard(Role.COMPANY))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualiza os dados do negócio autenticado' })
  @ApiResponse({ status: 200, description: 'Negócio atualizado com sucesso.' })
  async updateMe(
    @IdToken() token: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ) {
    const { uid } = await this.firebaseService.verifyIdToken(token, true);
    return this.companyService.update(uid, updateCompanyDto);
  }

  @Get()
  @UseGuards(RolesGuard(Role.ADMIN))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lista todos os negócios (admin somente)' })
  @ApiResponse({ status: 200, description: 'Lista de negócios retornada.' })
  findAll() {
    return this.companyService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtém os dados de um negócio pelo ID' })
  @ApiResponse({ status: 200, description: 'Dados do negócio retornados.' })
  findOne(@Param('id') id: string) {
    return this.companyService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard(Role.COMPANY, Role.ADMIN), CompanyOwnerOrAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualiza um negócio pelo ID' })
  @ApiResponse({ status: 200, description: 'Negócio atualizado com sucesso.' })
  update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    return this.companyService.update(id, updateCompanyDto);
  }

  @Patch(':id/compliance')
  @UseGuards(RolesGuard(Role.ADMIN))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualiza campos de compliance do negócio (admin)' })
  @ApiResponse({
    status: 200,
    description: 'Campos de compliance atualizados com sucesso.',
  })
  updateCompliance(
    @Param('id') id: string,
    @Body() updateComplianceDto: UpdateCompanyComplianceDto,
  ) {
    return this.companyService.updateCompliance(id, updateComplianceDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard(Role.ADMIN))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove um negócio pelo ID' })
  @ApiResponse({ status: 200, description: 'Negócio removido com sucesso.' })
  remove(@Param('id') id: string) {
    return this.companyService.remove(id);
  }
}
