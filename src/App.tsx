import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { AddFoodProvider } from './context/AddFoodContext'
import AddAnalyzePage from './pages/AddAnalyzePage'
import AddCapturePage from './pages/AddCapturePage'
import AddPreviewPage from './pages/AddPreviewPage'
import FoodDetailPage from './pages/FoodDetailPage'
import HomePage from './pages/HomePage'

export default function App() {
  return (
    <BrowserRouter basename="/foodlog">
      <AddFoodProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="add" element={<AddCapturePage />} />
            <Route path="add/preview" element={<AddPreviewPage />} />
            <Route path="add/analyze" element={<AddAnalyzePage />} />
            <Route path="food/:id" element={<FoodDetailPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AddFoodProvider>
    </BrowserRouter>
  )
}
