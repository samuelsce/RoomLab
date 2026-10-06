import { Link, Route, Routes } from 'react-router'

export function App() {
  return <Routes><Route path="*" element={<main id="main-content"><h1>RoomLab</h1><p>Monte um quarto que combina com seu setup.</p><Link to="/editor">Montar meu setup</Link></main>} /></Routes>
}
