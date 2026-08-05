import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toPng } from 'html-to-image'
import { ArrowLeft, Download, Share2, RotateCw } from 'lucide-react'
import { receiptService } from '../../../services/receiptService'
import ReceiptCard from '../components/ReceiptCard'

export default function ReceiptPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const cardRef = useRef(null)
  const [receipt, setReceipt] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const canShareFiles = typeof navigator !== 'undefined' && !!navigator.canShare

  useEffect(() => {
    receiptService.generate(id).then(setReceipt).catch((e) => setError(e.message))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function capture() {
    if (!cardRef.current) return null
    return toPng(cardRef.current, { pixelRatio: 2, backgroundColor: '#ffffff' })
  }

  async function handleDownload() {
    setBusy(true)
    try {
      const dataUrl = await capture()
      const link = document.createElement('a')
      link.download = `recibo-publicolor-${receipt.consecutiveNumber}.png`
      link.href = dataUrl
      link.click()
    } finally {
      setBusy(false)
    }
  }

  async function handleShare() {
    setBusy(true)
    try {
      const dataUrl = await capture()
      const blob = await (await fetch(dataUrl)).blob()
      const file = new File([blob], `recibo-publicolor-${receipt.consecutiveNumber}.png`, { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Recibo de cobro - Publicolor' })
      } else {
        await handleDownload()
      }
    } finally {
      setBusy(false)
    }
  }

  function handleRegenerate() {
    setReceipt(null)
    setError('')
    receiptService.generate(id).then(setReceipt).catch((e) => setError(e.message))
  }

  if (error) return <p className="min-h-screen bg-slate-50 p-6 text-rose-600 text-sm">{error}</p>
  if (!receipt) return <p className="min-h-screen bg-slate-50 p-6 text-slate-400 text-sm">Generando recibo…</p>

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 space-y-4">
      <button onClick={() => navigate(`/trabajos/${id}`)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft size={16} /> Volver al trabajo
      </button>

      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <ReceiptCard ref={cardRef} receipt={receipt} />
      </div>

      <div className="flex flex-wrap gap-2 max-w-md mx-auto">
        <button
          onClick={handleDownload}
          disabled={busy}
          className="flex-1 flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg text-sm"
        >
          <Download size={16} /> Descargar como imagen
        </button>
        {canShareFiles && (
          <button
            onClick={handleShare}
            disabled={busy}
            className="flex-1 flex items-center justify-center gap-2 border border-slate-300 hover:bg-slate-50 disabled:opacity-60 text-slate-700 font-semibold py-2.5 rounded-lg text-sm"
          >
            <Share2 size={16} /> Compartir
          </button>
        )}
        <button
          onClick={handleRegenerate}
          disabled={busy}
          className="flex-1 flex items-center justify-center gap-2 border border-slate-300 hover:bg-slate-50 disabled:opacity-60 text-slate-700 font-semibold py-2.5 rounded-lg text-sm"
        >
          <RotateCw size={16} /> Volver a generar
        </button>
      </div>
    </div>
  )
}
