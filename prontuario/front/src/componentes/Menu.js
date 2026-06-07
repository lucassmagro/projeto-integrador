import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const NAV = [
  { to: "/", label: "Início", icon: "bi-house-door", match: (p) => p === "/" },
  {
    to: "/busca",
    label: "Buscar Paciente",
    icon: "bi-search",
    match: (p) => p === "/busca",
  },
  {
    to: "/registro",
    label: "Novo Registro",
    icon: "bi-file-earmark-plus",
    match: (p) => p.startsWith("/registro"),
  },
  {
    to: "/retificacao",
    label: "Retificação",
    icon: "bi-pencil",
    match: (p) => p.startsWith("/retificacao"),
    hideTab: true,
  },
];

function crumbsFor(pathname) {
  if (pathname === "/") return [{ label: "Início" }];
  if (pathname === "/busca")
    return [
      { to: "/", label: "Início" },
      { label: "Consulta de Histórico Clínico" },
    ];
  if (pathname.startsWith("/registro"))
    return [
      { to: "/", label: "Início" },
      { to: "/busca", label: "Histórico Clínico" },
      { label: "Novo Registro Clínico" },
    ];
  if (pathname.startsWith("/retificacao"))
    return [
      { to: "/", label: "Início" },
      { to: "/busca", label: "Histórico Clínico" },
      { label: "Retificação de Registro" },
    ];
  return [{ to: "/", label: "Início" }];
}

function Menu() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const crumbs = crumbsFor(location.pathname);

  return (
    <>
      <div className="topbar">
        <div className="shell-width topbar-inner">
          <span className="topbar-sys">Sistema de Saúde Integrado</span>
          <span className="topbar-meta">
            <span>Projeto Integrador · Sistemas de Informação</span>
            <span className="env">AMBIENTE ACADÊMICO</span>
          </span>
        </div>
      </div>

      <nav className="appbar">
        <div className="shell-width appbar-inner">
          <Link to="/" className="brand" onClick={() => setOpen(false)}>
            <span className="brand-mark">
              <i className="bi bi-clipboard2-pulse"></i>
            </span>
            <span className="brand-text">
              <span className="brand-name">Prontuário Eletrônico</span>
            </span>
          </Link>

          <div className={`tabs${open ? " is-open" : ""}`}>
            {NAV.filter((n) => !n.hideTab).map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={`tab${n.match(location.pathname) ? " is-active" : ""}`}
                onClick={() => setOpen(false)}
              >
                <i className={`bi ${n.icon}`}></i>
                {n.label}
              </Link>
            ))}
          </div>

          <button
            className="hamburger"
            aria-label="Menu"
            onClick={() => setOpen(!open)}
          >
            <i className={`bi ${open ? "bi-x-lg" : "bi-list"}`}></i>
          </button>
        </div>
      </nav>

      <div className="crumbbar">
        <div className="shell-width crumbbar-inner">
          {crumbs.map((c, i) => (
            <span
              key={i}
              style={{ display: "inline-flex", gap: 8, alignItems: "center" }}
            >
              {i > 0 && <span className="sep">/</span>}
              {c.to ? (
                <Link to={c.to}>{c.label}</Link>
              ) : (
                <span className="here">{c.label}</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

export default Menu;
