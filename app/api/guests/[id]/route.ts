
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const dynamic = "force-dynamic";

const prisma = new PrismaClient()

// GET - Buscar hóspede por ID com histórico de estadias
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const guest = await prisma.guest.findUnique({
      where: { id: params.id },
      include: {
        stays: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!guest) {
      return NextResponse.json(
        { error: 'Hóspede não encontrado' },
        { status: 404 }
      )
    }

    // Adicionar informações da última estadia
    const guestWithLastStay = {
      ...guest,
      lastStay: guest.stays[0] || null,
      totalStays: guest.stays.length
    }

    return NextResponse.json(guestWithLastStay)
  } catch (error) {
    console.error('Erro ao buscar hóspede:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar dados pessoais do hóspede
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    
    const {
      nomeCompleto,
      cpf,
      email,
      telefone,
      dataNascimento
    } = data

    // Validações básicas
    if (!nomeCompleto || !cpf || !email || !telefone || !dataNascimento) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    // Limpar CPF
    const cleanCPF = cpf.replace(/\D/g, '')

    // Verificar se CPF já existe em outro registro
    const existingGuest = await prisma.guest.findFirst({
      where: {
        cpf: cleanCPF,
        NOT: { id: params.id }
      }
    })

    if (existingGuest) {
      return NextResponse.json(
        { error: 'CPF já cadastrado para outro hóspede' },
        { status: 409 }
      )
    }

    // Atualizar apenas dados pessoais do hóspede
    const updatedGuest = await prisma.guest.update({
      where: { id: params.id },
      data: {
        nomeCompleto,
        cpf: cleanCPF,
        email,
        telefone: telefone.replace(/\D/g, ''),
        dataNascimento: new Date(dataNascimento)
      },
      include: {
        stays: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    return NextResponse.json(updatedGuest)
  } catch (error) {
    console.error('Erro ao atualizar hóspede:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
