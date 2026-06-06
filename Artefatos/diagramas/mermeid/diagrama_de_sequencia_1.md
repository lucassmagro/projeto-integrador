sequenceDiagram
autonumber
actor Medico
participant Frontend
participant API_G5 as G5 - Prontuário
participant API_G4 as G4 - Consultas
participant DB as Banco G5

    Medico->>Frontend: Preenche diagnóstico, sintomas e observações
    Frontend->>API_G5: POST /api/v1/consultas/{consulta_id}/prontuarios

    API_G5->>API_G4: GET /api/v1/consultas/{consulta_id}

    alt Consulta inexistente, cancelada ou de outro paciente
        API_G4-->>API_G5: 404 / status inválido
        API_G5-->>Frontend: 422 Unprocessable Entity
    else Consulta válida (status = REALIZADA)
        API_G4-->>API_G5: 200 OK { consultaId, pacienteId, status }
        API_G5->>DB: INSERT RegistroClinico (imutável)
        DB-->>API_G5: registroId
        API_G5->>DB: INSERT LogAuditoria (LGPD — RNF05)
        API_G5-->>Frontend: 201 Created { registroId }
        Frontend-->>Medico: Registro clínico salvo com sucesso
    end
