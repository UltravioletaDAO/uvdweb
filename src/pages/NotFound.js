import { Link } from "react-router-dom"
import { useTranslation } from 'react-i18next'

function NotFound() {
  const { t } = useTranslation();
  return (
    <main className="h-screen w-full flex flex-col justify-center items-center bg-background">
    <h1 className="text-9xl font-extrabold text-text-primary tracking-widest">404</h1>
    <div className="bg-ultraviolet-darker px-2 text-md rounded rotate-12 absolute">
      {t('not_found.title', { defaultValue: 'Página no encontrada' })}
    </div>
    <Link
        to="/"
        className="bg-ultraviolet-darker hover:bg-ultraviolet-dark text-text-primary font-semibold py-2 px-6 mt-5 rounded-lg transition-colors"
      >
        {t('success.back_home')}
      </Link>
  </main>
  )
}

export default NotFound
