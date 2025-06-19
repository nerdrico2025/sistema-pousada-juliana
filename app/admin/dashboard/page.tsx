
'use client';

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Search, Download, LogOut, Eye, Edit3, UserCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
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

interface Admin {
  id: string
  login: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [guests, setGuests] = useState<Guest[]>([])
  const [filteredGuests, setFilteredGuests] = useState<Guest[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (admin) {
      loadGuests()
    }
  }, [admin])

  useEffect(() => {
    filterGuests()
  }, [searchTerm, guests])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/verify')
      if (response.ok) {
        const data = await response.json()
        setAdmin(data.admin)
      } else {
        router.push('/admin')
      }
    } catch (error) {
      router.push('/admin')
    } finally {
      setLoading(false)
    }
  }

  const loadGuests = async () => {
    try {
      const response = await fetch('/api/guests')
      if (response.ok) {
        const data = await response.json()
        setGuests(data)
      }
    } catch (error) {
      console.error('Erro ao carregar hóspedes:', error)
    }
  }

  const filterGuests = () => {
    if (!searchTerm.trim()) {
      setFilteredGuests(guests)
    } else {
      const filtered = guests.filter(guest =>
        guest.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.cpf.includes(searchTerm.replace(/\D/g, ''))
      )
      setFilteredGuests(filtered)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/admin')
    } catch (error) {
      console.error('Erro no logout:', error)
    }
  }

  const exportToCSV = async () => {
    setExporting(true)
    try {
      const response = await fetch('/api/guests/export')
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `hospedes-pousada-juliana-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert('Erro ao exportar dados')
      }
    } catch (error) {
      console.error('Erro na exportação:', error)
      alert('Erro ao exportar dados')
    } finally {
      setExporting(false)
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

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-lg text-gray-600">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            <Users className="inline-block mr-3 h-8 w-8 text-red-600" />
            Dashboard Administrativo
          </h1>
          <p className="text-gray-600 mt-1">Bem-vindo, {admin?.login}</p>
        </div>
        
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Sair</span>
        </button>
      </motion.div>

      {/* Stats and Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid md:grid-cols-3 gap-6"
      >
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Hóspedes</p>
              <p className="text-2xl font-bold text-gray-800">{guests.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Resultados da Busca</p>
              <p className="text-2xl font-bold text-gray-800">{filteredGuests.length}</p>
            </div>
            <Search className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <button
            onClick={exportToCSV}
            disabled={exporting}
            className="w-full flex items-center justify-center space-x-2 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            <Download className="h-4 w-4" />
            <span>{exporting ? 'Exportando...' : 'Exportar CSV'}</span>
          </button>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-md p-6"
      >
        <div className="flex items-center space-x-4">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome, email ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
          />
        </div>
      </motion.div>

      {/* Guests List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-md overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            Lista de Hóspedes ({filteredGuests.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hóspede
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ÚLTIMA ESTADIA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cadastro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredGuests.map((guest, index) => (
                <motion.tr
                  key={guest.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{guest.nomeCompleto}</div>
                      <div className="text-sm text-gray-500">{formatCPF(guest.cpf)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">{guest.email}</div>
                      <div className="text-sm text-gray-500">{formatPhone(guest.telefone)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      {guest.lastStay ? (
                        <div>
                          <div className="text-sm text-gray-900">
                            {formatDate(guest.lastStay.dataEntrada)} a {formatDate(guest.lastStay.dataSaida)}
                          </div>
                          <div className="text-sm text-gray-500">
                            Status: {guest.lastStay.status} • Total: {guest.totalStays} estadia{guest.totalStays !== 1 ? 's' : ''}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-sm text-gray-500">Nenhuma estadia registrada</div>
                          <div className="text-sm text-gray-400">
                            Nascimento: {formatDate(guest.dataNascimento)}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(guest.dataCadastro)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedGuest(guest)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Ver detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <Link href={`/editar/${guest.id}`}>
                        <button className="text-yellow-600 hover:text-yellow-900 p-1" title="Editar">
                          <Edit3 className="h-4 w-4" />
                        </button>
                      </Link>
                      <Link href={`/novo-checkin/${guest.id}`}>
                        <button className="text-green-600 hover:text-green-900 p-1" title="Novo check-in">
                          <UserCheck className="h-4 w-4" />
                        </button>
                      </Link>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {filteredGuests.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? 'Nenhum hóspede encontrado para esta busca' : 'Nenhum hóspede cadastrado'}
              </p>
            </div>
          )}
        </div>
      </motion.div>

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
    </div>
  )
}
