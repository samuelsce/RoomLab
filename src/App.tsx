import { useEffect } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router'
import { Home } from './pages/Home'
import { Editor } from './pages/Editor'

export function App() {
  const location = useLocation()
  useEffect(() => {
    document.title =
      location.pathname === '/editor'
        ? 'Editor — RoomLab'
        : 'RoomLab — monte seu setup'
    if (!location.hash) window.scrollTo(0, 0)
  }, [location.pathname, location.search, location.hash])
  return (
    <>
      <a className="skip-link" href="#main-content">
        Pular para o conteúdo
      </a>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/editor" element={<Editor />} />
        <Route
          path="*"
          element={
            <main id="main-content" className="not-found">
              <h1>Esse quarto não foi encontrado.</h1>
              <p>Volte ao início para explorar os exemplos do RoomLab.</p>
              <Link className="button button-primary" to="/">
                Voltar ao início
              </Link>
            </main>
          }
        />
      </Routes>
    </>
  )
}
