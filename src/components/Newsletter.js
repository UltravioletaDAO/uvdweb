import React from 'react';
import { useTranslation } from 'react-i18next';
import { useState } from "react"

function Newsletter() {
  const [email, setEmail] = useState("")
  const { t } = useTranslation();

  const handleSubmit = (e) => {
    e.preventDefault()
    // Lógica para enviar los datos del servicio de newsletter (para enviar emails automaticamente cuando haya un nuevo post)
    setEmail("")
  }

  return (
    <div className="bg-gradient-to-r from-violet-900/30 to-purple-900/30 rounded-xl p-4 md:p-8 border border-violet-800/50 flex flex-col md:flex-row justify-center md:justify-self-auto gap-4 md:gap-14 items-center max-w-5xl mx-auto">
      <div className="text-center md:text-left">
        <h2 className="text-xl md:text-2xl font-bold text-text-primary mb-2">{t('newsletter.title')}</h2>
        <p className="text-text-secondary mb-6">{t('newsletter.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 flex-1">
        <div className="flex flex-col md:flex-row flex-1">
          <input
            type="email"
            placeholder={t('newsletter.email_placeholder')}
            className="w-full md:w-3/4 px-4 py-2 rounded-l-md bg-zinc-800 border border-zinc-700 text-text-primary focus:outline-none focus:ring-2 focus:ring-ultraviolet-darker"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-ultraviolet-darker hover:bg-ultraviolet-dark text-white px-4 py-2 rounded-r-md font-medium transition-colors mt-2 md:mt-0"
          >
            {t('newsletter.subscribe')}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Newsletter
