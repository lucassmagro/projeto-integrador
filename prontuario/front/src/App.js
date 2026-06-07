import Menu from "./componentes/Menu";
import Footer from "./componentes/Footer";
import LandingPage from "./componentes/LandingPage";
import PaginaInicial from "./componentes/PaginaInicial";
import PaginaRegistroCadastro from "./componentes/PaginaRegistroCadastro";
import PaginaRetificacaoForm from "./componentes/PaginaRetificacaoForm";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <BrowserRouter>
      <div className="app-wrapper">
        <Menu />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/busca" element={<PaginaInicial />} />
            <Route path="/registro" element={<PaginaRegistroCadastro />} />
            <Route
              path="/retificacao/:registro_id"
              element={<PaginaRetificacaoForm />}
            />
          </Routes>
        </main>
        <Footer />
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick={true}
        pauseOnHover={true}
        theme="light"
      />
    </BrowserRouter>
  );
}

export default App;
