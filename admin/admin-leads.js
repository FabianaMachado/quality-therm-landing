/* =========================================================
   QUALITY THERM - CRM DE LEADS
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
  const supabase = window.supabaseClient;

  const loading = document.getElementById("leadsLoading");
  const empty = document.getElementById("leadsEmpty");
  const tableContainer = document.getElementById("leadsTableContainer");
  const tableBody = document.getElementById("leadsTableBody");

  const totalLeads = document.getElementById("totalLeads");
  const newLeads = document.getElementById("newLeads");
  const serviceLeads = document.getElementById("serviceLeads");
  const convertedLeads = document.getElementById("convertedLeads");

  /* =======================================================
     ESTADO INICIAL
  ======================================================= */

  if (loading) loading.hidden = false;
  if (empty) empty.hidden = true;
  if (tableContainer) tableContainer.hidden = true;

  /* =======================================================
     VERIFICA SUPABASE
  ======================================================= */

  if (!supabase) {
    console.error("Supabase não foi inicializado.");

    if (loading) {
      loading.innerHTML = `
        <strong>Não foi possível carregar os leads.</strong>
        <span>Supabase não inicializado.</span>
      `;
    }

    return;
  }

  try {
    /* =====================================================
       VERIFICA USUÁRIO LOGADO
    ===================================================== */

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      throw userError;
    }

    if (!user) {
      window.location.href = "login.html";
      return;
    }

    /* =====================================================
       BUSCA LEADS

       A separação por empresa é protegida pelo RLS
       configurado no Supabase.
    ===================================================== */

    const { data: leads, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      throw error;
    }

    /* =====================================================
       REMOVE CARREGAMENTO
    ===================================================== */

    if (loading) {
      loading.hidden = true;
    }

    /* =====================================================
       CARDS
    ===================================================== */

    const leadList = Array.isArray(leads) ? leads : [];

    const total = leadList.length;

    const novos = leadList.filter((lead) => lead.status === "novo").length;

    const emAtendimento = leadList.filter(
      (lead) => lead.status === "em_atendimento",
    ).length;

    const convertidos = leadList.filter(
      (lead) => lead.status === "convertido",
    ).length;

    if (totalLeads) totalLeads.textContent = total;
    if (newLeads) newLeads.textContent = novos;
    if (serviceLeads) serviceLeads.textContent = emAtendimento;
    if (convertedLeads) convertedLeads.textContent = convertidos;

    /* =====================================================
       SEM LEADS
    ===================================================== */

    if (total === 0) {
      if (empty) empty.hidden = false;
      if (tableContainer) tableContainer.hidden = true;

      return;
    }

    /* =====================================================
       MOSTRA TABELA
    ===================================================== */

    if (empty) empty.hidden = true;
    if (tableContainer) tableContainer.hidden = false;

    if (!tableBody) {
      return;
    }

    tableBody.innerHTML = "";

    /* =====================================================
   PESQUISA DE LEADS
===================================================== */

    const leadSearch = document.getElementById("leadSearch");

    if (leadSearch) {
      leadSearch.addEventListener("input", () => {
        const searchTerm = leadSearch.value.trim().toLowerCase();

        const rows = tableBody.querySelectorAll("tr");

        rows.forEach((row) => {
          const rowText = row.textContent.toLowerCase();

          row.hidden = searchTerm !== "" && !rowText.includes(searchTerm);
        });
      });
    }

    /* =====================================================
       MONTA OS LEADS
    ===================================================== */

    leadList.forEach((lead) => {
      const row = document.createElement("tr");

      const createdAt = lead.created_at
        ? new Date(lead.created_at).toLocaleString("pt-BR")
        : "-";

      const brandModel =
        [lead.brand, lead.model].filter(Boolean).join(" / ") || "-";

      const location =
        [lead.city, lead.state].filter(Boolean).join(" / ") || "-";

      const source = lead.source || "-";

      const statusLabels = {
        novo: "Novo",
        em_atendimento: "Em atendimento",
        orcamento_enviado: "Orçamento enviado",
        convertido: "Convertido",
        perdido: "Perdido",
      };

      const status = statusLabels[lead.status] || lead.status || "-";

      const phoneNumbers = String(lead.phone || "").replace(/\D/g, "");

      const firstName =
        String(lead.name || "")
          .trim()
          .split(/\s+/)[0] || "Olá";

      const equipment = [lead.brand, lead.model].filter(Boolean).join(" ");

      const problemText = lead.problem
        ? ` Você informou que o problema é: "${lead.problem}".`
        : "";

      const equipmentText = equipment
        ? ` para o seu aquecedor ${equipment}`
        : "";

      const locationText = [lead.city, lead.state].filter(Boolean).join("/");

      const whatsappMessage =
        `Olá, ${firstName}! Tudo bem?\n\n` +
        `Aqui é da Quality Therm Aquecedores.\n\n` +
        `Recebemos sua solicitação de assistência técnica${equipmentText}.\n\n` +
        (lead.problem
          ? `Você informou que o aparelho apresenta: ${lead.problem}.\n\n`
          : "") +
        `Podemos verificar seu atendimento?\n\n` +
        (locationText
          ? `Tenho seu endereço cadastrado em ${locationText} e posso consultar a disponibilidade de um técnico para sua região.`
          : `Posso consultar a disponibilidade de um técnico para sua região.`);

      const whatsappUrl = phoneNumbers
        ? `https://wa.me/55${phoneNumbers.replace(/^55/, "")}?text=${encodeURIComponent(
            whatsappMessage,
          )}`
        : "#";

      row.innerHTML = `
  <td>${escapeHtml(createdAt)}</td>

  <td>
    <strong>${escapeHtml(lead.name || "-")}</strong>
  </td>

  <td>
    ${escapeHtml(lead.phone || "-")}
  </td>

  <td>
    <span class="lead-type-badge">
      ${escapeHtml(lead.lead_type || "-")}
    </span>
  </td>

  <td>
    ${escapeHtml(brandModel)}
  </td>

  <td>
    ${escapeHtml(lead.problem || "-")}
  </td>

  <td>
    ${escapeHtml(location)}
  </td>

  <td>
    <span class="lead-source-badge">
      ${escapeHtml(source)}
    </span>
  </td>

  <td>
    <select
      class="lead-status-select"
      data-lead-id="${lead.id}"
      data-current-status="${escapeHtml(lead.status || "novo")}"
    >
      <option
        value="novo"
        ${lead.status === "novo" ? "selected" : ""}
      >
        Novo
      </option>

      <option
        value="em_atendimento"
        ${lead.status === "em_atendimento" ? "selected" : ""}
      >
        Em atendimento
      </option>

      <option
        value="orcamento_enviado"
        ${lead.status === "orcamento_enviado" ? "selected" : ""}
      >
        Orçamento enviado
      </option>

      <option
        value="convertido"
        ${lead.status === "convertido" ? "selected" : ""}
      >
        Convertido
      </option>

      <option
        value="perdido"
        ${lead.status === "perdido" ? "selected" : ""}
      >
        Perdido
      </option>
    </select>
  </td>

  <td>
    <div class="lead-actions">

      <button
        type="button"
        class="lead-action-button lead-details-button"
        data-lead-id="${lead.id}"
      >
        ◉ Detalhes
      </button>

      ${
        phoneNumbers
          ? `
            <a
              href="${whatsappUrl}"
              target="_blank"
              rel="noopener"
              class="lead-whatsapp-button"
            >
              WhatsApp
            </a>
          `
          : ""
      }

    </div>
  </td>
`;

      tableBody.appendChild(row);

      /* =====================================================
   REGISTRA CLIQUE NO WHATSAPP
===================================================== */

      const whatsappButton = row.querySelector(".lead-whatsapp-button");

      if (whatsappButton) {
        whatsappButton.addEventListener("click", async () => {
          try {
            const {
              data: { user: currentUser },
              error: currentUserError,
            } = await supabase.auth.getUser();

            if (currentUserError) {
              throw currentUserError;
            }

            if (!currentUser) {
              throw new Error("Usuário não autenticado.");
            }

            if (!lead.company_id) {
              throw new Error("Lead sem empresa vinculada.");
            }

            const { error: historyError } = await supabase
              .from("lead_history")
              .insert({
                company_id: lead.company_id,
                lead_id: lead.id,
                user_id: currentUser.id,
                action_type: "whatsapp",
                description: "Atendimento iniciado pelo WhatsApp.",
              });

            if (historyError) {
              throw historyError;
            }

            console.log(
              `Lead ${lead.id}: contato via WhatsApp registrado no histórico.`,
            );
          } catch (error) {
            console.error("Erro ao registrar contato via WhatsApp:", error);
          }
        });
      }

      /* =====================================================
   BOTÃO - DETALHES DO LEAD
===================================================== */

      const detailsButton = row.querySelector(".lead-details-button");

      if (detailsButton) {
        detailsButton.addEventListener("click", () => {
          const modal = document.getElementById("leadDetailsModal");
          const content = document.getElementById("leadDetailsContent");

          if (!modal || !content) {
            console.error("Modal de detalhes não encontrado.");
            return;
          }

          const fullAddress = [
            lead.street,
            lead.address_number,
            lead.address_complement,
            lead.neighborhood,
            lead.city,
            lead.state,
          ]
            .filter(Boolean)
            .join(", ");

          const statusLabels = {
            novo: "Novo",
            em_atendimento: "Em atendimento",
            orcamento_enviado: "Orçamento enviado",
            convertido: "Convertido",
            perdido: "Perdido",
          };

          content.innerHTML = `
      <div class="lead-details-grid">

        <div class="lead-detail-item">
          <span>Cliente</span>
          <strong>${escapeHtml(lead.name || "-")}</strong>
        </div>

        <div class="lead-detail-item">
          <span>Telefone</span>
          <strong>${escapeHtml(lead.phone || "-")}</strong>
        </div>

        <div class="lead-detail-item">
          <span>Interesse</span>
          <strong>${escapeHtml(lead.lead_type || "-")}</strong>
        </div>

        <div class="lead-detail-item">
          <span>Marca / Modelo</span>
          <strong>${escapeHtml(brandModel)}</strong>
        </div>

        <div class="lead-detail-item lead-detail-full">
          <span>Problema / Solicitação</span>
          <strong>${escapeHtml(lead.problem || "-")}</strong>
        </div>

        <div class="lead-detail-item lead-detail-full">
          <span>Endereço</span>
          <strong>${escapeHtml(fullAddress || "-")}</strong>
        </div>

        <div class="lead-detail-item">
          <span>CEP</span>
          <strong>${escapeHtml(lead.cep || "-")}</strong>
        </div>

        <div class="lead-detail-item">
          <span>Origem</span>
          <strong>${escapeHtml(lead.source || "-")}</strong>
        </div>

        <div class="lead-detail-item">
          <span>Status</span>
          <strong>${escapeHtml(
            statusLabels[lead.status] || lead.status || "-",
          )}</strong>
        </div>

        <div class="lead-detail-item">
          <span>Recebido em</span>
          <strong>${escapeHtml(createdAt)}</strong>
        </div>

        <div class="lead-detail-item lead-detail-full lead-notes-area">

  <span>Adicionar anotação</span>

  <textarea
    id="leadHistoryNote"
    placeholder="Ex.: Cliente pediu retorno amanhã, orçamento enviado, aguardando confirmação..."
  ></textarea>

  <div class="lead-notes-actions">

    <span id="leadHistoryFeedback"></span>

    <button
      type="button"
      class="admin-button admin-button-primary"
      id="saveLeadHistory"
      data-lead-id="${lead.id}"
    >
      Adicionar ao histórico
    </button>

  </div>

  <div class="lead-history-section">

    <div class="lead-history-title">
      Histórico do atendimento
    </div>

    <div id="leadHistoryList" class="lead-history-list">
      <div class="lead-history-loading">
        Carregando histórico...
      </div>
    </div>

  </div>

</div>

    `;

          modal.showModal();
          /* =====================================================
   SALVAR OBSERVAÇÃO DO LEAD
===================================================== */
          /* =====================================================
   HISTÓRICO DE ATENDIMENTO DO LEAD
===================================================== */

          const historyList = document.getElementById("leadHistoryList");
          const historyField = document.getElementById("leadHistoryNote");
          const saveHistoryButton = document.getElementById("saveLeadHistory");
          const historyFeedback = document.getElementById(
            "leadHistoryFeedback",
          );

          /* CARREGA O HISTÓRICO */

          async function loadLeadHistory() {
            if (!historyList) return;

            historyList.innerHTML = `
    <div class="lead-history-loading">
      Carregando histórico...
    </div>
  `;

            try {
              const { data: history, error } = await supabase
                .from("lead_history")
                .select("*")
                .eq("lead_id", lead.id)
                .order("created_at", {
                  ascending: false,
                });

              if (error) {
                throw error;
              }

              if (!history || history.length === 0) {
                historyList.innerHTML = `
        <div class="lead-history-empty">
          Nenhuma anotação registrada ainda.
        </div>
      `;

                return;
              }

              historyList.innerHTML = history
                .map((item) => {
                  const historyDate = item.created_at
                    ? new Date(item.created_at).toLocaleString("pt-BR")
                    : "-";

                  return `
          <div class="lead-history-item lead-history-${escapeHtml(
            item.action_type || "note",
          )}">

            <div class="lead-history-item-header">
              <strong>${escapeHtml(historyDate)}</strong>

              <span>
               ${escapeHtml(
                 item.action_type === "note"
                   ? "Anotação"
                   : item.action_type === "status_change"
                     ? "Mudança de status"
                     : item.action_type || "Registro",
               )}
              </span>
            </div>

            <p>
              ${escapeHtml(item.description || "-")}
            </p>

          </div>
        `;
                })
                .join("");
            } catch (error) {
              console.error("Erro ao carregar histórico:", error);

              historyList.innerHTML = `
      <div class="lead-history-empty">
        Não foi possível carregar o histórico.
      </div>
    `;
            }
          }

          /* SALVA NOVA ANOTAÇÃO */

          if (saveHistoryButton && historyField) {
            saveHistoryButton.addEventListener("click", async () => {
              const description = historyField.value.trim();

              if (!description) {
                if (historyFeedback) {
                  historyFeedback.textContent = "Digite uma anotação.";
                }

                historyField.focus();
                return;
              }

              saveHistoryButton.disabled = true;
              saveHistoryButton.textContent = "Salvando...";

              if (historyFeedback) {
                historyFeedback.textContent = "";
              }

              try {
                const {
                  data: { user: currentUser },
                  error: currentUserError,
                } = await supabase.auth.getUser();

                if (currentUserError) {
                  throw currentUserError;
                }

                if (!currentUser) {
                  throw new Error("Usuário não autenticado.");
                }

                if (!lead.company_id) {
                  throw new Error("Lead sem empresa vinculada.");
                }

                const { error } = await supabase.from("lead_history").insert({
                  company_id: lead.company_id,
                  lead_id: lead.id,
                  user_id: currentUser.id,
                  action_type: "note",
                  description: description,
                });

                if (error) {
                  throw error;
                }

                historyField.value = "";

                if (historyFeedback) {
                  historyFeedback.textContent = "Anotação adicionada.";
                }

                await loadLeadHistory();
              } catch (error) {
                console.error("Erro ao salvar histórico:", error);

                if (historyFeedback) {
                  historyFeedback.textContent = "Erro ao salvar.";
                }
              } finally {
                saveHistoryButton.disabled = false;
                saveHistoryButton.textContent = "Adicionar ao histórico";
              }
            });
          }

          /* CARREGA AO ABRIR O LEAD */

          loadLeadHistory();
        });
      }
    });

    /* =====================================================
   FECHAR MODAL - DETALHES DO LEAD
===================================================== */

    const leadDetailsModal = document.getElementById("leadDetailsModal");
    const closeLeadDetails = document.getElementById("closeLeadDetails");

    if (leadDetailsModal && closeLeadDetails) {
      closeLeadDetails.addEventListener("click", () => {
        leadDetailsModal.close();
      });

      leadDetailsModal.addEventListener("click", (event) => {
        if (event.target === leadDetailsModal) {
          leadDetailsModal.close();
        }
      });
    }

    /* =====================================================
   ALTERAÇÃO DE STATUS DO LEAD
===================================================== */
    const statusLabels = {
      novo: "Novo",
      em_atendimento: "Em atendimento",
      orcamento_enviado: "Orçamento enviado",
      convertido: "Convertido",
      perdido: "Perdido",
    };

    const statusSelects = document.querySelectorAll(".lead-status-select");

    statusSelects.forEach((select) => {
      select.addEventListener("change", async (event) => {
        const field = event.target;

        const leadId = field.dataset.leadId;
        const previousStatus = field.dataset.currentStatus;
        const newStatus = field.value;

        field.disabled = true;

        try {
          const { error } = await supabase
            .from("leads")
            .update({
              status: newStatus,
              updated_at: new Date().toISOString(),
            })
            .eq("id", leadId);

          if (error) {
            throw error;
          }

          /* =====================================================
   REGISTRA A MUDANÇA NO HISTÓRICO
===================================================== */

          const {
            data: { user: currentUser },
            error: currentUserError,
          } = await supabase.auth.getUser();

          if (currentUserError) {
            throw currentUserError;
          }

          if (!currentUser) {
            throw new Error("Usuário não autenticado.");
          }

          const previousStatusLabel =
            statusLabels[previousStatus] || previousStatus || "Não informado";

          const newStatusLabel =
            statusLabels[newStatus] || newStatus || "Não informado";

          const { error: historyError } = await supabase
            .from("lead_history")
            .insert({
              company_id: lead.company_id,
              lead_id: lead.id,
              user_id: currentUser.id,
              action_type: "status_change",
              description: `Status alterado de ${previousStatusLabel} para ${newStatusLabel}.`,
            });

          if (historyError) {
            console.error(
              "Status alterado, mas houve erro ao registrar o histórico:",
              historyError,
            );
          }

          field.dataset.currentStatus = newStatus;

          console.log(
            `Lead ${leadId}: status alterado de ${previousStatusLabel} para ${newStatusLabel}.`,
          );

          window.location.reload();
        } catch (error) {
          console.error("Erro ao atualizar status do lead:", error);

          field.value = previousStatus;

          alert("Não foi possível alterar o status do lead. Tente novamente.");
        } finally {
          field.disabled = false;
        }
      });
    });

    console.log(`Quality Therm CRM: ${total} lead(s) carregado(s).`);
  } catch (error) {
    console.error("Erro ao carregar leads:", error);

    if (loading) {
      loading.hidden = false;

      loading.innerHTML = `
        <strong>Não foi possível carregar os leads.</strong>
        <span>Verifique o console para mais detalhes.</span>
      `;
    }

    if (empty) empty.hidden = true;
    if (tableContainer) tableContainer.hidden = true;
  }
});

/* =========================================================
   SEGURANÇA PARA TEXTO INSERIDO NA TABELA
========================================================= */

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
