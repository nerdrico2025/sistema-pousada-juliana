
'use client';

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Edit3, Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface FormData {
  nomeCompleto: string
  cpf: string
  email: string
  telefone: string
  dataNascimento: string
  dataEntrada: string
  dataSaida: string
}

interface FormErrors {
  [key: string]: string
}

export default function EditarPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    nomeCompleto: '',
    cpf: '',
    email: '',
    telefone: '',
    dataNascimento: '',
    dataEntrada: '',
    dataSaida: ''
  })
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
        const guest = await response.json()
        setFormData({
          nomeCompleto: guest.nomeCompleto,
          cpf: formatCPF(guest.cpf),
          email: guest.email,
          telefone: formatPhone(guest.telefone),
          dataNascimento: guest.dataNascimento.split('T')[0],
          dataEntrada: guest.dataEntrada.split('T')[0],
          dataSaida: guest.dataSaida.split('T')[0]
        })
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

  const validateCPF = (cpf: string): boolean => {
    const cleanCPF = cpf.replace(/\D/g, '')
    
    if (cleanCPF.length !== 11) return false
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false

    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i)
    }
    let remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(cleanCPF.charAt(9))) return false

    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i)
    }
    remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(cleanCPF.charAt(10))) return false

    return true
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string): boolean => {
    const cleanPhone = phone.replace(/\D/g, '')
    return cleanPhone.length === 10 || cleanPhone.length === 11
  }

  const formatCPF = (value: string): string => {
    const cleanValue = value.replace(/\D/g, '')
    if (cleanValue.length <= 11) {
      return cleanValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    }
    return value
  }

  const formatPhone = (value: string): string => {
    const cleanValue = value.replace(/\D/g, '')
    if (cleanValue.length <= 11) {
      if (cleanValue.length <= 10) {
        return cleanValue.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
      } else {
        return cleanValue.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
      }
    }
    return value
  }

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value

    if (field === 'cpf') {
      formattedValue = formatCPF(value)
    } else if (field === 'telefone') {
      formattedValue = formatPhone(value)
    }

    setFormData(prev => ({ ...prev, [field]: formattedValue }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.nomeCompleto.trim()) {
      newErrors.nomeCompleto = 'Nome completo é obrigatório'
    } else if (formData.nomeCompleto.trim().split(' ').length < 2) {
      newErrors.nomeCompleto = 'Digite o nome completo'
    }

    if (!formData.cpf) {
      newErrors.cpf = 'CPF é obrigatório'
    } else if (!validateCPF(formData.cpf)) {
      newErrors.cpf = 'CPF inválido'
    }

    if (!formData.email) {
      newErrors.email = 'Email é obrigatório'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!formData.telefone) {
      newErrors.telefone = 'Telefone é obrigatório'
    } else if (!validatePhone(formData.telefone)) {
      newErrors.telefone = 'Telefone inválido (deve ter DDD)'
    }

    if (!formData.dataNascimento) {
      newErrors.dataNascimento = 'Data de nascimento é obrigatória'
    }

    if (!formData.dataEntrada) {
      newErrors.dataEntrada = 'Data de entrada é obrigatória'
    }

    if (!formData.dataSaida) {
      newErrors.dataSaida = 'Data de saída é obrigatória'
    } else if (formData.dataEntrada && formData.dataSaida) {
      const entryDate = new Date(formData.dataEntrada)
      const exitDate = new Date(formData.dataSaida)
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
      const response = await fetch(`/api/guests/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        alert('Dados atualizados com sucesso!')
        router.push('/consultar')
      } else {
        const errorData = await response.json()
        if (errorData.error === 'CPF já cadastrado para outro hóspede') {
          setErrors({ cpf: 'Este CPF já está cadastrado para outro hóspede' })
        } else {
          alert('Erro ao atualizar dados. Tente novamente.')
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar:', error)
      alert('Erro ao atualizar dados. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="text-center py-12">
        <div className="text-lg text-gray-600">Carregando dados do hóspede...</div>
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
          <Edit3 className="inline-block mr-3 h-8 w-8 text-blue-600" />
          Editar Dados do Hóspede
        </h1>
        <p className="text-gray-600">Atualize as informações necessárias</p>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg p-8"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome Completo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome Completo *
            </label>
            <input
              type="text"
              value={formData.nomeCompleto}
              onChange={(e) => handleInputChange('nomeCompleto', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                errors.nomeCompleto ? 'border-red-500' : 'border-gray-200'
              }`}
              placeholder="Digite o nome completo do hóspede"
            />
            {errors.nomeCompleto && (
              <p className="text-red-600 text-sm mt-1">{errors.nomeCompleto}</p>
            )}
          </div>

          {/* CPF e Email */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CPF *
              </label>
              <input
                type="text"
                value={formData.cpf}
                onChange={(e) => handleInputChange('cpf', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                  errors.cpf ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="000.000.000-00"
                maxLength={14}
              />
              {errors.cpf && (
                <p className="text-red-600 text-sm mt-1">{errors.cpf}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                  errors.email ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="exemplo@email.com"
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Telefone e Data de Nascimento */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone com DDD *
              </label>
              <input
                type="text"
                value={formData.telefone}
                onChange={(e) => handleInputChange('telefone', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                  errors.telefone ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="(11) 99999-9999"
                maxLength={15}
              />
              {errors.telefone && (
                <p className="text-red-600 text-sm mt-1">{errors.telefone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Nascimento *
              </label>
              <input
                type="date"
                value={formData.dataNascimento}
                onChange={(e) => handleInputChange('dataNascimento', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                  errors.dataNascimento ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {errors.dataNascimento && (
                <p className="text-red-600 text-sm mt-1">{errors.dataNascimento}</p>
              )}
            </div>
          </div>

          {/* Datas de Entrada e Saída */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Entrada *
              </label>
              <input
                type="date"
                value={formData.dataEntrada}
                onChange={(e) => handleInputChange('dataEntrada', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
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
                value={formData.dataSaida}
                onChange={(e) => handleInputChange('dataSaida', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
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
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold flex items-center justify-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Salvando...' : 'SALVAR ALTERAÇÕES'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
