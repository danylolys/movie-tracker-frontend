import { Routes, Route } from 'react-router-dom'

import Home from './pages/Home/Home'
import Movies from './pages/Movies/Movies'

import Header from './components/Header/Header'

import './App.css'

function App() {

  return (
    <>
      <div className='container'>
        <Header />
        <div className='pageContainer'>
          <Routes>
            <Route
              path='/'
              element={<Home />}
            />
            <Route
              path='/movies'
              element={<Movies />}
            />
          </Routes>
        </div>
      </div>
    </>
  )
}

export default App
