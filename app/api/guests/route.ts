
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const dynamic = "force-dynamic";

const prisma = new PrismaClient()

// GET - Listar todos os hóspedes (para admin)
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

    // Adicionar informações da última estadia para cada hóspede
    const guestsWithLastStay = guests.map(guest => ({
      ...guest,
      lastStay: guest.stays[0] || null, // Primeira estadia na ordem desc = última estadia
      totalStays: guest.stays.length
    }))

    return NextResponse.json(guestsWithLastStay)
  } catch (error) {
    console.error('Erro ao buscar hóspedes:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Cadastrar novo hóspede com primeira estadia
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const {
      nomeCompleto,
      cpf,
      email,
      telefone,
      dataNascimento,
      dataEntrada,
      dataSaida,
      observacoes
    } = data

    // Validações básicas
    if (!nomeCompleto || !cpf || !email || !telefone || !dataNascimento || !dataEntrada || !dataSaida) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    // Limpar CPF para verificação
    const cleanCPF = cpf.replace(/\D/g, '')

    // Verificar se CPF já existe
    const existingGuest = await prisma.guest.findUnique({
      where: { cpf: cleanCPF }
    })

    if (existingGuest) {
      return NextResponse.json(
        { error: 'CPF já cadastrado. Use a opção "Novo Check-in" para este hóspede.' },
        { status: 409 }
      )
    }

    // Usar transação para criar hóspede e primeira estadia
    const result = await prisma.$transaction(async (tx) => {
      // Criar novo hóspede
      const newGuest = await tx.guest.create({
        data: {
          nomeCompleto,
          cpf: cleanCPF,
          email,
          telefone: telefone.replace(/\D/g, ''),
          dataNascimento: new Date(dataNascimento)
        }
      })

      // Criar primeira estadia
      const newStay = await tx.stay.create({
        data: {
          guestId: newGuest.id,
          dataEntrada: new Date(dataEntrada),
          dataSaida: new Date(dataSaida),
          status: 'ativo',
          observacoes: observacoes || 'Primeira estadia'
        }
      })

      return { guest: newGuest, stay: newStay }
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Erro ao cadastrar hóspede:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
