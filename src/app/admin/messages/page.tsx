'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageSquare, Mail, Phone, Clock, Trash2, 
  Eye, EyeOff, Search, X, Reply
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Message {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
  isRead: boolean
  createdAt: string
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/admin/messages')
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages)
        setUnreadCount(data.unreadCount)
      }
    } catch (error) {
      toast.error('Failed to fetch messages')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (message: Message) => {
    try {
      const res = await fetch(`/api/admin/messages/${message.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: !message.isRead })
      })

      if (res.ok) {
        fetchMessages()
        if (selectedMessage?.id === message.id) {
          setSelectedMessage({ ...message, isRead: !message.isRead })
        }
      }
    } catch (error) {
      toast.error('Failed to update message')
    }
  }

  const deleteMessage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return

    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        toast.success('Message deleted')
        fetchMessages()
        if (selectedMessage?.id === id) {
          setSelectedMessage(null)
        }
      }
    } catch (error) {
      toast.error('Failed to delete message')
    }
  }

  const openMessage = (message: Message) => {
    setSelectedMessage(message)
    if (!message.isRead) {
      markAsRead(message)
    }
  }

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = 
      msg.name.toLowerCase().includes(search.toLowerCase()) ||
      msg.email.toLowerCase().includes(search.toLowerCase()) ||
      msg.subject.toLowerCase().includes(search.toLowerCase())
    
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'unread' && !msg.isRead) ||
      (filter === 'read' && msg.isRead)

    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Contact Messages</h1>
          <p className="text-secondary-600">
            {unreadCount > 0 ? `${unreadCount} unread messages` : 'All messages read'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or subject..."
            className="w-full pl-12 pr-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'unread', 'read'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                filter === f
                  ? 'bg-primary-600 text-white'
                  : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
              }`}
            >
              {f} {f === 'unread' && unreadCount > 0 && `(${unreadCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Messages List */}
      {filteredMessages.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-secondary-200">
          <MessageSquare className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-2">No messages</h3>
          <p className="text-secondary-600">
            {search ? 'No messages match your search' : 'Contact messages will appear here'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-secondary-200 overflow-hidden">
          {filteredMessages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.02 }}
              onClick={() => openMessage(message)}
              className={`p-4 border-b border-secondary-100 last:border-b-0 cursor-pointer hover:bg-secondary-50 transition-colors ${
                !message.isRead ? 'bg-primary-50/50' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  !message.isRead ? 'bg-primary-100' : 'bg-secondary-100'
                }`}>
                  <Mail className={`w-5 h-5 ${!message.isRead ? 'text-primary-600' : 'text-secondary-500'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={`font-medium truncate ${!message.isRead ? 'text-secondary-900' : 'text-secondary-700'}`}>
                      {message.name}
                    </h3>
                    <span className="text-xs text-secondary-500 flex-shrink-0">
                      {new Date(message.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-secondary-500 truncate">{message.email}</p>
                  <p className={`text-sm mt-1 truncate ${!message.isRead ? 'font-medium text-secondary-800' : 'text-secondary-600'}`}>
                    {message.subject}
                  </p>
                  <p className="text-sm text-secondary-500 truncate mt-1">{message.message}</p>
                </div>
                {!message.isRead && (
                  <div className="w-3 h-3 bg-primary-500 rounded-full flex-shrink-0"></div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Message Detail Modal */}
      <AnimatePresence>
        {selectedMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedMessage(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-secondary-200">
                <h2 className="text-xl font-bold text-secondary-900">Message Details</h2>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="p-2 text-secondary-400 hover:text-secondary-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <Mail className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-secondary-900">{selectedMessage.name}</h3>
                      <a 
                        href={`mailto:${selectedMessage.email}`} 
                        className="text-primary-600 hover:underline text-sm"
                      >
                        {selectedMessage.email}
                      </a>
                      {selectedMessage.phone && (
                        <p className="text-sm text-secondary-500 flex items-center gap-1 mt-1">
                          <Phone className="w-4 h-4" />
                          {selectedMessage.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="bg-secondary-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-sm text-secondary-500 mb-2">
                      <Clock className="w-4 h-4" />
                      {new Date(selectedMessage.createdAt).toLocaleString()}
                    </div>
                    <h4 className="font-semibold text-secondary-900 mb-3">{selectedMessage.subject}</h4>
                    <p className="text-secondary-700 whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between p-6 border-t border-secondary-200 bg-secondary-50">
                <div className="flex gap-2">
                  <button
                    onClick={() => markAsRead(selectedMessage)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      selectedMessage.isRead
                        ? 'bg-secondary-200 text-secondary-700 hover:bg-secondary-300'
                        : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                    }`}
                  >
                    {selectedMessage.isRead ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {selectedMessage.isRead ? 'Mark Unread' : 'Mark Read'}
                  </button>
                  <button
                    onClick={() => deleteMessage(selectedMessage.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Reply className="w-4 h-4" />
                  Reply via Email
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
