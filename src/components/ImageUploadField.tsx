import React, { useRef, useState } from 'react'
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import pb from '@/lib/pocketbase/client'

/**
 * Campo de upload de imagem que usa o PocketBase file upload.
 *
 * Comportamento:
 *  - Edição (recordId informado): ao selecionar um arquivo, faz o upload imediato
 *    via FormData para o PocketBase e chama `onChange` com o nome do arquivo salvo.
 *  - Criação (sem recordId): ao selecionar um arquivo, mantém o preview local e
 *    chama `onFileChange(file)` — o pai deve guardar o File e enviá-lo via FormData
 *    no submit. `onChange` é chamado com o nome do arquivo (para referência).
 *  - Também permite colar uma URL manualmente (modo legado), chamando `onChange`.
 */
interface ImageUploadFieldProps {
  collection: string
  fieldName: string
  recordId?: string
  value?: string
  onChange: (value: string) => void
  onFileChange?: (file: File | null) => void
  label?: string
  /** Aceita também colar uma URL manualmente (padrão: true). */
  allowUrl?: boolean
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  collection,
  fieldName,
  recordId,
  value,
  onChange,
  onFileChange,
  label,
  allowUrl = true,
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [localPreview, setLocalPreview] = useState<string>('')
  const [useUrlMode, setUseUrlMode] = useState(false)

  // Resolve a URL pública de um arquivo PocketBase já salvo.
  const resolveUrl = (filename?: string): string => {
    if (!filename) return ''
    if (
      filename.startsWith('http://') ||
      filename.startsWith('https://') ||
      filename.startsWith('/')
    ) {
      return filename
    }
    if (!recordId) return ''
    return pb.files.getURL({ id: recordId, collectionName: collection } as any, filename)
  }

  const currentPreview = localPreview || resolveUrl(value)

  const handleFile = async (file: File) => {
    // Sem recordId (criação) — apenas preview local + repassa o File ao pai.
    if (!recordId) {
      const objUrl = URL.createObjectURL(file)
      setLocalPreview(objUrl)
      onChange(file.name)
      onFileChange?.(file)
      return
    }

    // Com recordId (edição) — upload imediato via FormData.
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append(fieldName, file)
      const updated = await pb.collection(collection).update(recordId, formData)
      const filename = (updated as any)?.[fieldName] || ''
      setLocalPreview('')
      onChange(filename)
      onFileChange?.(null)
    } catch (e) {
      console.error('Erro no upload da imagem:', e)
      alert('Não foi possível enviar a imagem. Tente novamente.')
    } finally {
      setUploading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleRemove = () => {
    setLocalPreview('')
    onChange('')
    onFileChange?.(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-2">
      {label && <span className="text-[11px] text-slate-300 font-medium block">{label}</span>}

      {currentPreview ? (
        <div className="relative group w-full h-32 rounded-md overflow-hidden border border-[#222c3f] bg-[#0a0d14]">
          <img src={currentPreview} alt="Preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 border border-white/20 text-white flex items-center justify-center hover:bg-red-600/80 transition-colors"
            title="Remover imagem"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          {uploading && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full h-32 rounded-md border border-dashed border-[#222c3f] bg-[#0a0d14] hover:border-blue-500/60 hover:bg-[#0c1320] transition-colors flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-blue-400"
        >
          {uploading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Upload className="w-5 h-5" />
          )}
          <span className="text-[11px] font-medium">
            {uploading ? 'Enviando...' : 'Clique para enviar uma imagem'}
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />

      {allowUrl && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setUseUrlMode((v) => !v)}
            className="text-[10px] text-slate-500 hover:text-blue-400 flex items-center gap-1"
          >
            <ImageIcon className="w-3 h-3" />
            {useUrlMode ? 'Usar upload' : 'Ou informar URL da imagem'}
          </button>
        </div>
      )}

      {useUrlMode && (
        <Input
          value={value && value.startsWith('http') ? value : ''}
          onChange={(e) => {
            setLocalPreview(e.target.value)
            onChange(e.target.value)
            onFileChange?.(null)
          }}
          placeholder="https://..."
          className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
        />
      )}
    </div>
  )
}

/** Gera a URL pública de um arquivo PocketBase. */
export function pbFileUrl(
  collection: string,
  recordId: string | undefined,
  filename?: string,
): string {
  if (!filename) return ''
  if (
    filename.startsWith('http://') ||
    filename.startsWith('https://') ||
    filename.startsWith('/')
  ) {
    return filename
  }
  if (!recordId) return ''
  return pb.files.getURL({ id: recordId, collectionName: collection } as any, filename)
}
