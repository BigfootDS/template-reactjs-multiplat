import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'

function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <div className="page">
      <div className="page-heading">
        <h1>{t('not_found_heading')}</h1>
        <p>{t('not_found_intro')}</p>
      </div>
      <div className="page-actions">
        <Link className="button-link" to="/">{t('not_found_return_home')}</Link>
      </div>
    </div>
  )
}

export default NotFoundPage
