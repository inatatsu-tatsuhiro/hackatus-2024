import { FC, Suspense, lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

const HomePage = lazy(() => import('../pages/Home'))
const AuditPage = lazy(() => import('../pages/Audit'))

export const Router: FC = () => {
  return (
    <Suspense>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/audit/:addr" element={<AuditPage />} />
        </Routes>
      </BrowserRouter>
    </Suspense>
  )
}
