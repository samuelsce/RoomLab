import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router'

export function SectionLink({
  targetId,
  className,
  children,
}: {
  targetId: string
  className?: string
  children: ReactNode
}) {
  const location = useLocation()
  return (
    <Link
      className={className}
      to={{
        pathname: location.pathname,
        search: location.search,
        // Shared URLs in browser mode store their document in this fragment.
        hash: location.hash.startsWith('#data=')
          ? location.hash
          : `#${targetId}`,
      }}
      onClick={(event) => {
        if (
          event.button !== 0 ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey ||
          event.altKey
        )
          return
        const target = document.getElementById(targetId)
        if (!target) return
        // Same-page navigation must not replace a route or a shared document.
        event.preventDefault()
        target.scrollIntoView({ block: 'start' })
        target.focus({ preventScroll: true })
      }}
    >
      {children}
    </Link>
  )
}
