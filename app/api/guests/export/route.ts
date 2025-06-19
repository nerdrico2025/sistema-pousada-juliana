
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const dynamic = "force-dynamic";

const prisma = new PrismaClient()

export async function GET() {
  try {
    const guests = await prisma.guest.findMany({
      include: {
        stays: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        dataCadastro: 'desc'
      }
    })

    // Função para formatar CPF
    const formatCPF = (cpf: string) => {
      return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    }

    // Função para formatar telefone
    const formatPhone = (phone: string) => {
      return phone.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3')
    }

    // Função para formatar data
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('pt-BR')
    }

    // Criar cabeçalho CSV
    const headers = [
      'ID',
      'Nome Completo',
      'CPF',
      'Email',
      'Telefone',
      'Data de Nascimento',
      'Data de Cadastro',
      'Total de Estadias',
      'Última Data de Entrada',
      'Última Data de Saída',
      'Status da Última Estadia'
    ]

    // Criar linhas CSV
    const csvLines = [
      headers.join(','),
      ...guests.map(guest => {
        const lastStay = guest.stays[0] || null
        return [
          guest.id,
          `"${guest.nomeCompleto}"`,
          formatCPF(guest.cpf),
          guest.email,
          formatPhone(guest.telefone),
          formatDate(guest.dataNascimento),
          formatDate(guest.dataCadastro),
          guest.stays.length,
          lastStay ? formatDate(lastStay.dataEntrada) : 'N/A',
          lastStay ? formatDate(lastStay.dataSaida) : 'N/A',
          lastStay ? lastStay.status : 'N/A'
        ].join(',')
      })
    ]

    const csvContent = csvLines.join('\n')

    // Adicionar BOM para garantir que acentos sejam exibidos corretamente no Excel
    const BOM = '\uFEFF'
    const csvWithBOM = BOM + csvContent

    return new NextResponse(csvWithBOM, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename=hospedes-pousada-juliana-${new Date().toISOString().split('T')[0]}.csv`
      }
    })
  } catch (error) {
    console.error('Erro ao exportar CSV:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
