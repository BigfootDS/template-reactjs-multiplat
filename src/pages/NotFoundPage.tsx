import { Link } from 'react-router'

function NotFoundPage() {
  return (
    <div className="page">
      <div className="page-heading">
        <h1>Page not found</h1>
        <p>The address does not match a route in this application.</p>
      </div>
      <div className="page-actions">
        <Link className="button-link" to="/">Return home</Link>
      </div>
    </div>
  )
}

export default NotFoundPage
