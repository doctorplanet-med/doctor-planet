import WhatsAppFloat from '@/components/layout/whatsapp-float'

export default function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">WhatsApp Button Test</h1>
        <p className="text-gray-600 mb-8">
          The green WhatsApp button should appear in the bottom-right corner
        </p>
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <p className="text-sm text-gray-500">
            If you see a green floating button in the bottom-right corner, it's working!
          </p>
        </div>
      </div>
      <WhatsAppFloat />
    </div>
  )
}
