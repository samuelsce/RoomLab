import { useEffect } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router'
import { Home } from './pages/Home'
import { Editor } from './pages/Editor'
import { Setups } from './pages/Setups'
import { SharedSetup } from './pages/SharedSetup'
import { SectionLink } from './components/SectionLink'

export function App() {
  const location = useLocation()
  useEffect(() => {
    document.title =
      location.pathname === '/editor'
        ? 'Editor | RoomLab'
        : location.pathname === '/setups'
          ? 'Meus setups | RoomLab'
          : location.pathname === '/setup'
            ? 'Quarto compartilhado | RoomLab'
            : 'RoomLab | monte seu setup'
    if (location.hash) {
      const target = document.getElementById(location.hash.slice(1))
      target?.scrollIntoView({ block: 'start' })
      target?.focus({ preventScroll: true })
    } else window.scrollTo(0, 0)
  }, [location.pathname, location.search, location.hash])
  return (
    <>
      <SectionLink className="skip-link" targetId="main-content">
        Pular para o conteúdo
      </SectionLink>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="/setups" element={<Setups />} />
        <Route path="/setup" element={<SharedSetup />} />
        <Route
          path="*"
          element={
            <main id="main-content" className="not-found" tabIndex={-1}>
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
