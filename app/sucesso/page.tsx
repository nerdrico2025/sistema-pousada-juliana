
'use client';

import { motion } from 'framer-motion'
import { CheckCircle, Home, UserPlus } from 'lucide-react'
import Link from 'next/link'

export default function SucessoPage() {
  return (
    <div className="max-w-2xl mx-auto text-center space-y-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto"
      >
        <CheckCircle className="h-12 w-12 text-green-600" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <h1 className="text-3xl font-bold text-gray-800">
          Hóspede Cadastrado com Sucesso!
        </h1>
        <p className="text-lg text-gray-600">
          Os dados do hóspede foram salvos no sistema da Pousada Juliana.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl shadow-lg p-6 space-y-4"
      >
        <h3 className="text-lg font-semibold text-gray-800">O que fazer agora?</h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <Link href="/">
            <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center space-x-2">
              <Home className="h-4 w-4" />
              <span>Voltar ao Início</span>
            </button>
          </Link>
          
          <Link href="/cadastrar">
            <button className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center space-x-2">
              <UserPlus className="h-4 w-4" />
              <span>Cadastrar Outro</span>
            </button>
          </Link>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-sm text-gray-500"
      >
        <p>Os dados estão seguros e podem ser consultados a qualquer momento.</p>
      </motion.div>
    </div>
  )
}
