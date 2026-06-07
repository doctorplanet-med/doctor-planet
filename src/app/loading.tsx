import Image from 'next/image'

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-8">
      <Image
        src="/logos/Full Logo.png"
        alt="Doctor Planet"
        width={160}
        height={70}
        priority
        className="object-contain"
      />
      <div className="w-48 h-1 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-primary-600 rounded-full animate-loading-bar" />
      </div>
      <style>{`
        @keyframes loading-bar {
          0%   { transform: translateX(-100%); }
          50%  { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
        .animate-loading-bar {
          animation: loading-bar 1.4s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
