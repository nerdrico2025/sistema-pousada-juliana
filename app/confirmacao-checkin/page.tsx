
'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Home, Calendar, User } from 'lucide-react'
import { motion } from 'framer-motion'

function ConfirmacaoContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [guestData, setGuestData] = useState<any>(null)
  const [stayData, setStayData] = useState<any>(null)

  useEffect(() => {
    // Recuperar dados do sessionStorage ou query params
    const guestName = searchParams.get('guestName')
    const stayId = searchParams.get('stayId')
    const dataEntrada = searchParams.get('dataEntrada')
    const dataSaida = searchParams.get('dataSaida')

    if (guestName && dataEntrada && dataSaida) {
      setGuestData({ nomeCompleto: guestName })
      setStayData({
        id: stayId,
        dataEntrada: new Date(dataEntrada),
        dataSaida: new Date(dataSaida)
      })
    }
  }, [searchParams])

  const handleVoltar = () => {
    router.push('/')
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  if (!guestData || !stayData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-600">Carregando...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur">
          <CardHeader className="text-center pb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex justify-center mb-4"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </motion.div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              Check-in Confirmado!
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="space-y-4"
            >
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <User className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-800">Hóspede</p>
                  <p className="text-sm text-gray-600">{guestData.nomeCompleto}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <Calendar className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-800">Período da Estadia</p>
                  <p className="text-sm text-gray-600">
                    {formatDate(stayData.dataEntrada)} até {formatDate(stayData.dataSaida)}
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800 text-center">
                  <strong>✨ Sucesso!</strong><br />
                  O novo check-in foi registrado com sucesso no sistema.
                  O histórico de estadias anteriores foi preservado.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Button
                onClick={handleVoltar}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105"
              >
                <Home className="w-5 h-5 mr-2" />
                Voltar ao Início
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default function ConfirmacaoCheckinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-600">Carregando...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <ConfirmacaoContent />
    </Suspense>
  )
}
