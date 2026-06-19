import { Link, Outlet, useLocation } from 'react-router-dom'

export default function Layout() {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <div className="mx-auto flex min-h-svh max-w-lg flex-col bg-neutral-50">
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between">
          {isHome ? (
            <h1 className="text-lg font-bold text-emerald-700">FoodLog</h1>
          ) : (
            <Link to="/" className="text-sm font-medium text-emerald-700">
              ← Danh sách
            </Link>
          )}
          <span className="text-xs text-neutral-400">Thực phẩm sơ chế</span>
        </div>
      </header>

      <main className="flex-1 pb-safe">
        <Outlet />
      </main>
    </div>
  )
}
