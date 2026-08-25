import { useState, useEffect, useCallback, useRef } from 'react'
import { Announcement, announcementService } from '@/services/api'
import { useAuth } from '@/context/AuthContext'

export interface UseAnnouncementPopupReturn {
  announcements: Announcement[]
  currentAnnouncement: Announcement | null
  currentIndex: number
  totalCount: number
  isOpen: boolean
  isLoading: boolean
  isMarking: boolean
  next: () => void
  prev: () => void
  goTo: (index: number) => void
  markCurrentAsUnderstood: () => Promise<void>
  markAllAsUnderstood: () => Promise<void>
  closeModal: () => void
  refresh: () => Promise<void>
}

export function useAnnouncementPopup(): UseAnnouncementPopupReturn {
  const { user } = useAuth()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isMarking, setIsMarking] = useState<boolean>(false)

  // Track checked user to prevent repeated duplicate checks while logged in
  const lastCheckedUserId = useRef<string | null>(null)

  const loadUnread = useCallback(
    async (force = false) => {
      if (!user?.id) {
        setAnnouncements([])
        setIsOpen(false)
        lastCheckedUserId.current = null
        return
      }

      if (!force && lastCheckedUserId.current === user.id) {
        return
      }

      setIsLoading(true)
      try {
        const unread = await announcementService.getUnreadForMember(user.id)
        setAnnouncements(unread)
        setCurrentIndex(0)
        if (unread.length > 0) {
          setIsOpen(true)
        } else {
          setIsOpen(false)
        }
        lastCheckedUserId.current = user.id
      } catch (err) {
        console.error('Erro no useAnnouncementPopup ao carregar comunicados:', err)
      } finally {
        setIsLoading(false)
      }
    },
    [user?.id],
  )

  useEffect(() => {
    loadUnread()
  }, [loadUnread])

  const totalCount = announcements.length
  const currentAnnouncement =
    totalCount > 0 ? announcements[currentIndex] || announcements[0] : null

  const next = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1 < totalCount ? prev + 1 : prev))
  }, [totalCount])

  const prev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : 0))
  }, [])

  const goTo = useCallback(
    (index: number) => {
      if (index >= 0 && index < totalCount) {
        setCurrentIndex(index)
      }
    },
    [totalCount],
  )

  /**
   * Marca o comunicado atual como visualizado no PocketBase.
   * Remove da lista de pendentes. Se houver mais comunicados na fila, continua exibindo o próximo.
   * Se for o último, fecha o modal.
   */
  const markCurrentAsUnderstood = useCallback(async () => {
    if (!user?.id || !currentAnnouncement) {
      setIsOpen(false)
      return
    }

    setIsMarking(true)
    const targetId = currentAnnouncement.id
    try {
      await announcementService.markAsViewed(targetId, user.id)

      setAnnouncements((prevList) => {
        const nextList = prevList.filter((a) => a.id !== targetId)
        if (nextList.length === 0) {
          setIsOpen(false)
          setCurrentIndex(0)
        } else {
          // Ajusta currentIndex para que continue válido
          setCurrentIndex((prevIdx) => (prevIdx >= nextList.length ? nextList.length - 1 : prevIdx))
        }
        return nextList
      })
    } catch (err) {
      console.error('Erro ao marcar comunicado como entendido:', err)
    } finally {
      setIsMarking(false)
    }
  }, [user?.id, currentAnnouncement])

  /**
   * Marca todos os comunicados pendentes na lista atual como lidos de uma vez.
   */
  const markAllAsUnderstood = useCallback(async () => {
    if (!user?.id || announcements.length === 0) {
      setIsOpen(false)
      return
    }

    setIsMarking(true)
    const idsToMark = announcements.map((a) => a.id)
    try {
      await announcementService.markManyAsViewed(idsToMark, user.id)
      setAnnouncements([])
      setIsOpen(false)
      setCurrentIndex(0)
    } catch (err) {
      console.error('Erro ao marcar todos os comunicados como lidos:', err)
    } finally {
      setIsMarking(false)
    }
  }, [user?.id, announcements])

  const closeModal = useCallback(() => {
    // Ao fechar pelo botão X ou overlay, marca o comunicado atual como lido
    markCurrentAsUnderstood()
  }, [markCurrentAsUnderstood])

  const refresh = useCallback(async () => {
    await loadUnread(true)
  }, [loadUnread])

  return {
    announcements,
    currentAnnouncement,
    currentIndex,
    totalCount,
    isOpen,
    isLoading,
    isMarking,
    next,
    prev,
    goTo,
    markCurrentAsUnderstood,
    markAllAsUnderstood,
    closeModal,
    refresh,
  }
}
