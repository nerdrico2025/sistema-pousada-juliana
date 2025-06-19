
'use client';

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { UserCheck, Save, ArrowLeft, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Guest {
  id: string
  nomeCompleto: string
  cpf: string
  email: string
  telefone: string
  dataNascimento: string
}

interface FormErrors {
  [key: string]: string
}

export default function NovoCheckinPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [guest, setGuest] = useState<Guest | null>(null)
  const [dataEntrada, setDataEntrada] = useState('')
  const [dataSaida, setDataSaida] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    loadGuestData()
  }, [params.id])

  const loadGuestData = async () => {
    try {
      const response = await fetch(`/api/guests/${params.id}`)
      if (response.ok) {
        const guestData = await response.json()
        setGuest(guestData)
      } else {
        alert('Erro ao carregar dados do hóspede')
        router.push('/')
      }
    } catch (error) {
      console.error('Erro ao carregar hóspede:', error)
      alert('Erro ao carregar dados do hóspede')
      router.push('/')
    } finally {
      setLoadingData(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!dataEntrada) {
      newErrors.dataEntrada = 'Data de entrada é obrigatória'
    }

    if (!dataSaida) {
      newErrors.dataSaida = 'Data de saída é obrigatória'
    } else if (dataEntrada && dataSaida) {
      const entryDate = new Date(dataEntrada)
      const exitDate = new Date(dataSaida)
      if (exitDate <= entryDate) {
        newErrors.dataSaida = 'Data de saída deve ser posterior à data de entrada'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)

    try {
      const response = await fetch('/api/stays', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guestId: params.id,
          dataEntrada,
          dataSaida,
          observacoes: 'Nova estadia registrada'
        }),
      })

      if (response.ok) {
        const newStay = await response.json()
        
        // Redirecionar para página de confirmação com os dados
        const confirmationParams = new URLSearchParams({
          guestName: guest!.nomeCompleto,
          stayId: newStay.id,
          dataEntrada: dataEntrada,
          dataSaida: dataSaida
        })
        
        router.push(`/confirmacao-checkin?${confirmationParams.toString()}`)
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Erro ao realizar check-in. Tente novamente.')
      }
    } catch (error) {
      console.error('Erro ao fazer check-in:', error)
      alert('Erro ao realizar check-in. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  const formatPhone = (phone: string) => {
    return phone.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  if (loadingData) {
    return (
      <div className="text-center py-12">
        <div className="text-lg text-gray-600">Carregando dados do hóspede...</div>
      </div>
    )
  }

  if (!guest) {
    return (
      <div className="text-center py-12">
        <div className="text-lg text-gray-600">Hóspede não encontrado</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-3xl font-bold text-gray-800">
          <UserCheck className="inline-block mr-3 h-8 w-8 text-green-600" />
          Novo Check-in
        </h1>
        <p className="text-gray-600">Registre uma nova estadia para este hóspede</p>
      </motion.div>

      {/* Guest Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-50 rounded-2xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <User className="h-6 w-6 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800">Dados do Hóspede</h3>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-600">Nome:</span>
            <p className="text-gray-800">{guest.nomeCompleto}</p>
          </div>
          <div>
            <span className="font-medium text-gray-600">CPF:</span>
            <p className="text-gray-800">{formatCPF(guest.cpf)}</p>
          </div>
          <div>
            <span className="font-medium text-gray-600">Email:</span>
            <p className="text-gray-800">{guest.email}</p>
          </div>
          <div>
            <span className="font-medium text-gray-600">Telefone:</span>
            <p className="text-gray-800">{formatPhone(guest.telefone)}</p>
          </div>
          <div>
            <span className="font-medium text-gray-600">Data de Nascimento:</span>
            <p className="text-gray-800">{formatDate(guest.dataNascimento)}</p>
          </div>
        </div>
      </motion.div>

      {/* Check-in Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-lg p-8"
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Novas Datas de Estadia</h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Datas de Entrada e Saída */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Entrada *
              </label>
              <input
                type="date"
                value={dataEntrada}
                onChange={(e) => {
                  setDataEntrada(e.target.value)
                  if (errors.dataEntrada) {
                    setErrors(prev => ({ ...prev, dataEntrada: '' }))
                  }
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all ${
                  errors.dataEntrada ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {errors.dataEntrada && (
                <p className="text-red-600 text-sm mt-1">{errors.dataEntrada}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Saída *
              </label>
              <input
                type="date"
                value={dataSaida}
                onChange={(e) => {
                  setDataSaida(e.target.value)
                  if (errors.dataSaida) {
                    setErrors(prev => ({ ...prev, dataSaida: '' }))
                  }
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all ${
                  errors.dataSaida ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {errors.dataSaida && (
                <p className="text-red-600 text-sm mt-1">{errors.dataSaida}</p>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex space-x-4 pt-6">
            <Link href="/consultar" className="flex-1">
              <button
                type="button"
                className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors font-semibold flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Cancelar</span>
              </button>
            </Link>
            
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold flex items-center justify-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Processando...' : 'CONFIRMAR CHECK-IN'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
