
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const dynamic = "force-dynamic";

const prisma = new PrismaClient()

// PUT - Atualizar dados de uma estadia específica
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    
    const {
      dataEntrada,
      dataSaida,
      status,
      observacoes
    } = data

    // Validações básicas
    if (!dataEntrada || !dataSaida) {
      return NextResponse.json(
        { error: 'Data de entrada e data de saída são obrigatórias' },
        { status: 400 }
      )
    }

    // Verificar se a estadia existe
    const existingStay = await prisma.stay.findUnique({
      where: { id: params.id }
    })

    if (!existingStay) {
      return NextResponse.json(
        { error: 'Estadia não encontrada' },
        { status: 404 }
      )
    }

    // Atualizar estadia
    const updatedStay = await prisma.stay.update({
      where: { id: params.id },
      data: {
        dataEntrada: new Date(dataEntrada),
        dataSaida: new Date(dataSaida),
        status: status || 'ativo',
        observacoes: observacoes
      },
      include: {
        guest: true
      }
    })

    return NextResponse.json(updatedStay)
  } catch (error) {
    console.error('Erro ao atualizar estadia:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Cancelar estadia
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar se a estadia existe
    const existingStay = await prisma.stay.findUnique({
      where: { id: params.id }
    })

    if (!existingStay) {
      return NextResponse.json(
        { error: 'Estadia não encontrada' },
        { status: 404 }
      )
    }

    // Marcar estadia como cancelada em vez de deletar
    const cancelledStay = await prisma.stay.update({
      where: { id: params.id },
      data: {
        status: 'cancelado'
      }
    })

    return NextResponse.json({ message: 'Estadia cancelada com sucesso', stay: cancelledStay })
  } catch (error) {
    console.error('Erro ao cancelar estadia:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
