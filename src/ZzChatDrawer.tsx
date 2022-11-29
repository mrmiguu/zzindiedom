import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import sounds from './sounds'

type FormData = {
  msg: string
}

type ChatDrawerProps = {
  onSubmit: (data: FormData) => void
  onEsc: () => void
}

function ChatDrawer({ onSubmit, onEsc }: ChatDrawerProps) {
  const { register, handleSubmit, reset } = useForm<FormData>()

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onEsc()
    }
    addEventListener('keydown', onKeyDown)
    return () => removeEventListener('keydown', onKeyDown)
  }, [onEsc])

  return (
    <div className="w-full h-[4.5rem] px-4 py-3 bg-white shadow-inner rounded-t-3xl">
      <form
        className="flex w-full gap-1 p-1 bg-gray-200 pointer-events-auto rounded-3xl"
        onSubmit={handleSubmit((data: FormData) => {
          onSubmit(data)
          reset()
        })}
      >
        <input
          {...register('msg', { required: true })}
          className="w-full px-2 py-1 bg-transparent rounded-full grow focus:outline-none focus:ring-0"
          placeholder="Send message..."
          autoComplete="off"
          autoFocus
        />

        <button
          className="p-2 grayscale brightness-[99] leading-none rounded-full border-2 border-white hover:opacity-90 active:animate-ping"
          type="submit"
          onMouseDown={e => sounds.button.then(s => s.play())}
        >
          Send
        </button>
      </form>
    </div>
  )
}

export default ChatDrawer
