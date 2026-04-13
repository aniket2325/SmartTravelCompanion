import { useEffect, useRef, useState } from 'react'
import { FileText, Upload, Lock, Eye, Download, Trash2, Plus, Shield, AlertCircle, CheckCircle2, Clock, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import { documentsAPI } from '../services/api'
import PageWrapper from '../components/Layout/PageWrapper'

const DOC_TYPES = ['Passport', 'Visa', 'Flight Ticket', 'Hotel Booking', 'Travel Insurance', 'ID Card', 'Vaccination', 'Other']

const statusConfig = {
  valid:   { label: 'Valid',    color: 'text-emerald-600',   bg: 'bg-emerald-50',  border: 'border-emerald-200',  icon: CheckCircle2 },
  expiring:{ label: 'Expiring', color: 'text-amber-600',  bg: 'bg-amber-50', border: 'border-amber-200', icon: Clock },
  expired: { label: 'Expired',  color: 'text-red-600',    bg: 'bg-red-50',   border: 'border-red-200',   icon: AlertCircle },
}

export default function DocVault() {
  const [docs, setDocs]       = useState([])
  const [filter, setFilter]   = useState('all')
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [dragOver, setDragOver]   = useState(false)
  const fileInputRef = useRef(null)

  const getStatus = (exp) => {
    if (!exp || exp === 'N/A') return 'valid'
    const diff = (new Date(exp) - new Date()) / (1000 * 60 * 60 * 24)
    if (diff < 0) return 'expired'
    if (diff < 90) return 'expiring'
    return 'valid'
  }

  const loadDocs = async () => {
    setLoading(true)
    try {
      const res = await documentsAPI.getAll()
      setDocs(res.data?.data || [])
    } catch (err) {
      toast.error(err?.message || 'Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadDocs() }, [])

  const uploadFile = async (file) => {
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)

    setUploading(true)
    try {
      const res = await documentsAPI.upload(formData)
      setDocs((prev) => [res.data.data, ...prev])
      toast.success('Document uploaded securely (AES-256 encrypted)')
    } catch (err) {
      toast.error(err?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleUpload = () => fileInputRef.current?.click()
  const handleFileSelected = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    await uploadFile(file)
    event.target.value = null
  }

  const handleDrop = async (event) => {
    event.preventDefault()
    setDragOver(false)
    const file = event.dataTransfer.files?.[0]
    if (file) await uploadFile(file)
  }

  const docsWithStatus = docs.map((doc) => ({
    ...doc,
    expires: doc.expiresAt ? new Date(doc.expiresAt).toISOString().slice(0, 10) : 'N/A',
    size: doc.size ? `${(doc.size / 1024 / 1024).toFixed(1)} MB` : '—',
    added: doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : '—',
    computedStatus: getStatus(doc.expiresAt),
  }))

  const filtered = filter === 'all' ? docsWithStatus : docsWithStatus.filter(d => d.computedStatus === filter)

  const removeDoc = async (id) => {
    try {
      await documentsAPI.delete(id)
      setDocs((prev) => prev.filter((d) => d._id !== id && d.id !== id))
      toast.success('Document removed from vault')
    } catch (err) {
      toast.error(err?.message || 'Delete failed')
    }
  }

  const handleDownload = async (doc) => {
    try {
      const id = doc._id || doc.id
      toast.loading(`Downloading ${doc.name}...`, { id: 'download' })
      const res = await documentsAPI.download(id)
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', doc.originalName || doc.filename || doc.name)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Downloaded successfully', { id: 'download' })
    } catch (err) {
      toast.error('Download failed', { id: 'download' })
    }
  }

  const handleView = async (doc) => {
    try {
      const id = doc._id || doc.id
      toast.loading(`Opening ${doc.name}...`, { id: 'view' })
      const res = await documentsAPI.download(id)
      const url = window.URL.createObjectURL(new Blob([res.data], { type: doc.mimeType }))
      window.open(url, '_blank')
      toast.success('Opened successfully', { id: 'view' })
    } catch (err) {
      toast.error('View failed', { id: 'view' })
    }
  }

  return (
    <PageWrapper icon={Lock} title="Secure Document Vault" subtitle="AES-256 encrypted · Offline accessible" iconColor="text-indigo-500" iconBg="bg-indigo-100">

      <div className="flex justify-end -mt-10 relative z-30 mb-8 px-2 pointer-events-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-[10px] font-bold text-emerald-600 uppercase tracking-widest shadow-sm">
            <Shield size={12}/> Encrypted Server
          </div>
      </div>

      <div className="max-w-4xl space-y-6">

        {/* Upload zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={clsx(
            'glass-card border-2 border-dashed rounded-[20px] p-10 flex flex-col items-center gap-4 cursor-pointer transition-all duration-300 shadow-sm relative overflow-hidden group',
            dragOver ? 'border-blue-400 bg-blue-50/80 scale-[1.02]' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
          )}
          onClick={handleUpload}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="hidden" onChange={handleFileSelected} />
          
          <div className={clsx("w-16 h-16 rounded-2xl flex items-center justify-center transition-transform duration-300 shadow-inner group-hover:-translate-y-1 group-hover:shadow-md", dragOver ? 'bg-blue-100' : 'bg-slate-100 border border-slate-200')}>
            <Upload size={28} className={clsx("transition-colors", dragOver ? 'text-blue-500 animate-bounce-soft' : 'text-slate-400 group-hover:text-blue-500')} />
          </div>
          <div className="text-center relative z-10">
            <p className="font-extrabold text-base text-slate-800">Drop files here or click to upload</p>
            <p className="text-slate-500 font-medium text-xs mt-1.5">PDF, JPG, PNG · Max 10MB · All documents are AES-256 encrypted</p>
          </div>
          {uploading && (
            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm bg-blue-50 px-4 py-2 rounded-full border border-blue-200 absolute bottom-4 animate-fade-in shadow-sm">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              Encrypting and uploading…
            </div>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { label: 'Total Docs', val: docs.length, color: 'text-slate-800', bg: 'bg-white', border: 'border-slate-200' },
            { label: 'Expiring Soon', val: docsWithStatus.filter(d=>d.computedStatus==='expiring').length, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
            { label: 'Expired', val: docsWithStatus.filter(d=>d.computedStatus==='expired').length, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
          ].map((s, i) => (
            <div key={i} className={clsx('rounded-2xl p-6 border shadow-sm transition-all hover:shadow-md', s.bg, s.border)}>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1.5">{s.label}</p>
              <p className={clsx('text-3xl font-black tabular-nums', s.color)}>{s.val}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 bg-slate-200/50 p-1 rounded-xl w-fit mb-2">
          {['all','valid','expiring','expired'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={clsx('text-xs font-bold px-4 py-2 rounded-lg capitalize transition-all shadow-sm',
                filter === f ? 'bg-white/50 backdrop-blur-sm text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-white/30 shadow-none'
              )}>
              {f}
            </button>
          ))}
        </div>

        {/* Document list */}
        <div className="space-y-3">
          {loading ? (
             <div className="glass-card rounded-[18px] p-10 text-center shadow-sm">
                <Loader2 size={24} className="animate-spin text-blue-500 mx-auto" />
             </div>
          ) : filtered.length === 0 ? (
             <div className="glass-card rounded-[18px] p-12 text-center shadow-sm">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                    <FileText size={24} className="text-slate-300" />
                </div>
                <p className="text-slate-800 text-base font-bold">No documents found</p>
                <p className="text-slate-500 text-sm mt-1">Upload a document to securely store it in your vault.</p>
             </div>
          ) : filtered.map((doc) => {
            const st = statusConfig[doc.computedStatus]
            const StatusIcon = st.icon
            return (
              <div key={doc.id} className="glass-card rounded-[18px] p-4 flex items-center gap-5 hover:border-blue-300 hover:shadow-md transition-all group shadow-sm cursor-pointer">
                <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-3xl flex-shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                  {doc.icon || '📄'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                    <p className="font-extrabold text-base text-slate-800 group-hover:text-blue-600 transition-colors truncate">{doc.name}</p>
                    <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 uppercase tracking-wide', st.color, st.bg, st.border)}>
                      <StatusIcon size={12}/> {st.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 font-medium text-xs flex-wrap">
                    <span className="font-bold text-slate-400 uppercase text-[10px] bg-slate-100 px-2 py-0.5 rounded">{doc.type}</span>
                    <span>·</span>
                    <span>Expires: <span className="font-semibold text-slate-600">{doc.expires}</span></span>
                    <span>·</span>
                    <span>{doc.size}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                  <button title="View" onClick={() => handleView(doc)} className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 border border-slate-100 hover:border-blue-200 transition-all shadow-sm">
                    <Eye size={16}/>
                  </button>
                  <button title="Download" onClick={() => handleDownload(doc)} className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 border border-slate-100 hover:border-emerald-200 transition-all shadow-sm">
                    <Download size={16}/>
                  </button>
                  <button title="Delete" onClick={() => removeDoc(doc._id || doc.id)} className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 border border-slate-100 hover:border-red-200 transition-all shadow-sm ml-2">
                    <Trash2 size={16}/>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </PageWrapper>
  )
}
