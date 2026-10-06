import { Link } from 'react-router'

export function Brand() {
  return (
    <Link to="/" className="brand" aria-label="RoomLab, página inicial">
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path
          d="M5 27V5h22v22M5 20h22M12 27v-7"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      </svg>
      <span>
        RoomLab<span className="brand-dot">.</span>
      </span>
    </Link>
  )
}
