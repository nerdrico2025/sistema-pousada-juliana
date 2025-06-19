
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const dynamic = "force-dynamic";

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json(
        { error: 'Termo de busca é obrigatório' },
        { status: 400 }
      )
    }

    const guests = await prisma.guest.findMany({
      where: {
        OR: [
          {
            nomeCompleto: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            email: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            cpf: {
              contains: query.replace(/\D/g, ''),
              mode: 'insensitive'
            }
          }
        ]
      },
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
