import Image from 'next/image'

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-6">
        <div className="animate-pulse">
          <Image
            src="/logos/Full Logo.png"
            alt="Doctor Planet"
            width={180}
            height={80}
            priority
            className="object-contain"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary-600 animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 rounded-full bg-primary-600 animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 rounded-full bg-primary-600 animate-bounce" />
        </div>
      </div>
    </div>
  )
}
