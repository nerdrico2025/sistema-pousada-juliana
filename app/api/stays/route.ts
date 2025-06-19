
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const dynamic = "force-dynamic";

const prisma = new PrismaClient()

// POST - Criar nova estadia (novo check-in)
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const {
      guestId,
      dataEntrada,
      dataSaida,
      observacoes
    } = data

    // Validações básicas
    if (!guestId || !dataEntrada || !dataSaida) {
      return NextResponse.json(
        { error: 'Guest ID, data de entrada e data de saída são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se o hóspede existe
    const guest = await prisma.guest.findUnique({
      where: { id: guestId }
    })

    if (!guest) {
      return NextResponse.json(
        { error: 'Hóspede não encontrado' },
        { status: 404 }
      )
    }

    // Finalizar estadia ativa anterior, se houver
    await prisma.stay.updateMany({
      where: {
        guestId: guestId,
        status: 'ativo'
      },
      data: {
        status: 'finalizado'
      }
    })

    // Criar nova estadia
    const newStay = await prisma.stay.create({
      data: {
        guestId,
        dataEntrada: new Date(dataEntrada),
        dataSaida: new Date(dataSaida),
        status: 'ativo',
        observacoes: observacoes || 'Nova estadia'
      },
      include: {
        guest: true
      }
    })

    return NextResponse.json(newStay, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar nova estadia:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
