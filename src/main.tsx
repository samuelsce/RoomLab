import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  createHashRouter,
  RouterProvider,
} from 'react-router'
import { App } from './App'
import '@fontsource/barlow/latin-400.css'
import '@fontsource/barlow/latin-500.css'
import '@fontsource/barlow/latin-600.css'
import '@fontsource/barlow-semi-condensed/latin-600.css'
import './styles.css'

const routes = [{ path: '*', element: <App /> }]
const router =
  import.meta.env.VITE_ROUTER_MODE === 'hash'
    ? createHashRouter(routes)
    : createBrowserRouter(routes, {
        basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/',
      })

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
