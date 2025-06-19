
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Criar usuário admin padrão
  const hashedPassword = await bcrypt.hash('X@drez13', 10)
  
  const admin = await prisma.admin.upsert({
    where: { login: 'rafael-admin' },
    update: {},
    create: {
      login: 'rafael-admin',
      senha: hashedPassword,
    },
  })

  console.log('Admin criado:', admin)

  // Criar alguns hóspedes de exemplo com histórico de estadias
  const guest1 = await prisma.guest.upsert({
    where: { cpf: '123.456.789-00' },
    update: {},
    create: {
      nomeCompleto: 'Maria Silva Santos',
      cpf: '123.456.789-00',
      email: 'maria.silva@email.com',
      telefone: '(11) 99999-1234',
      dataNascimento: new Date('1985-03-15'),
      dataCadastro: new Date(),
    },
  })

  // Criar estadias para o primeiro hóspede (histórico)
  await prisma.stay.create({
    data: {
      guestId: guest1.id,
      dataEntrada: new Date('2024-01-15'),
      dataSaida: new Date('2024-01-20'),
      status: 'finalizado',
      observacoes: 'Primeira estadia - tudo perfeito',
    },
  })

  await prisma.stay.create({
    data: {
      guestId: guest1.id,
      dataEntrada: new Date('2024-06-10'),
      dataSaida: new Date('2024-06-15'),
      status: 'finalizado',
      observacoes: 'Segunda estadia - cliente fidelizado',
    },
  })

  // Estadia atual/ativa
  await prisma.stay.create({
    data: {
      guestId: guest1.id,
      dataEntrada: new Date('2024-12-18'),
      dataSaida: new Date('2024-12-25'),
      status: 'ativo',
      observacoes: 'Estadia de fim de ano',
    },
  })

  const guest2 = await prisma.guest.upsert({
    where: { cpf: '987.654.321-00' },
    update: {},
    create: {
      nomeCompleto: 'João Pereira Lima',
      cpf: '987.654.321-00',
      email: 'joao.pereira@email.com',
      telefone: '(21) 98888-5678',
      dataNascimento: new Date('1978-08-22'),
      dataCadastro: new Date(),
    },
  })

  // Estadia para o segundo hóspede
  await prisma.stay.create({
    data: {
      guestId: guest2.id,
      dataEntrada: new Date('2024-12-20'),
      dataSaida: new Date('2024-12-23'),
      status: 'ativo',
      observacoes: 'Primeira vez na pousada',
    },
  })

  console.log('Dados de exemplo criados com sucesso!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
