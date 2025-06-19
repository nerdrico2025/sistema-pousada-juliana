
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export const dynamic = "force-dynamic";

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'pousada-juliana-secret-key'

export async function POST(request: NextRequest) {
  try {
    const { login, senha } = await request.json()

    if (!login || !senha) {
      return NextResponse.json(
        { error: 'Login e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar admin no banco
    const admin = await prisma.admin.findUnique({
      where: { login }
    })

    if (!admin) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(senha, admin.senha)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    // Gerar JWT token
    const token = jwt.sign(
      { adminId: admin.id, login: admin.login },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    // Criar resposta com cookie
    const response = NextResponse.json(
      { message: 'Login realizado com sucesso', admin: { id: admin.id, login: admin.login } },
      { status: 200 }
    )

    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 // 24 horas
    })

    return response
  } catch (error) {
    console.error('Erro no login:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
