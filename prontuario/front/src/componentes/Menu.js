function Menu() {
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
            <div className="container">
                <a className="navbar-brand fw-bold" href="/">
                    <i className="bi bi-journal-medical me-2"></i>
                    G5 - Prontuário
                </a>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menu">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="menu">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <a className="nav-link" href="/">
                                <i className="bi bi-search me-1"></i>
                                Buscar Paciente
                            </a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="/registro">
                                <i className="bi bi-plus-circle me-1"></i>
                                Novo Registro
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Menu;
