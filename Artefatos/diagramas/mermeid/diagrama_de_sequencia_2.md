sequenceDiagram
autonumber
participant API_G6_Receitas as API G6 Receitas
participant API_G7_Exames as API G7 Exames
participant API_G12_Telemedicina as API G12 Telemedicina
participant API_G5_Prontuario as API G5 Prontuario
participant AuthService
participant BancoG5 as BancoG5 (DB)
participant AuditoriaService

    Note over API_G6_Receitas,API_G12_Telemedicina: Sistemas internos consumidores do ResumoClinico (G5)
    Note over API_G6_Receitas,API_G5_Prontuario: RNF04 - Interoperabilidade: REST JSON OpenAPI 3.0

    API_G6_Receitas->>API_G5_Prontuario: GET /api/v1/internos/pacientes/{paciente_id}/resumo
    Note over API_G6_Receitas,API_G5_Prontuario: G7 e G12 consomem o mesmo endpoint de forma análoga

    Note over API_G5_Prontuario,AuthService: RNF02 - Segurança: autenticação service-to-service

    API_G5_Prontuario->>AuthService: validarTokenServico(JWT)
    AuthService-->>API_G5_Prontuario: claims {usuarioSistema}

    alt Token inválido
        API_G5_Prontuario-->>API_G6_Receitas: HTTP 401 Unauthorized
        Note right of API_G5_Prontuario: Encerra o fluxo
    else Token válido

        API_G5_Prontuario->>BancoG5: buscarProntuario(paciente_id)
        BancoG5-->>API_G5_Prontuario: prontuario | null

        alt Paciente / prontuário inexistente
            API_G5_Prontuario-->>API_G6_Receitas: HTTP 404 Not Found
            Note right of API_G5_Prontuario: Encerra o fluxo
        else Prontuário encontrado

            API_G5_Prontuario->>BancoG5: recuperarDiagnosticosAtivos(paciente_id)
            BancoG5-->>API_G5_Prontuario: diagnosticosAtivos
            API_G5_Prontuario->>BancoG5: recuperarAlergias(paciente_id)
            BancoG5-->>API_G5_Prontuario: alergias
            API_G5_Prontuario->>BancoG5: recuperarHistoricoRelevante(paciente_id)
            BancoG5-->>API_G5_Prontuario: historicoRelevante
            API_G5_Prontuario->>BancoG5: recuperarUltimasObservacoes(paciente_id)
            BancoG5-->>API_G5_Prontuario: ultimasObservacoes

            API_G5_Prontuario->>API_G5_Prontuario: montarResumoClinico()

            Note over API_G5_Prontuario,AuditoriaService: RNF05 - LGPD: toda leitura gera auditoria persistente

            API_G5_Prontuario->>AuditoriaService: registrarLeitura(usuarioSistema, pacienteId, timestamp, IP)
            AuditoriaService->>BancoG5: persistir(LogAuditoria)
            BancoG5-->>AuditoriaService: confirmação
            AuditoriaService-->>API_G5_Prontuario: log registrado

            API_G5_Prontuario-->>API_G6_Receitas: HTTP 200 OK {ResumoClinico em JSON}

            opt Uso do resumo pelo sistema consumidor
                API_G6_Receitas->>API_G6_Receitas: emitir receita (G6)
                API_G7_Exames->>API_G7_Exames: solicitar exame (G7)
                API_G12_Telemedicina->>API_G12_Telemedicina: consulta remota (G12)
            end
        end
    end
