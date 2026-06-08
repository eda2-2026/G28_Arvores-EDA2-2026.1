import { PrismaService } from 'src/database/prisma.service';
import { Injectable } from '@nestjs/common';
import { ProfessoresDto } from './dto/professores.dto';
import { ProfessoresDtoUpdate } from './dto/update-professores.dto';
import { AvlTree } from 'src/shared/sorting/trees/avl-tree';

@Injectable()
export class ProfessoresService {
  private professorTree = new AvlTree<any>();
  private treeLoaded = false;

  constructor(private prisma: PrismaService) {}

  private normalize(text: string): string {
    return text.toLowerCase().trim();
  }

  private async loadProfessorTree() {
    if (this.treeLoaded) return;

    const professores = await this.prisma.professores.findMany({
      include: { avaliacoes: true, materias: true },
    });

    this.professorTree = new AvlTree<any>();

    professores.forEach((professor) => {
      this.professorTree.insert(this.normalize(professor.nome), professor);
    });

    this.treeLoaded = true;
  }

  async create(data: ProfessoresDto) {
    const professor = await this.prisma.professores.create({
      data,
      include: { avaliacoes: true, materias: true },
    });

    if (this.treeLoaded) {
      this.professorTree.insert(this.normalize(professor.nome), professor);
    }

    return professor;
  }

  async findAll() {
    return await this.prisma.professores.findMany({
      include: { avaliacoes: true, materias: true },
    });
  }

  async FindOne(id: number) {
    if (!id) {
      throw new Error('Professor não encontrado');
    }

    return await this.prisma.professores.findUnique({
      where: { id },
      include: { avaliacoes: true, materias: true },
    });
  }

  async searchByTree(termo: string) {
    await this.loadProfessorTree();

    return this.professorTree.searchPrefix(this.normalize(termo));
  }

  async searchLinear(termo: string) {
    const professores = await this.findAll();
    const normalizedTerm = this.normalize(termo);

    return professores.filter((professor) =>
      professor.nome.toLowerCase().startsWith(normalizedTerm),
    );
  }

  async benchmarkSearch(termo: string) {
    const startLinear = performance.now();
    const linearResult = await this.searchLinear(termo);
    const endLinear = performance.now();

    const startTree = performance.now();
    const treeResult = await this.searchByTree(termo);
    const endTree = performance.now();

    return {
      termo,
      buscaSequencial: {
        tempoMs: endLinear - startLinear,
        quantidade: linearResult.length,
        resultado: linearResult,
      },
      buscaArvoreAvl: {
        tempoMs: endTree - startTree,
        quantidade: treeResult.length,
        resultado: treeResult,
      },
    };
  }

  async delete(id: number) {
    const professorExists = await this.prisma.professores.findUnique({
      where: { id },
    });

    if (!professorExists) {
      throw new Error('Professor não existe');
    }

    const deletedProfessor = await this.prisma.professores.delete({
      where: { id },
    });

    if (this.treeLoaded) {
      this.professorTree.remove(this.normalize(professorExists.nome));
    }

    return deletedProfessor;
  }

  async update(id: number, updateData: ProfessoresDtoUpdate) {
    const professorExists = await this.prisma.professores.findUnique({
      where: { id },
    });

    if (!professorExists) {
      throw new Error('Professor não existe');
    }

    const dataToUpdateInPrisma: any = {};

    if (updateData.nome) {
      dataToUpdateInPrisma.nome = updateData.nome;
    }

    if (updateData.departamento) {
      dataToUpdateInPrisma.departamento = updateData.departamento;
    }

    if (updateData.fotosrc) {
      dataToUpdateInPrisma.fotosrc = updateData.fotosrc;
    }

    const updateProfessores = await this.prisma.professores.update({
      where: { id },
      data: dataToUpdateInPrisma,
      include: { avaliacoes: true, materias: true },
    });

    if (this.treeLoaded) {
      this.professorTree.remove(this.normalize(professorExists.nome));
      this.professorTree.insert(
        this.normalize(updateProfessores.nome),
        updateProfessores,
      );
    }

    return updateProfessores;
  }
}