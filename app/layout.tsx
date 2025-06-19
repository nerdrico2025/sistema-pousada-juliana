
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Pousada Juliana - Sistema de Hóspedes',
  description: 'Sistema de cadastro e consulta de hóspedes da Pousada Juliana na Ilha Grande',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
          <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">PJ</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-800">Pousada Juliana</h1>
                    <p className="text-sm text-gray-600">Ilha Grande</p>
                  </div>
                </div>
                <nav className="hidden md:flex space-x-4">
                  <a href="/" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-lg transition-colors">
                    Início
                  </a>
                  <a href="/admin" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-lg transition-colors">
                    Área Admin
                  </a>
                </nav>
              </div>
            </div>
          </header>
          <main className="max-w-6xl mx-auto px-4 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
