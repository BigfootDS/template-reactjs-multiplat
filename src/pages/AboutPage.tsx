import { useTranslation } from 'react-i18next'

function AboutPage() {
  const { t } = useTranslation()

  return (
    <div className="page">
      <div className="page-heading">
        <h1>{t('about_heading')}</h1>
        <p>{t('about_intro')}</p>
      </div>
      <section className="page-section">
        <h2>{t('about_included')}</h2>
        <p>{t('about_included_description')}</p>
      </section>
      <section className="page-section">
        <h2>{t('about_change_first')}</h2>
        <p>{t('about_change_first_description')}</p>
      </section>
    </div>
  )
}

export default AboutPage
