
'use client';

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, UserPlus, Users, Calendar } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearch = () => {
    if (searchTerm.trim()) {
      window.location.href = `/consultar?q=${encodeURIComponent(searchTerm.trim())}`
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-bold text-gray-800">
          Sistema de <span className="text-blue-600">Hóspedes</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Gerencie facilmente o cadastro e consulta de hóspedes da Pousada Juliana
        </p>
      </motion.div>

      {/* Main Action Boxes */}
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        
        {/* CONSULTAR Box */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100 p-8 h-full"
        >
          <div className="flex flex-col h-full text-center">
            <div className="flex-shrink-0 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto">
                <Search className="h-8 w-8 text-white" />
              </div>
            </div>
            
            <div className="flex-shrink-0 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">CONSULTAR</h2>
              <p className="text-gray-600">Busque hóspedes já cadastrados por nome completo ou email</p>
            </div>

            <div className="flex-grow flex flex-col justify-end space-y-4">
              <input
                type="text"
                placeholder="Digite o nome completo ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
              
              <button
                onClick={handleSearch}
                disabled={!searchTerm.trim()}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg"
              >
                CONSULTAR HÓSPEDE
              </button>
            </div>
          </div>
        </motion.div>

        {/* CADASTRAR Box */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100 p-8 h-full"
        >
          <div className="flex flex-col h-full text-center">
            <div className="flex-shrink-0 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto">
                <UserPlus className="h-8 w-8 text-white" />
              </div>
            </div>
            
            <div className="flex-shrink-0 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">CADASTRAR</h2>
              <p className="text-gray-600">Registre um novo hóspede no sistema</p>
            </div>

            <div className="flex-grow flex flex-col justify-end space-y-4">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-4 text-sm text-green-700">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>Dados pessoais</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Datas de estadia</span>
                  </div>
                </div>
              </div>
              
              <Link href="/cadastrar">
                <button className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-md hover:shadow-lg">
                  CADASTRAR NOVO HÓSPEDE
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto"
      >
        <p className="text-gray-600">
          Sistema simples e prático para gerenciar seus hóspedes
        </p>
      </motion.div>
    </div>
  )
}
