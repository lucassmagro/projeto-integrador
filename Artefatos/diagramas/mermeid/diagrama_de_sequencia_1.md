sequenceDiagram
autonumber
actor Medico
participant Frontend
participant API_G5_Prontuario as API G5 Prontuario
participant AuthService
participant API_G4_Consultas as API G4 Consultas
participant BancoG5 as BancoG5 (DB)
participant AuditoriaService

    Note over Frontend,API_G5_Prontuario: RNF04 - Interoperabilidade: REST JSON OpenAPI 3.0

    Medico->>Frontend: Preencher diagnósticos, sintomas e observações
    Frontend->>API_G5_Prontuario: POST /api/v1/consultas/{consulta_id}/prontuarios

    Note over API_G5_Prontuario,AuthService: RNF02 - Segurança: JWT obrigatório

    API_G5_Prontuario->>AuthService: validarToken(JWT)
    AuthService-->>API_G5_Prontuario: claims {usuarioId, role}

    alt Token inválido ou expirado
        API_G5_Prontuario-->>Frontend: HTTP 401 Unauthorized
    else Token válido
        alt Role não autorizada (≠ MEDICO e ≠ ENFERMEIRO)
            API_G5_Prontuario-->>Frontend: HTTP 403 Forbidden
        else Role autorizada (MEDICO ou ENFERMEIRO)

            Note over API_G5_Prontuario,API_G4_Consultas: Integração G5 → G4: nenhum registro sem consulta válida

            API_G5_Prontuario->>API_G4_Consultas: GET /api/v1/consultas/{consulta_id}
            API_G4_Consultas-->>API_G5_Prontuario: 200 OK {idConsulta, pacienteId, statusConsulta}

            alt Consulta inexistente, cancelada ou inconsistente
                API_G5_Prontuario-->>Frontend: HTTP 422 Unprocessable Entity
                Note right of API_G5_Prontuario: Encerra o fluxo - RF01: vínculo obrigatório
            else Consulta válida (status = REALIZADA)

                API_G5_Prontuario->>API_G5_Prontuario: criarRegistroClinico()
                API_G5_Prontuario->>API_G5_Prontuario: criarDiagnosticos()

                opt Sintomas informados
                    API_G5_Prontuario->>API_G5_Prontuario: criarSintomas()
                end
                opt Observações informadas
                    API_G5_Prontuario->>API_G5_Prontuario: criarObservacoesClinicas()
                end

                API_G5_Prontuario->>API_G5_Prontuario: gerarTimestamp()

                API_G5_Prontuario->>BancoG5: persistir(RegistroClinico) [imutável]
                BancoG5-->>API_G5_Prontuario: confirmação {registroId}

                Note over API_G5_Prontuario,AuditoriaService: RNF05 - LGPD: operação auditada

                API_G5_Prontuario->>AuditoriaService: registrarOperacao(usuarioId, pacienteId, IP, "CRIAR_REGISTRO")
                AuditoriaService->>BancoG5: persistir(LogAuditoria)
                BancoG5-->>AuditoriaService: confirmação
                AuditoriaService-->>API_G5_Prontuario: log registrado

                API_G5_Prontuario-->>Frontend: HTTP 201 Created {registroId}
                Frontend-->>Medico: Registro clínico criado com sucesso
            end
        end
    end
