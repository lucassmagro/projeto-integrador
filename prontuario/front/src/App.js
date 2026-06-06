import Menu from './componentes/Menu';
import PaginaInicial from './componentes/PaginaInicial';
import PaginaRegistroCadastro from './componentes/PaginaRegistroCadastro';
import PaginaRetificacaoForm from './componentes/PaginaRetificacaoForm';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Menu />
        <Routes>
          <Route path='/' element={<PaginaInicial />} />
          <Route path='/registro' element={<PaginaRegistroCadastro />} />
          <Route path='/retificacao/:registro_id' element={<PaginaRetificacaoForm />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
