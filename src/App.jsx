import { Routes, Route } from 'react-router-dom'

import Home from './pages/Home/Home'
import Movies from './pages/Movies/Movies'
import Series from './pages/Series/Series'
import Auth from './pages/Auth/Auth'
import Profile from './pages/Profile/Profile'
import MovieDetails from './pages/MovieDetails/MovieDetails'
import Watchlist from './pages/Watchlist/Watchlist'
import TvDetails from './pages/TvDetails/TvDetails'

import Header from './components/Header/Header'
import AuthProvider from './context/AuthProvider'

import './App.css'

function App() {
  return (
    <AuthProvider>
      <div className='container'>
        <Header />

        <div className='pageContainer'>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/movies' element={<Movies />} />
            <Route path='/movies/:id' element={<MovieDetails />} />
            <Route path='/series' element={<Series />} />
            <Route path="/series/:id" element={<TvDetails />} />
            <Route path='/auth' element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/watchlist" element={<Watchlist />} />
          </Routes>
        </div>
      </div>
    </AuthProvider>
  )
}

export default App