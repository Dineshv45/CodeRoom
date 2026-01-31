import { useState } from 'react'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Home from "./pages/Home"
import EditorPage from './pages/EditorPage'
import { Toaster } from 'react-hot-toast'

function App() {
  const [count, setCount] = useState(0)

  return (
   <>
      <div>
        <Toaster
          position = "top-right"
          toastOptions = {{
            success:{
              theme:{
                primary: '#4aed88'
              }
            }
          }}

        >  
        </Toaster>
      </div>
      <BrowserRouter>
        <Routes>

          <Route path='/' element= {<Home />} />

          <Route path='/editor/:roomId' element = {<EditorPage />} />
        </Routes>
      </BrowserRouter>
   </>
  )
}

export default App
