import zzz_svg from './zzz.svg'

function LoadingScreen() {
  const gameLogo = (
    <div className="flex flex-col items-center text-black">
      <img className="w-32 h-32 -mb-3 animate-breathe" src={zzz_svg} />
      <div className="text-4xl font-bold">Zz Indie</div>
    </div>
  )

  const loadingText = <div>Loading...</div>

  const ui = (
    <div className="absolute w-full h-full">
      <div className="absolute flex flex-col items-center justify-center w-full h-full gap-4 p-4 pointer-events-none">
        {gameLogo}
        {loadingText}
      </div>
    </div>
  )

  const bgColor = <div className="absolute w-full h-full bg-gradient-to-b to-[#36D6ED] from-[#C8F6FF]" />

  const bgTexture = (
    <div
      className="absolute top-0 left-0 w-full h-full opacity-20 mix-blend-multiply"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M0 38.59l2.83-2.83 1.41 1.41L1.41 40H0v-1.41zM0 1.4l2.83 2.83 1.41-1.41L1.41 0H0v1.41zM38.59 40l-2.83-2.83 1.41-1.41L40 38.59V40h-1.41zM40 1.41l-2.83 2.83-1.41-1.41L38.59 0H40v1.41zM20 18.6l2.83-2.83 1.41 1.41L21.41 20l2.83 2.83-1.41 1.41L20 21.41l-2.83 2.83-1.41-1.41L18.59 20l-2.83-2.83 1.41-1.41L20 18.59z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}
    />
  )

  return (
    <div className="animate-pulse">
      {bgColor}
      {bgTexture}
      {ui}
    </div>
  )
}

export default LoadingScreen
