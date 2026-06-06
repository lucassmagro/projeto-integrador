classDiagram
direction TB

    %% ===================== ENUMERAÇÕES =====================
    class Role {
        <<enumeration>>
        MEDICO
        ENFERMEIRO
        AUDITOR
    }

    class StatusConsulta {
        <<enumeration>>
        AGENDADA
        REALIZADA
        CANCELADA
    }

    class TipoRegistro {
        <<enumeration>>
        EVOLUCAO_MEDICA
        EVOLUCAO_ENFERMAGEM
        ANAMNESE
        OBSERVACAO_ENFERMAGEM
    }

    class StatusRegistro {
        <<enumeration>>
        ATIVO
        RETIFICADO
    }

    %% ===================== AGREGADO PRONTUÁRIO (RAIZ) =====================
    class Prontuario {
        <<Entity>>
        -UUID id
        -UUID pacienteId
        -LocalDateTime dataCriacao
        +adicionarRegistro(registro: RegistroClinico) RegistroClinico
        +gerarResumoClinico() ResumoClinico
    }

    class HistoricoClinico {
        <<Entity>>
        -UUID id
        +listarRegistros(pagina: int, tamanho: int) List~RegistroClinico~
        +buscarPorPeriodo(inicio: LocalDate, fim: LocalDate) List~RegistroClinico~
    }

    class RegistroClinico {
        <<Entity>>
        -UUID id
        -UUID consultaId
        -UUID profissionalId
        -LocalDateTime dataRegistro
        -TipoRegistro tipo
        -StatusRegistro status
        +registrar() void
        +validarIntegridade() boolean
    }

    %% ===== Conteúdo clínico (ciclo de vida preso ao RegistroClinico) =====
    class Diagnostico {
        <<Entity>>
        -UUID id
        -String codigoCID
        -String descricao
    }

    class Sintoma {
        <<Entity>>
        -UUID id
        -String descricao
        -int intensidade
    }

    class ObservacaoClinica {
        <<Entity>>
        -UUID id
        -String descricao
    }

    %% ===== Mecanismos de imutabilidade / correção =====
    class Retificacao {
        <<Entity>>
        -UUID id
        -String motivo
        -LocalDateTime dataCriacao
        -UUID registroOriginalId
    }

    class AdendoClinico {
        <<Entity>>
        -UUID id
        -String descricao
        -LocalDateTime dataCriacao
    }

    %% ===== Read model fornecido aos demais módulos =====
    class ResumoClinico {
        <<Entity>>
        -UUID pacienteId
        -List~String~ alergias
        -List~Diagnostico~ diagnosticosAtivos
        -LocalDateTime ultimaAtualizacao
    }

    %% ===== Auditoria / LGPD =====
    class LogAuditoria {
        <<Entity>>
        -UUID id
        -UUID usuarioId
        -UUID pacienteId
        -String ipOrigem
        -LocalDateTime dataHora
        -String acaoExecutada
        +registrarAcesso() void
    }

    class UsuarioProfissional {
        <<Entity>>
        -UUID id
        -String nome
        -Role role
    }

    %% ===================== SISTEMAS EXTERNOS =====================
    class Consulta {
        <<External System>>
        -UUID id
        -UUID pacienteId
        -StatusConsulta status
        -LocalDateTime dataHora
    }

    class ReceitaMedica {
        <<External System>>
    }

    class SolicitacaoExame {
        <<External System>>
    }

    class AtendimentoTelemedicina {
        <<External System>>
    }

    %% ===================== SERVIÇOS DE APLICAÇÃO =====================
    class ProntuarioService {
        <<Service>>
        +validarConsulta(consultaId: UUID) boolean
        +criarRegistroClinico(prontuarioId: UUID, registro: RegistroClinico) RegistroClinico
        +criarRetificacao(registroOriginalId: UUID, motivo: String) Retificacao
        +criarAdendo(registroId: UUID, descricao: String) AdendoClinico
        +consultarHistorico(pacienteId: UUID, pagina: int) HistoricoClinico
        +gerarResumoClinico(pacienteId: UUID) ResumoClinico
    }

    class AuditoriaService {
        <<Service>>
        +registrarLeitura(usuarioId: UUID, pacienteId: UUID, ip: String) LogAuditoria
        +registrarOperacao(usuarioId: UUID, acao: String) LogAuditoria
    }

    class IntegracaoConsultaService {
        <<Service>>
        +validarConsulta(consultaId: UUID) boolean
        +obterConsulta(consultaId: UUID) Consulta
    }

    %% ===================== COMPOSIÇÕES (ciclo de vida) =====================
    Prontuario "1" *-- "1" HistoricoClinico : compõe
    Prontuario "1" *-- "1..*" RegistroClinico : possui
    RegistroClinico "1" *-- "1..*" Diagnostico : contém
    RegistroClinico "1" *-- "0..*" Sintoma : contém
    RegistroClinico "1" *-- "0..*" ObservacaoClinica : contém
    RegistroClinico "1" *-- "0..*" AdendoClinico : complementado por
    RegistroClinico "1" *-- "0..*" Retificacao : corrigido por

    %% ===================== AGREGAÇÕES / ASSOCIAÇÕES =====================
    HistoricoClinico "1" o-- "0..*" RegistroClinico : organiza
    Prontuario "1" --> "1" ResumoClinico : gera
    UsuarioProfissional "1" --> "0..*" RegistroClinico : registra
    Consulta "1" --> "0..*" RegistroClinico : origina
    LogAuditoria --> UsuarioProfissional : referencia
    LogAuditoria --> Prontuario : referencia

    %% ===================== DEPENDÊNCIAS (integrações / orquestração) =====================
    ProntuarioService ..> Prontuario : orquestra
    ProntuarioService ..> RegistroClinico : cria
    ProntuarioService ..> Retificacao : cria
    ProntuarioService ..> AdendoClinico : cria
    ProntuarioService ..> Consulta : valida
    ProntuarioService ..> IntegracaoConsultaService : usa
    ProntuarioService ..> AuditoriaService : aciona
    IntegracaoConsultaService ..> Consulta : consome G4
    AuditoriaService ..> LogAuditoria : persiste
    ResumoClinico ..> ReceitaMedica : fornece a G6
    ResumoClinico ..> SolicitacaoExame : fornece a G7
    ResumoClinico ..> AtendimentoTelemedicina : fornece a G12

    %% ===================== REGRAS DE NEGÓCIO / RNF =====================
    note for RegistroClinico "RF02: imutável — sem exclusão física nem sobrescrita.<br>Correções apenas via Retificacao; complementos via AdendoClinico."
    note for AdendoClinico "RF05: complementa o registro original sem alterar seu conteúdo."
    note for Retificacao "RF02: correção legal; aponta para registroOriginalId e nunca o sobrescreve."
    note for RegistroClinico "RNF02: só pode ser criado por UsuarioProfissional com Role MEDICO ou ENFERMEIRO (JWT válido)."
    note for AuditoriaService "RNF05/LGPD: toda leitura e operação gera LogAuditoria persistente."
