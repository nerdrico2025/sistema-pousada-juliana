
'use client';

import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { Search, User, Mail, Phone, Calendar, Edit3, UserCheck } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface Stay {
  id: string
  dataEntrada: string
  dataSaida: string
  status: string
  observacoes?: string
  createdAt: string
}

interface Guest {
  id: string
  nomeCompleto: string
  cpf: string
  email: string
  telefone: string
  dataNascimento: string
  dataCadastro: string
  stays: Stay[]
  lastStay: Stay | null
  totalStays: number
}

function ConsultarContent() {
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams?.get('q') || '')
  const [guests, setGuests] = useState<Guest[]>([])
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    const query = searchParams?.get('q')
    if (query) {
      setSearchTerm(query)
      handleSearch(query)
    }
  }, [searchParams])

  const handleSearch = async (term?: string) => {
    const searchQuery = term || searchTerm
    if (!searchQuery.trim()) return

    setLoading(true)
    setHasSearched(true)
    
    try {
      const response = await fetch(`/api/guests/search?q=${encodeURIComponent(searchQuery.trim())}`)
      if (response.ok) {
        const data = await response.json()
        setGuests(data)
      } else {
        setGuests([])
      }
    } catch (error) {
      console.error('Erro ao buscar hóspedes:', error)
      setGuests([])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  const formatPhone = (phone: string) => {
    return phone.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3')
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-3xl font-bold text-gray-800">
          <Search className="inline-block mr-3 h-8 w-8 text-blue-600" />
          Consultar Hóspedes
        </h1>
        <p className="text-gray-600">Busque por nome completo ou email</p>
      </motion.div>

      {/* Search Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6"
      >
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Digite o nome completo ou email do hóspede..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
          <button
            onClick={() => handleSearch()}
            disabled={!searchTerm.trim() || loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </motion.div>

      {/* Results */}
      {hasSearched && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {guests.length === 0 ? (
            <div className="text-center bg-white rounded-2xl shadow-lg p-8">
              <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhum hóspede encontrado</h3>
              <p className="text-gray-500">Tente buscar por outro nome ou email</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                {guests.length} hóspede{guests.length > 1 ? 's' : ''} encontrado{guests.length > 1 ? 's' : ''}
              </h3>
              
              <div className="grid gap-4">
                {guests.map((guest, index) => (
                  <motion.div
                    key={guest.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 cursor-pointer border border-gray-100"
                    onClick={() => setSelectedGuest(guest)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">{guest.nomeCompleto}</h4>
                        <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4" />
                            <span>{guest.email}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4" />
                            <span>{formatPhone(guest.telefone)}</span>
                          </div>
                          {guest.lastStay ? (
                            <>
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4" />
                                <span>Última entrada: {formatDate(guest.lastStay.dataEntrada)}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4" />
                                <span>Última saída: {formatDate(guest.lastStay.dataSaida)}</span>
                              </div>
                            </>
                          ) : (
                            <div className="flex items-center space-x-2 md:col-span-2">
                              <Calendar className="h-4 w-4" />
                              <span className="text-gray-500">Nenhuma estadia registrada</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-blue-600">
                        <span className="text-sm font-medium">Ver detalhes →</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Guest Details Modal */}
      {selectedGuest && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedGuest(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Detalhes do Hóspede</h3>
                <button
                  onClick={() => setSelectedGuest(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Nome Completo</label>
                    <p className="text-gray-800 font-semibold">{selectedGuest.nomeCompleto}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">CPF</label>
                    <p className="text-gray-800">{formatCPF(selectedGuest.cpf)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                    <p className="text-gray-800">{selectedGuest.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Telefone</label>
                    <p className="text-gray-800">{formatPhone(selectedGuest.telefone)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Data de Nascimento</label>
                    <p className="text-gray-800">{formatDate(selectedGuest.dataNascimento)}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Data de Cadastro</label>
                    <p className="text-gray-800">{formatDate(selectedGuest.dataCadastro)}</p>
                  </div>
                </div>

                {/* Histórico de Estadias */}
                <div className="border-t pt-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">
                    Histórico de Estadias ({selectedGuest.totalStays})
                  </h4>
                  {selectedGuest.stays.length > 0 ? (
                    <div className="space-y-3 max-h-40 overflow-y-auto">
                      {selectedGuest.stays.map((stay, index) => (
                        <div key={stay.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-800">
                              Estadia #{selectedGuest.stays.length - index}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              stay.status === 'ativo' ? 'bg-green-100 text-green-800' :
                              stay.status === 'finalizado' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {stay.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Entrada:</span>
                              <p className="font-medium text-green-600">{formatDate(stay.dataEntrada)}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Saída:</span>
                              <p className="font-medium text-red-600">{formatDate(stay.dataSaida)}</p>
                            </div>
                          </div>
                          {stay.observacoes && (
                            <div className="mt-2">
                              <span className="text-gray-600 text-sm">Observações:</span>
                              <p className="text-sm text-gray-800">{stay.observacoes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">Nenhuma estadia registrada</p>
                  )}
                </div>

                <div className="flex space-x-4 pt-6 border-t">
                  <Link href={`/editar/${selectedGuest.id}`} className="flex-1">
                    <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center space-x-2">
                      <Edit3 className="h-4 w-4" />
                      <span>Editar Dados</span>
                    </button>
                  </Link>
                  <Link href={`/novo-checkin/${selectedGuest.id}`} className="flex-1">
                    <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center space-x-2">
                      <UserCheck className="h-4 w-4" />
                      <span>Novo Check-in</span>
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Back to Home */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
          ← Voltar para o início
        </Link>
      </motion.div>
    </div>
  )
}

export default function ConsultarPage() {
  return (
    <Suspense fallback={
      <div className="text-center py-12">
        <div className="text-lg text-gray-600">Carregando...</div>
      </div>
    }>
      <ConsultarContent />
    </Suspense>
  )
}
