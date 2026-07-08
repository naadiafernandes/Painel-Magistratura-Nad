import { useState, useEffect } from "react";

// ---------- Shared checklists ----------
const JURIS_ITEMS = ["Súmulas Vinculantes", "Súmulas STF", "Súmulas STJ", "Teses de Repercussão Geral (RG)", "Temas de Recurso Repetitivo (RR)", "Jurisprudência em Teses (STJ)"];

const ANKI_ITEMS = ["Cards da matéria", "Caderno de erros da matéria", "Pontos de prova da matéria", "Outros cards da matéria"];

const SIMULADOS = [
  { grupo: "2026", provas: ["TJ BA 2026", "TJ GO 2026 (59º Concurso)", "TJ PA 2026", "TJ PR 2026", "MPE GO 2026", "MPE MT 2026", "MPE RJ 2026 (XXXIX)", "TRF2 2026 (XIX Concurso)", "ENAM 2026 — 5º Exame"] },
  { grupo: "2025", provas: ["TJ SC 2025 (1ª Aplicação)", "TJ CE 2025", "TJ MS 2025", "TJ SE 2025", "TJ TO 2025", "MPE ES 2025", "MPE RJ 2025 (XXXVIII)", "TRF1 2025 (XVIII)", "TRF3 2025", "TRF5 2025 (XV)", "TRF6 2025", "ENAM 2025 — 4º Exame", "ENAM 2025 — 3º Exame"] },
  { grupo: "2024", provas: ["ENAM 2024 — 2º Exame", "ENAM 2024 — Reaplicação Manaus", "ENAM 2024 — 1ª Edição (2024.1)"] },
];

// Edições mais recentes — atualizadas automaticamente aos domingos (robô semanal).
// A URL do PDF é derivada do número pela função infoUrl().
const INFORMATIVOS = {
  stf: [{ num: 1222, date: "30/06/2026" }, { num: 1221, date: "23/06/2026" }, { num: 1220, date: "16/06/2026" }],
  stj: [{ num: 894, date: "30/06/2026" }],
};
// Link direto para o PDF oficial de cada edição.
function infoUrl(org, num) {
  if (org === "stf") return `https://www.stf.jus.br/arquivo/cms/informativoSTF/anexo/Informativo_PDF/Informativo_stf_${num}.pdf`;
  return `https://processo.stj.jus.br/docs_internet/informativos/PDF/Inf${String(num).padStart(4, "0")}.pdf`;
}

// ---------- Teoria (tópicos do edital, por matéria) ----------
const TEORIA = {
  civil: ["LINDB e sistema do CC", "Pessoas naturais, personalidade, capacidade", "Bens", "Fatos e negócios jurídicos, defeitos, invalidade", "Atos ilícitos", "Prescrição e decadência", "Obrigações (modalidades, mora)", "Contratos: teoria geral, formação, extinção", "Contratos em espécie", "Responsabilidade civil", "Posse", "Propriedade e direitos reais", "Família: casamento, união estável, filiação", "Alimentos e bem de família", "Sucessões", "Registros públicos", "Alienação fiduciária, condomínio edilício e leis correlatas"],
  pcivil: ["Normas fundamentais e processo constitucional", "Jurisdição e competência", "Ação e processo: conceitos e pressupostos", "Sujeitos do processo", "Atos processuais, prazos, citações", "Tutelas provisórias", "Procedimento comum: petição inicial a saneamento", "Resposta do réu", "Provas", "Sentença e coisa julgada", "Cumprimento de sentença", "Procedimentos especiais do CPC", "Jurisdição voluntária", "Processo de execução", "Ordem nos tribunais e competência originária", "Recursos", "Legislação processual extravagante"],
  penal: ["Conceito, funções, escolas penais", "Princípios fundamentais", "Bem jurídico-penal", "Lei penal: fontes, interpretação, eficácia no tempo/espaço", "Extradição e territorialidade", "Teoria do delito: conceito e classificação", "Teorias da ação e causalidade", "Tipicidade, dolo e culpa, erro de tipo", "Ilicitude e causas de justificação", "Culpabilidade e erro de proibição", "Consumação e tentativa", "Concurso de pessoas", "Concurso de crimes", "Circunstâncias, agravantes, atenuantes", "Teoria da pena e sistemas penitenciários", "Execução penal: princípios, órgãos, regimes", "Suspensão condicional e livramento condicional", "Medidas de segurança", "Extinção da punibilidade e prescrição", "Crimes em espécie (parte especial completa)", "Direito Penal Militar"],
  ppenal: ["Interpretação e norma processual penal", "Inquérito policial", "Ação penal", "Ação civil ex delicto", "Competência", "Questões e processos incidentes", "Prova", "Sujeitos processuais", "Prisão, medidas cautelares, liberdade provisória", "Citações e intimações", "Sentença", "Processo comum", "Processos especiais", "Nulidades e recursos", "Pacote Anticrime (Lei 13.964/2019)", "Execução da pena", "Leis penais especiais (aspecto processual)"],
  const: ["Conceito e classificação de Constituição", "Estado Democrático de Direito", "Hermenêutica constitucional", "Aplicabilidade das normas constitucionais", "Controle de constitucionalidade", "Poder Constituinte", "Poder Legislativo", "Poder Judiciário", "Funções essenciais à Justiça", "Poder Executivo", "Estrutura federativa e repartição de competências", "Direitos e garantias fundamentais", "Direitos individuais", "Direitos sociais", "Nacionalidade e direitos políticos", "Ações constitucionais", "Convenção sobre Direitos das Pessoas com Deficiência", "Marco temporal indígena"],
  adm: ["Regime jurídico-administrativo", "Princípios constitucionais do Direito Administrativo", "Ato administrativo", "Servidores públicos", "Direitos, deveres e regime disciplinar", "Improbidade administrativa", "Controles da Administração Pública", "Domínio público e bens públicos", "Licitação (Lei 14.133/2021)", "Contrato administrativo", "Convênios, consórcios, concessões", "Parcerias com o terceiro setor", "Infrações e sanções administrativas", "Poderes administrativos e desapropriação", "Responsabilidade civil do Estado", "Organização administrativa", "Jurisprudência STJ/STF em Direito Administrativo"],
  empres: ["Empresa, empresário, estabelecimento", "Microempresa e EPP (LC 123/2006)", "Propriedade Industrial (patentes, marcas, desenhos)", "Direito Societário: sociedade empresária", "Sociedades em espécie", "Ligações societárias", "Títulos de crédito", "Recuperação judicial, extrajudicial e falência", "Crimes falimentares"],
  trib: ["Sistema Tributário Nacional", "Tributos: conceito e espécies", "Competência tributária", "Imunidades tributárias", "Normas gerais de direito tributário", "Fato gerador e obrigação tributária", "Responsabilidade tributária", "Constituição do crédito (lançamento)", "Suspensão da exigibilidade", "Extinção do crédito tributário", "Exclusão do crédito tributário", "Infrações e sanções tributárias", "Garantias, privilégios e administração tributária", "Processo judicial tributário", "Tributação internacional", "Direito financeiro e Lei 4.320/1964", "Legislação tributária estadual (SC)"],
};

// ---------- Lei Seca ----------
const LEI_SECA = {
  civil: ["Código Civil — Lei 10.406/2002", "Lei de Introdução às Normas do Direito Brasileiro (LINDB) — Decreto-Lei 4.657/1942", "Lei da Liberdade Econômica — Lei 13.874/2019", "Lei da Guarda Compartilhada — Lei 13.058/2014", "Lei Maria da Penha (medidas protetivas cíveis) — Lei 11.340/2006", "Lei de Registros Públicos — Lei 6.015/1973", "Provimento 149/2023 do CNJ (Registros Públicos)", "Lei dos Notários e Registradores — Lei 8.935/1994", "Alienação Fiduciária de Bens Móveis — Decreto-Lei 911/1969", "Lei do Sistema Financeiro Imobiliário (SFI) — Lei 9.514/1997", "Lei do Condomínio em Edificações — Lei 4.591/1964", "Lei das Incorporações Imobiliárias — Lei 10.931/2004", "Estatuto do Idoso — Lei 10.741/2003", "Lei de Locação de Imóveis Urbanos — Lei 8.245/1991", "Estatuto da Pessoa com Deficiência — Lei 13.146/2015", "Regime Jurídico Emergencial e Transitório (RJET) — Lei 14.010/2020", "Resolução CNJ 452/2022", "Lei Geral de Proteção de Dados (LGPD) — Lei 13.709/2018", "Marco Civil da Internet — Lei 12.965/2014", "Lei do Parcelamento do Solo Urbano — Lei 6.766/1979", "Lei da Usura — Decreto 22.626/1933", "Lei Estadual de Parcelamento do Solo (SC) — Lei Estadual 17.492/2018"],
  pcivil: ["Código de Processo Civil — Lei 13.105/2015", "Lei dos Juizados Especiais Cíveis — Lei 9.099/1995", "Lei dos Juizados Especiais Federais — Lei 10.259/2001", "Lei dos Juizados Especiais da Fazenda Pública — Lei 12.153/2009", "Lei da Impenhorabilidade do Bem de Família — Lei 8.009/1990", "Decreto da Prescrição contra a Fazenda Pública — Decreto 20.910/1932", "Decreto-Lei 4.597/1942 (prescrição contra a Fazenda Pública)", "Lei da Assistência Judiciária Gratuita — Lei 1.060/1950", "Lei de Execução Fiscal — Lei 6.830/1980", "Lei do Divórcio — Lei 6.515/1977", "Lei da União Estável — Lei 9.278/1996", "Código de Defesa do Consumidor (reflexos processuais) — Lei 8.078/1990", "Decreto-Lei da Desapropriação — Decreto-Lei 3.365/1941", "Lei do Mandado de Segurança — Lei 12.016/2009", "Lei da Ação Popular — Lei 4.717/1965", "Lei da Ação Civil Pública — Lei 7.347/1985", "Lei de Improbidade Administrativa (reflexos processuais) — Lei 8.429/1992", "Lei do Habeas Data — Lei 9.507/1997", "Lei de Alimentos — Lei 5.478/1968", "Lei de Alimentos Gravídicos — Lei 11.804/2008", "Lei de Investigação de Paternidade — Lei 8.560/1992", "Lei da Informatização do Processo Judicial — Lei 11.419/2006", "Lei das Cautelares contra o Poder Público — Lei 8.437/1992", "Lei 9.494/1997 (tutela antecipada contra a Fazenda Pública)", "Lei da Súmula Vinculante — Lei 11.417/2006", "Lei da Mediação — Lei 13.140/2015", "Lei 13.655/2018 (altera a LINDB)", "Lei de Arbitragem — Lei 9.307/1996", "Lei 13.129/2015 (altera a Lei de Arbitragem)"],
  cdc: ["Código de Defesa do Consumidor — Lei 8.078/1990", "Decreto do Comércio Eletrônico — Decreto 7.962/2013", "Decreto do Sistema Nacional de Defesa do Consumidor (SNDC) — Decreto 2.181/1997", "Lei do Cadastro Positivo — Lei 12.414/2011", "Decreto 9.936/2019 (regulamenta o Cadastro Positivo)", "Resolução ANATEL 632/2014", "Resolução ANEEL 1.000/2021", "Lei dos Planos de Saúde — Lei 9.656/1998"],
  eca: ["Estatuto da Criança e do Adolescente (ECA) — Lei 8.069/1990", "Lei do SINASE — Lei 12.594/2012", "Lei do Sistema de Garantia de Direitos (violência) — Lei 13.431/2017", "Decreto 9.603/2018 (regulamenta a Lei 13.431/2017)", "Lei Henry Borel — Lei 14.344/2022", "Marco Legal da Primeira Infância — Lei 13.257/2016", "ECA Digital — Lei 15.211/2025", "Lei Orgânica da Assistência Social (LOAS) — Lei 8.742/1993", "Lei 12.435/2011 (altera a LOAS)", "Resolução CNJ 295/2019 (autorização de viagem)", "Resolução CNJ 165/2012", "Resolução CONANDA 113/2006", "Resolução CONANDA 117/2006", "Resolução CONANDA 169/2014", "Resolução CONANDA 231/2022", "Lei da Proteção à Pessoa com Transtorno Mental — Lei 10.216/2001"],
  civesp: ["Lei dos Juizados Especiais Cíveis — Lei 9.099/1995", "Lei dos Juizados Especiais Federais — Lei 10.259/2001", "Lei dos Juizados Especiais da Fazenda Pública — Lei 12.153/2009", "Lei do Mandado de Segurança — Lei 12.016/2009", "Lei da Ação Civil Pública — Lei 7.347/1985", "Lei da Ação Popular — Lei 4.717/1965", "Lei da Mediação — Lei 13.140/2015", "Lei de Arbitragem — Lei 9.307/1996", "LINDB — Decreto-Lei 4.657/1942", "Lei 13.655/2018 (altera a LINDB)", "Lei da Ação Direta de Inconstitucionalidade — Lei 9.868/1999", "Lei da Súmula Vinculante — Lei 11.417/2006", "Lei de Locação de Imóveis Urbanos — Lei 8.245/1991", "Lei da Impenhorabilidade do Bem de Família — Lei 8.009/1990", "Lei do Sistema Financeiro Imobiliário (SFI) — Lei 9.514/1997", "Regime Jurídico Emergencial e Transitório (RJET) — Lei 14.010/2020", "Lei do Mandado de Injunção — Lei 13.300/2016", "Lei da Intervenção da União — Lei 9.469/1997", "Lei das Cautelares contra o Poder Público — Lei 8.437/1992"],
  penal: ["Código Penal — Decreto-Lei 2.848/1940", "Lei de Execução Penal (LEP) — Lei 7.210/1984"],
  ppenal: ["Código de Processo Penal — Decreto-Lei 3.689/1941", "Pacote Anticrime — Lei 13.964/2019", "Lei de Execução Penal (LEP) — Lei 7.210/1984"],
  penesp: ["Lei das Organizações Criminosas — Lei 12.850/2013", "Lei de Drogas — Lei 11.343/2006", "Código de Trânsito Brasileiro (crimes) — Lei 9.503/1997", "Lei de Execução Penal (LEP) — Lei 7.210/1984", "Lei dos Crimes Hediondos — Lei 8.072/1990", "Lei dos Crimes Ambientais — Lei 9.605/1998", "Lei de Lavagem de Dinheiro — Lei 9.613/1998", "Lei dos Crimes contra o Sistema Financeiro — Lei 7.492/1986", "Lei dos Crimes contra a Ordem Tributária — Lei 8.137/1990", "Lei de Proteção a Vítimas e Testemunhas — Lei 9.807/1999", "Lei da Prisão Temporária — Lei 7.960/1989", "Lei dos Juizados Especiais Criminais — Lei 9.099/1995", "Lei Maria da Penha — Lei 11.340/2006", "Código Eleitoral (crimes eleitorais) — Lei 4.737/1965", "Lei Henry Borel — Lei 14.344/2022", "Estatuto do Desarmamento — Lei 10.826/2003", "Lei dos Crimes de Prefeitos e Vereadores — Decreto-Lei 201/1967", "Lei da Propriedade Industrial (crimes) — Lei 9.279/1996", "ECA (crimes) — Lei 8.069/1990", "Lei de Abuso de Autoridade — Lei 13.869/2019", "Lei de Interceptação Telefônica — Lei 9.296/1996", "Lei de Recuperação e Falência (crimes) — Lei 11.101/2005", "Lei dos Crimes de Competência Originária dos Tribunais — Lei 8.038/1990"],
  const: ["Constituição Federal — CF/1988", "Lei dos Consórcios Públicos — Lei 11.107/2005", "Emenda Constitucional 132/2023 (Reforma Tributária)", "Emenda Constitucional 103/2019 (Reforma da Previdência)"],
  eleit: ["Código Eleitoral — Lei 4.737/1965", "Lei das Eleições — Lei 9.504/1997", "Lei das Inelegibilidades — LC 64/1990", "Lei dos Partidos Políticos — Lei 9.096/1995", "LC 86/1996"],
  empres: ["Código Civil — Livro II (Direito de Empresa)", "Lei das Sociedades Anônimas — Lei 6.404/1976", "Lei de Recuperação Judicial e Falência — Lei 11.101/2005", "Lei do Simples Nacional (ME/EPP) — LC 123/2006", "Lei da Propriedade Industrial — Lei 9.279/1996", "Lei Uniforme de Genebra — Decreto 57.663/1966", "Lei do Protesto — Lei 9.492/1997", "Lei da Duplicata — Lei 5.474/1968", "Lei do Cheque — Lei 7.357/1985", "Lei dos Títulos do Agronegócio — Lei 11.076/2004", "Lei das Cooperativas — Lei 5.764/1971", "Lei de Intervenção e Liquidação de Instituição Financeira — Lei 6.024/1974", "Lei da Sociedade Anônima do Futebol (SAF) — Lei 14.193/2021"],
  trib: ["Código Tributário Nacional (CTN) — Lei 5.172/1966", "Lei de Execução Fiscal — Lei 6.830/1980", "Lei do Orçamento Público — Lei 4.320/1964", "Lei de Responsabilidade Fiscal — LC 101/2000", "Lei da Cautelar Fiscal — Lei 8.397/1992", "Lei do Mandado de Segurança — Lei 12.016/2009", "Tribunal Administrativo Tributário de SC (TAT-SC) — LC Estadual 465/2009", "Lei do ICMS de SC — Lei Estadual 10.297/1996", "Lei Estadual (SC) 13.136/2004"],
  amb: ["Lei da Política Nacional do Meio Ambiente (PNMA) — Lei 6.938/1981", "Lei dos Crimes Ambientais — Lei 9.605/1998", "Lei do Sistema Nacional de Unidades de Conservação (SNUC) — Lei 9.985/2000", "Decreto 4.340/2002 (regulamenta o SNUC)", "Código Florestal — Lei 12.651/2012", "Lei da Política Nacional de Recursos Hídricos — Lei 9.433/1997", "Lei da Cooperação Ambiental — LC 140/2011", "Resolução CONAMA 237/1997 (Licenciamento)", "Lei da Biodiversidade — Lei 13.123/2015", "Decreto 8.772/2016 (regulamenta a Lei da Biodiversidade)", "Lei de Segurança de Barragens — Lei 12.334/2010", "Lei de Pagamento por Serviços Ambientais — Lei 14.119/2021", "Decreto das Infrações Administrativas Ambientais — Decreto 6.514/2008", "Lei da Política Nacional sobre Mudança do Clima — Lei 12.187/2009", "Lei da Política Nacional de Resíduos Sólidos — Lei 12.305/2010", "Lei da Mata Atlântica — Lei 11.428/2006", "Lei dos Agrotóxicos — Lei 14.785/2023", "Código Estadual do Meio Ambiente (SC) — Lei Estadual 14.675/2009", "Lei Estadual (SC) 16.342/2014 (altera o Código Estadual)"],
  adm: ["Lei de Licitações e Contratos — Lei 14.133/2021", "Lei de Improbidade Administrativa — Lei 8.429/1992", "Lei de Acesso à Informação (LAI) — Lei 12.527/2011", "Lei Anticorrupção — Lei 12.846/2013", "Lei do Processo Administrativo Federal — Lei 9.784/1999", "Lei das Concessões e Permissões — Lei 8.987/1995", "Lei das Parcerias Público-Privadas (PPP) — Lei 11.079/2004", "Lei das Estatais — Lei 13.303/2016", "Lei do Estatuto das Parcerias com OSCs — Lei 13.019/2014", "Lei do Programa de Parcerias de Investimentos (PPI) — Lei 13.334/2016", "Lei 13.448/2017 (altera o PPI)", "Lei dos Bens Imóveis da União — Lei 9.636/1998", "Lei do Contrato de Desempenho — Lei 13.934/2019", "Decreto-Lei do Tombamento — Decreto-Lei 25/1937", "Lei dos Servidores Públicos Federais — Lei 8.112/1990", "Estatuto dos Servidores Públicos de SC — Lei Estadual 6.745/1985", "Regime Próprio de Previdência do Servidor de SC — LC Estadual 412/2008", "Lei Orgânica da Magistratura Nacional (LOMAN) — LC 35/1979", "Processo Administrativo Disciplinar de SC — LC Estadual 491/2010"],
  dh: ["Declaração Universal dos Direitos Humanos", "Convenção Americana de Direitos Humanos (Pacto de San José)", "Pacto Internacional dos Direitos Civis e Políticos (PIDCP)", "Estatuto de Roma — Decreto 4.388/2002", "Convenção sobre os Direitos das Pessoas com Deficiência — Decreto 6.949/2009", "Estatuto da Pessoa com Deficiência — Lei 13.146/2015", "Lei das Pessoas Portadoras de Deficiência — Lei 7.853/1989", "Convenção Interamericana contra o Racismo — Decreto 10.932/2022", "Estatuto do Idoso — Lei 10.741/2003", "Lei da Proteção à Pessoa com Transtorno Mental — Lei 10.216/2001", "Decreto da Política Nacional para População em Situação de Rua — Decreto 7.053/2009"],
  human: ["Lei da Organização Judiciária de SC — LC Estadual 339/2006", "Estatuto da Magistratura de SC — LC Estadual 367/2006", "LC Estadual (SC) 413/2008", "Adaptação à LOMAN em SC — Lei Estadual 5.624/1979", "Código de Ética da Magistratura Nacional — Resolução CNJ 60/2008", "Resolução CNJ 325/2020 (Planejamento e Gestão Estratégica)", "Resolução CNJ 159/2012 (Formação de Magistrados e Servidores)", "Resolução CNJ 348/2020 (Tratamento da População LGBTI)", "Resolução CNJ 351/2020 (Prevenção ao Assédio Moral)", "Resolução CNJ 350/2020 (Cooperação Judiciária Nacional)", "Lei Geral de Proteção de Dados (LGPD) — Lei 13.709/2018", "Marco Civil da Internet — Lei 12.965/2014", "Lei da Informatização do Processo Judicial — Lei 11.419/2006"],
};

// ---------- Questões: tópicos do próprio edital (tabela de incidência), do mais pro menos cobrado ----------
const TOPICOS = {
  const: ["Organização, Competências e Bens dos Entes Federativos (jurisprudência)", "Administração Pública (jurisprudência)", "Controle de Constitucionalidade (jurisprudência)", "Métodos e Princípios de Interpretação Constitucional", "União: Bens e Competências (arts. 20-24)", "Direitos e Deveres Individuais e Coletivos (jurisprudência)", "Processo Legislativo (jurisprudência)", "Intervenção Federal e Estadual", "Da Educação, Cultura e Desporto", "Direitos e Deveres Individuais e Coletivos (art. 5º)", "Questões Mescladas de Controle de Constitucionalidade", "Fiscalização Contábil, Financeira e Orçamentária (jurisprudência)", "Sistema Tributário Nacional (jurisprudência)", "Competências para Fiscalização e TCU", "Medidas Provisórias"],
  civil: ["Prescrição e Decadência", "Da Responsabilidade Civil", "Do Regime de Bens entre os Cônjuges", "Da Doação", "Do Condomínio Geral", "Invalidade do Negócio Jurídico", "Do Casamento", "Da Aquisição da Propriedade Imóvel (Usucapião, Acessão, Registro)", "Desconsideração da Personalidade Jurídica", "Da Mora", "Princípios Contratuais no Código Civil", "Das Relações de Parentesco", "Responsabilidade Civil (jurisprudência)", "Defeitos ou Vícios do Negócio Jurídico", "Dos Vícios Redibitórios"],
  pcivil: ["Da Tutela Provisória", "Da Competência Interna", "Do Cumprimento da Sentença", "Da Sentença e Da Coisa Julgada", "Do Agravo de Instrumento", "Da Intervenção de Terceiros", "Dos Deveres das Partes e de seus Procuradores", "Do Incidente de Resolução de Demandas Repetitivas", "Da Execução em Geral", "Da Capacidade Processual", "Da Ação Rescisória", "Da Petição Inicial", "Da Citação", "Provas (disposições gerais)", "Da Apelação"],
  adm: ["Procedimento Administrativo e Processo Judicial (Improbidade)", "Responsabilidade Civil do Estado (jurisprudência)", "Desapropriação", "Agentes Públicos (jurisprudência)", "Controle da Administração Pública (jurisprudência)", "Concurso Público (jurisprudência)", "Tombamento", "Improbidade Administrativa (jurisprudência)", "Parceria Público-Privada (Lei 11.079/2004)", "Consórcios Públicos (Lei 11.107/2005)", "Tópicos Mesclados de Improbidade", "Desapropriação (jurisprudência)", "Serviços Públicos (jurisprudência)", "Terceiro Setor (OSs, OSCIPs, Sistema S)", "Controle da Administração (tópicos mesclados)"],
  penal: ["Penas (jurisprudência)", "Da Aplicação da Pena", "Crimes contra o Patrimônio (jurisprudência)", "Da Prescrição", "Efeitos da Condenação", "Dos Crimes Sexuais contra Vulnerável", "Homicídio", "Do Roubo e da Extorsão", "Crimes Contra o Patrimônio (questões mescladas)", "Causas de Extinção da Punibilidade", "Do Furto", "Dos Crimes contra a Liberdade Pessoal", "Concurso de Crimes", "Crimes contra a Liberdade Sexual e Exposição da Intimidade Sexual", "Crimes contra a Administração Pública (questões mescladas)"],
  ppenal: ["Da Ação Penal", "Procedimento dos Crimes do Tribunal do Júri", "Questões Mescladas sobre Recursos", "Das Medidas Assecuratórias", "Competência (jurisprudência)", "Teoria Geral da Prova Penal", "Questões Mescladas sobre a Prova", "Da Prisão Preventiva", "Da Comunicação dos Atos Processuais", "Prisão, Medidas Cautelares e Liberdade Provisória (questões mescladas)", "Inquérito Policial", "Fase Decisória e Sentença Penal", "Ação Penal (jurisprudência)", "Assuntos Diversos/Mesclados de Processo Penal (jurisprudência)", "Das Testemunhas"],
  empres: ["Recuperação Judicial e Convolação em Falência", "Da Falência", "Outros Títulos de Crédito", "Disposições Comuns à Recuperação Judicial e Falência", "Sociedade Limitada", "Ações, Partes Beneficiárias, Debêntures, Bônus de Subscrição", "Cédulas de Crédito", "Lei das Cooperativas", "Intervenção/Liquidação de Instituição Financeira", "Das Patentes", "Da Recuperação Extrajudicial", "Sociedades Coligadas, Controladas, Filiadas"],
  trib: ["Extinção do Crédito Tributário", "ICMS (jurisprudência)", "Responsabilidade Tributária", "Princípios Tributários", "Execução Fiscal (Lei 6.830/1980)", "Imunidades Tributárias (jurisprudência)", "Execução Fiscal (jurisprudência)", "Extinção do Crédito Tributário (jurisprudência)", "Repartição Constitucional de Receitas Tributárias", "Princípios Tributários (jurisprudência)"],
  cdc: ["Direito do Consumidor (jurisprudência — bloco geral)", "Defesa do Consumidor em Juízo", "Das Práticas Comerciais", "Da Proteção Contratual", "Da Conciliação no Superendividamento", "Da Desconsideração da Personalidade Jurídica", "Responsabilidade por Vício do Produto e do Serviço", "Tópicos Mesclados do CDC", "Responsabilidade pelo Fato do Produto e do Serviço", "Da Decadência e da Prescrição"],
  eca: ["Da Família Substituta: Guarda, Tutela e Adoção", "Lei do SINASE", "Dos Procedimentos do Acesso à Justiça", "Das Medidas Sócio-educativas", "ECA (jurisprudência)", "Sistema de Garantia de Direitos (Lei 13.431/2017)", "Dos Recursos", "Direito à Convivência Familiar (disposições gerais)", "Da Prevenção Especial", "Das Infrações Administrativas"],
  penesp: ["Lei das Organizações Criminosas", "Disposições Gerais e Crimes da Lei de Drogas", "Código de Trânsito Brasileiro (crimes)", "Da Execução das Penas em Espécie (LEP)", "Tópicos Mesclados de Leis Penais Extravagantes", "Jurisprudência sobre Tópicos Mesclados", "Lei dos Crimes Hediondos", "Aplicação da Pena (Lei de Crimes Ambientais)", "Lei de Lavagem de Dinheiro", "Procedimento Penal da Lei de Drogas (apreensão de bens)", "Crimes contra o Sistema Financeiro", "Crimes contra a Ordem Tributária"],
  civesp: ["Direitos Individuais Homogêneos, Coletivos e Difusos", "Do Mandado de Segurança", "Da Ação Civil Pública", "Lei dos Juizados Especiais Cíveis", "Da Ação Popular", "Ação Civil Pública (jurisprudência)", "Lei da Mediação", "Segurança Jurídica e Eficiência (LINDB arts. 20-30)", "Eficácia das Leis no Espaço (LINDB arts. 7-19)", "Lei de Locação de Imóveis Urbanos"],
  amb: ["Infrações e Responsabilidade Civil Ambiental (jurisprudência)", "Demais Temas de Direito Ambiental (jurisprudência)", "Responsabilidade Civil Ambiental", "Direito Ambiental Constitucional (jurisprudência)", "Lei da Política Nacional de Recursos Hídricos", "Lei da Cooperação Ambiental (LC 140/2011)", "Criação e Gestão das Unidades de Conservação", "Proibição do Uso de Fogo e Controle de Incêndios", "Competências Constitucionais em Matéria Ambiental", "CONAMA"],
  eleit: ["Elegibilidade e Inelegibilidade", "Propaganda Eleitoral e Direito de Resposta", "Registro dos Candidatos", "Questões Mescladas de Direito Eleitoral", "Eleições (jurisprudência)", "Investigação Judicial Eleitoral", "Direitos Políticos (jurisprudência)", "Impugnação a Pedido de Registro de Candidatura", "Prestação de Contas da Campanha Eleitoral"],
  dh: ["Outros Tópicos sobre Direitos Humanos", "Outros Assuntos de DH (jurisprudência)", "Proteção dos Direitos Humanos (temas mesclados)", "Direitos Humanos na Constituição Federal", "Deveres dos Estados e Direitos Protegidos (CADH)", "Sistema Interamericano de Direitos Humanos", "Disposições Gerais do Estatuto da PcD"],
  human: ["Hermenêutica Jurídica", "Disposições Preliminares da LGPD", "Juspositivismo e Jusnaturalismo", "Direito, Moral e Justiça", "Direito Digital (jurisprudência)", "Pragmatismo, Análise Econômica do Direito e Economia Comportamental", "Tratamento de Dados Pessoais Sensíveis (LGPD)", "Regras para Tratamento de Dados Pessoais (LGPD)", "Sociologia Jurídica", "Utilitarismo"],
};

const TIER_META = {
  base: { label: "MATÉRIAS-BASE", sub: "⭐️⭐️⭐️", color: "#f0c85a", n: 1 },
  altamedia: { label: "IMPORTÂNCIA MÉDIA-ALTA", sub: "⭐️⭐️", color: "#e0954f", n: 2 },
  baixamedia: { label: "IMPORTÂNCIA MÉDIA-BAIXA", sub: "⭐️", color: "#7f96c4", n: 3 },
};
const SUBJ_NAME_COLOR = "#e8837a";
const YELLOW = "#f0c85a";

// ---------- Cursos isolados ----------
const PENAL_TOPICS = [
  ["1. Conceito, funções e caracteres do Direito Penal", 2],
  ["2. Escolas e tendências penais", 1],
  ["3. Evolução epistemológica do Direito Penal", 2],
  ["4. Princípios Fundamentais do Direito Penal", 5],
  ["5. Bem Jurídico-Penal", 1],
  ["6. Aplicação da lei penal (tempo, espaço, extradição)", 6],
  ["7. Classificação dos delitos", 2],
  ["8. Fato típico, causas de exclusão da tipicidade, teoria da ação", 5],
  ["9. Erro de tipo", 2],
  ["10. Ilicitude e causas de justificação", 2],
  ["11. Culpabilidade", 3],
  ["12. Concurso de pessoas", 3],
  ["13. Concurso de crimes", 2],
  ["14. Teoria da pena, circunstâncias e determinação da pena", 5],
  ["15. Pena de multa", 2],
  ["16. Suspensão condicional da pena", 1],
  ["17. Livramento condicional", 1],
  ["18. Medidas de Segurança", 1],
  ["19. Efeitos da condenação", 1],
  ["20. Punibilidade e causas de extinção", 1],
  ["21. Prescrição", 2],
  ["22. Crimes contra a pessoa", 9],
  ["23. Crimes contra o patrimônio", 6],
  ["24. Crimes contra a propriedade imaterial", 1],
  ["25. Crimes contra a organização do trabalho", 1],
  ["26. Crimes contra o sentimento religioso e respeito aos mortos", 1],
  ["27. Crimes contra a dignidade sexual", 3],
  ["28. Crimes contra a família", 1],
  ["29. Crimes contra a incolumidade pública", 2],
  ["30. Crimes contra a paz pública", 1],
  ["31. Crimes contra a fé pública", 2],
  ["32. Crimes contra a Administração Pública", 3],
  ["33. Crimes contra o Estado Democrático de Direito", 1],
];

const PPENAL_TOPICS = [
  ["1. Sistemas Processuais", 1],
  ["2. Princípios constitucionais do processo penal", 3],
  ["3. Aplicação da lei processual (tempo, espaço, pessoas)", 1],
  ["4. Inquérito policial", 6],
  ["5. Ação penal (pública e privada)", 3],
  ["6. Acordo de Não Persecução Penal (ANPP)", 2],
  ["7. Ação civil ex delicto", 1],
  ["8. Jurisdição e competência", 5],
  ["9. Questões e processos incidentes", 1],
  ["10. Da prova", 6],
  ["11. Sujeitos processuais", 2],
  ["12. Prisão, medidas cautelares e liberdade provisória", 4],
  ["13. Medidas protetivas de urgência (Lei 15.280/2025)", 1],
  ["14. Medidas assecuratórias", 1],
  ["15. Citações e intimações", 1],
  ["16. Processo e procedimento (comum, sumário, sumaríssimo, JECrim)", 3],
  ["17. Procedimento do Tribunal do Júri e desaforamento", 4],
  ["18. Da sentença", 1],
  ["19. Das nulidades", 1],
  ["20. Dos recursos em geral", 2],
  ["21. Ações de impugnação (revisão criminal, HC, MS, exceções)", 1],
];

const CURSOS_ISOLADOS = [
  {
    id: "cur_adm",
    nome: "Direito Administrativo",
    sublistas: [
      {
        nome: "Curso Intensivo (141 aulas)",
        itens: [
          "Apresentação do módulo e materiais pdf",
          "Aula 1 - Atos Administrativos (Parte 1)", "Aula 1 - Atos Administrativos (Parte 2)", "Aula 1 - Atos Administrativos (Parte 3)", "Aula 1 - Atos Administrativos (Parte 4)", "Aula 1 - Atos Administrativos (Parte 5)",
          "Aula 2 - Atos Administrativos (Parte 6)", "Aula 2 - Atos Administrativos (Parte 7)", "Aula 2 - Atos Administrativos (Parte 8)", "Aula 2 - Atos Administrativos (Parte 9)", "Aula 2 - Poderes Administrativos (Parte 1)",
          "Aula 3 - Poderes Administrativos (Parte 2)", "Aula 3 - Poderes Administrativos (Parte 3)", "Aula 3 - Poderes Administrativos (Parte 4)", "Aula 3 - Organização Administrativa (Parte 1)", "Aula 3 - Organização Administrativa (Parte 2)",
          "Aula 4 - Organização Administrativa (Parte 3)", "Aula 4 - Organização Administrativa (Parte 4)", "Aula 4 - Organização Administrativa (Parte 5)", "Aula 4 - Organização Administrativa (Parte 6)", "Aula 4 - Organização Administrativa (Parte 7)",
          "Aula 5 - 3º Setor (Parte 1)", "Aula 5 - 3º Setor (Parte 2)", "Aula 5 - Consórcio Público", "Aula 5 - Responsabilidade Civil do Estado (Parte 1)", "Aula 5 - Responsabilidade Civil do Estado (Parte 2)",
          "Aula 6 - Responsabilidade Civil do Estado (Parte 3)", "Aula 6 - Responsabilidade Civil do Estado (Parte 4)", "Aula 6 - Licitações (Parte 1)", "Aula 6 - Licitações (Parte 2)", "Aula 6 - Licitações (Parte 3)",
          "Aula 7 - Licitações (Parte 4)", "Aula 7 - Licitações (Parte 5)", "Aula 7 - Licitações (Parte 6)", "Aula 7 - Licitações (Parte 7)", "Aula 7 - Licitações (Parte 8)",
          "Aula 8 - Licitações (Parte 9)", "Aula 8 - Licitações (Parte 10)", "Aula 8 - Licitações (Parte 11)", "Aula 8 - Licitações (Parte 12)", "Aula 8 - Licitações (Parte 13)", "Aula 8 - Licitações (Parte 14)",
          "Licitações - Atualização Licitações Decreto 12.343", "Licitações - Atualização Licitações Lei 14.770",
          "Aula 9 - Contratos Administrativos (Parte 1)", "Aula 9 - Contratos Administrativos (Parte 2)", "Aula 9 - Contratos Administrativos (Parte 3)", "Aula 9 - Contratos Administrativos (Parte 4)",
          "Aula 10 - Contratos Administrativos (Parte 5)", "Aula 10 - Contratos (Parte 6)", "Aula 10 - Agentes Públicos (Parte 1)", "Aula 10 - Agentes Públicos (Parte 2)",
          "Aula 11 - Agentes Públicos (Parte 3)", "Aula 11 - Agentes Públicos (Parte 4)", "Aula 11 - Agentes Públicos (Parte 5)", "Aula 11 - Agentes Públicos (Parte 6)", "Aula 11 - Agentes Públicos (Parte 7)",
          "Aula 12 - Agentes Públicos (Parte 8)", "Aula 12 - Agentes Públicos (Parte 9)", "Aula 12 - Agentes Públicos (Parte 10)", "Aula 12 - PAD (Parte 1)", "Aula 12 - PAD (Parte 2)",
          "Aula 13 - Improbidade Administrativa - Conceito e Comentários Iniciais - Aplicação Retroativa (Parte 1)", "Aula 13 - Improbidade Administrativa - ADI 7236 (Parte 2)", "Aula 13 - Improbidade Administrativa - Sujeitos Ativo, Passivo e Tipologia (Parte 3)", "Aula 13 - Improbidade Administrativa - Tipologia da Improbidade (Parte 4)",
          "Aula 14 - Improbidade Administrativa - Sanções de Improbidade e Procedimento Judicial (Parte 5)", "Aula 14 - Improbidade Administrativa - Do Procedimento Judicial (Parte 6)", "Aula 14 - Improbidade Administrativa - Procedimento Judicial (Parte 7)", "Aula 14 - Improbidade Administrativa - Indisponibilidade de Bens e Comentário Final (Parte 8)", "Aula 14 - Lei Anticorrupção",
          "Aula 15 - Desapropriação (Parte 1)", "Aula 15 - Desapropriação (Parte 2)", "Aula 15 - Desapropriação (Parte 3)", "Aula 15 - Desapropriação (Parte 4)", "Aula 15 - Desapropriação (Parte 5)",
          "Aula 16 - Desapropriação (Parte 6)", "Aula 16 - Desapropriação (Parte 7)", "Aula 16 - Intervenção do Estado na Propriedade (Parte 1)", "Aula 16 - Intervenção do Estado na Propriedade (Parte 2)",
          "Aula 17 - Bens Públicos (Parte 1)", "Aula 17 - Bens Públicos (Parte 2)", "Aula 17 - Bens Públicos (Parte 3)", "Aula 17 - Serviço Público (Parte 1)",
          "Aula 18 - Serviço Público (Parte 2)", "Aula 18 - Serviço Público (Parte 3)", "Aula 18 - Serviço Público (Parte 4)", "Aula 18 - Serviço Público (Parte 5)", "Aula 18 - Serviço Público (Parte 6)", "Aula 18 - Serviço Público (Parte 7)",
          "Aula 19 - Princípios (Parte 1)", "Aula 19 - Princípios (Parte 2)", "Aula 19 - Princípios (Parte 3)", "Aula 19 - Princípios (Parte 4)", "Aula 19 - Princípios (Parte 5)",
          "Aula 20 - Controle da Administração (Parte 1)", "Aula 20 - Controle da Administração (Parte 2)", "Aula 20 - Controle da Administração (Parte 3)", "Aula 20 - Controle da Administração (Parte 4)",
          "Aula 21 - Controle da Administração (Parte 5)", "Aula 21 - Controle da Administração (Parte 6)", "Aula 21 - Lei 9.784",
          "Aula Extra - Lei das Estatais (Parte 1)", "Aula Extra - Lei das Estatais (Parte 2)", "Aula Extra - Lei das Estatais (Parte 3)", "Aula Extra - Lei das Estatais (Parte 4)",
          "Aula LINDB (Parte 1)", "Aula LINDB (Parte 2)", "Aula LINDB (Parte 3)",
          "Atualização Informativos 2023.2", "Informativos 1º Trimestre 2024 (Parte 1)", "Informativos 1º Trimestre 2024 (Parte 2)", "Informativos 1º Trimestre 2024 (Parte 3)",
          "Retroatividade da Lei mais Benéfica - Entenda de vez",
          "Informativos 2024 - 2º Trimestre (Parte 1)", "Informativos 2024 - 2º Trimestre (Parte 2)", "Informativos 2024 - 2º Trimestre (Parte 3)", "Informativos 2024 - 2º Trimestre (Parte 4)",
          "Aula Extra - Prorrogação e Relicitação de Contratos de Parceria (Parte 1)", "Aula Extra - Prorrogação e Relicitação de Contratos de Parceria (Parte 2)",
          "Aula de Lei de Acesso à Informação (Parte 1)", "Aula de Lei de Acesso à Informação (Parte 2)", "Aula de Lei de Acesso à Informação (Parte 3)",
          "Aprofundamento de temas - Bipolaridade do Direito Administrativo", "Aprofundamento de temas - Continuidade Típico-Normativa", "Aprofundamento - Teoria das Circunstâncias Excepcionais",
          "Informativos 2024 - 3º Trimestre (Parte 1)", "Informativos 2024 - 3º Trimestre (Parte 2)", "Informativos 2024 - 3º Trimestre (Parte 3)",
          "Tema Aprofundado - Revogação da Revogação; Estabilização dos Efeitos; Teoria da Dupla Garantia e Conduta Irregular",
          "Informativos 2024 - 4º Trimestre (Parte 1)", "Informativos 2024 - 4º Trimestre (Parte 2)", "Informativos 2024 - 4º Trimestre (Parte 3)",
          "Informativos 2025 - 1º Trimestre", "Informativos 2025 - 2º Trimestre (Parte 1)", "Informativos 2025 - 2º Trimestre (Parte 2)",
          "Informativos 2025 - 3º Trimestre (Parte 1)", "Informativos 2025 - 3º Trimestre (Parte 2)", "Informativos 2025 - 4º Trimestre",
          "Informativos 1º Trimestre de 2026",
        ],
      },
      {
        nome: "Curso 100% FGV",
        itens: [
          "Improbidade Administrativa (Parte 1)", "Improbidade Administrativa (Parte 2)",
          "Licitações e Contratos (Parte 1)", "Licitações e Contratos (Parte 2)",
          "Organização Administrativa (Parte 1)", "Organização Administrativa (Parte 2)",
          "Responsabilidade Civil do Estado", "Poderes Administrativos",
          "Atos Administrativos e Serviços Públicos (Parte 1)", "Atos Administrativos e Serviços Públicos (Parte 2)", "Atos Administrativos e Serviços Públicos (Parte 3)",
          "Intervenção do Estado na Propriedade, Desapropriação e Bens Públicos (Parte 1)", "Intervenção do Estado na Propriedade, Desapropriação e Bens Públicos (Parte 2)", "Intervenção do Estado na Propriedade, Desapropriação e Bens Públicos (Parte 3)", "Intervenção do Estado na Propriedade, Desapropriação e Bens Públicos (Parte 4)",
          "Controle e Princípios",
          "Retroatividade da Lei mais Benéfica - Entenda de vez",
          "Lei das Estatais",
          "100% FGV (Parte 1)", "100% FGV (Parte 2)",
          "Questões TJ/SC", "Questões TJ/PE", "Questões TJ/MT", "Questões PGM/Vitória", "Questões ENAM 1", "Questões ENAM 4", "Questões DPE/PE e TRF-5 (Parte 2)",
        ],
      },
    ],
  },
  {
    id: "cur_civil",
    nome: "Direito Civil",
    itens: [
      { h: "LINDB e Princípios Norteadores do Direito Constitucional" },
      { t: "Lei de Introdução às Normas do Direito Brasileiro (LINDB) II", d: "17:24" },
      { t: "Da aplicação e interpretação das normas jurídicas. Interpretação e integração da lei", d: "26:53" },
      { t: "Da irretroatividade das leis e graus de retroatividade I", d: "24:03" },
      { t: "Da irretroatividade das leis e graus de retroatividade II", d: "18:34" },
      { t: "Estrutura da LINDB", d: "16:32" },
      { t: "Dos princípios norteadores do código civil", d: "23:13" },
      { t: "Direito civil constitucional I", d: "23:13" },
      { t: "Direito civil constitucional II", d: "15:01" },
      { h: "Da Parte Geral do Código Civil" },
      { t: "Apresentação", d: "17:27" },
      { t: "Princípios gerais do direito civil I", d: "29:00" },
      { t: "Princípios gerais do direito civil II", d: "28:58" },
      { t: "Princípios gerais do direito civil III", d: "29:30" },
      { t: "Princípios gerais do direito civil IV", d: "27:03" },
      { t: "Princípios gerais do direito civil V", d: "27:17" },
      { t: "Pessoa natural I", d: "29:02" },
      { t: "Pessoa natural II", d: "29:36" },
      { t: "Pessoa natural III", d: "22:24" },
      { t: "Pessoa natural IV", d: "19:27" },
      { t: "Pessoa natural V", d: "26:50" },
      { t: "Pessoa natural VI", d: "28:14" },
      { t: "Pessoa natural VII", d: "23:14" },
      { t: "Pessoa natural VIII", d: "24:03" },
      { t: "Pessoa natural IX", d: "28:13" },
      { t: "Pessoa natural X", d: "27:52" },
      { t: "Pessoa natural XI", d: "25:44" },
      { t: "Pessoa natural XII", d: "23:35" },
      { t: "Pessoa natural XIII", d: "27:23" },
      { t: "Pessoa natural XIV", d: "27:52" },
      { t: "Pessoa natural XV", d: "25:12" },
      { t: "Pessoa natural XVI", d: "17:13" },
      { t: "Direitos da Personalidade I", d: "27:13" },
      { t: "Direitos da Personalidade II", d: "29:16" },
      { t: "Direitos da Personalidade III", d: "22:04" },
      { t: "Direitos da Personalidade IV", d: "20:32" },
      { t: "Direitos da Personalidade V", d: "29:16" },
      { t: "Direitos da Personalidade VI", d: "29:48" },
      { t: "Direitos da Personalidade VII", d: "22:55" },
      { t: "Direitos da Personalidade VIII", d: "22:29" },
      { t: "Direitos da Personalidade IX", d: "28:30" },
      { t: "Direitos da Personalidade X", d: "29:28" },
      { t: "Direitos da Personalidade XI", d: "24:43" },
      { t: "Direitos da Personalidade XII", d: "27:22" },
      { t: "Pessoa Jurídica I", d: "26:06" },
      { t: "Pessoa Jurídica II", d: "28:46" },
      { t: "Pessoa Jurídica III", d: "25:38" },
      { t: "Pessoa Jurídica IV", d: "23:15" },
      { t: "Pessoa Jurídica V", d: "29:24" },
      { t: "Pessoa Jurídica VI", d: "28:40" },
      { t: "Pessoa Jurídica VII", d: "27:33" },
      { t: "Pessoa Jurídica VIII", d: "23:52" },
      { t: "Domicílio/Residência. Bens I", d: "29:21" },
      { t: "Bens II", d: "27:49" },
      { t: "Bens III", d: "25:28" },
      { t: "Bens IV", d: "28:28" },
      { t: "Bens V", d: "26:43" },
      { t: "Bens VI", d: "26:28" },
      { t: "Bens VII", d: "29:28" },
      { t: "Bens VIII", d: "28:58" },
      { t: "Bens IX", d: "27:28" },
      { t: "Bens X", d: "27:26" },
      { t: "Bens XI", d: "32:53" },
      { t: "Ato/Fato/Negócio Jurídico I", d: "29:07" },
      { t: "Ato/Fato/Negócio Jurídico II", d: "29:11" },
      { t: "Ato/Fato/Negócio Jurídico III", d: "29:26" },
      { t: "Ato/Fato/Negócio Jurídico IV", d: "29:09" },
      { t: "Ato/Fato/Negócio Jurídico V", d: "26:20" },
      { t: "Ato/Fato/Negócio Jurídico VI", d: "25:22" },
      { t: "Ato/Fato/Negócio Jurídico VII", d: "27:33" },
      { t: "Ato/Fato/Negócio Jurídico VIII", d: "27:56" },
      { t: "Ato/Fato/Negócio Jurídico IX", d: "27:32" },
      { t: "Ato/Fato/Negócio Jurídico X", d: "27:12" },
      { t: "Ato/Fato/Negócio Jurídico XI", d: "26:46" },
      { t: "Ato/Fato/Negócio Jurídico XII", d: "28:39" },
      { t: "Ato/Fato/Negócio Jurídico XIII", d: "26:59" },
      { t: "Ato/Fato/Negócio Jurídico XIV", d: "25:45" },
      { t: "Prescrição e Decadência I", d: "28:06" },
      { t: "Prescrição e Decadência II", d: "25:32" },
      { t: "Prescrição e Decadência III", d: "21:47" },
      { h: "Direito das Obrigações" },
      { t: "Introdução ao direito das obrigações", d: "29:56" },
      { t: "Teoria dualista das obrigações (Brinz)", d: "24:37" },
      { t: "Responsabilidade patrimonial do devedor", d: "27:23" },
      { t: "Classificação das obrigações", d: "28:58" },
      { t: "Obrigações de dar coisa incerta I", d: "07:17" },
      { t: "Obrigações de dar coisa incerta II", d: "20:06" },
      { t: "Modalidades obrigacionais", d: "18:20" },
      { t: "Obrigações objetivamente compostas", d: "30:04" },
      { t: "Obrigações divisíveis e indivisíveis", d: "22:26" },
      { t: "Obrigações solidárias I", d: "30:01" },
      { t: "Obrigações solidárias II", d: "30:00" },
      { t: "Transmissão das obrigações I", d: "29:58" },
      { t: "Transmissão das obrigações II", d: "25:06" },
      { t: "Adimplemento e inadimplemento das obrigações", d: "28:09" },
      { t: "Termo inicial dos juros e correção monetária", d: "29:35" },
      { t: "Cláusula penal e arras ou sinal", d: "19:44" },
      { h: "Direito dos Contratos: Teoria geral dos Contratos" },
      { t: "Conceito e formação dos contratos I", d: "11:54" },
      { t: "Conceito e formação dos contratos II", d: "20:00" },
      { t: "Classificação dos contratos I", d: "29:55" },
      { t: "Classificação dos contratos II", d: "16:09" },
      { t: "Classificação dos contratos III", d: "19:53" },
      { t: "Princípios contratuais clássicos", d: "22:46" },
      { t: "Princípio da boa-fé objetiva", d: "27:03" },
      { t: "Princípio da função social I", d: "16:05" },
      { t: "Princípio da função social II", d: "15:56" },
      { t: "Formas Contratuais", d: "29:57" },
      { t: "Estipulação em favor de terceiros", d: "29:55" },
      { t: "Vícios Redibitórios", d: "27:58" },
      { t: "Evicção", d: "19:39" },
      { t: "Revisão dos contratos e extinção dos contratos", d: "29:54" },
      { t: "Exceções dos contratos. Teoria do inadimplemento antecipado", d: "20:27" },
      { t: "Teoria do inadimplemento antecipado", d: "16:55" },
      { h: "Direito dos Contratos: Contratos em Espécie" },
      { t: "Contrato de compra e venda e permuta", d: "29:59" },
      { t: "Modalidades de compra e venda", d: "26:53" },
      { t: "Doação I", d: "24:09" },
      { t: "Doação II", d: "28:35" },
      { t: "Contrato estimatório", d: "29:59" },
      { t: "Locação", d: "29:56" },
      { t: "Empréstimo: Contrato de comodato", d: "23:47" },
      { t: "Empréstimo: Contrato de mútuo", d: "27:44" },
      { t: "Prestação de serviço", d: "22:12" },
      { t: "Contrato de empreitada", d: "25:13" },
      { t: "Contrato de depósito", d: "24:30" },
      { t: "Contrato de mandato", d: "24:33" },
      { t: "Contrato de transportes", d: "27:22" },
      { t: "Contrato de Seguro", d: "20:41" },
      { t: "Contrato de Fiança", d: "23:47" },
      { t: "Contrato de Fiança na Jurisprudência", d: "25:28" },
      { t: "Transação e compromisso", d: "24:29" },
      { t: "Jogo e aposta", d: "25:03" },
      { t: "Atos unilaterais", d: "19:21" },
      { h: "Direito das Coisas" },
      { t: "Introdução", d: "27:08" },
      { t: "Posse", d: "29:57" },
      { t: "Detenção I", d: "22:59" },
      { t: "Detenção II", d: "21:12" },
      { t: "Classificação da posse e tutela possessória", d: "28:11" },
      { t: "Direito de Propriedade I", d: "28:47" },
      { t: "Direito de Propriedade II", d: "23:41" },
      { t: "Usucapião I", d: "26:06" },
      { t: "Usucapião II", d: "25:07" },
      { t: "Direitos de Vizinhança I", d: "29:59" },
      { t: "Direitos de Vizinhança II", d: "29:57" },
      { t: "Do condomínio", d: "29:14" },
      { t: "Direitos reais sobre coisa alheia", d: "22:31" },
      { t: "Servidão predial", d: "17:53" },
      { t: "Usufruto. Uso. Habitação", d: "25:05" },
      { t: "Direitos reais de garantia I", d: "29:59" },
      { t: "Direitos reais de garantia II", d: "29:58" },
      { t: "Direitos reais de garantia III", d: "21:25" },
      { h: "Responsabilidade Civil" },
      { t: "Disposições gerais e classificação da responsabilidade Civil", d: "29:57" },
      { t: "Elementos da responsabilidade civil", d: "21:06" },
      { t: "Dano ou prejuízo", d: "18:23" },
      { t: "Lucro da intervenção e perda de uma chance", d: "26:37" },
      { t: "Responsabilidade pelo fato de terceiro, do dono do edifício e dono do animal I", d: "09:52" },
      { t: "Responsabilidade pelo fato de terceiro, do dono do edifício e dono do animal II", d: "21:10" },
      { t: "Responsabilidade civil médica e por fraudes bancárias", d: "29:58" },
      { h: "Direito das Famílias" },
      { t: "Direito de família", d: "29:28" },
      { t: "Causas impeditivas e suspensivas do casamento", d: "23:13" },
      { t: "Invalidades do casamento", d: "21:34" },
      { t: "Causas de nulidade relativa do casamento", d: "28:09" },
      { t: "União estável", d: "29:58" },
      { t: "Formalidades do casamento", d: "27:07" },
      { t: "Efeitos do casamento", d: "22:07" },
      { t: "Regime de bens I", d: "30:01" },
      { t: "Regime de bens II", d: "30:02" },
      { t: "Regime de bens III", d: "26:36" },
      { t: "Parentesco I", d: "28:24" },
      { t: "Parentesco II", d: "26:31" },
      { t: "Alimentos", d: "30:04" },
      { t: "Direito de família assistencial I", d: "29:13" },
      { t: "Direito de família assistencial II", d: "29:29" },
      { t: "Direito de família assistencial III", d: "24:08" },
      { h: "Direito das Sucessões" },
      { t: "Abertura da Sucessão", d: "21:43" },
      { t: "Atos dos sucessores", d: "27:45" },
      { t: "Sucessão hereditária", d: "25:54" },
      { t: "Excluídos da sucessão", d: "26:40" },
      { t: "Sucessão legítima. Ordem de vocação hereditária I", d: "29:57" },
      { t: "Ordem de vocação hereditária II", d: "28:03" },
      { t: "Ordem de vocação hereditária III", d: "29:52" },
      { t: "Sucessão testamentária", d: "29:36" },
      { t: "Disposições testamentárias", d: "28:21" },
      { t: "Direito de acrescer entre herdeiros e legatários", d: "20:36" },
      { t: "Substituições testamentárias", d: "25:28" },
      { t: "Revogação do testamento I", d: "23:05" },
      { t: "Revogação do testamento II", d: "18:15" },
      { t: "Inventário e partilha I", d: "30:01" },
      { t: "Inventário e partilha II", d: "29:55" },
      { t: "Inventário e partilha III", d: "27:56" },
      { t: "Temas especiais", d: "18:19" },
    ],
  },
  {
    id: "cur_ppcivil",
    nome: "Direito Processual Civil",
    itens: [
      { h: "I. Teoria Geral do Processo" },
      { t: "Aula 1. Evolução da doutrina processual", d: "46min" },
      { t: "Aula 2. Jurisdição: conceito e características", d: "42min" },
      { t: "Aula 3 - Jurisdição - princípios (parte I)", d: "28min" },
      { t: "Aula 4 - Jurisdição - princípios (parte II)", d: "33min" },
      { t: "Aula 5 - Jurisdição - espécies", d: "10min" },
      { t: "Aula 6 - Jurisdição e Justiça Multiportas", d: "36min" },
      { t: "Aula 7 - Ação - conceito e teorias", d: "30min" },
      { t: "Aula 8 - Ação - Condições da ação - Interesse Processual", d: "21min" },
      { t: "Aula 9 - Ação - Condições da ação - Legitimidade", d: "20min" },
      { t: "Aula 10 - Ação - Elementos da Ação", d: "19min" },
      { t: "Aula 11 - Processo - Conceito", d: "6min" },
      { t: "Aula 12 - Processo - princípios (parte I)", d: "42min" },
      { t: "Aula 13 - Processo - princípios (parte II)", d: "20min" },
      { t: "Aula 14 - Processo - princípios (parte III)", d: "20min" },
      { t: "Aula 15 - Processo - princípios (parte IV)", d: "37min" },
      { t: "Aula 16 - Processo - princípios (parte V)", d: "10min" },
      { t: "Aula 17 - Processo - princípios (parte VI)", d: "10min" },
      { t: "Aula 18 - Processo - pressupostos processuais", d: "23min" },
      { h: "II - Limites da Jurisdição Nacional" },
      { t: "Aula 19 - Limites da Jurisdição Nacional (parte I)", d: "21min" },
      { t: "Aula 20 - Limites da Jurisdição Nacional (parte II)", d: "22min" },
      { h: "III - Cooperação Jurídica Internacional" },
      { t: "Aula 21 - Cooperação Jurídica Internacional (parte I)", d: "22min" },
      { t: "Aula 22 - Cooperação Jurídica Internacional (parte II)", d: "20min" },
      { h: "IV - Competência" },
      { t: "Aula 23 - Competência - disposições gerais", d: "34min" },
      { t: "Aula 24 - Competência - disposições gerais e competência territorial (parte I)", d: "22min" },
      { t: "Aula 25 - Competência - competência territorial (parte II)", d: "24min" },
      { t: "Aula 26 - Competência - competência territorial (parte III)", d: "24min" },
      { t: "Aula 27 - Competência - conexão", d: "24min" },
      { t: "Aula 28 - Competência - continência", d: "9min" },
      { t: "Aula 29 - Competência - eleição de foro", d: "21min" },
      { t: "Aula 30 - Competência - incompetência absoluta", d: "17min" },
      { t: "Aula 31 - Competência - incompetência relativa", d: "14min" },
      { t: "Aula 32 - Competência - conflito de competência", d: "13min" },
      { h: "V - Cooperação Nacional" },
      { t: "Aula 33 - Cooperação Judiciária Nacional (parte I)", d: "15min" },
      { t: "Aula 34 - Cooperação Judiciária Nacional (parte II)", d: "15min" },
      { h: "VI - Sujeitos Processuais" },
      { t: "Aula 35 - Sujeitos Processuais - capacidade de ser parte", d: "18min" },
      { t: "Aula 36 - Sujeitos Processuais - capacidade processual", d: "16min" },
      { t: "Aula 37 - Sujeitos Processuais - capacidade processual e curador especial", d: "28min" },
      { t: "Aula 38 - Sujeitos Processuais - capacidade processual e pessoas casadas", d: "15min" },
      { t: "Aula 39 - Sujeitos Processuais - capacidade processual e representação das PJs e das pessoas formais", d: "30min" },
      { t: "Aula 40 - Sujeitos Processuais - capacidade postulatória", d: "6min" },
      { h: "VII - Deveres e Responsabilidades" },
      { t: "Aula 41 - Atos atentatórios à dignidade da justiça", d: "22min" },
      { t: "Aula 42 - Litigância de má-fé", d: "16min" },
      { h: "VIII - Honorários Advocatícios" },
      { t: "Aula 43 - Honorários (parte I)", d: "27min" },
      { t: "Aula 44 - Honorários (parte II)", d: "22min" },
      { t: "Aula 45 - Honorários (parte III)", d: "19min" },
      { t: "Aula 46 - Honorários (parte IV)", d: "21min" },
      { t: "Aula 47 - Honorários (parte V)", d: "25min" },
      { h: "IX - Gratuidade da Justiça" },
      { t: "Aula 48 - Gratuidade da Justiça (parte I)", d: "24min" },
      { t: "Aula 49 - Gratuidade da Justiça (parte II)", d: "41min" },
      { t: "Aula 50 - Gratuidade da Justiça (parte III)", d: "19min" },
      { h: "X - Litisconsórcio" },
      { t: "Aula 51 - Litisconsórcio (parte I)", d: "35min" },
      { t: "Aula 52 - Litisconsórcio (parte II)", d: "25min" },
      { t: "Aula 53 - Litisconsórcio (parte III)", d: "18min" },
      { h: "XI - Intervenção de Terceiros" },
      { t: "Aula 54 - Assistência (parte I)", d: "14min" },
      { t: "Aula 55 - Assistência (parte II)", d: "20min" },
      { t: "Aula 56 - Assistência (parte III)", d: "14min" },
      { t: "Aula 57 - Denunciação da Lide (parte I)", d: "26min" },
      { t: "Aula 58 - Denunciação da Lide (parte II)", d: "30min" },
      { t: "Aula 59 - Chamamento ao Processo", d: "10min" },
      { t: "Aula 60 - IDPJ (parte I)", d: "19min" },
      { t: "Aula 61 - IDPJ (parte II)", d: "29min" },
      { t: "Aula 62 - Amicus Curiae (parte I)", d: "15min" },
      { t: "Aula 63 - Amicus Curiae (parte II)", d: "18min" },
      { h: "XII - Do Juiz" },
      { t: "Aula 64 - Juiz (parte I)", d: "15min" },
      { t: "Aula 65 - Juiz (parte II)", d: "30min" },
      { t: "Aula 66 - Juiz (parte III)", d: "14min" },
      { t: "Aula 67 - Juiz (parte IV)", d: "33min" },
      { t: "Aula 68 - Juiz (parte V)", d: "40min" },
      { t: "Aula 69 - Juiz (parte VI)", d: "17min" },
      { t: "Aula 70 - Juiz (parte VII)", d: "22min" },
      { h: "XIII - Do Ministério Público" },
      { t: "Aula 71 - Ministério Público (parte I)", d: "21min" },
      { t: "Aula 72 - Ministério Público (parte I)", d: "21min" },
      { h: "XIV - Advocacia Pública" },
      { t: "Aula 73 - Advocacia Pública", d: "30min" },
      { h: "XV - Defensoria Pública" },
      { t: "Aula 74 - Defensoria Pública", d: "18min" },
      { h: "XVI - Atos Processuais" },
      { t: "Aula 75 - Atos Processuais (forma e publicidade)", d: "28min" },
      { t: "Aula 76 - Atos Processuais (negócios jurídicos)", d: "26min" },
      { t: "Aula 77 - Atos Processuais (calendário processual)", d: "10min" },
      { t: "Aula 78 - Atos Processuais (atos das partes)", d: "10min" },
      { t: "Aula 79 - Atos Processuais (atos do juiz)", d: "27min" },
      { t: "Aula 80 - Atos Processuais (tempo e lugar dos atos)", d: "27min" },
      { t: "Aula 81 - Atos Processuais (prazos I)", d: "35min" },
      { t: "Aula 82 - Atos Processuais (prazos II)", d: "27min" },
      { t: "Aula 83 - Atos Processuais (prazos III)", d: "39min" },
      { t: "Aula 84 - Atos Processuais (prazos IV)", d: "19min" },
      { t: "Aula 85 - Atos Processuais (citação I)", d: "28min" },
      { t: "Aula 86 - Atos Processuais (citação II)", d: "28min" },
      { t: "Aula 87 - Atos Processuais (citação III)", d: "15min" },
      { t: "Aula 88 - Atos Processuais (citação IV)", d: "33min" },
      { t: "Aula 89 - Atos Processuais (citação V)", d: "16min" },
      { t: "Aula 90 - Atos Processuais (citação VI)", d: "12min" },
      { t: "Aula 91 - Atos Processuais (citação VII)", d: "31min" },
      { t: "Aula 92 - Atos Processuais (intimações I)", d: "29min" },
      { t: "Aula 93 - Atos Processuais (intimações II)", d: "36min" },
      { t: "Aula 94 - Atos Processuais (intimações III)", d: "13min" },
      { t: "Aula 95 - Atos Processuais (nulidades)", d: "29min" },
      { t: "Aula 96 - Atos Processuais (distribuição e registro I)", d: "23min" },
      { t: "Aula 97 - Atos Processuais (distribuição e registro II)", d: "22min" },
      { t: "Aula 98 - Atos Processuais (valor da causa I)", d: "15min" },
      { t: "Aula 99 - Atos Processuais (valor da causa II)", d: "23min" },
      { h: "XVII - Tutelas Provisórias" },
      { t: "Aula 100 - Tutelas Provisórias (disposições gerais)", d: "31min" },
      { t: "Aula 101 - Tutelas Provisórias (tutelas de urgência - disposições gerais I)", d: "26min" },
      { t: "Aula 102 - Tutelas Provisórias (tutelas de urgência - disposições gerais II)", d: "30min" },
      { t: "Aula 103 - Tutelas Provisórias (tutelas de urgência - antecipada)", d: "30min" },
      { t: "Aula 104 - Tutelas Provisórias (tutelas de urgência - cautelar)", d: "28min" },
      { t: "Aula 105 - Tutelas Provisórias (tutela da evidência)", d: "17min" },
      { h: "XVIII - Formação, Suspensão e Extinção do Processo" },
      { t: "Aula 106 - Formação do Processo", d: "7min" },
      { t: "Aula 107 - Suspensão do Processo (parte I)", d: "24min" },
      { t: "Aula 108 - Suspensão do Processo (parte II)", d: "44min" },
      { t: "Aula 109 - Extinção do Processo", d: "2min" },
      { h: "XIX - Procedimento Comum" },
      { t: "Aula 110 - Petição Inicial - requisitos e emenda", d: "26min" },
      { t: "Aula 111 - Pedidos (parte I)", d: "21min" },
      { t: "Aula 112 - Pedidos (parte II)", d: "20min" },
      { t: "Aula 113 - Pedidos (parte III)", d: "19min" },
      { t: "Aula 114 - Indeferimento da inicial", d: "27min" },
      { t: "Aula 115 - Improcedência liminar do pedido", d: "14min" },
      { t: "Aula 116 - Audiência de concliação ou mediação", d: "24min" },
      { t: "Aula 117 - Contestação (parte I)", d: "22min" },
      { t: "Aula 118 - Contestação (parte II)", d: "30min" },
      { t: "Aula 119 - Contestação (parte III)", d: "38min" },
      { t: "Aula 120 - Reconvenção (parte I)", d: "31min" },
      { t: "Aula 121 - Reconvenção (parte II)", d: "24min" },
      { t: "Aula 122 - Revelia (parte I)", d: "25min" },
      { t: "Aula 123 - Revelia (parte II)", d: "25min" },
      { t: "Aula 124 - Providências Preliminares", d: "20min" },
      { t: "Aula 125 - Julgamento conforme o estado do processo (extinção do processo e julgamento antecipado)", d: "39min" },
      { t: "Aula 126 - Julgamento conforme o estado do processo (saneamento e organização)", d: "25min" },
      { t: "Aula 127 - Audiência de Instrução e Julgamento (parte I)", d: "17min" },
      { t: "Aula 128 - Audiência de Instrução e Julgamento (parte II)", d: "35min" },
      { t: "Aula 129 - Teoria Geral da Prova (parte I)", d: "23min" },
      { t: "Aula 130 - Teoria Geral da Prova (parte II)", d: "13min" },
      { t: "Aula 131 - Teoria Geral da Prova (parte III)", d: "25min" },
      { t: "Aula 132 - Teoria Geral da Prova (parte IV)", d: "20min" },
      { t: "Aula 133 - Teoria Geral da Prova (parte V)", d: "20min" },
      { t: "Aula 134 - Teoria Geral da Prova (parte VI)", d: "18min" },
      { t: "Aula 135 - Ata Notarial", d: "10min" },
      { t: "Aula 136 - Depoimento Pessoal", d: "35min" },
      { t: "Aula 137 - Confissão", d: "24min" },
      { t: "Aula 138 - Exibição de Doc. ou Coisa (parte I)", d: "18min" },
      { t: "Aula 139 - Exibição de Doc. ou Coisa (parte II)", d: "11min" },
      { t: "Aula 140 - Exibição de Doc. ou Coisa (parte III)", d: "12min" },
      { t: "Aula 141 - Prova Documental (parte I)", d: "16min" },
      { t: "Aula 142 - Prova Documental (parte II)", d: "28min" },
      { t: "Aula 143 - Prova Documental (parte III)", d: "37min" },
      { t: "Aula 144 - Prova Documental (parte IV)", d: "17min" },
      { t: "Aula 145 - Prova Documental (parte V)", d: "23min" },
      { t: "Aula 146 - Prova Testemunhal (parte I)", d: "29min" },
      { t: "Aula 147 - Prova Testemunhal (parte II)", d: "21min" },
      { t: "Aula 148 - Prova Testemunhal (parte III)", d: "25min" },
      { t: "Aula 149 - Prova Pericial (parte I)", d: "27min" },
      { t: "Aula 150 - Prova Pericial (parte II)", d: "27min" },
      { t: "Aula 151 - Prova Pericial (parte III)", d: "23min" },
      { t: "Aula 152 - Inspeção Judicial", d: "8min" },
      { t: "Aula 153 - Sentença (parte I)", d: "28min" },
      { t: "Aula 154 - Sentença (parte II)", d: "26min" },
      { t: "Aula 155 - Sentença (parte III)", d: "16min" },
      { t: "Aula 156 - Sentença (parte IV)", d: "37min" },
      { t: "Aula 157 - Sentença (parte V)", d: "19min" },
      { t: "Aula 158 - Sentença (parte VI)", d: "29min" },
      { t: "Aula 159 - Sentença (parte VII)", d: "27min" },
      { t: "Aula 160 - Sentença (parte VIII)", d: "13min" },
      { t: "Aula 161 - Sentença (parte IX)", d: "12min" },
      { t: "Aula 162 - Sentença (parte X)", d: "26min" },
      { t: "Aula 163 - Coisa Julgada (parte I)", d: "26min" },
      { t: "Aula 164 - Coisa Julgada (parte II)", d: "32min" },
      { t: "Aula 165 - Coisa Julgada (parte III)", d: "32min" },
      { t: "Aula 166 - Coisa Julgada (parte IV)", d: "15min" },
      { t: "Aula 167 - Liquidação de Sentença (parte I)", d: "21min" },
      { t: "Aula 168 - Liquidação de Sentença (parte II)", d: "28min" },
      { t: "Aula 169 - Cumprimento de Sentença - Disposições Gerais (parte I)", d: "16min" },
      { t: "Aula 170 - Cumprimento de Sentença - Disposições Gerais (parte II)", d: "28min" },
      { t: "Aula 171 - Cumprimento de Sentença - Disposições Gerais (parte III)", d: "25min" },
      { h: "XX - Liquidação e Cumprimento de Sentença" },
      { t: "Aula 167 - Liquidação de Sentença (parte I)", d: "21min" },
      { t: "Aula 168 - Liquidação de Sentença (parte II)", d: "28min" },
      { t: "Aula 169 - Cumprimento de Sentença - Disposições Gerais (parte I)", d: "16min" },
      { t: "Aula 170 - Cumprimento de Sentença - Disposições Gerais (parte II)", d: "28min" },
      { t: "Aula 171 - Cumprimento de Sentença - Disposições Gerais (parte III)", d: "25min" },
      { t: "Aula 172 - Cumprimento Provisório de Sentença (parte I)", d: "15min" },
      { t: "Aula 173 - Cumprimento Provisório de Sentença (parte II)", d: "28min" },
      { t: "Aula 174 - Cumprimento Definitivo Sentença - Pagar", d: "28min" },
      { t: "Aula 175 - Impugnação ao Cumprimento de Sentença (parte I)", d: "28min" },
      { t: "Aula 176 - Impugnação ao Cumprimento de Sentença (parte II)", d: "16min" },
      { t: "Aula 177 - Impugnação ao Cumprimento de Sentença (parte III)", d: "35min" },
      { t: "Aula 178 - Impugnação ao Cumprimento de Sentença (parte IV)", d: "24min" },
      { t: "Aula 179 - Cumprimento Espontâneo da Sentença", d: "7min" },
      { t: "Aula 180 - Cumprimento de Sentença - Alimentos (parte I)", d: "14min" },
      { t: "Aula 181 - Cumprimento de Sentença - Alimentos (parte II)", d: "29min" },
      { t: "Aula 182 - Cumprimento de Sentença - Alimentos (parte III)", d: "22min" },
      { t: "Aula 183 - Cumprimento de Sentença - Alimentos (parte IV)", d: "20min" },
      { t: "Aula 184 - Cumprimento de Sentença - Alimentos (parte V)", d: "26min" },
      { t: "Aula 185 - Cumprimento de Sentença contra a Fazenda (parte I)", d: "33min" },
      { t: "Aula 186 - Cumprimento de Sentença contra a Fazenda (parte II)", d: "24min" },
      { t: "Aula 187 - Cumprimento de Sentença contra a Fazenda (parte III)", d: "26min" },
      { t: "Aula 188 - Cumprimento de Sentença - Fazer e Não Fazer (parte I)", d: "14min" },
      { t: "Aula 189 - Cumprimento de Sentença - Fazer e Não Fazer (parte II)", d: "46min" },
      { t: "Aula 190 - Cumprimento de Sentença - Entregar", d: "6min" },
      { h: "XXI - Procedimentos Especiais" },
      { t: "Aula 191 - Consignação em Pagamento (parte I)", d: "19min" },
      { t: "Aula 192 - Consignação em Pagamento (parte II)", d: "28min" },
      { t: "Aula 193 - Exigir Contas (parte I)", d: "19min" },
      { t: "Aula 194 - Exigir Contas (parte iI)", d: "40min" },
      { t: "Aula 195 - Ações Possessórias (parte I)", d: "41min" },
      { t: "Aula 196 - Ações Possessórias (parte II)", d: "20min" },
      { t: "Aula 197 - Ações Possessórias (parte III)", d: "26min" },
      { t: "Aula 198 - Embargos de Terceiro (parte I)", d: "25min" },
      { t: "Aula 199 - Embargos de Terceiro (parte II)", d: "34min" },
      { t: "Aula 200 - Embargos de Terceiro (parte III)", d: "46min" },
      { t: "Aula 201 - Oposição", d: "27min" },
      { t: "Aula 202 - Habilitação (parte I)", d: "16min" },
      { t: "Aula 203 - Habilitação (parte II)", d: "16min" },
      { t: "Aula 204 - Ações de Família", d: "38min" },
      { t: "Aula 205 - Ação Monitória (parte II)", d: "20min" },
      { t: "Aula 206 - Ação Monitória (parte II)", d: "24min" },
      { t: "Aula 207 - Ação Monitória (parte III)", d: "29min" },
      { t: "Aula 208 - Divórcio e Separação Consensuais, Extinção Consensual de União Estável e Alteração do Regime de Bens do Matrimônio", d: "17min" },
      { t: "Aula 209 - Interdição", d: "48min" },
      { h: "XXII - Processo de Execução" },
      { t: "Aula 210 - Princípios da Execução (parte I)", d: "27min" },
      { t: "Aula 211 - Princípios da Execução (parte II)", d: "31min" },
      { t: "Aula 212 - Legitimidade ativa", d: "21min" },
      { t: "Aula 213 - Legitimidade passiva", d: "13min" },
      { t: "Aula 214 - Competência", d: "18min" },
      { t: "Aula 215 - Títulos Executivos Extrajudiciais (parte I)", d: "23min" },
      { t: "Aula 216 - Títulos Executivos Extrajudiciais (parte II)", d: "40min" },
      { t: "Aula 217 - Fraude à Execução (parte I)", d: "12min" },
      { t: "Aula 218 - Fraude à Execução (parte II)", d: "27min" },
      { t: "Aula 219 - Fraude à Execução (parte III)", d: "35min" },
      { t: "Aula 220 - Diversas Espécies de Execução - Disposições Gerais", d: "33min" },
      { t: "Aula 221 - Execução de Entregar Coisa", d: "26min" },
      { t: "Aula 222 - Execução de Fazer e Não Fazer", d: "25min" },
      { t: "Aula 223 - Execução de Pagar - disposições gerais (parte I)", d: "17min" },
      { t: "Aula 224 - Execução de Pagar - disposições gerais (parte II)", d: "42min" },
      { t: "Aula 225 - Penhora - disposições gerais e impenhorabilidades (parte I)", d: "16min" },
      { t: "Aula 226 - Penhora - impenhorabilidades (parte II)", d: "34min" },
      { t: "Aula 227 - Penhora - impenhorabilidades (parte III)", d: "20min" },
      { t: "Aula 228 - Penhora - impenhorabilidades (parte IV)", d: "21min" },
      { t: "Aula 229 - Penhora - ordem de preferência", d: "32min" },
      { t: "Aula 230 - Penhora - bens irrisórios, documentação, etc. (parte I)", d: "22min" },
      { t: "Aula 231 - Penhora - bens irrisórios, documentação, etc. (parte II)", d: "23min" },
      { t: "Aula 232 - Penhora - registro, substituição, etc.", d: "36min" },
      { t: "Aula 233 - Penhora - redução, ampliação, renovação, etc.", d: "13min" },
      { t: "Aula 234 - Penhora - Siisbajud", d: "30min" },
      { t: "Aula 235 - Penhora de créditos", d: "14min" },
      { t: "Aula 236 - Penhora de quotas ou ações", d: "39min" },
      { t: "Aula 237 - Penhora de % de faturamento de empresa", d: "19min" },
      { t: "Aula 238 - Execução de Título Extrajudicial contra a Fazenda", d: "17min" },
      { t: "Aula 239 - Execução de Título Extrajudicial - Alimentos", d: "10min" },
      { t: "Aula 240 - Embargos à Execução (parte I)", d: "21min" },
      { t: "Aula 241 - Embargos à Execução (parte II)", d: "26min" },
      { t: "Aula 242 - Embargos à Execução (parte III)", d: "16min" },
      { t: "Aula 243 - Embargos à Execução (parte IV)", d: "25min" },
      { t: "Aula 244 - Exceção de pré-executividade (parte I)", d: "12min" },
      { t: "Aula 245 - Exceção de pré-executividade (parte II)", d: "14min" },
      { t: "Aula 246 - Exceção de pré-executividade (parte III)", d: "19min" },
      { t: "Aula 247 - Suspensão da Execução", d: "9min" },
      { t: "Aula 248 - Prescrição Intercorrente (parte I)", d: "18min" },
      { t: "Aula 249 - Prescrição Intercorrente (parte II)", d: "29min" },
      { t: "Aula 250 - Extinção da Execução", d: "4min" },
      { h: "XXIII - Processos nos Tribunais" },
      { t: "Aula 251 - Técnica de Ampliação do Colegiado (parte I)", d: "27min" },
      { t: "Aula 252 - Técnica de Ampliação do Colegiado (parte II)", d: "11min" },
      { t: "Aula 253 - Técnica de Ampliação do Colegiado (parte III)", d: "26min" },
      { t: "Aula 254 - Incidente de Assunção de Competência", d: "30min" },
      { t: "Aula 255 - Conflito de Competência (parte I)", d: "24min" },
      { t: "Aula 256 - Conflito de Competência (parte II)", d: "27min" },
      { t: "Aula 257 - Ação Rescisória (parte I)", d: "31min" },
      { t: "Aula 258 - Ação Rescisória (parte II)", d: "18min" },
      { t: "Aula 259 - Ação Rescisória (parte III)", d: "31min" },
      { t: "Aula 260 - Ação Rescisória (parte IV)", d: "25min" },
      { t: "Aula 261 - Ação Rescisória (parte V)", d: "35min" },
      { t: "Aula 262 - Ação Rescisória (parte VI)", d: "23min" },
      { t: "Aula 263 - Ação Rescisória (parte VII)", d: "16min" },
      { t: "Aula 264 - Ação Rescisória (parte VIII)", d: "20min" },
      { t: "Aula 265 - Incidente de Resolução de Demandas Repetitivas (parte I)", d: "21min" },
      { t: "Aula 266 - Incidente de Resolução de Demandas Repetitivas (parte II)", d: "31min" },
      { t: "Aula 267 - Incidente de Resolução de Demandas Repetitivas (parte III)", d: "32min" },
      { t: "Aula 268 - Reclamação (parte I)", d: "26min" },
      { t: "Aula 269 - Reclamação (parte II)", d: "36min" },
      { t: "Aula 270 - Reclamação (parte III)", d: "27min" },
      { h: "XXIV - Recursos" },
      { t: "Aula 271 - Teoria Geral - Introdução", d: "25min" },
      { t: "Aula 272 - Teoria Geral - Princípios (parte I)", d: "21min" },
      { t: "Aula 273 - Teoria Geral - Princípios (parte II)", d: "28min" },
      { t: "Aula 274 - Teoria Geral - Princípios (parte III)", d: "17min" },
      { t: "Aula 275 - Teoria Geral - Princípios (parte IV)", d: "20min" },
      { t: "Aula 276 - Teoria Geral - Princípios (parte V)", d: "25min" },
      { t: "Aula 277 - Teoria Geral - Efeitos (parte I)", d: "33min" },
      { t: "Aula 278 - Teoria Geral - Efeitos (parte II)", d: "17min" },
      { t: "Aula 279 - Teoria Geral - Efeitos (parte III)", d: "25min" },
      { t: "Aula 280 - Teoria Geral - Efeitos (parte IV)", d: "21min" },
      { t: "Aula 281 - Teoria Geral - Efeitos (parte V)", d: "29min" },
      { t: "Aula 282 - Teoria Geral - Efeitos (parte VI)", d: "17min" },
      { t: "Aula 283 - Teoria Geral - Pressupostos de admissibilidade (parte I)", d: "22min" },
      { t: "Aula 284 - Teoria Geral - Pressupostos de admissibilidade (parte II)", d: "21min" },
      { t: "Aula 285 - Teoria Geral - Pressupostos de admissibilidade (parte III)", d: "31min" },
      { t: "Aula 286 - Teoria Geral - Pressupostos de admissibilidade (parte IV)", d: "34min" },
      { t: "Aula 287 - Teoria Geral - Pressupostos de admissibilidade (parte V)", d: "24min" },
      { t: "Aula 288 - Teoria Geral - Pressupostos de admissibilidade (parte VI)", d: "28min" },
      { t: "Aula 289 - Teoria Geral - Recurso Adesivo (parte I)", d: "27min" },
      { t: "Aula 290 - Teoria Geral - Recurso Adesivo (parte II)", d: "16min" },
      { t: "Aula 291 - Apelação (parte I)", d: "38min" },
      { t: "Aula 292 - Apelação (parte II)", d: "27min" },
      { t: "Aula 293 - Apelação (parte III)", d: "34min" },
      { t: "Aula 294 - Apelação (parte IV)", d: "21min" },
      { t: "Aula 295 - Apelação (parte V)", d: "12min" },
      { t: "Aula 296 - Agravo de Instrumento (parte I)", d: "23min" },
      { t: "Aula 297 - Agravo de Instrumento (parte II)", d: "40min" },
      { t: "Aula 298 - Agravo de Instrumento (parte III)", d: "27min" },
      { t: "Aula 299 - Agravo Interno (parte I)", d: "16min" },
      { t: "Aula 300 - Agravo Interno (parte II)", d: "27min" },
      { t: "Aula 301 - Agravo Interno (parte III)", d: "29min" },
      { t: "Aula 302 - Embargos de Declaração (parte I)", d: "19min" },
      { t: "Aula 303 - Embargos de Declaração (parte II)", d: "30min" },
      { t: "Aula 304 - Embargos de Declaração (parte III)", d: "26min" },
      { t: "Aula 305 - Embargos de Declaração (parte IV)", d: "14min" },
    ],
  },
  {
    id: "cur_penal",
    nome: "Direito Penal",
    itens: expandBlocos(PENAL_TOPICS),
  },
  {
    id: "cur_ppenal",
    nome: "Direito Processual Penal",
    itens: expandBlocos(PPENAL_TOPICS),
  },
  {
    id: "cur_cdc",
    nome: "Direito do Consumidor",
    itens: [
      { h: "CÓDIGO DE DEFESA DO CONSUMIDOR EM TABELAS" },
      { t: "CAPÍTULO I - Disposições Gerais" },
      { t: "CAPÍTULO II - Da Política Nacional de Relações de Consumo" },
      { t: "CAPÍTULO III - Dos Direitos Básicos do Consumidor" },
      { t: "CAPÍTULO IV - Da Qualidade de Produtos e Serviços, da Prevenção e da Reparação dos Danos" },
      { t: "CAPÍTULO V - Das Práticas Comerciais" },
      { t: "CAPÍTULO VI - Da Proteção Contratual" },
      { t: "CAPÍTULO VI-A - Da Prevenção e do Tratamento do Superendividamento" },
      { t: "CAPÍTULO VII - Das Sanções Administrativas" },
      { t: "TÍTULO II - Das Infrações Penais" },
      { t: "TÍTULO III - Da Defesa do Consumidor em Juízo" },
      { t: "CAPÍTULO II - Das Ações Coletivas Para a Defesa de Interesses Individuais Homogêneos" },
      { t: "CAPÍTULO III - Das Ações de Responsabilidade do Fornecedor de Produtos e Serviços" },
      { t: "CAPÍTULO IV - Da Coisa Julgada" },
      { t: "CAPÍTULO V - Da Conciliação no Superendividamento" },
    ],
  },
  {
    id: "cur_penesp",
    nome: "Leis Penais e Processuais Penais Especiais",
    itens: [
      "Lei de Abuso de Autoridade (Lei 13.869/2019)", "Lei do Racismo (Lei 7.716/1989)", "Lei dos Juizados Especiais Criminais (Lei 9.099/1995)",
      "Lei de Lavagem de Dinheiro (Lei 9.613/1998)", "Lei de Organização Criminosa (Lei 12.850/2013)", "Lei de Drogas (Lei 11.343/2006)",
      "Lei Maria da Penha (Lei 11.340/2006)", "Lei Henry Borel (Lei 14.344/2022)", "Estatuto do Desarmamento (Lei 10.826/2003)",
      "Lei das Interceptações Telefônicas (Lei 9.296/1996)", "Lei dos Crimes Hediondos (Lei 8.072/1990)", "Lei de Tortura (Lei 9.455/1997)",
      "Lei de Identificação Criminal (Lei 12.037/2009)", "Lei dos Crimes Ambientais (Lei 9.605/1998)", "Crimes no CTB (Lei 9.503/1997)",
      "Crimes Eleitorais (Lei 4.737/1965)", "Crimes contra a Ordem Tributária (Lei 8.137/1990)", "Lei dos Crimes contra o Sistema Financeiro (Lei 7.492/1986)",
      "Lei das Contravenções Penais (Decreto-Lei 3.688/1941)", "Lei Geral do Esporte (Lei 14.597/2023)", "Lei de Transplante (Lei 9.434/1997)",
      "Lei de Biossegurança (Lei 11.105/2005)", "Estatuto do Índio (Lei 6.001/1973)", "Lei de Terrorismo (Lei 13.260/2016)",
      "Crimes na Lei Brasileira de Inclusão da PcD (Lei 13.146/2015)", "Lei de Proteção a Vítimas e Testemunhas (Lei 9.807/1999)",
      "Lei do Parcelamento do Solo Urbano (Lei 6.766/1979)", "Lei do Genocídio (Lei 2.889/1956)", "Crimes no ECA (Lei 8.069/1990)",
      "Crimes contra a Propriedade Intelectual (Lei 9.609/1998)", "Crimes contra as Relações de Consumo (Lei 8.078/1990)",
      "Crimes no Estatuto do Idoso (Lei 10.741/2003)", "Crimes Falimentares (Lei 11.101/2005)",
    ],
  },
];
function expandBlocos(topics) {
  return topics.flatMap(([label, n]) =>
    n === 1 ? [`${label} (Bloco único)`] : Array.from({ length: n }, (_, i) => `${label} (Bloco ${i + 1})`)
  );
}


const CURSO_KEY_PREFIX = "tjsc-cursos-isolados:";
const EDITAIS_KEY_PREFIX = "tjsc-editais:";
const PRIORIDADES_KEY = "tjsc-prioridades:list";
const SIM_MANUAIS_KEY = "tjsc-simulados-manuais:list";

// ---------- Editais verticalizados (dados injetados pelo build) ----------
const EDITAIS = [{"id": "tjsc-juiz-2025", "nome": "TJSC · Juiz 2025 (FGV)", "materias": [{"nome": "DIREITO CIVIL", "itens": [{"n": "1.", "txt": "Lei de Introdução às Normas do Direito Brasileiro."}, {"n": "2.", "txt": "Sistema do Código Civil. Princípios gerais do Direito. Unidade sistemática e pluralidade de fontes. Codificação e constitucionalização das relações interprivadas."}, {"n": "3.", "txt": "Direito subjetivo. Direito potestativo. Faculdade jurídica. Direitos imprescritíveis. Relação jurídica e situações jurídicas. Situações subjetivas existenciais e situações subjetivas patrimoniais."}, {"n": "4.", "txt": "Das pessoas naturais. Da personalidade e da capacidade. Dos direitos de personalidade. Da ausência. Da personalidade jurídica. Liberdade, autonomia e novas tecnologias. Teorias da desconsideração da personalidade jurídica. Do domicílio."}, {"n": "5.", "txt": "Dos Bens. Bens considerados em si mesmos. Móveis e imóveis. Fungíveis e consumíveis. Divisíveis. Singulares e coletivos. Bens reciprocamente considerados. Principais e acessórios. Benfeitorias e sua classificação. Bens públicos. Distinção dos particulares."}, {"n": "6.", "txt": "Dos Fatos jurídicos. Teoria Geral do negócio jurídico. Prova. Negócios jurídicos: conceito, pressupostos e elementos de existência, requisitos de validade; classificações. Inexistência, invalidade e ineficácia. Interpretação dos atos e negócios jurídicos. Defeitos dos atos e negócios jurídicos. Erro. Dolo. Coação. Estado de perigo. Lesão. Fraude contra credores. Invalidade do negócio jurídico. Negócio nulo. Condições de nulidade. Simulação. Negócio anulável. Condições de anulabilidade. Convalidação. Requisitos. Prova dos fatos jurídicos. Interesse público e estrutura do negócio jurídico. A função negocial nas relações jurídicas contemporâneas. “Lei da Usura” (Decreto nº 22.626/1933)."}, {"n": "7.", "txt": "Dos atos jurídicos lícitos e dos atos jurídicos ilícitos. Requisitos de configuração do ato ilícito. Excludentes do ato ilícito."}, {"n": "8.", "txt": "Prescrição e decadência. Regime jurídico do Código Civil. Disposições gerais. Prescrição. Exceção, renúncia, oportunidade de alegação, reconhecimento ex officio e iniciativa do interessado. Interrupção e suspensão da prescrição. Fato com origem criminal. Termo legal da prescrição. Solidariedade. Aproveitamento da prescrição. Condições. Prazos de prescrição. Decadência. Legal e convencional. Renúncia. Prazos de decadência."}, {"n": "9.", "txt": "Das Obrigações. Modalidades. Obrigações de dar. Obrigações de fazer e não fazer. Obrigações alternativas, divisíveis e indivisíveis. Obrigações solidárias. Solidariedade ativa e passiva. Transmissão das obrigações. Adimplemento, inadimplemento e extinção das obrigações. Mora."}, {"n": "10.", "txt": "Contratos em geral. Normas gerais. Extinção do contrato. Tendências atuais do direito contratual. Autonomia da vontade. Intervenção do Estado e a função social do contrato. Contrato e propriedade. Pós-eficácia contratual. Lei de Liberdade Econômica (Lei nº 13.874/2019)."}, {"n": "11.", "txt": "Formação dos contratos, estipulação em favor de terceiro, promessa de fato de terceiro, vícios redibitórios, evicção, contratos aleatórios, contrato preliminar, contrato com pessoa a declarar. Teoria da boa-fé objetiva. Extinção do contrato. Distrato. Cláusula resolutiva. Exceção do contrato não cumprido. Revisão contratual. Teorias subjetivas e objetivas. Imprevisão. Resolução por onerosidade excessiva. Teoria da base do negócio jurídico."}, {"n": "12.", "txt": "Classificação dos contratos: unilaterais e bilaterais; típicos, atípicos e mistos; consensuais e reais; gratuitos e onerosos; cumulativos e aleatórios; contratos solenes e não solenes; contratos personalíssimos; contratos preliminares. Contrato com pessoa a nomear. Gestão de negócios. Distinções e semelhanças do regime jurídico-contratual entre ‘civil law’ e ‘common law’."}, {"n": "13.", "txt": "Contratos em espécie (típicos): Compra e venda. Troca ou permuta. Contrato estimatório. Doação. Locação de coisas. Fiança. Empréstimo. Comodato. Mútuo. Prestação de serviço. Empreitada. Depósito. Mandato. Comissão. Agência e Distribuição. Corretagem. Transporte. Seguro. Constituição de renda. Transação. Contratos atípicos. Contratos agrários. Parceria e arrendamento."}, {"n": "14.", "txt": "Atos Unilaterais. Promessa de recompensa. Gestão de negócios. Pagamento indevido. Enriquecimento sem causa."}, {"n": "15.", "txt": "Da responsabilidade civil e da obrigação de indenizar. Do novo direito de danos e os reflexos na imputação e no nexo causal."}, {"n": "16.", "txt": "Da posse. Conceito e classificação. Detenção. Aquisição. Efeitos e perda. Composse e defesa dos direitos possessórios. Posse justa, violenta, clandestina e precária. Posse de boa-fé. Constituto possessório. Aquisição, efeitos, desforço próprio. Direitos do possuidor de boa-fé. Obrigações e direitos do possuidor de má-fé. Exceptio proprietatis. Perda da posse."}, {"n": "17.", "txt": "Da propriedade. Função social da propriedade. Aquisição da propriedade imóvel. Modos de aquisição a título originário e derivado. Aquisição da propriedade móvel. Tradição. Perda da propriedade. Direitos de vizinhança. Superfície. Servidões. Usufruto. Uso e Habitação. Direito do promitente comprador. Penhor. Hipoteca. Anticrese. Alienação fiduciária. Proteção possessória. Usucapião. Espécies e requisitos."}, {"n": "18.", "txt": "Direito das famílias. Direitos pessoais. Casamento. Formas, pressupostos, capacidade, impedimentos, causas suspensivas, celebração, provas, nulidade, anulabilidade e eficácia. Dissolução do casamento. Dissolução da sociedade conjugal e do vínculo matrimonial. Formas, causas, hipóteses de impossibilidade de vida em comum. Separação, divórcio e proteção da pessoa dos filhos. Direito Parental. Relação de parentesco, filiação, reconhecimento dos filhos, adoção, poder familiar e bem de família. Investigação de paternidade. Fundamentos biologistas e bases socioafetivas da filiação e do parentesco. Filiação matrimonial. Filiação havida fora do casamento. Posse de estado de filho. Filiação e descendência genética. Guarda compartilhada (Lei nº 13.058/2014). Direito Protetivo. Tutela e Curatela. Medidas protetivas à violência doméstica e familiar (Lei nº 11.340/2006)."}, {"n": "19.", "txt": "Direito das famílias. Direitos pessoais. Da União Estável e do Concubinato. União estável. Conceito, condições, impedimentos, deveres, causas suspensivas do casamento e a união estável, regime patrimonial. Concubinato. Conceito e reconhecimento judicial. Da União Homoafetiva."}, {"n": "20.", "txt": "Direito das Família. Direitos patrimoniais. Regimes de bens no casamento, usufruto e administração dos bens dos filhos menores. Alimentos. Conceito, abrangência, finalidade, pressupostos, critérios e características da obrigação. Bem de família."}, {"n": "21.", "txt": "Do Direito das Sucessões. Da sucessão em geral. Herança e administração. Vocação hereditária. Aceitação e renúncia. Exclusão da sucessão. Herança jacente. Petição de herança. Sucessão legítima. Ordem de vocação hereditária. Herdeiros necessários. Direito de representação. Sucessão testamentária. Testamento em geral. Capacidade de testar. Testamentos público, cerrado e particular. Codicilo. Legados e sua caducidade. Testamentos especiais. Direito de acrescer entre herdeiros e legatários. Substituições. Deserdação. Redução das disposições testamentárias. Revogação e rompimento do testamento. Inventário e partilha. Sonegados. Pagamento de dívidas. Colação de bens. Garantia dos quinhões hereditários. Anulação de partilha. Das disposições finais e transitórias do Código Civil Brasileiro, artigos 2.028 a 2.046."}, {"n": "22.", "txt": "Registros Públicos. Lei nº 6.015, de 31 de dezembro de 1973 (Provimento nº 149/2023 do Conselho Nacional de Justiça). Natureza dos serviços. Delegação. Fé pública. Lei nº 8.935/94. Registro de imóveis. Princípios de regência do registro imobiliário. Atos sujeitos a registro. Averbações. Registro de Títulos e Documentos. Atos sujeitos a registro. Sociedades religiosas e partidos políticos. Competência para registro dos atos constitutivos e estatutos. Registro Civil das Pessoas Naturais. Atos sujeitos a registro. Tabelionatos de Notas e Tabelionatos de Protestos Cambiais. Competência dos titulares."}, {"n": "23.", "txt": "Da alienação fiduciária (Decreto-Lei nº 911, de 1º de outubro de 1969). Lei nº 9.514, de 20 de novembro de 1997. Do condomínio em edificações e as incorporações imobiliárias (Lei nº 4.591, de 16 de dezembro de 1964), Lei nº 10.931, de 2 de agosto de 2004. Do Estatuto do Idoso (Lei nº 10.741, de 1º de outubro de 2003). Da locação de imóveis urbanos (Lei nº 8.245, de 18 de outubro de 1991). Estatuto da Pessoa com Deficiência (Lei nº 13.146/2015). Lei nº 14.382/2022. Regime Jurídico Emergencial e Transitório das relações jurídicas de Direito Privado (Lei nº 14.010/2020). Resolução CNJ nº 452, de 22/4/2022. Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018). Marco Civil da Internet (Lei nº 12.965/2014). Lei Federal de Parcelamento do Solo Urbano nº 6.766/1979. Lei Estadual nº", "subs": [{"n": "17.492", "txt": "/2018."}]}]}, {"nome": "DIREITO PROCESSUAL CIVIL", "itens": [{"n": "1.", "txt": "Direito material e direito processual. Normas processuais fundamentais. Boa-fé, eficiência e colaboração processual. Direito processual e Constituição. Acesso à Justiça. Lesão e ameaça a direito. Instrumentalidade, efetividade, adequação, tempestividade e eficiência da tutela jurisdicional. Princípio de economia processual. Garantia da duração razoável do processo. Meios adequados de resolução de conflitos. Conciliação e mediação. Arbitragem. Aplicação das normas processuais."}, {"n": "2.", "txt": "Jurisdição e competência. Conceito. Características. Espécies. Escopos. Critérios. Limites. Princípios. Cooperação internacional. Incompetência absoluta e relativa e meios de suscitação. Modificação da competência. Prevenção. Prorrogação. Perpetuação. Cooperação nacional. Atos de concertação. Produção de prova única nos litígios de massa."}, {"n": "3.", "txt": "Ação: conceito, natureza jurídica, teorias, condições, identificação e Classificação. Processo: conceito, natureza jurídica, teorias. Pressupostos processuais."}, {"n": "4.", "txt": "Sujeitos do processo. Partes e capacidade processual. Deveres processuais e responsabilidade. Litigância de má-fé e atos atentatórios à dignidade da justiça. Despesas processuais, honorários de sucumbência, multas e gratuidade da justiça. Sucessão e substituição. Curador especial. Procuradores. Litisconsórcio: modalidades, poderes e limitação. Intervenção de terceiros: espécies, características. Assistência simples e litisconsorcial. Denunciação da lide. Chamamento ao processo. Incidente de desconsideração da personalidade jurídica. Amicus Curiae. Juiz: poderes, deveres e responsabilidades. Impedimento e suspeição. Auxiliares da Justiça. Carreiras essenciais à administração da Justiça. Ministério Público. Advocacia Pública. Defensoria Pública."}, {"n": "5.", "txt": "Atos processuais: conceito, classificação, forma. Negócio jurídico processual e convenção processual. Calendário processual. Prática de atos processuais no processo eletrônico. Atos das partes. Preclusão temporal, lógica e consumativa. Atos do juiz. Preclusão pro judicato. Tempo, lugar e comunicação dos atos processuais. Prazos. Citações e intimações. Teoria da aparência. Citação real e ficta. Contumácia. Invalidades processuais. Mera irregularidade. Anulabilidade. Nulidade. Vícios processuais sanáveis e insanáveis. Distribuição e registro. Valor da causa."}, {"n": "6.", "txt": "Tutelas provisórias. Aspectos gerais. Poder geral de tutela. Tutelas de urgência. Tutela cautelar e tutela antecipada: cabimento, fungibilidade, momento, requisitos, procedimentalização. Estabilização da tutela antecipada requerida em caráter antecedente. Modalidades de tutela urgente antecipada na forma específica: tutela inibitória e tutela de remoção do ilícito. Tutela de evidência: cabimento, requisitos, procedimentalização. Distribuição do tempo do processo."}, {"n": "7.", "txt": "Procedimento comum. Formação, suspensão e extinção do Processo. Elementos da demanda. Petição inicial: requisitos, alteração, aditamento, emenda, inépcia e indeferimento. Improcedência liminar do pedido. Recursos. Retratação. Teoria da aparência. Audiência de conciliação ou de mediação."}, {"n": "8.", "txt": "Resposta: conceito, espécies. Contestação. Reconvenção. Revelia. Providências preliminares. Julgamento conforme o estado do processo. Extinção do processo. Julgamento antecipado do mérito. Julgamento antecipado parcial do mérito. Saneamento e organização do processo. Delimitação das questões e requerimento de esclarecimentos. Saneamento compartilhado."}, {"n": "9.", "txt": "Provas: conceito e disposições gerais. Relevância e admissibilidade. Prova direta e indireta. Presunções e máximas de experiência. Ônus e dever probatório. Distribuição estática e distribuição dinâmica. Inversão. Poderes probatórios do juiz. Prova ilícita. Regras de exclusão e regras de privilégio. Provas típicas e atípicas. Prova estatística nas demandas coletivas. Prova e tutela inibitória. Produção da prova e produção antecipada da prova. Valoração da prova. Sistema do convencimento motivado. Standards de prova. Audiência de instrução e julgamento."}, {"n": "10.", "txt": "Sentença: conceito, disposições gerais, classificação e elementos. Racionalidade. Fundamentação analítica. Interpretação e argumentação jurídica na sentença. Justificação das consequências da decisão judicial (LINDB). Interpretação da decisão judicial. Efeitos. Regra da congruência. Julgamento das ações relativas às prestações de fazer, de não fazer e de entregar coisa e as formas de tutela específica. Remessa obrigatória. Coisa julgada: conceito; espécies; limites; eficácias negativa, positiva e preclusiva; relativização. O deduzido e o dedutível. Coisa julgada sobre questão. Sentenças autossuficientes e sentenças não autossuficientes. Liquidação de sentença."}, {"n": "11.", "txt": "Cumprimento de Sentença: disposições gerais. Cumprimento de sentença que reconheça a exigibilidade de obrigação: (a) de pagar quantia certa; (b) de prestar alimentos, provisórios ou definitivos; (c) de pagar quantia certa pela Fazenda Pública; (d) de fazer, de não fazer e de entregar coisa. Defesa. Cumprimento de sentença provisório e definitivo."}, {"n": "12.", "txt": "Procedimentos especiais do CPC/15: ação de consignação em pagamento, ação de exigir contas, ações possessórias, inventário e partilha, ações de família, embargos de terceiro, oposição, habilitação, ação monitória, da homologação do penhor legal; da regulação de avaria grossa; restauração de autos."}, {"n": "13.", "txt": "Procedimentos de jurisdição voluntária: disposições gerais. Notificação e interpelação, alienação judicial. Divórcio e separação consensuais, extinção consensual de união estável e alteração do regime de bens do matrimônio. Testamentos e codicilos. Herança jacente. Bens dos ausentes. Coisas vagas. Interdição e tutela. Organização e fiscalização das fundações."}, {"n": "14.", "txt": "Processo de execução: disposições gerais, partes, competência, requisitos. Títulos executivos. Responsabilidade patrimonial. Espécies de execução. Execução para entrega de coisa. Execução das obrigações de fazer e não fazer. Execução por quantia certa. Execução contra a fazenda pública. Execução de alimentos. Embargos à execução. Suspensão e extinção do processo de execução."}, {"n": "15.", "txt": "Da ordem dos processos nos Tribunais e competência originária: disposições gerais. Incidentes de assunção de competência, de arguição de inconstitucionalidade e de resolução de demandas repetitivas. Conflito de competência. Homologação de sentença estrangeira e concessão de exequatur a carta rogatória. Ação rescisória. Incidente de resolução de demandas repetitivas. Reclamação."}, {"n": "16.", "txt": "Recursos: conceito, natureza jurídica, classificação, normas fundamentais, efeitos. Juízo de admissibilidade e juízo de mérito. Sucedâneos recursais. Ações autônomas de impugnação. Precedentes (ratio decidendi, obiter dictum, formação, vinculação, distinção e superação). Distinguishing e overruling. Recomendação nº 134 do Conselho Nacional de Justiça. Súmulas. Súmulas vinculantes. Papel das Cortes Superiores. Recursos em espécie: apelação, agravo de instrumento, embargos de declaração, agravo interno, recurso ordinário, recurso especial, recurso extraordinário. Repercussão geral em recurso extraordinário. Recursos extraordinário e especial repetitivos e seu julgamento. Agravo em recurso especial e em recurso extraordinário. Embargos de divergência. Técnica de julgamento não unânime."}, {"n": "17.", "txt": "Código de Processo Civil (Lei nº 13.105/2015 e suas alterações). Procedimentos especiais previstos na legislação extravagante. Doutrina processual e legislação processual esparsa e suas alterações (independentemente de indicação específica do diploma legal, mas notadamente a respeito do indicado) sobre: bem de família (Lei nº 8.009/1990 e suas alterações); prescrição das ações contra a Fazenda Pública (Decreto nº 20.910/1932 e Decreto-lei nº 4.597/1942); assistência judiciária (Lei nº", "subs": [{"n": "1.060", "txt": "/1950 e suas alterações); execução fiscal (Lei nº 6.830/1980 e suas alterações); divórcio, separação e união estável (Lei nº 6.515/1977 e suas alterações e Lei nº 9.278/1996); proteção do consumidor (Lei nº 8.078/1990) e suas alterações; desapropriação (Decreto-Lei nº 3.365/1941 e suas alterações); registros públicos (Lei nº 6.015/1973 e suas alterações, Provimento nº 149/2023 do Conselho Nacional de Justiça; mandado de segurança (Lei nº 12.016/2009); ação popular e ação civil pública (Lei nº"}, {"n": "4.717", "txt": "/1965 e suas alterações, Lei nº 7.347/1985 e suas alterações e Lei nº 8.429/1992 e suas alterações); habeas data (Lei nº 9.507/1997); alimentos (Lei nº 5.478/1968 e suas alterações e Lei nº"}, {"n": "11.804", "txt": "/2008); investigação de paternidade (Lei nº 8.560/1992 e suas alterações); habeas corpus cível; usucapião; Juizados Especiais Estadual e Federal (Lei nº 9.099/1995 e suas alterações e Lei nº"}, {"n": "10.259", "txt": "/2001 e suas alterações) e Juizado Especial da Fazenda Pública (Lei nº 12.153/2009); informatização do processo judicial (Lei nº 11.419/2006); medidas cautelares e tutela antecipada contra o Poder Público/Fazenda Pública e suspensão de liminares (Lei nº 8.437/1992 e suas alterações e Lei nº"}, {"n": "9.494", "txt": "/1997 e suas alterações); edição, revisão e cancelamento de enunciado de súmula vinculante pelo Supremo Tribunal Federal (Lei nº 11.417/2006); mediação e autocomposição de conflitos (Lei nº"}, {"n": "13.140", "txt": "/2015). Reflexos da Lei nº 13.105/2015 e suas alterações na legislação processual esparsa. Lei de Introdução às Normas do Direito Brasileiro (Lei nº 13.655/2018). Lei de Arbitragem (Lei nº 9.307/1996 e alterações – Lei nº 13.129/2015). Lei nº 14.538/2023."}]}]}, {"nome": "DIREITO DO CONSUMIDOR", "itens": [{"n": "1.", "txt": "Fundamentos Constitucionais e infraconstitucionais do Direito do Consumidor. Campo de Aplicação do Código de Defesa do Consumidor (CDC)."}, {"n": "2.", "txt": "Relação de Consumo. Conceitos de consumidor, fornecedor, produto e serviço. Correntes e posicionamento do STJ."}, {"n": "3.", "txt": "Principiologia e Direitos Básicos no CDC. Boa-fé objetiva. Inversão do ônus da prova."}, {"n": "4.", "txt": "Responsabilidade pelo fato e do produto e do serviço no CDC. Responsabilidade pelo Vício do produto e do serviço no CDC. Prazos. Garantia Contratual e Legal. Decadência e Prescrição. Desconsideração da Personalidade Jurídica no CDC."}, {"n": "5.", "txt": "Oferta e Publicidade. Práticas Comerciais Abusivas. Cobrança de Dívidas e cadastros de Inadimplentes. Contratação no comércio eletrônico – Decreto nº 7.962, de 15 de março de 2013."}, {"n": "6.", "txt": "Proteção Contratual no CDC. Cláusulas Abusivas. Contratos de Adesão. Financiamentos. Ações de revisão de contrato. Prevenção e tratamento do superenvidamento."}, {"n": "7.", "txt": "Sanções administrativas. O Sistema Nacional de Defesa do Consumidor."}, {"n": "8.", "txt": "Defesa dos Direitos do Consumidor em Juízo. Ações Coletivas para defesa de interesses difusos, coletivos e individuais homogêneos em matéria de consumo. Conciliação no superendividamento."}, {"n": "9.", "txt": "Lei do Cadastro Positivo e seu regulamento (Lei nº 12.414/2011 e Decreto nº 9.936/2019)."}, {"n": "10.", "txt": "Regulamento Geral de Direitos do Consumidor de Serviços de Telecomunicações (Resolução nº 632 ANATEL, de 7 de março de 2014)."}, {"n": "11.", "txt": "Regras de Prestação do Serviço Público de Distribuição de Energia Elétrica (Resolução Normativa ANEEL nº 1.000, de 7 de dezembro de 2021)."}, {"n": "12.", "txt": "Lei dos planos e seguros privados de assistência à saúde (Lei nº 9.656/1998)."}, {"n": "13.", "txt": "Jurisprudência, precedentes e súmulas do STF e do STJ em matéria de direito do consumidor."}]}, {"nome": "DIREITO DA CRIANÇA E DO ADOLESCENTE", "itens": [{"n": "1.", "txt": "Constituição Federal de 1988. Proteção integral e prioridade absoluta dos direitos da Infância e Juventude."}, {"n": "2.", "txt": "Estatuto da Criança e do Adolescente (Lei nº 8.069/1990 e suas alterações). Lei do SINASE (Sistema Nacional de Atendimento Socioeducativo) (Lei nº 12.594/2012)."}, {"n": "3.", "txt": "Autorização de viagem. Resolução CNJ nº 295 de 13/09/2019."}, {"n": "4.", "txt": "Sistema de Garantia dos Direitos da Criança e do Adolescente."}, {"n": "5.", "txt": "Atos Normativos referentes à criança e ao adolescente do Conselho Nacional de Justiça."}, {"n": "6.", "txt": "Normativa Internacional: Declaração Universal dos Direitos da Criança, Convenção das Nações Unidas sobre os Direitos da Criança e do Adolescente, Convenção de Haia sobre Cooperação em Matéria de Adoção, Regras Mínimas sobre Administração da Justiça da Infância e da Juventude (Regras de Beijing)."}, {"n": "7.", "txt": "Lei Orgânica da Assistência Social - LOAS (Lei nº 8.742/1993, com as alterações da Lei nº", "subs": [{"n": "12.435", "txt": "/2011). Política Nacional de Assistência Social (Resolução do Conselho Nacional de Assistência Social nº 145/04 – D.O.U. 28.10.2004). Tipificação Nacional dos Serviços Socioassistenciais (Resolução do Conselho Nacional se Assistência Social nº 109/09 – D.O.U. 25.11.2009). Resolução CNJ nº 165/2012 e suas alterações. Recomendação CNJ nº 98/2021. Resolução CONANDA nº 169/2014."}]}, {"n": "8.", "txt": "Resoluções nº 113, de 19.04.06 e nº 117, de 11.07.06, ambas do Conselho Nacional dos Direitos da Criança e do Adolescente (CONANDA), que dispõem sobre os parâmetros para a institucionalização e fortalecimento do Sistema de Garantia dos Direitos da Criança e do Adolescente."}, {"n": "9.", "txt": "Proteção e direitos das crianças e adolescentes com transtornos mentais (Lei nº 10.216/2001)."}, {"n": "10.", "txt": "Lei nº 13.431/2017 e Decreto nº 9.603/2018- Sistema de garantia de direitos da criança e do adolescente vítima ou testemunha de violência."}, {"n": "11.", "txt": "Lei nº 14.344/2022 – cria mecanismos para a prevenção e o enfrentamento da violência doméstica e familiar contra a criança e o adolescente, nos termos do § 8º do art. 226 e do § 4º do art. 227 da Constituição Federal e das disposições específicas previstas em tratados, convenções ou acordos internacionais de que o Brasil seja parte."}, {"n": "12.", "txt": "Lei nº 13.257/2016 – Marco Legal da Primeira Infância."}, {"n": "13.", "txt": "Resolução CONANDA nº 231/2022 - Altera a Resolução nº 170, de 10 de dezembro de 2014 para dispor sobre o processo de escolha em data unificada em todo o território nacional dos membros do Conselho Tutelar."}]}, {"nome": "DIREITO PENAL", "itens": [{"n": "1.", "txt": "Direito Penal: conceito, funções e caracteres. Ciências Penais e disciplinas auxiliares;"}, {"n": "2.", "txt": "Escolas e tendências penais: escola clássica, escola positiva, escola crítica, escola moderna alemã, escola penal humanista, escola técnico-jurídica, escola correcionalista, movimento de defesa social;"}, {"n": "3.", "txt": "Principais fases da evolução epistemológica do Direito Penal: positivismo, neokantismo, finalismo e ontologismo do finalismo de Welzel, pós-finalismo: normativismo funcionalista. Direito Penal do Inimigo;"}, {"n": "4.", "txt": "Princípios Fundamentais do Direito Penal. Princípio da legalidade ou reserva legal. Princípio da dignidade da pessoa humana. Princípio da culpabilidade. Princípio da exclusiva proteção de bens jurídicos. Princípio da intervenção mínima e da fragmentariedade. Princípios da pessoalidade e da individualização da pena. Princípio da proporcionalidade. Princípio da humanidade. Princípio da adequação social. Princípio da insignificância;"}, {"n": "5.", "txt": "Bem Jurídico-Penal: Conceito e delimitação. Bem jurídico individual e transindividual. Objeto do crime. Bem jurídico e função;"}, {"n": "6.", "txt": "Teoria da lei penal. Fontes do Direito Penal: costume, jurisprudência e doutrina. Norma e lei penal: conceito e estrutura lógica da norma jurídico-penal. Lei penal em branco. Interpretação da lei penal. Aplicação da lei penal: argumento analógico, princípios gerais de direito e equidade."}, {"n": "7.", "txt": "Âmbito temporal da lei penal: irretroatividade e retroatividade da lei penal favorável. Lei excepcional ou temporária. Tempo do crime."}, {"n": "8.", "txt": "Âmbito espacial da lei penal. Princípios Fundamentais. Conceito de território nacional. Lugar do delito. Extraterritorialidade: imunidade diplomática e imunidade parlamentar. Extradição: conceito e espécies. Princípios e condições. Limitações à extradição. Deportação e expulsão."}, {"n": "9.", "txt": "Delito: conceito formal, material ou analítico. Classificação dos delitos: delito de resultado, delito de mera atividade ou conduta, delito qualificado pelo resultado, delito de lesão, delito de perigo abstrato e concreto, delito comum, especial (próprio e impróprio), delito de mão própria, delito unissubsistente, delito plurissubsistente, delito pluriofensivo, delito instantâneo, permanente e instantâneo de efeitos permanentes, delito de dano, delito comissivo, delito omissivo próprio (puro) e omissivo impróprios (ou comissivos por omissão, ou comissivos-omissivos), delitos unissubjetivo, delito plurissubjetivo (coletivo, de concurso necessário), delitos de ação única, delitos de ação múltipla ou de conteúdo variado, delito complexo, delito progressivo ou de passagem, delito habitual;"}, {"n": "10.", "txt": "Teorias da ação. Causas que excluem a ação e omissão. Relação de causalidade. Teorias. Superveniência de causa relativamente independente. Causação e imputação do resultado. Teorias. Estrutura do delito omissivo. Delito omissivo próprio. Delito omissivo impróprio;"}, {"n": "11.", "txt": "Tipicidade. Conceito de tipo. Tipicidade e ilicitude. Desvalor da ação, desvalor do resultado. Classificação estrutural dos tipos. Tipo de injusto de ação doloso: tipo objetivo e tipo subjetivo. Elemento subjetivo geral: o dolo. Elemento subjetivo do injusto (elemento subjetivo especial do tipo). Tipo de injusto de ação culposo. Conceito e elementos. Modalidades de culpa. Espécies de culpa. Princípio da confiança. Dolo eventual e culpa consciente. Erro de tipo. Conceito. Erro de tipo e erro de tipo permissivo. Erro de tipo escusável e inescusável. Erro acidental. Erro provocado por terceiro. Erro sobre o objeto. Erro na execução. Resultado diverso do pretendido;"}, {"n": "12.", "txt": "Ilicitude ou antijuridicidade. Causas de justificação. Estado de necessidade: conceito, fundamento e requisitos. Legítima defesa: conceito, fundamento e requisitos. Estrito cumprimento de dever legal: conceito, fundamento, requisitos. Colisão de deveres. Exercício Regular de direito: conceito, fundamento e requisitos. Consentimento do ofendido: conceito, funções, fundamento e requisito;"}, {"n": "13.", "txt": "Culpabilidade. Conceito. Evolução dogmática da culpabilidade. Conceito material de culpabilidade. Elementos da culpabilidade. Imputabilidade. Conceito. Causas de exclusão da imputabilidade. Imputabilidade diminuída. Embriaguez actio libera in causa. Consciência da ilicitude. Conceitos e teorias. Erro de proibição. Conceito e modalidades. Distinção entre erro de proibição e erro de tipo. Erro de proibição vencível e erro de proibição invencível. Exigibilidade de conduta diversa. Inexigibilidade. Hipóteses legais e supralegais de exculpação;"}, {"n": "14.", "txt": "Etapas da realização do delito: consumação e tentativa. Conceito e elementos. Fundamento da punibilidade da tentativa. Preparação e execução. Desistência voluntária e arrependimento eficaz. Arrependimento posterior. Crime impossível. Crime impossível e delito putativo. Intervenção predisposta de autoridade e atuação do agente provocador;"}, {"n": "15.", "txt": "Sujeitos do delito. Sujeito ativo e passivo. Responsabilidade penal da pessoa jurídica;"}, {"n": "16.", "txt": "Concurso de pessoas. Autoria e participação: teorias, requisitos e divisão. Autoria e coautoria: conceito de autor. Autoria colateral Participação: conceitos, elementos e espécies de participação. Punibilidade no concurso de pessoas. Circunstâncias incomunicáveis;"}, {"n": "17.", "txt": "Concurso de delitos. Unidade e Pluralidade delitiva. Sistemas. Concurso material ou real. Concurso formal ou ideal. Crime continuado. Multas no concurso de delitos;"}, {"n": "18.", "txt": "Teoria das Circunstâncias. Circunstâncias judiciais. Circunstâncias legais. Circunstâncias legais. Circunstâncias agravantes. Reincidência. Conceito e elementos da reincidência. Espécies e efeitos da reincidência. Agravantes no concurso de pessoas. Circunstâncias atenuantes. Causas de aumento e de diminuição de pena. Qualificadoras;"}, {"n": "19.", "txt": "Teorias da pena. Conceito. Espécies. Fundamentos e fins da pena. Teorias absolutas, relativas ou unitárias (ecléticas), Classificação das penas;"}, {"n": "20.", "txt": "Sistemas penitenciários;"}, {"n": "21.", "txt": "Princípios da Execução Penal: Princípio da legalidade; Princípio do devido processo legal; princípio da humanidade; princípio da jurisdicionalidade; princípios do contraditório e da ampla defesa; princípio da publicidade. Objeto e aplicação da Lei de Execução Penal: Do objeto da execução penal; da jurisdição do Juízo da Execução; dos presos provisórios, condenados pela Justiça Eleitoral ou Militar; delitos não atingidos pela sentença ou pela lei; a comunidade como ente colaborador. Classificação dos condenados: exame de personalidade e exame criminológico. Assistência: assistência material, assistência à saúde, assistência educacional, assistência social, assistência religiosa, assistência ao egresso. Trabalho: trabalho interno e externo. Deveres e direitos do preso. Disciplina: Faltas disciplinares, regime disciplinar diferenciado, sanções, aplicação das sanções e procedimento disciplinar;"}, {"n": "22.", "txt": "Órgãos da Execução Penal. Conselho Nacional de Política Criminal e Penitenciaria. Juízo da Execução. Ministério Público. Conselho Penitenciário. Departamentos penitenciários. Departamento Penitenciário Nacional. Departamento Penitenciário local. Direção administrativa e de pessoal dos estabelecimentos penais. Patronato. Conselho da Comunidade. Defensoria Pública;"}, {"n": "23.", "txt": "Estabelecimentos penais. Penitenciária. Colônia agrícola, industrial ou similar. Casa do albergado. Centro de Observação. Hospital de Custódia e Tratamento Psiquiátrico. Cadeia Pública;"}, {"n": "24.", "txt": "Penas privativas de liberdade e execução das penas em espécie: Reclusão e Detenção. Guia de recolhimento. Cálculo de liquidação e soma das penas. Superveniência de doença mental. Regimes. Soma e unificação de pena, detração, remição e fixação de regime. Progressão de regime: requisito objetivo e subjetivo, progressão nos crimes hediondos ou equiparados, regime aberto. Progressão por saltos. Regressão de regime. Monitoração eletrônica. Permissão de saída prisional. Saída temporária. Requisitos para a concessão da saída temporária. Condições legais de fiscalização. Prazo para saída temporária. Revogação da saída temporária. Remição. Contagem do tempo remido. Decisão judicial. Perda do tempo remido. Tempo remido e benefícios;"}, {"n": "25.", "txt": "Penas restritivas de direitos. Prestação pecuniária. Perda de bens e valores. Prestação de serviços à comunidade ou a entidades públicas. Interdição temporária de direitos: proibição do exercício de cargo, função ou atividade pública, bem como de mandado eletivo; proibição do exercício de profissão, atividade ou ofício que dependam de habilitação especial, de licença ou autorização do poder público; suspensão de autorização ou de habilitação para dirigir veículo; proibição de frequentar determinados lugares; proibição de inscrever-se em concurso, avaliação ou exames públicos. Limitação de fim de semana. Substituição. Conversão da pena na execução. Fiscalização e regras para execução;"}, {"n": "26.", "txt": "Pena de multa. Conceito. Natureza Jurídica. Sistemas de cominação de multa penal. Aplicação da pena de multa. Pagamento e parcelamento. Conversão e suspensão da pena de multa. Da prescrição da pena de multa na execução;"}, {"n": "27.", "txt": "Determinação da pena. Conceitos e sistemas. Individualização legal, judicial e executória. Fixação da pena. Fixação da pena privativa de liberdade. Fixação da pena de multa;"}, {"n": "28.", "txt": "Suspensão condicional da pena. Conceito e natureza jurídica. Sistemas. Requisitos. Espécies. Condições. Período de prova. Revogação. Prorrogação. Extinção. Competência;"}, {"n": "29.", "txt": "Livramento condicional. Requisitos de ordem objetiva e subjetiva. Concessão do livramento. Condições. Carta de livramento, cerimônia, caderneta e pecúlio. Revogação obrigatória e facultativa. Efeitos da revogação. Modificação das condições. Suspensão do livramento. Prorrogação do período de prova e extinção da pena;"}, {"n": "30.", "txt": "Medidas de Segurança. Conceito. Natureza jurídica. Pena e medida de segurança. Princípio da legalidade. Sistemas. Pressupostos de aplicação das medidas de segurança: prática de fato punível, periculosidade do autor, e ausência de imputabilidade plena. Espécies: internação em hospital de custódia e tratamento psiquiátrico, e tratamento ambulatorial. Locais de internação e tratamento. Duração das medidas de segurança. Exame de verificação da cessação de periculosidade. Desinternação ou liberação condicional. Medida de segurança substitutiva: semi-imputabilidade e superveniência de doença mental. Duração da medida de segurança substitutiva. Extinção da punibilidade e medidas de segurança. Direitos do internado;"}, {"n": "31.", "txt": "Processo e procedimento judicial na execução penal. Iniciativa. Procedimento. Videoconferência na execução penal. Agravo em execução;"}, {"n": "32.", "txt": "Conversões na execução. Incidentes de execução. Conversões: pena privativa de liberdade em penas restritivas de direito; penas restritivas de direito em pena privativa de liberdade; impossibilidade de conversão da pena de multa; pena privativa de liberdade em medidas de segurança. Tratamento ambulatorial em internação;"}, {"n": "33.", "txt": "Excesso ou desvio na execução. Legitimidade para suscitar o incidente;"}, {"n": "34.", "txt": "Efeitos da condenação. Conceito. Efeitos secundários penais. Efeitos secundários extrapenais: genéricos específicos. Reabilitação: conceito, condições, requisitos, efeitos e revogação;"}, {"n": "35.", "txt": "Condições objetivas da punibilidade. Definição e natureza jurídica. Enumeração e efeitos. Escusas absolutórias. Conceito e denominação. Natureza jurídica;"}, {"n": "36.", "txt": "Causas de extinção da punibilidade. Natureza jurídica e efeitos da extinção da punibilidade. Morte do agente. Anistia, graça e indulto. Abolitio criminis. Renúncia. Perdão do ofendido. Perdão judicial. Retratação. Decadência e perempção;"}, {"n": "37.", "txt": "Prescrição. Conceito e fundamentos. Os prazos de prescrição e sua contagem. Espécies. Suspensão e interrupção da prescrição;"}, {"n": "38.", "txt": "Dos crimes contra a pessoa;"}, {"n": "39.", "txt": "Dos crimes contra o patrimônio;"}, {"n": "40.", "txt": "Dos crimes contra a propriedade imaterial;"}, {"n": "41.", "txt": "Dos crimes contra a organização do trabalho;"}, {"n": "42.", "txt": "Dos crimes contra o sentimento religioso e contra o respeito aos mortos;"}, {"n": "43.", "txt": "Dos crimes contra a dignidade sexual;"}, {"n": "44.", "txt": "Dos crimes contra a família;"}, {"n": "45.", "txt": "Dos crimes contra a incolumidade pública;"}, {"n": "46.", "txt": "Dos crimes contra a paz pública;"}, {"n": "47.", "txt": "Dos crimes contra a fé pública e delitos das fraudes em certames de interesse público;"}, {"n": "48.", "txt": "Dos crimes contra a administração pública;"}, {"n": "49.", "txt": "Dos crimes contra o estado democrático de direito;"}, {"n": "50.", "txt": "Dos crimes previstos na Lei Antidrogas (Lei nº 11.343/2006 e suas alterações);"}, {"n": "51.", "txt": "Dos crimes referentes à violência doméstica e familiar (Lei nº 11.340/2006 e suas alterações);"}, {"n": "52.", "txt": "Dos crimes previstos na Lei nº 9.263/1996 e suas alterações (planejamento familiar);"}, {"n": "53.", "txt": "Dos crimes previstos no Estatuto do Desarmamento (Lei nº 10.826/2003 e suas alterações);"}, {"n": "54.", "txt": "Dos crimes hediondos (Lei nº 8.072/1990 e suas alterações);"}, {"n": "55.", "txt": "Dos crimes de tortura (Lei nº 9.455/1997 e suas alterações);"}, {"n": "56.", "txt": "Dos crimes de discriminação na relação jurídica de trabalho (Lei nº 9.029/1995);"}, {"n": "57.", "txt": "Dos crimes relativos a preconceito (Leis nº 7.716/1989 e suas alterações e nº 9.459/1997);"}, {"n": "58.", "txt": "Dos crimes eleitorais (Lei nº 4.737/1965 e suas alterações);"}, {"n": "59.", "txt": "Dos crimes previstos no Estatuto do Idoso (Lei nº 10.471/2003 e suas alterações);"}, {"n": "60.", "txt": "Dos crimes previstos no Estatuto da Criança e do Adolescente (Lei nº 8.069/1990 e suas alterações);"}, {"n": "61.", "txt": "Dos crimes de interceptação das comunicações telefônicas (Lei nº 9.296/1996);"}, {"n": "62.", "txt": "Dos crimes de trânsito (Lei nº 9.503/1997 e suas alterações);"}, {"n": "63.", "txt": "Dos crimes de propriedade intelectual de programa de computador (Lei nº 9.609/1998);"}, {"n": "64.", "txt": "Dos crimes contra o meio ambiente (Lei nº 9.605/1998 e suas alterações);"}, {"n": "65.", "txt": "Dos crimes de biossegurança (Lei nº 11.105/2005);"}, {"n": "66.", "txt": "Dos crimes de transplante de órgãos (Lei nº 9.434/1997 e suas alterações);"}, {"n": "67.", "txt": "Dos crimes do Estatuto do Índio (Lei nº 6.001/1973 e suas alterações);"}, {"n": "68.", "txt": "Dos crimes contra a ordem tributária, econômica e relações de consumo (Leis nº 8.137/1990 e suas alterações e nº 8.176/1991);"}, {"n": "69.", "txt": "Dos crimes previstos no Código de Defesa do Consumidor (Lei nº 8.078/1990 e suas alterações);"}, {"n": "70.", "txt": "Dos crimes de lavagem de capitais (Lei nº 9.613/1998 e suas alterações);"}, {"n": "71.", "txt": "Das disposições penais em relação à prevenção e repressão de organizações criminosas (Lei nº", "subs": [{"n": "12.850", "txt": "/2013 e suas alterações);"}]}, {"n": "72.", "txt": "Dos crimes de Licitações Públicas (Lei nº 14.133/2021);"}, {"n": "73.", "txt": "Dos crimes de responsabilidade penal dos Prefeitos e Vereadores (Decreto-Lei nº 201/1967 e suas alterações);"}, {"n": "74.", "txt": "Crimes falimentares (Lei nº 11.101/2005 e suas alterações);"}, {"n": "75.", "txt": "Crimes de propriedade intelectual (Lei nº 9.279/1996 e suas alterações);"}, {"n": "76.", "txt": "Dos Crimes previstos na Lei Geral do Esporte (Lei nº 14.597/2023);"}, {"n": "77.", "txt": "Lei de Abuso de Autoridade (Lei nº 13.869/2019)."}, {"n": "78.", "txt": "Lei das Contravenções Penais (Decreto-Lei nº 3.688/1941 e suas alterações);"}, {"n": "79.", "txt": "Lei de Prevenção e Enfrentamento da violência doméstica e familiar contra a criança e o adolescente (Lei nº 14.344/2022)."}, {"n": "80.", "txt": "Direito Penal Militar: Conceito. Autonomia. Classificação doutrinária. Aplicação da Lei Penal Militar. Imputabilidade Penal. Concurso de Agentes. Aplicação da pena. Penas principais e acessórias. Suspensão condicional da pena. Livramento condicional. Penas acessórias. Efeitos da condenação. Medidas de Segurança. Ação Penal. Extinção da Punibilidade. Crimes contra a Autoridade ou Disciplina Militar. Crimes contra a Administração Militar. Crimes contra a Justiça Militar. Genocídio. Dos Crimes Militares em Tempo de Paz: Crimes contra a segurança externa do país. Crimes contra a autoridade ou disciplina militar. Crimes contra o serviço militar e o dever militar. Crimes contra a pessoa. Crimes contra o patrimônio. Crimes contra a incolumidade pública. Crimes contra a administração militar. Crimes contra a administração da justiça militar. Dos Crimes Militares em Tempo de Guerra: Do favorecimento ao inimigo. Da hostilidade e da ordem arbitrária. Crimes contra a pessoa. Crimes contra o patrimônio. Do rapto e da violência carnal."}]}, {"nome": "DIREITO PROCESSUAL PENAL", "itens": [{"n": "1.", "txt": "Interpretação e aplicação da norma processual penal."}, {"n": "2.", "txt": "Direito Processual Penal à luz da Constituição Federal."}, {"n": "3.", "txt": "Do inquérito Policial (Título II do Livro I – CPP)."}, {"n": "4.", "txt": "Da Ação Penal (Título III do Livro I – CPP)."}, {"n": "5.", "txt": "Da Ação Civil (Título IV do Livro I – CPP)."}, {"n": "6.", "txt": "Da Competência (Título V do Livro I – CPP)."}, {"n": "7.", "txt": "Das Questões e Processos Incidentes (Título VI do Livro I – CPP)."}, {"n": "8.", "txt": "Da prova (Título VII do Livro I – CPP)."}, {"n": "9.", "txt": "Do Juiz, do Ministério Público, do Acusado e Defensor, dos Assistentes e Auxiliares da Justiça (Título VIII do Livro I – CPP)."}, {"n": "10.", "txt": "Da Prisão, das Medidas Cautelares e da Liberdade Provisória (Título IX do Livro I – CPP)."}, {"n": "11.", "txt": "Das Citações e Intimações (Título X do Livro I – CPP)."}, {"n": "12.", "txt": "Da Sentença (Título XII do Livro I – CPP)."}, {"n": "13.", "txt": "Do Processo Comum (Título I do Livro II – CPP)."}, {"n": "14.", "txt": "Dos Processos Especiais (Título II do Livro II – CPP)."}, {"n": "15.", "txt": "Das Nulidades e dos Recursos em Geral (Títulos I e II do Livro III – CPP)."}, {"n": "16.", "txt": "Reforma do Processo Penal (Pacote Anticrime - Lei nº 13.964/2019)."}, {"n": "17.", "txt": "Da Execução da Pena (Lei nº 7210/84)."}, {"n": "18.", "txt": "Leis especiais:", "subs": [{"n": "a)", "txt": "Lei antidrogas (Lei nº 11.343/2006 e suas alterações);"}, {"n": "b)", "txt": "Programa de proteção às vítimas (Lei nº 9.807/1999);"}, {"n": "c)", "txt": "Lei de abuso de autoridade (Lei nº 13.869/2019);"}, {"n": "d)", "txt": "Interceptação telefônica (Lei nº 9.296/1996);"}, {"n": "e)", "txt": "Lei dos crimes hediondos (Lei nº 8.072/1990 e suas alterações);"}, {"n": "f)", "txt": "Lei dos Juizados Especiais (Lei nº 9.099/1995 e suas alterações);"}, {"n": "g)", "txt": "Prisão temporária (Lei nº 7.960/1989 e suas alterações);"}, {"n": "h)", "txt": "Lei das organizações criminosas (Lei nº 12.850/2013 e suas alterações);"}, {"n": "i)", "txt": "Código de Trânsito Brasileiro (Lei nº 9.503/1997 e suas alterações);"}, {"n": "j)", "txt": "Estatuto do desarmamento (Lei nº 10.826/2003 e suas alterações);"}, {"n": "k)", "txt": "Violência doméstica (Lei nº 11.340/2006 e suas alterações);"}, {"n": "l)", "txt": "Decreto-Lei nº 201/1967 e suas alterações;"}, {"n": "m)", "txt": "Lei de Prevenção e Enfrentamento da violência doméstica e familiar contra a criança e o adolescente (Lei nº 14.344/2022);"}, {"n": "n)", "txt": "CIRCULAR N. 277 DE 03 DE OUTUBRO DE 2023 – CORREGEDORIA-GERAL DA JUSTIÇA;"}, {"n": "o)", "txt": "Decreto-Lei nº 3.240/1941;"}, {"n": "p)", "txt": "Resolução nº 213/2015 do Conselho Nacional de Justiça;"}, {"n": "q)", "txt": "Resolução nº 427/2021 do Conselho Nacional de Justiça;"}, {"n": "r)", "txt": "Resolução nº 484/2022 do Conselho Nacional de Justiça."}]}]}, {"nome": "DIREITO CONSTITUCIONAL", "itens": [{"n": "1.", "txt": "Constituição: conceito e classificação; conteúdo da Constituição; normas constitucionais materiais e formais; supremacia da Constituição."}, {"n": "2.", "txt": "Estado Democrático de Direito: conceito; fundamentos constitucionais; princípio da República."}, {"n": "3.", "txt": "Interpretação da Constituição: hermenêutica constitucional; teorias da interpretação; critério da interpretação conforme; mutação constitucional."}, {"n": "4.", "txt": "Aplicabilidade das normas constitucionais: classificação quanto à eficácia e à aplicabilidade."}, {"n": "5.", "txt": "Controle de constitucionalidade: sistemas de controle; o sistema brasileiro; instrumentos; exercício do controle; efeitos da declaração de inconstitucionalidade; efeitos da declaração de constitucionalidade; a inconstitucionalidade por omissão."}, {"n": "6.", "txt": "Poder Constituinte: conceito; legitimidade e limites; poder originário e poder derivado; poder constituinte estadual."}, {"n": "7.", "txt": "Poder Legislativo: organização, funcionamento e competências; Congresso Nacional; processo legislativo; Comissões Parlamentares e controle jurisdicional; imunidades parlamentares; orçamento e fiscalização orçamentária; Tribunais de Contas."}, {"n": "8.", "txt": "Poder Judiciário: a função jurisdicional; organização do Poder Judiciário; Supremo Tribunal Federal; Superior Tribunal de Justiça; Súmula Vinculante; Conselho Nacional de Justiça; Justiça dos Estados."}, {"n": "9.", "txt": "Funções essenciais à Justiça: Ministério Público (natureza, princípios e garantias, estrutura e funções constitucionais); Advocacia (o advogado e a administração da Justiça, direitos, deveres e inviolabilidade); Advocacia pública (procuradorias e defensorias)."}, {"n": "10.", "txt": "Poder Executivo: princípios constitucionais da Administração Pública; presidencialismo e parlamentarismo; organização e estrutura do Poder Executivo; eleição e mandato do Chefe do Executivo; perda do mandato: hipóteses e consequências; responsabilidade do Chefe do Executivo; Medida Provisória: natureza, efeitos, conteúdo e limites; competência política, executiva e regulamentar; Estado de sítio e Estado de defesa."}, {"n": "11.", "txt": "Estrutura federativa brasileira: conceito e características da federação; repartição e classificação das competências na Constituição de 1988; União (natureza da unidade federativa; competências; organização), Estados (competências, organização e autonomia), Municípios (competências, organização e autonomia) e Distrito Federal (natureza, competências, organização e autonomia); os “consórcios públicos” (Lei nº 11.107/2005 e suas alterações); intervenção nos Estados e Municípios (autonomia e intervenção, competência interventiva, pressupostos formais e substanciais, procedimento, limites e controle)."}, {"n": "12.", "txt": "Direitos e garantias fundamentais: declaração dos direitos e sua formação histórica; natureza e eficácia das normas sobre direitos fundamentais; conceito de direitos e de garantias; classificação dos direitos fundamentais;"}, {"n": "13.", "txt": "Direitos individuais: destinatários; classificação; direito à vida; direito à privacidade; dignidade da pessoa humana; igualdade; liberdade (pessoa física, pensamento, ação profissional); propriedade (conceito e natureza constitucional, propriedades especiais, limitações ao direito de propriedade, função social da propriedade);"}, {"n": "14.", "txt": "Direitos sociais: conceito e classificação; direitos dos trabalhadores (individuais e coletivos); direito à educação e à cultura; direito ambiental; direitos das crianças e dos idosos; seguridade social (saúde, previdência e assistência social); disciplina da comunicação social;"}, {"n": "15.", "txt": "Nacionalidade (conceito e natureza, direitos dos estrangeiros); Direitos políticos: cidadania (direito a voto e elegibilidade); plebiscito e referendo (conceitos e distinções); direitos políticos negativos (conceito e significado; perda, suspensão e reaquisição dos direitos políticos; inelegibilidades); Lei das Inelegibilidades (Lei Complementar nº 64/1990); Partidos políticos e organização partidária; Lei Orgânica dos Partidos Políticos (Lei nº 9.096/1995 e suas alterações);"}, {"n": "16.", "txt": "Ações Constitucionais: tutela de interesses individuais, difusos e coletivos; ações constitucionais em espécie (habeas corpus, habeas data, mandado de segurança individual e coletivo; mandado de injunção, ação civil pública, ação popular, ação declaratória de constitucionalidade, ação direta de inconstitucionalidade, arguição de descumprimento de preceito fundamental)."}, {"n": "17.", "txt": "Convenção Internacional sobre os Direitos das Pessoas com Deficiência."}, {"n": "18.", "txt": "Marco temporal indígena."}]}, {"nome": "DIREITO ELEITORAL", "itens": [{"n": "1.", "txt": "Direito eleitoral. Conceito. Fundamentos. Fontes e princípios. Interpretação. Aplicação subsidiária do Código de Processo Civil."}, {"n": "2.", "txt": "Do Alistamento Eleitoral: ato e efeitos da inscrição, transferência e encerramento. Cancelamento e exclusão do eleitor. Do domicílio eleitoral."}, {"n": "3.", "txt": "Direitos políticos. Perda. Suspensão. Sufrágio universal. Voto. Característica do voto. Do sistema eleitoral: sistema majoritário e sistema proporcional."}, {"n": "4.", "txt": "Circunscrição eleitoral. Zona eleitoral. Seção eleitoral. Alistamento eleitoral. Mesa receptora de votos, cabinas e urnas."}, {"n": "5.", "txt": "Das coligações. Das convenções para a escolha de candidatos. Do registro de candidatos. Elegibilidade e inelegibilidade. Impugnação de registro de candidatos. Fundo Especial de Financiamento de Campanha. Da arrecadação e da aplicação de recursos nas campanhas eleitorais, Da prestação de contas."}, {"n": "6.", "txt": "Dos partidos políticos. Lei nº 9.096, de 19 de setembro de 1995. Registro e funcionamento partidário. Criação, fusão, incorporação e extinção dos partidos políticos. Da filiação partidária. Da fidelidade e da disciplina partidárias. Das finanças e contabilidade dos partidos. Fundo partidário. Prestação de contas. Aspectos constitucionais, legais e éticos dos partidos políticos."}, {"n": "7.", "txt": "Da votação: atos preparatórios, início e encerramento. Dos lugares de votação, das seções eleitorais e das mesas receptoras. Da polícia e da fiscalização perante as mesas receptoras. Da apuração. Do Sistema Eletrônico de Votação e da Totalização dos Votos."}, {"n": "8.", "txt": "Dos órgãos da Justiça Eleitoral. Do Tribunal Superior Eleitoral. Dos Tribunais Regionais Eleitorais. Dos Juízes Eleitorais. Das Juntas Eleitorais. Instâncias Eleitorais. Composição e atribuições. Competência da justiça eleitoral. Poder normativo do TSE."}, {"n": "9.", "txt": "Das pesquisas e testes pré-eleitorais. Da propaganda eleitoral em geral. Da propaganda eleitoral na imprensa. Da propaganda eleitoral no rádio e na televisão. Propaganda na internet. Do direito de resposta. Das condutas vedadas aos agentes públicos em campanhas eleitorais. Espécies de propaganda regidas pela Lei nº 9.504/1997."}, {"n": "10.", "txt": "Ministério Público Eleitoral. Improbidade administrativa eleitoral."}, {"n": "11.", "txt": "Processo penal eleitoral. Investigação criminal eleitoral. Inquérito policial, flagrante, representação, notícia crime e peças de investigação. Ação penal eleitoral. Competência em matéria criminal eleitoral. Rito processual. Incidentes. Invalidação e nulidade de atos eleitorais. Recursos."}, {"n": "12.", "txt": "Ação de impugnação de pedido de registro de candidatura. Investigação judicial eleitoral ou representação jurisdicional eleitoral. Recurso contra a expedição de diploma. Ação de impugnação de mandato eletivo. Prestação de contas eleitoral. Do mandado de segurança. Das impugnações perante as juntas eleitorais. Da proclamação e da diplomação dos eleitos."}, {"n": "13.", "txt": "Dos recursos eleitorais: pressupostos de admissibilidade. Efeitos e prazos. Recursos perante as Juntas e Juízos Eleitorais e Tribunais Regionais."}, {"n": "14.", "txt": "Dos crimes eleitorais. Conceito, natureza e classificação. Tipos previstos na legislação eleitoral."}, {"n": "15.", "txt": "Lei Complementar nº 64, de 18 de maio de 1990."}, {"n": "16.", "txt": "Lei nº 9.504, de 30 de setembro de 1997."}, {"n": "17.", "txt": "Lei Complementar nº 86/1996."}]}, {"nome": "DIREITO EMPRESARIAL", "itens": [{"n": "1.", "txt": "Empresa e empresário. Estabelecimento empresarial."}, {"n": "2.", "txt": "Microempresa, microempreendedor individual e empresa de pequeno porte (Lei Complementar nº 123/2006 e suas alterações)."}, {"n": "3.", "txt": "Propriedade Industrial.", "subs": [{"n": "3.1", "txt": "Patentes: a) pedido; b) concessão da patente; c) invenção; d) modelo de utilidade; e) proteção;"}, {"n": "f)", "txt": "nulidades; g) cessão do pedido ou da patente; h) extinção da patente."}, {"n": "3.2", "txt": "Marcas: a) caracterização; b) registro; c) restrições; d) proteção; e) nulidades; f) cessão e licença de uso; g) prazo; h) extinção do registro."}, {"n": "3.3", "txt": "Desenhos Industriais: a) titularidade e pedido de registro; b) proteção legal; c) nulidade e extinção do registro."}, {"n": "3.4", "txt": "Concorrência desleal. Aspectos civis."}]}, {"n": "4.", "txt": "Direito Societário. Código Civil de 2002.", "subs": [{"n": "4.1", "txt": "Sociedade empresária: a) conceito de sociedade; b) formação e divisão do capital; c) responsabilidade dos sócios; d) personalidade jurídica; e) desconsideração da personalidade jurídica; f) classificação das sociedades; g) constituição das sociedades."}, {"n": "4.2", "txt": "Das sociedades em espécie: a) sociedade em comum; b) sociedade em conta de participação;"}, {"n": "c)", "txt": "sociedade simples; d) sociedade em nome coletivo; e) sociedade em comandita simples; f) sociedade limitada; g) sociedade anônima; h) sociedade em comandita por ações; i) sociedade cooperativa."}]}, {"n": "5.", "txt": "Ligações Societárias: a) sociedade controladora; b) sociedades coligadas; c) subsidiária integral;", "subs": [{"n": "d)", "txt": "grupo societário; e) consórcio."}]}, {"n": "6.", "txt": "Títulos de crédito.", "subs": [{"n": "6.1", "txt": "Código Civil de 2002 e Lei Uniforme (Decreto nº 57.663/1966): a) características de títulos de crédito; b) circulação dos títulos de crédito; c) conceito de título de crédito; d) requisitos essenciais e não essenciais; e) títulos escriturais."}, {"n": "6.2", "txt": "Classificação dos títulos de crédito quanto à circulação: a) títulos de crédito não à ordem; b) títulos de crédito ao portador; títulos de crédito à ordem."}, {"n": "6.3", "txt": "Institutos cambiários: a) saque; b) endosso; c) aceite; d) intervenção; e) aval; f) protesto (Lei nº"}, {"n": "9.492", "txt": "/1997)."}, {"n": "6.4", "txt": "Títulos de crédito em espécie: a) letra de câmbio; b) nota promissória; c) duplicata; d) cheque;"}, {"n": "e)", "txt": "cédula de produto rural; f) comercial paper; g) cédulas de crédito comercial, industrial, rural e bancário; h) debêntures; i) títulos de crédito do agronegócio (Lei nº 11.076/2004 e suas alterações)."}]}, {"n": "7.", "txt": "Recuperação judicial, extrajudicial falência do empresário e da sociedade empresária (Lei nº", "subs": [{"n": "11.101", "txt": "/2005 e suas alterações)."}, {"n": "7.1", "txt": "Crise econômica e financeira e cessação do pagamento; causas macro e microeconômicas da crise da empresa."}, {"n": "7.2", "txt": "Disposições preliminares e comuns à recuperação judicial e à falência: a) verificação e da habilitação de créditos; b) administrador judicial e comitê de credores; c) assembleia geral de credores."}, {"n": "7.3", "txt": "Recuperação judicial: a) objetivo; b) legitimidade ativa; c) requisitos; d) créditos abrangidos e exceções; e) meios para a obtenção da recuperação da empresa; f) pedido e processamento da recuperação judicial;"}, {"n": "g)", "txt": "plano de recuperação judicial;"}, {"n": "h)", "txt": "consolidação processual e patrimonial/substancial; i) plano alternativo; j) concessão da recuperação e seus efeitos; k) encerramento da recuperação."}, {"n": "7.4", "txt": "Recuperação judicial das Microempresas e Empresas de Pequeno Porte: plano especial. Conteúdo e aprovação."}, {"n": "7.5", "txt": "Recuperação extrajudicial."}, {"n": "7.6", "txt": "Convolação da recuperação judicial em falência."}, {"n": "7.7", "txt": "Falência: a) objetivo; b) juízo universal; c) habilitação e verificação dos créditos; d) classificação dos créditos e ordem de preferência; e) incidente de classificação de créditos de direito público."}, {"n": "7.8", "txt": "Procedimento pré-falimentar e decretação da falência; a) direitos e deveres do falido; b) autofalência; c) efeitos da decretação da falência sobre as obrigações do devedor; suas obrigações, bens, contratos e atos praticados antes da falência; d) ações falimentares."}, {"n": "7.9", "txt": "Crimes em espécie na falência, na recuperação judicial e na recuperação extrajudicial: a) competência; b) natureza da ação penal; c) procedimento penal; d) prescrição; e) efeitos da sentença condenatória; f) legitimação passiva; g) condição objetiva de punibilidade."}]}]}, {"nome": "DIREITO FINANCEIRO E TRIBUTÁRIO", "itens": [{"n": "1.", "txt": "Sistema Tributário Nacional. Princípios gerais. Limitações constitucionais ao poder de tributar. Repartições de competência (impostos da União, Estados, Distrito Federal e Municípios na Constituição Federal de 1988). Repartição constitucional de receitas tributárias."}, {"n": "2.", "txt": "Tributos. Conceito; definição e características; determinação da natureza jurídica específica do tributo; denominação e destino legal do produto da arrecadação. Tributos diretos e indiretos. Fiscalidade, extrafiscalidade e parafiscalidade."}, {"n": "3.", "txt": "Espécies tributárias. Impostos; taxas; contribuição de melhoria; contribuições sociais; preço público; tarifa; pedágio."}, {"n": "4.", "txt": "Competência tributária. Conceito, espécies e características. Competência tributária e capacidade tributária ativa. Limitações da competência tributária."}, {"n": "5.", "txt": "Imunidades tributárias. Conceito; imunidades genéricas; imunidades específicas; outras imunidades."}, {"n": "6.", "txt": "Normas gerais de direito tributário. Fontes do direito tributário e espécies normativas. Vigência, aplicação, interpretação e integração da legislação tributária."}, {"n": "7.", "txt": "Norma jurídica tributária. Conceito. Classificação. A regra-matriz de incidência tributária: estrutura lógica; critérios da hipótese e da consequência."}, {"n": "8.", "txt": "O “fato gerador” da obrigação tributária. Classificações dos “fatos geradores”. Efeitos do “fato gerador”. O “fato gerador” no âmbito do Código Tributário Nacional."}, {"n": "9.", "txt": "Obrigação tributária. Obrigação tributária e deveres instrumentais ou formais. A obrigação tributária no âmbito do Código Tributário Nacional. Sujeito ativo e sujeito passivo da obrigação tributária. Solidariedade tributária. Capacidade tributária e domicílio tributário."}, {"n": "10.", "txt": "Responsabilidade tributária. Responsabilidade de sucessores, responsabilidade de terceiros e responsabilidade por infrações. A substituição tributária."}, {"n": "11.", "txt": "Constituição do crédito tributário. Lançamento tributário: conceito; natureza jurídica; atributos; alterabilidade; modalidades; revisão."}, {"n": "12.", "txt": "Suspensão da exigibilidade do crédito tributário. Moratória; depósito do montante integral; reclamações e recursos administrativos; medida liminar em mandado de segurança; medida liminar ou tutela antecipada em outras espécies de ação judicial; parcelamento."}, {"n": "13.", "txt": "Extinção do crédito tributário. Pagamento; consignação em pagamento; repetição do indébito tributário; pagamento antecipado e homologação do lançamento; dação em pagamento; compensação; transação; remissão; decadência; prescrição; conversão de depósito em renda; decisão administrativa irreformável; decisão judicial passada em julgado. Causas extintivas não previstas no Código Tributário Nacional."}, {"n": "14.", "txt": "Exclusão do crédito tributário. Isenção e anistia."}, {"n": "15.", "txt": "Infrações e sanções tributárias. Ilícitos administrativos tributários. Sanções tributárias."}, {"n": "16.", "txt": "Garantias e privilégios do crédito tributário. Preferências."}, {"n": "17.", "txt": "Administração tributária. Fiscalização; dívida ativa e protesto de certidão de dívida ativa; certidões negativas."}, {"n": "18.", "txt": "Processo judicial tributário: execução fiscal; ação cautelar fiscal; ação declaratória; ação anulatória de lançamento; ação de consignação em pagamento; ação de repetição de indébito tributário; mandado de segurança."}, {"n": "19.", "txt": "Impostos da União, dos Estados e dos Munícipios."}, {"n": "20.", "txt": "Tributação internacional. Acordos para evitar a dupla tributação. Aspectos tributários da OMC, MERCOSUL, ALADI e ALCA. Incentivos fiscais. Legislação. Análise crítica do sistema e de seus reflexos no desenvolvimento do País. Evasão e elisão tributárias."}, {"n": "21.", "txt": "Direito financeiro: sede constitucional, seu objeto e suas fontes. Normas gerais de direito financeiro e de direito tributário: autonomia científica e normativa. Atividade financeira do Estado: fundamentos financeiros, econômicos e jurídicos. Finalidades. Aspectos tributários das leis: de responsabilidade tributária, de diretrizes orçamentárias, de orçamento anual, Lei nº 4.320, de 1964, e suas alterações."}, {"n": "22.", "txt": "Lei Complementar Estadual nº 465/2009 (SC). Tribunal Administrativo Tributário do Estado de Santa Catarina. Lei Estadual nº 10.297/1996. Lei 3938/1966. Lei Estadual nº 13.136/2004."}]}, {"nome": "DIREITO AMBIENTAL", "itens": [{"n": "1.", "txt": "Meio Ambiente. Teoria Geral do Direito ambiental. Conceito. Natureza. Fontes e Princípios. Ética Ambiental. Meio Ambiente na Constituição Federal. Fundamento constitucional. Ecologia ou Antropologia. Estado Constitucional Ecológico. A Ética e o ambiente natural, cultural e artificial. A ética ambiental e o Estatuto da Cidade."}, {"n": "2.", "txt": "Política ambiental constitucional. Deveres ambientais. Deveres ecológicos e regulamentação da atividade econômica na Constituição Federal."}, {"n": "3.", "txt": "Direito Ambiental Constitucional. Competência legislativa em matéria ambiental. Competências legislativas exclusivas e concorrentes. Competência material na defesa do meio ambiente."}, {"n": "4.", "txt": "Bens Ambientais. Águas, cavidades naturais subterrâneas. Energia. Espaços territoriais protegidos e seus componentes: Fauna, Flora, Florestas, Ilhas, Paisagem, Mar Territorial, Praias fluviais, Praias marítimas. Recursos naturais da plataforma continental. Recursos da zona econômica exclusiva. Sítios arqueológicos e pré-históricos. Terrenos de marinha e seus acrescidos. Terrenos marginais."}, {"n": "5.", "txt": "Política Nacional do Meio Ambiente. Regime jurídico. Princípios da PNMA. Objeto. Finalidade. Instrumentos da PNMA."}, {"n": "6.", "txt": "SISNAMA – Sistema Nacional do Meio Ambiente. Objeto. Órgãos integrantes. Órgão Superior. Conselho de Governo."}, {"n": "7.", "txt": "Órgão Consultivo e Deliberativo (CONAMA). Órgão Central – Ministério do Meio-Ambiente. Recursos Hídricos e Amazônia legal. Órgão executor – IBAMA. Órgãos Setoriais. Órgãos Seccionais e órgãos locais. Fundo Nacional do Meio Ambiente (FNMA). Licenciamento Ambiental. Sistema de Licenciamento."}, {"n": "8.", "txt": "Tipos de Licença (Licença Prévia, Licença de Instalação e Licença de Operação). Outorgas das Licenças. Licença Ambiental para fins específicos. Função e Natureza Jurídica do Estudo de Impacto Ambiental. Regime jurídico do licenciamento ambiental."}, {"n": "9.", "txt": "Conceito jurídico de impacto ambiental. Exigência Constitucional dos Estudos de Impacto Ambiental. O EIA na legislação nacional. Competência Legislativa sobre o EIA. Competência para exigir o EIA. Estados e Municípios. Competência do CONAMA para estabelecer as diretrizes sobre o EIA. Normas Gerais. Conteúdo do EIA. RIMA. Audiência Pública. As licitações e o EIA."}, {"n": "10.", "txt": "Conceito de Zoneamento Ambiental. Finalidade. Natureza jurídica. Zoneamento Ambiental Urbano. Zonas de Uso Industrial – ZUI. Zonas de Uso Estritamente Industrial – ZUEI. Zona de Uso Predominantemente Industrial – ZUPI. Zona de Uso Diversificado – ZUD. Zoneamento Ambiental Agrícola e Zoneamento Ambiental Costeiro. Zoneamento Ecológico-Econômico."}, {"n": "11.", "txt": "O Dano Ambiental. Apuração do Dano Ambiental. Reparação do Dano Ambiental. Responsabilidade Administrativa, Civil e Penal por danos ao Meio Ambiente. Infrações Administrativas Ambientais. Sanções para as infrações administrativas ambientais. O Poder de Polícia e Direito Ambiental. Regime jurídico das infrações penais e administrativas derivadas de condutas e atividades lesivas ao meio ambiente."}, {"n": "12.", "txt": "Meios processuais para a defesa ambiental. Ação Popular. Ação Civil Pública. Competência para o processamento e julgamento das ações civis públicas por danos ao meio ambiente. Legitimidade ativa. Mandado de Segurança Individual e Coletivo. Mandado de Injunção. Ação Direta de Inconstitucionalidade. Desapropriação. Tombamento. A tutela inibitória em matéria de proteção ao meio ambiente. A tutela de urgência e de evidência no direito ambiental. O acesso coletivo à tutela jurisdicional em matéria ambiental. Intervenção de Terceiros stricto e lato sensu. Recursos."}, {"n": "13.", "txt": "Crimes contra o meio ambiente. Responsabilidade penal ambiental. Responsabilidade penal da pessoa jurídica. Ação e processo penal. Competência para julgar os crimes contra o meio ambiente. Crimes ambientais. Crimes contra a fauna. Crimes contra a flora. Crimes contra o ordenamento urbano e patrimônio cultural. Crimes de poluição."}, {"n": "14.", "txt": "O Direito Ambiental Internacional. Conceito. Fontes do Direito ambiental internacional. Princípios gerais do direito ambiental internacional. MERCOSUL e Direito Ambiental Internacional. Procedimentos administrativos de prevenção de dano ambiental nacional transfronteiriço. As Organizações Não Governamentais. ONGs."}, {"n": "15.", "txt": "Política Nacional de Recursos Hídricos. Política Nacional de Saneamento Básico. Política Nacional de Resíduos Sólidos."}, {"n": "16.", "txt": "Conceito de Poluição. Poluição das águas. Poluição Atmosférica. Poluição por resíduos sólidos. Poluição por rejeitos perigosos. Poluição por agrotóxicos. Poluição sonora. Áreas de Preservação Permanente e Unidades de Conservação: Fundamento Constitucional. Mudanças Climáticas. Pagamento por Serviços Ambientais. Mudança do Clima e Mercado de Carbono."}, {"n": "17.", "txt": "Política Nacional de Recursos Hídricos (Lei nº 9.433/1997). Lei de Crimes Ambientais (Lei nº", "subs": [{"n": "9.605", "txt": "/1998). Política Nacional de Educação Ambiental (Lei nº 9.795/1999). Poluição causada por óleo (Lei nº 9.966/2000). Sistema Nacional de Unidades de Conservação da Natureza (Lei nº 9.985/2000). Lei de Biossegurança (Lei nº 11.105/2005). Lei de Gestão de Florestas Públicas (Lei nº 11.284/2006). Lei da Mata Atlântica (Lei nº 11.428/2006). Lei de Saneamento Básico (Lei nº 11.445/2007). Política Nacional sobre Mudança do Clima (Lei nº 12.187/2009). Política Nacional de Resíduos Sólidos (Lei nº"}, {"n": "12.305", "txt": "/2010). Lei da cooperação federativa em matéria ambiental (Lei Complementar nº 140/2011). Código Florestal (Lei nº 12.651/2012). Lei da Biodiversidade (Lei nº 13.123/2015). Lei de Pagamentos por Serviços Ambientais (Lei nº 14.119/2021). Lei Estadual nº 16.342/2014 - altera a Lei nº 14.675/2009, que institui o Código Estadual do Meio Ambiente."}]}]}, {"nome": "DIREITO ADMINISTRATIVO", "itens": [{"n": "1.", "txt": "Conteúdo do regime jurídico administrativo. Lei de Introdução às Normas do Direito Brasileiro – LINDB. Aplicação do regime jurídico administrativo a entidades da Administração Indireta, entidades de colaboração e particulares. Estatuto das Empresas Estatais (Lei nº 13.303/2006). Administração Direta e Indireta. Terceiro Setor. Conceito de Direito Administrativo e suas relações com as outras disciplinas jurídicas. A constitucionalização do Direito Administrativo."}, {"n": "2.", "txt": "Princípios Constitucionais do Direito Administrativo. Restrições ao princípio da legalidade. Princípios reconhecidos em legislação infraconstitucional, pela doutrina e pela jurisprudência. Interpretação do direito administrativo. Normas sobre interpretação do direito público na Lei de Introdução ao Direito Brasileiro. Controle sistemático das relações administrativas."}, {"n": "3.", "txt": "Ato administrativo: conceito, elementos, atributos, classificação, espécies. Perfeição, validade e eficácia do ato administrativo. Invalidade, nulidade, anulação, cassação, caducidade, convalidação e revogação. Principais espécies. Controle de mérito e de legalidade dos atos administrativos. Controle sistemático dos atos administrativos. Regime jurídico dos atos administrativos."}, {"n": "4.", "txt": "Servidores Públicos. Agentes Públicos. Classificação. Normas relativas à remuneração dos servidores e de agentes públicos. Regime dos servidores públicos e titulares de cargos públicos na Constituição Federal. Estatuto dos Funcionários Públicos Civis do Estado de Santa Catarina (Lei Estadual nº 6.745/1985). Regime Próprio de Previdência dos Servidores do Estado de Santa Catarina (Lei Complementar Estadual nº 412, de 26 de junho de 2008). Cargo, emprego e função pública. Provimento, vacância, remoção, redistribuição e substituição. Provimento. Nomeação. Concurso Público. Posse e exercício. Estabilidade. Transferência. Readaptação. Reversão. Reintegração. Recondução. Disponibilidade. Aproveitamento. Vacância. Remoção. Redistribuição. Substituição."}, {"n": "5.", "txt": "Direitos e vantagens dos servidores públicos. Deveres e responsabilidades dos servidores públicos. Do regime disciplinar. O funcionário Público Civil. Da Seguridade social do servidor: aposentadoria e pensões; aposentadoria de magistrado, membros do Ministério Público e do Tribunal de Contas; aposentadoria voluntária, aposentadoria compulsória. Normas relativas à remuneração dos servidores e de agentes políticos. Lei Complementar nº 35, de 14 de março de 1979 (Lei Orgânica da Magistratura Nacional) e alterações. Processo administrativo disciplinar (Lei Complementar Estadual nº 491, de 20 de janeiro de 2010)."}, {"n": "6.", "txt": "Improbidade administrativa: Lei Federal nº 8.429/1992. Agentes do polo ativo e passivo. Atos de improbidade. Da ação de improbidade administrativa. Das penas. Enriquecimento ilícito. Prejuízo ao erário. Princípios. Penas. Procedimento e prescrição. Regime jurídico dos atos de improbidade administrativa. Lei de Responsabilidade Fiscal - Lei Complementar nº 101/2000. Lei de Acesso à Informação - Lei Federal nº 12.527/2011. Lei Anticorrupção - Lei Federal nº 12.846/2013."}, {"n": "7.", "txt": "Controles da Administração Pública: Controle administrativo; Controle legislativo ou político; Controle judicial. Discricionariedade administrativa e controle judicial. Controle interno e controle externo. Controle pelo Tribunal de Contas. Domínio público. Controle sistemático das delegações de serviços públicos."}, {"n": "8.", "txt": "Domínio Público. Bens públicos. Regime jurídico. Classificação, Administração e Utilização. Alienação. Tratamento do tema no Estatuto da Cidade (Lei Federal nº 10.257/2001)."}, {"n": "9.", "txt": "Licitação (Lei nº 14.133/2021): Princípios, Obrigatoriedade, Dispensa e Exigibilidade, Procedimentos e Modalidades. Pregão presencial e eletrônico. Fases da licitação. Habilitação. Julgamento. Homologação e adjudicação. Recursos administrativos. Crimes. Licitação e mandado de segurança. Regime Diferenciado de Contratações Públicas. Registro de preços. Regime jurídico de licitações."}, {"n": "10.", "txt": "Contrato administrativo. Espécies. Conceito. Características. Prerrogativas da Administração. Formalização. Execução e inexecução. A cláusula rebus sic stantibus. A Teoria da Imprevisão. As cláusulas de reajuste de preços. Obrigações do Estado derivadas de contratos inválidos ou inexistentes. Rescisão e anulação. Regime jurídico dos contratos administrativos."}, {"n": "11.", "txt": "Convênios e Consórcios. Concessões e Permissões de serviços públicos (Lei nº 8.987/1995 e suas alterações). Forma e condições da outorga do serviço em concessão. O Prazo nas concessões e sua prorrogação. Poderes do Concedente. Os Direitos do concessionário. Regime tarifário e sua revisão. Os Direitos dos usuários. Formas de extinção da concessão e seus efeitos jurídicos. A reversão dos Bens. Serviços públicos. Responsabilidades civis do concessionário e do Poder concedente. Permissão. Parcerias Público-Privadas."}, {"n": "12.", "txt": "Parcerias com o terceiro setor. Convênios e outras espécies de ajustes colaborativos. Organizações sociais. OSCIPs. Organizações da Sociedade Civil."}, {"n": "13.", "txt": "Infrações e Sanções Administrativas. Conceito. Sujeito infrator. Excludentes da Infração. Princípios. Dever de sancionar. Processo administrativo. Regime jurídico. Conceito. Processo ou procedimento administrativo. Princípios do processo administrativo. Instauração do processo administrativo e fases do processo. A sindicância. Os sujeitos da relação processual administrativa. Direitos e deveres das partes. Competência. Instrução do processo administrativo. Decisão do Processo Administrativo: estrutura, tipologia. Recurso Administrativo e seus efeitos. Coisa julgada administrativa. Da revisão administrativa. Da prescrição e da decadência."}, {"n": "14.", "txt": "Poderes Administrativos. Poder de polícia: conceito. Intervenção do Estado na propriedade. Função social da propriedade. Desapropriação. Conceito. Requisitos. Bens suscetíveis de desapropriação: Competências relacionadas à desapropriação. Espécies de desapropriação Indenização e consectários legais. Caducidade da desapropriação. Imissão na posse do imóvel desapropriado. Direito de extensão. Desapropriação indireta. Retrocessão. Controle da desapropriação. Servidão administrativa. Tombamento. Requisição. Ocupação provisória. Limitação administrativa. Direito de construir e seu exercício. Loteamento e zoneamento."}, {"n": "15.", "txt": "Responsabilidade civil do Estado: evolução das teorias. Reparação do dano. Responsabilidade objetiva e subjetiva. Caracterização. Causas de exclusão e mitigação. Prescrição e decadência. Responsabilidades dos contratados e delegatários de serviços públicos. Procedimento administrativo e judicial. Direito de regresso."}, {"n": "16.", "txt": "Organização administrativa: noções gerais. Administração direta e indireta, centralizada e descentralizada. Autarquias. Autarquias comuns e especiais. Agências reguladoras e agências executivas. Fundações Públicas, Empresas Públicas e Sociedades de Economia Mista. Consórcios Públicos. Tutela dos entes da Administração Indireta. Entidades de colaboração e seu regime jurídico."}, {"n": "17.", "txt": "Jurisprudência e súmulas de direito administrativo do Superior Tribunal de Justiça e do Supremo Tribunal Federal. Súmulas Vinculantes. Temas decididos em regime de repercussão geral ou de recursos repetitivos."}]}, {"nome": "NOÇÕES GERAIS DE DIREITO E FORMAÇÃO HUMANÍSTICA", "itens": [{"n": "A)", "txt": "LEGISLAÇÃO ESTADUAL", "subs": [{"n": "1.", "txt": "Lei Complementar Estadual nº 339, de 8 de março de 2006 (dispõe sobre a divisão e organização judiciárias do Estado de Santa Catarina e estabelece outras providências)."}, {"n": "2.", "txt": "Lei Complementar Estadual nº 367, de 7 de dezembro de 2006 (dispõe sobre o Estatuto da Magistratura do Estado de Santa Catarina e adota outras providências)."}, {"n": "3.", "txt": "Lei Complementar Estadual nº 413, de 7 de julho de 2008 (transforma cargos do Quadro da Magistratura e altera dispositivos das Leis Complementares Estaduais nº 339/2006 e nº 367/2006)."}]}, {"n": "B)", "txt": "SOCIOLOGIA DO DIREITO", "subs": [{"n": "1.", "txt": "Introdução à sociologia da administração judiciária. Aspectos gerenciais da atividade judiciária (administração e economia). Gestão. Gestão de pessoas."}, {"n": "2.", "txt": "Relações sociais e relações jurídicas. Controle social e o Direito. Transformações sociais e Direito."}, {"n": "3.", "txt": "Direito, Comunicação Social e opinião pública."}, {"n": "4.", "txt": "Conflitos sociais e mecanismos de resolução. Sistemas não judiciais de composição de litígios."}]}, {"n": "C)", "txt": "PSICOLOGIA JUDICIÁRIA", "subs": [{"n": "1.", "txt": "Psicologia e Comunicação: relacionamento interpessoal, relacionamento do magistrado com a sociedade e a mídia."}, {"n": "2.", "txt": "Problemas atuais da psicologia com reflexos no direito: assédio moral e assédio sexual."}, {"n": "3.", "txt": "Teoria do conflito e os mecanismos autocompositivos. Técnicas de negociação e mediação. Procedimentos, posturas, condutas e mecanismos aptos a obter a solução conciliada dos conflitos."}, {"n": "4.", "txt": "O processo psicológico e a obtenção da verdade judicial. O comportamento de partes e testemunhas."}]}, {"n": "D)", "txt": "ÉTICA E ESTATUTO JURÍDICO DA MAGISTRATURA NACIONAL", "subs": [{"n": "1.", "txt": "Regime jurídico da Magistratura Nacional: carreiras, ingresso, promoções, remoções."}, {"n": "2.", "txt": "Direitos e deveres funcionais da magistratura."}, {"n": "3.", "txt": "Integridade pessoal e profissional do juiz. Dignidade, honra e decoro. Diligência e dedicação. Conhecimento e Capacitação. Cortesia e Prudência do Juiz."}, {"n": "4.", "txt": "Ilícitos éticos. Sanções. Lugar da ética na função judicial e na vida particular do juiz."}, {"n": "5.", "txt": "O papel da cordialidade na prestação jurisdicional."}, {"n": "6.", "txt": "Código de Ética da Magistratura Nacional."}, {"n": "7.", "txt": "Sistemas de controle interno do Poder Judiciário: Corregedorias, Ouvidorias, Conselhos Superiores e Conselho Nacional de Justiça."}, {"n": "8.", "txt": "Responsabilidade administrativa, civil e criminal dos magistrados."}, {"n": "9.", "txt": "Administração judicial. Planejamento estratégico. Modernização da gestão."}]}, {"n": "E)", "txt": "FILOSOFIA DO DIREITO", "subs": [{"n": "1.", "txt": "O conceito de Justiça. Sentido lato de Justiça, como valor universal. Sentido estrito de Justiça, como valor jurídico-político. Divergências sobre o conteúdo do conceito."}, {"n": "2.", "txt": "O conceito de Direito. Equidade. Direito e Moral."}, {"n": "3.", "txt": "A interpretação do Direito. A superação dos métodos de interpretação mediante puro raciocínio lógico-dedutivo. O método de interpretação pela lógica do razoável."}]}, {"n": "F)", "txt": "TEORIA GERAL DO DIREITO E DA POLÍTICA", "subs": [{"n": "1.", "txt": "Direito objetivo e direito subjetivo."}, {"n": "2.", "txt": "Fontes do Direito objetivo. Princípios gerais de Direito. Jurisprudência. Súmula vinculante."}, {"n": "3.", "txt": "Eficácia da lei no tempo. Conflito de normas jurídicas no tempo e o Direito brasileiro: Direito Penal, Direito Civil, Direito Constitucional e Direito do Trabalho."}, {"n": "4.", "txt": "O conceito de Política. Política e Direito."}, {"n": "5.", "txt": "Ideologias."}, {"n": "6.", "txt": "A Declaração Universal dos Direitos do Homem (ONU)."}, {"n": "7.", "txt": "Agenda 2030 e os 17 Objetivos de Desenvolvimento Sustentável."}, {"n": "8.", "txt": "Gênero e Patriarcado. Gênero e Raça. Discriminação e Desigualdades de Gênero – questões centrais. Protocolo de Julgamento com perspectiva de gênero."}]}, {"n": "G)", "txt": "DIREITO DIGITAL", "subs": [{"n": "1.", "txt": "4ª Revolução industrial. Transformação Digital no Poder Judiciário. Tecnologia no contexto jurídico. Automação do processo. Inteligência Artificial e Direito. Audiências virtuais. Cortes remotas. Ciência de dados e Jurimetria. Resoluções do CNJ sobre inovações tecnológicas no Judiciário."}, {"n": "2.", "txt": "Persecução Penal e novas tecnologias. Crimes virtuais e cibersegurança. Deepweb e Darkweb. Provas digitais. Criptomoedas e Lavagem de dinheiro."}, {"n": "3.", "txt": "Noções gerais de contratos Inteligentes, Blockchain e Algoritmos."}, {"n": "4.", "txt": "LGPD e proteção de dados pessoais."}]}, {"n": "H)", "txt": "PRAGMATISMO, ANÁLISE ECONÔMICA DO DIREITO E ECONOMIA COMPORTAMENTAL", "subs": [{"n": "1.", "txt": "Função judicial e pragmatismo. Antifundacionalismo. Contextualismo. Consequencialismo. Racionalismo e Empirismo. Dialética. Utilitarismo."}, {"n": "2.", "txt": "Análise econômica do direito. Conceitos fundamentais. Racionalidade econômica. Eficiência processual. Métodos adequados de resolução de conflitos e acesso à Justiça. Demandas frívolas e de valor esperado negativo. Precedentes, estabilidade da jurisprudência e segurança jurídica. Coisa Julgada."}, {"n": "3.", "txt": "Economia comportamental. Heurística e vieses cognitivos. A percepção de Justiça. Processo cognitivo de tomada de decisão."}, {"n": "4.", "txt": "Governança corporativa e Compliance no Brasil. Mecanismos de Combate às organizações criminosas e Lavagem de Dinheiro. Whistleblower."}]}, {"n": "I)", "txt": "DIREITO DA ANTIDISCRIMINAÇÃO", "subs": [{"n": "1.", "txt": "Conceitos Fundamentais do Direito da Antidiscriminação."}, {"n": "2.", "txt": "Modalidades de Discriminação."}, {"n": "3.", "txt": "Legislação antidiscriminação nacional e internacional."}, {"n": "4.", "txt": "Conceitos Fundamentais do Racismo, Sexismo, Intolerância Religiosa, LGBTQIA+fobia."}, {"n": "5.", "txt": "Ações Afirmativas."}, {"n": "6.", "txt": "Direitos dos Povos indígenas e das comunidades tradicionais."}]}]}, {"nome": "DIREITOS HUMANOS", "itens": [{"n": "1.", "txt": "Teoria Geral dos Direitos Humanos."}, {"n": "2.", "txt": "Sistema global de proteção dos direitos humanos."}, {"n": "3.", "txt": "Sistema regional interamericano de proteção dos direitos humanos."}, {"n": "4.", "txt": "Controle de convencionalidade."}, {"n": "5.", "txt": "A relação entre o direito internacional dos direitos humanos e o direito brasileiro."}, {"n": "6.", "txt": "Os direitos humanos na Constituição Federal de 1988."}, {"n": "7.", "txt": "A jurisprudência do Supremo Tribunal Federal em matéria de direitos humanos."}]}]}, {"id": "pcpr-delegado-2026", "nome": "PCPR · Delegado 2026 (FGV)", "materias": [{"nome": "DIREITO PENAL", "itens": [{"n": "1.1", "txt": "Princípios Fundamentais do Direito Penal.", "subs": [{"n": "1.1.1", "txt": "Princípios da Legalidade, Anterioridade, Irretroatividade, Culpabilidade, Humanidade, Insignificância/Bagatela, Intervenção Mínima, Fragmentariedade e Subsidiariedade."}]}, {"n": "1.2", "txt": "Aplicação da Lei Penal.", "subs": [{"n": "1.2.1", "txt": "Lei Penal no Tempo."}, {"n": "1.2.2", "txt": "Lei Penal no Espaço."}, {"n": "1.2.3", "txt": "Contagem de prazos."}, {"n": "1.2.4", "txt": "Analogia."}, {"n": "1.2.5", "txt": "Interpretação da Lei Penal."}]}, {"n": "1.3", "txt": "Teoria Geral do Crime.", "subs": [{"n": "1.3.1", "txt": "Conceito de crime."}, {"n": "1.3.2", "txt": "Fato Típico."}, {"n": "1.3.3", "txt": "Dolo e Culpa."}, {"n": "1.3.4", "txt": "Erro de Tipo."}, {"n": "1.3.5", "txt": "Ilicitude."}, {"n": "1.3.6", "txt": "Culpabilidade."}, {"n": "1.3.7", "txt": "Erro de Proibição."}, {"n": "1.3.8", "txt": "Coação Irresistível e Obediência Hierárquica."}]}, {"n": "1.4", "txt": "Concurso de Pessoas.", "subs": [{"n": "1.4.1", "txt": "Autoria e Participação."}, {"n": "1.4.2", "txt": "Teorias."}, {"n": "1.4.3", "txt": "Punibilidade do Partícipe."}]}, {"n": "1.5", "txt": "Teoria da Pena.", "subs": [{"n": "1.5.1", "txt": "Conceito, Finalidades e Espécies de Penas."}, {"n": "1.5.2", "txt": "Penas Privativas de Liberdade."}, {"n": "1.5.3", "txt": "Penas Restritivas de Direitos."}, {"n": "1.5.4", "txt": "Pena de Multa."}, {"n": "1.5.5", "txt": "Suspensão Condicional da Pena."}, {"n": "1.5.6", "txt": "Livramento Condicional."}, {"n": "1.5.7", "txt": "Efeitos da Condenação."}, {"n": "1.5.8", "txt": "Reabilitação."}, {"n": "1.5.9", "txt": "Medidas de Segurança."}]}, {"n": "1.6", "txt": "Extinção da Punibilidade.", "subs": [{"n": "1.6.1", "txt": "Causas de extinção."}, {"n": "1.6.2", "txt": "Prescrição."}, {"n": "1.6.3", "txt": "Decadência e Perempção."}]}, {"n": "1.7", "txt": "Crimes Contra a Pessoa.", "subs": [{"n": "1.7.1", "txt": "Homicídio."}, {"n": "1.7.2", "txt": "Lesões Corporais."}, {"n": "1.7.3", "txt": "Periclitação da Vida e da Saúde."}, {"n": "1.7.4", "txt": "Rixa."}, {"n": "1.7.5", "txt": "Crimes contra a Honra."}, {"n": "1.7.6", "txt": "Crimes contra a Liberdade Individual."}]}, {"n": "1.8", "txt": "Crimes Contra o Patrimônio.", "subs": [{"n": "1.8.1", "txt": "Furto."}, {"n": "1.8.2", "txt": "Roubo e Extorsão."}, {"n": "1.8.3", "txt": "Dano."}, {"n": "1.8.4", "txt": "Apropriação Indébita."}, {"n": "1.8.5", "txt": "Estelionato e Outras Fraudes."}, {"n": "1.8.6", "txt": "Receptação."}]}, {"n": "1.9", "txt": "Crimes Contra a Propriedade Imaterial.", "subs": [{"n": "1.9.1", "txt": "Crimes contra a Propriedade Industrial."}, {"n": "1.9.2", "txt": "Crimes contra a Propriedade Intelectual."}]}, {"n": "1.10", "txt": "Crimes Contra a Dignidade Sexual.", "subs": [{"n": "1.10.1", "txt": "Estupro e demais Crimes Sexuais."}, {"n": "1.10.2", "txt": "Satisfação de Lascívia Mediante Presença de Criança ou Adolescente."}, {"n": "1.10.3", "txt": "Registro Não Autorizado de Intimidade Sexual."}]}, {"n": "1.11", "txt": "Crimes Relacionados à Família e Relações de Dependência.", "subs": [{"n": "1.11.1", "txt": "Bigamia."}, {"n": "1.11.2", "txt": "Falsa Identidade."}, {"n": "1.11.3", "txt": "Abandono Material."}]}, {"n": "1.12", "txt": "Crimes Contra a Incolumidade Pública.", "subs": [{"n": "1.12.1", "txt": "Crimes de Perigo Comum."}, {"n": "1.12.2", "txt": "Crimes contra a Segurança dos Meios de Comunicação e Transporte."}, {"n": "1.12.3", "txt": "Crimes contra a Saúde Pública."}]}, {"n": "1.13", "txt": "Crimes Contra a Paz Pública.", "subs": [{"n": "1.13.1", "txt": "Associação Criminosa."}, {"n": "1.13.2", "txt": "Constituição de Milícia Privada."}]}, {"n": "1.14", "txt": "Crimes Contra a Fé Pública.", "subs": [{"n": "1.14.1", "txt": "Moeda Falsa."}, {"n": "1.14.2", "txt": "Falsidade de Documento Público e Particular."}, {"n": "1.14.3", "txt": "Falsidade Ideológica."}, {"n": "1.14.4", "txt": "Falsificação de Carteira de Trabalho e Previdência Social."}]}, {"n": "1.15", "txt": "Crimes Contra a Administração Pública.", "subs": [{"n": "1.15.1", "txt": "Crimes Praticados por Funcionário Público Contra a Administração em Geral."}, {"n": "1.15.2", "txt": "Crimes Praticados por Particular Contra a Administração em Geral."}, {"n": "1.15.3", "txt": "Crimes Contra a Administração da Justiça."}, {"n": "1.15.4", "txt": "Crimes Contra as Finanças Públicas."}]}, {"n": "1.16", "txt": "Crimes em Licitações e Contratos Administrativos (Capítulo II-B do Código Penal)."}, {"n": "1.17", "txt": "Lei das Contravenções Penais (Decreto-Lei n.º 3.688/1941)."}, {"n": "1.18", "txt": "Crimes de Trânsito (Lei n.º 9.503/1997)."}, {"n": "1.19", "txt": "Crimes Eleitorais (Lei n.º 4.737/1965)."}, {"n": "1.20", "txt": "Crimes contra a Ordem Tributária, Econômica e Relações de Consumo (Lei n.º 8.137/1990)."}, {"n": "1.21", "txt": "Crimes de Abuso de Autoridade (Lei n.º 13.869/2019)."}, {"n": "1.22", "txt": "Crimes de Tráfico de Drogas (Lei n.º 11.343/2006)."}, {"n": "1.23", "txt": "Crimes Resultantes de Preconceito de Raça ou de Cor (Lei n.º 7.716/1989)."}, {"n": "1.24", "txt": "Organizações Criminosas (Lei n.º 12.850/2013)."}, {"n": "1.25", "txt": "Crimes contra o Meio Ambiente (Lei n.º 9.605/1998)."}, {"n": "1.26", "txt": "Estatuto da Criança e do Adolescente - Crimes (Lei n.º 8.069/1990)."}, {"n": "1.27", "txt": "Estatuto do Idoso - Crimes (Lei n.º 10.741/2003)."}, {"n": "1.28", "txt": "Estatuto do Desarmamento (Lei n.º 10.826/2003)."}, {"n": "1.29", "txt": "Crimes de Tortura (Lei n.º 9.455/1997)."}, {"n": "1.30", "txt": "Violência Doméstica e Familiar Contra a Mulher (Lei n.º 11.340/2006)."}, {"n": "1.31", "txt": "Violência Doméstica e Familiar Contra Criança e Adolescente - Lei Henry Borel (Lei n.º 14.344/2022)."}, {"n": "1.32", "txt": "Crimes Hediondos (Lei n.º 8.072/1990)."}, {"n": "1.33", "txt": "Crimes Contra o Sistema Financeiro Nacional (Lei n.º 7.492/1986)."}, {"n": "1.34", "txt": "Lavagem ou Ocultação de Bens, Direitos e Valores (Lei n.º 9.613/1998)."}, {"n": "1.35", "txt": "Crimes Cibernéticos."}]}, {"nome": "DIREITO PROCESSUAL PENAL", "itens": [{"n": "2.1", "txt": "Princípios Fundamentais do Processo Penal.", "subs": [{"n": "2.1.1", "txt": "Princípios Constitucionais do Processo Penal."}]}, {"n": "2.2", "txt": "Sistemas Processuais Penais.", "subs": [{"n": "2.2.1", "txt": "Sistema Acusatório, Inquisitivo e Misto."}]}, {"n": "2.3", "txt": "Inquérito Policial.", "subs": [{"n": "2.3.1", "txt": "Conceito, Natureza Jurídica, Características e Finalidade."}, {"n": "2.3.2", "txt": "Notitia Criminis."}, {"n": "2.3.3", "txt": "Diligências Policiais."}, {"n": "2.3.4", "txt": "Indiciamento."}, {"n": "2.3.5", "txt": "Prazo para Conclusão."}, {"n": "2.3.6", "txt": "Encerramento do Inquérito."}, {"n": "2.3.7", "txt": "Arquivamento."}, {"n": "2.3.8", "txt": "Vícios do Inquérito Policial."}, {"n": "2.3.9", "txt": "Valor Probatório do Inquérito."}, {"n": "2.3.10", "txt": "Atribuições do Delegado de Polícia no Inquérito Policial."}]}, {"n": "2.4", "txt": "Ação Penal.", "subs": [{"n": "2.4.1", "txt": "Conceito e Condições da Ação."}, {"n": "2.4.2", "txt": "Classificação."}, {"n": "2.4.3", "txt": "Princípios da Ação Penal."}, {"n": "2.4.4", "txt": "Queixa-Crime."}]}, {"n": "2.5", "txt": "Competência.", "subs": [{"n": "2.5.1", "txt": "Conceito e Critérios de Fixação."}, {"n": "2.5.2", "txt": "Conexão e Continência."}, {"n": "2.5.3", "txt": "Prevenção."}, {"n": "2.5.4", "txt": "Desaforamento."}]}, {"n": "2.6", "txt": "Prova.", "subs": [{"n": "2.6.1", "txt": "Conceito, Objeto, Meios e Princípios."}, {"n": "2.6.2", "txt": "Ônus da Prova."}, {"n": "2.6.3", "txt": "Meios de Prova."}, {"n": "2.6.4", "txt": "Provas Ilícitas."}, {"n": "2.6.5", "txt": "Cadeia de Custódia."}]}, {"n": "2.7", "txt": "Medidas Cautelares Pessoais.", "subs": [{"n": "2.7.1", "txt": "Prisão em Flagrante."}, {"n": "2.7.2", "txt": "Prisão Preventiva."}, {"n": "2.7.3", "txt": "Prisão Temporária."}, {"n": "2.7.4", "txt": "Liberdade Provisória com ou sem Fiança."}, {"n": "2.7.5", "txt": "Medidas Cautelares Diversas da Prisão."}]}, {"n": "2.8", "txt": "Prisão e Liberdade Provisória (arts. 283 a 350 do Código de Processo Penal)."}, {"n": "2.9", "txt": "Citações e Intimações.", "subs": [{"n": "2.9.1", "txt": "Conceito, Formas e Finalidades."}]}, {"n": "2.10", "txt": "Sentença Penal.", "subs": [{"n": "2.10.1", "txt": "Conceito, Classificação e Requisitos."}, {"n": "2.10.2", "txt": "Nulidades da Sentença."}]}, {"n": "2.11", "txt": "Recursos.", "subs": [{"n": "2.11.1", "txt": "Conceito, Princípios e Espécies."}, {"n": "2.11.2", "txt": "Recurso em Sentido Estrito."}, {"n": "2.11.3", "txt": "Apelação."}, {"n": "2.11.4", "txt": "Habeas Corpus."}, {"n": "2.11.5", "txt": "Recurso Especial e Recurso Extraordinário."}, {"n": "2.11.6", "txt": "Revisão Criminal."}]}, {"n": "2.12", "txt": "Nulidades.", "subs": [{"n": "2.12.1", "txt": "Conceito, Princípios e Classificação."}, {"n": "2.12.2", "txt": "Vícios Insanáveis e Sanáveis."}, {"n": "2.12.3", "txt": "Momento para Arguição."}]}, {"n": "2.13", "txt": "Procedimentos Especiais do Código de Processo Penal.", "subs": [{"n": "2.13.1", "txt": "Procedimento relativo aos Crimes de Responsabilidade dos Funcionários públicos."}, {"n": "2.13.2", "txt": "Processo e julgamento dos crimes de Calúnia e Injúria."}, {"n": "2.13.3", "txt": "Procedimento do Tribunal do Júri."}]}, {"n": "2.14", "txt": "Lei de Prisão Temporária (Lei n.º 7.960/1989)."}, {"n": "2.15", "txt": "Lei do Depoimento Especial (Lei n.º 13.431/2017)."}, {"n": "2.16", "txt": "Investigação Criminal Conduzida pelo Delegado de Polícia (Lei n.º 12.830/2013)."}, {"n": "2.17", "txt": "Lei de Proteção a Vítimas e Testemunhas (Lei n.º 9.807/1999)."}, {"n": "2.18", "txt": "Juizados Especiais Criminais (Lei n.º 9.099/1995)."}, {"n": "2.19", "txt": "Colaboração Premiada (Lei n.º 12.850/2013)."}, {"n": "2.20", "txt": "Lei de Interceptação Telefônica (Lei n.º 9.296/1996)."}, {"n": "2.21", "txt": "Apuração de Atos Infracionais – ECA (Lei n.º 8.069/1990)."}, {"n": "2.22", "txt": "Investigação Criminal Digital.", "subs": [{"n": "2.22.1", "txt": "Busca e Apreensão de Dispositivos Eletrônicos e Evidências Digitais."}, {"n": "2.22.2", "txt": "Quebra de Sigilo Telemático e Cadeia de Custódia Digital."}, {"n": "2.22.3", "txt": "Conhecimentos Técnicos aplicados à Investigação Criminal: Redes de Computadores, Protocolos de Internet, Ataques Cibernéticos, Malware, Criptografia, Blockchain e Criptomoedas."}]}]}, {"nome": "LEGISLAÇÃO PENAL E LEGISLAÇÃO PROCESSUAL PENAL EXTRAVAGANTE", "itens": [{"n": "3.1", "txt": "Lei de Execução Penal – LEP (Lei n.º 7.210/1984)."}, {"n": "3.2", "txt": "Lei dos Crimes Hediondos (Lei n.º 8.072/1990)."}, {"n": "3.3", "txt": "Lei dos Crimes contra a Ordem Tributária, Econômica e Relações de Consumo (Lei n.º 8.137/1990)."}, {"n": "3.4", "txt": "Lei de Interceptação Telefônica (Lei n.º 9.296/1996)."}, {"n": "3.5", "txt": "Lei de Tortura (Lei n.º 9.455/1997)."}, {"n": "3.6", "txt": "Lei de Lavagem de Dinheiro (Lei n.º 9.613/1998)."}, {"n": "3.7", "txt": "Código de Trânsito Brasileiro – CTB (Lei n.º 9.503/1997): crimes de trânsito e disposições penais e processuais penais aplicáveis."}, {"n": "3.8", "txt": "Estatuto do Desarmamento (Lei n.º 10.826/2003)."}, {"n": "3.9", "txt": "Lei Maria da Penha (Lei n.º 11.340/2006)."}, {"n": "3.10", "txt": "Lei de Drogas (Lei n.º 11.343/2006)."}, {"n": "3.11", "txt": "Lei de Migração (Lei n.º 13.445/2017): disposições penais e processuais penais aplicáveis."}, {"n": "3.12", "txt": "Lei das Organizações Criminosas (Lei n.º 12.850/2013)."}, {"n": "3.13", "txt": "Lei Antiterrorismo (Lei n.º 13.260/2016)."}, {"n": "3.14", "txt": "Lei de Abuso de Autoridade (Lei n.º 13.869/2019)."}, {"n": "3.15", "txt": "Pacote Anticrime (Lei n.º 13.964/2019)."}, {"n": "3.16", "txt": "Lei n.º 14.155/2021: crimes eletrônicos, fraudes eletrônicas e invasão de dispositivo informático."}, {"n": "3.17", "txt": "Colaboração premiada, infiltração de agentes, ação controlada, cadeia de custódia, investigação criminal, meios especiais de obtenção de prova e cooperação interinstitucional previstos na legislação extravagante."}, {"n": "3.18", "txt": "Marco Legal do Combate ao Crime Organizado no Brasil (Lei n.º 15.358/2026)."}, {"n": "3.19", "txt": "Estatuto da Advocacia e Ordem dos Advogados do Brasil (Lei n.º 8.906/1994 - aspectos penais e processuais penais)."}]}, {"nome": "DIREITO CONSTITUCIONAL", "itens": [{"n": "4.1", "txt": "Teoria da Constituição.", "subs": [{"n": "4.1.1", "txt": "Conceito, objeto e classificações das Constituições."}, {"n": "4.1.2", "txt": "Poder Constituinte: titularidade, espécies, características e limites."}, {"n": "4.1.3", "txt": "Mutação constitucional e reforma constitucional."}, {"n": "4.1.4", "txt": "Supremacia da Constituição e bloco de constitucionalidade."}, {"n": "4.1.5", "txt": "Normas constitucionais: eficácia plena, contida e limitada."}]}, {"n": "4.2", "txt": "Controle de Constitucionalidade.", "subs": [{"n": "4.2.1", "txt": "Conceito e histórico."}, {"n": "4.2.2", "txt": "Controle difuso e concentrado."}, {"n": "4.2.3", "txt": "ADI, ADC, ADPF e ADO."}, {"n": "4.2.4", "txt": "Recurso extraordinário."}, {"n": "4.2.5", "txt": "Efeitos das decisões em controle de constitucionalidade."}]}, {"n": "4.3", "txt": "Direitos e Garantias Fundamentais.", "subs": [{"n": "4.3.1", "txt": "Direitos e deveres individuais e coletivos."}, {"n": "4.3.2", "txt": "Direitos sociais."}, {"n": "4.3.3", "txt": "Nacionalidade."}, {"n": "4.3.4", "txt": "Direitos políticos."}, {"n": "4.3.5", "txt": "Partidos políticos."}]}, {"n": "4.4", "txt": "Organização do Estado.", "subs": [{"n": "4.4.1", "txt": "Organização político-administrativa da República Federativa do Brasil."}, {"n": "4.4.2", "txt": "Repartição de competências."}, {"n": "4.4.3", "txt": "Intervenção federal."}, {"n": "4.4.4", "txt": "Administração Pública."}]}, {"n": "4.5", "txt": "Organização dos Poderes.", "subs": [{"n": "4.5.1", "txt": "Poder Legislativo."}, {"n": "4.5.2", "txt": "Poder Executivo."}, {"n": "4.5.3", "txt": "Poder Judiciário."}, {"n": "4.5.4", "txt": "Funções essenciais à Justiça."}]}, {"n": "4.6", "txt": "Defesa do Estado e das Instituições Democráticas.", "subs": [{"n": "4.6.1", "txt": "Estado de defesa."}, {"n": "4.6.2", "txt": "Estado de sítio."}, {"n": "4.6.3", "txt": "Forças Armadas."}]}, {"n": "4.7", "txt": "Segurança Pública.", "subs": [{"n": "4.7.1", "txt": "Segurança pública na Constituição Federal."}, {"n": "4.7.2", "txt": "Órgãos de segurança pública."}, {"n": "4.7.3", "txt": "Polícia judiciária e atribuições constitucionais da Polícia Civil."}, {"n": "4.7.4", "txt": "Segurança pública na Constituição do Estado do Paraná."}, {"n": "4.7.5", "txt": "Polícia Civil do Estado do Paraná: natureza, direção por Delegado de Polícia, funções de polícia judiciária e apuração de infrações penais, exceto militares."}]}, {"n": "4.8", "txt": "Ordem Social.", "subs": [{"n": "4.8.1", "txt": "Base e objetivos da ordem social."}, {"n": "4.8.2", "txt": "Seguridade social."}, {"n": "4.8.3", "txt": "Educação, cultura e desporto."}, {"n": "4.8.4", "txt": "Meio ambiente."}, {"n": "4.8.5", "txt": "Família, criança, adolescente, jovem e idoso."}]}, {"n": "4.9", "txt": "Constituição do Estado do Paraná.", "subs": [{"n": "4.9.1", "txt": "Princípios fundamentais do Estado do Paraná."}, {"n": "4.9.2", "txt": "Organização político-administrativa do Estado e dos Municípios."}, {"n": "4.9.3", "txt": "Poderes do Estado: Legislativo, Executivo e Judiciário."}, {"n": "4.9.4", "txt": "Administração Pública estadual."}, {"n": "4.9.5", "txt": "Segurança Pública estadual."}, {"n": "4.9.6", "txt": "Polícia Civil do Estado do Paraná."}, {"n": "4.9.7", "txt": "Polícia Militar, Corpo de Bombeiros Militar, Polícia Penal e Polícia Científica no âmbito constitucional estadual."}]}]}, {"nome": "DIREITO ADMINISTRATIVO E GESTÃO PÚBLICA", "itens": [{"n": "5.1", "txt": "Conceito e fontes do Direito Administrativo.", "subs": [{"n": "5.1.1", "txt": "Objeto do Direito Administrativo."}, {"n": "5.1.2", "txt": "Fontes formais e materiais."}, {"n": "5.1.3", "txt": "Regime jurídico-administrativo."}]}, {"n": "5.2", "txt": "Princípios da Administração Pública.", "subs": [{"n": "5.2.1", "txt": "Princípios expressos e implícitos."}, {"n": "5.2.2", "txt": "Disposições da Lei de Introdução às Normas do Direito Brasileiro (LINDB) aplicáveis ao Direito Administrativo."}]}, {"n": "5.3", "txt": "Administração Pública.", "subs": [{"n": "5.3.1", "txt": "Administração direta e indireta."}, {"n": "5.3.2", "txt": "Desconcentração e descentralização."}, {"n": "5.3.3", "txt": "Órgãos públicos."}, {"n": "5.3.4", "txt": "Agentes públicos."}, {"n": "5.3.5", "txt": "Cargos, empregos e funções públicas."}]}, {"n": "5.4", "txt": "Atos administrativos.", "subs": [{"n": "5.4.1", "txt": "Conceito e requisitos."}, {"n": "5.4.2", "txt": "Atributos."}, {"n": "5.4.3", "txt": "Classificação."}, {"n": "5.4.4", "txt": "Espécies."}, {"n": "5.4.5", "txt": "Revogação, anulação e convalidação."}]}, {"n": "5.5", "txt": "Poderes da Administração Pública.", "subs": [{"n": "5.5.1", "txt": "Poder hierárquico."}, {"n": "5.5.2", "txt": "Poder disciplinar."}, {"n": "5.5.3", "txt": "Poder regulamentar."}, {"n": "5.5.4", "txt": "Poder de polícia."}, {"n": "5.5.5", "txt": "Abuso de poder."}, {"n": "5.5.6", "txt": "Lei n.º 13.869/2019."}]}, {"n": "5.6", "txt": "Serviços públicos.", "subs": [{"n": "5.6.1", "txt": "Conceito e princípios."}, {"n": "5.6.2", "txt": "Formas de prestação."}]}, {"n": "5.7", "txt": "Licitações e contratos administrativos.", "subs": [{"n": "5.7.1", "txt": "Lei n.º 14.133/2021."}, {"n": "5.7.2", "txt": "Contratos administrativos."}]}, {"n": "5.8", "txt": "Responsabilidade civil do Estado.", "subs": [{"n": "5.8.1", "txt": "Teoria do risco administrativo."}, {"n": "5.8.2", "txt": "Responsabilidade por atos de agentes públicos."}, {"n": "5.8.3", "txt": "Causas excludentes e atenuantes."}]}, {"n": "5.9", "txt": "Controle da Administração Pública.", "subs": [{"n": "5.9.1", "txt": "Controle administrativo, legislativo e judicial."}, {"n": "5.9.2", "txt": "Controle interno e externo."}, {"n": "5.9.3", "txt": "Autotutela administrativa."}]}, {"n": "5.10", "txt": "Improbidade Administrativa.", "subs": [{"n": "5.10.1", "txt": "Lei n.º 8.429/1992 e alterações posteriores."}, {"n": "5.10.2", "txt": "Atos de improbidade administrativa."}, {"n": "5.10.3", "txt": "Sanções aplicáveis."}]}, {"n": "5.11", "txt": "Gestão pública.", "subs": [{"n": "5.11.1", "txt": "Governança pública."}, {"n": "5.11.2", "txt": "Planejamento e gestão estratégica."}, {"n": "5.11.3", "txt": "Eficiência administrativa."}, {"n": "5.11.4", "txt": "Gestão por resultados."}, {"n": "5.11.5", "txt": "Transparência, integridade e controle na Administração Pública."}, {"n": "5.11.6", "txt": "Ética no serviço público."}, {"n": "5.11.7", "txt": "Gestão pública aplicada à segurança pública e à atividade policial."}]}, {"n": "5.12", "txt": "Organização administrativa da Polícia Civil do Estado do Paraná.", "subs": [{"n": "5.12.1", "txt": "Estrutura institucional."}, {"n": "5.12.2", "txt": "Carreiras policiais."}, {"n": "5.12.3", "txt": "Regime jurídico e atribuições funcionais."}]}]}, {"nome": "LEGISLAÇÃO ESTADUAL E INSTITUCIONAL", "itens": [{"n": "6.1", "txt": "Constituição do Estado do Paraná: disposições relativas à Administração Pública, servidores públicos, segurança pública e Polícia Civil."}, {"n": "6.2", "txt": "Estruturação das carreiras da Polícia Civil do Estado do Paraná: Lei Complementar Estadual n.º 259, de 21 de julho de 2023, e suas alterações posteriores."}, {"n": "6.3", "txt": "Lei Orgânica Nacional das Polícias Civis: Lei Federal n.º 14.735/2023."}, {"n": "6.4", "txt": "Lei Orgânica da Polícia Civil do Estado do Paraná: Lei Estadual n.º 23.213/2026."}, {"n": "6.5", "txt": "Código Disciplinar da Polícia Civil do Paraná: Lei Estadual n.º 21.894/2024."}, {"n": "6.6", "txt": "Regime jurídico dos servidores públicos do Estado do Paraná: Lei Estadual n.º 6.174/1970 e alterações posteriores; provimento; vacância; direitos; vantagens; deveres; proibições; responsabilidades; sindicância; processo administrativo disciplinar; responsabilidade civil, administrativa e penal do servidor público; ética no serviço público; sigilo funcional e proteção de informações institucionais."}, {"n": "6.7", "txt": "Legislação aplicada à atividade institucional e policial: Lei de Abuso de Autoridade (Lei n.º 13.869/2019); Lei de Identificação Criminal (Lei n.º 12.037/2009); Lei Geral de Proteção de Dados Pessoais – LGPD (Lei n.º 13.709/2018); Lei de Acesso à Informação (Lei n.º 12.527/2011)."}]}, {"nome": "DIREITOS HUMANOS", "itens": [{"n": "7.1", "txt": "Teoria Geral dos Direitos Humanos: conceito, características, princípios e evolução histórica dos Direitos Humanos."}, {"n": "7.2", "txt": "Sistemas de proteção dos Direitos Humanos: sistema global e sistema interamericano de proteção dos Direitos Humanos; tratados internacionais de proteção dos Direitos Humanos; Constituição da República Federativa do Brasil de 1988 e Direitos Humanos."}, {"n": "7.3", "txt": "Democracia, cidadania e Direitos Humanos."}, {"n": "7.4", "txt": "Direitos Humanos e grupos vulneráveis: mulheres, idosos, crianças e adolescentes, povos indígenas e comunidades tradicionais, pessoas com deficiência, população LGBTQIA+ e refugiados."}, {"n": "7.5", "txt": "Segurança pública e Direitos Humanos: dignidade da pessoa humana; uso proporcional da força; prevenção da tortura; direitos da pessoa presa; atuação policial e Direitos Humanos."}, {"n": "7.6", "txt": "Política Nacional de Direitos Humanos, educação em Direitos Humanos e cultura de proteção dos Direitos Humanos."}, {"n": "7.7", "txt": "Agenda 2030 e Objetivos de Desenvolvimento Sustentável (ODS)."}]}, {"nome": "CIÊNCIAS FORENSES", "itens": [{"n": "8.1", "txt": "Medicina Legal.", "subs": [{"n": "8.1.1", "txt": "Conceito e divisão da Medicina Legal."}, {"n": "8.1.2", "txt": "Histórico e importância para o Direito."}, {"n": "8.1.3", "txt": "Perícia médico-legal."}]}, {"n": "8.2", "txt": "Antropologia Forense.", "subs": [{"n": "8.2.1", "txt": "Identificação humana."}, {"n": "8.2.2", "txt": "Papiloscopia, prosopografia, odontologia legal e identificação por DNA."}, {"n": "8.2.3", "txt": "Reconhecimento facial automatizado."}, {"n": "8.2.4", "txt": "Aplicação de inteligência artificial na identificação pericial."}]}, {"n": "8.3", "txt": "Sexologia Forense.", "subs": [{"n": "8.3.1", "txt": "Hímen, gravidez, parto, aborto e crimes sexuais."}]}, {"n": "8.4", "txt": "Traumatologia Forense.", "subs": [{"n": "8.4.1", "txt": "Lesões e suas classificações."}, {"n": "8.4.2", "txt": "Lesões por instrumentos contundentes, cortantes, perfurantes, perfurocortantes e perfurocontundentes."}, {"n": "8.4.3", "txt": "Asfixiologia forense."}, {"n": "8.4.4", "txt": "Balística forense."}]}, {"n": "8.5", "txt": "Tanatologia Forense.", "subs": [{"n": "8.5.1", "txt": "Morte."}, {"n": "8.5.2", "txt": "Fenômenos cadavéricos."}, {"n": "8.5.3", "txt": "Data da morte."}, {"n": "8.5.4", "txt": "Causas jurídicas da morte."}, {"n": "8.5.5", "txt": "Necropsia."}]}, {"n": "8.6", "txt": "Toxicologia Forense.", "subs": [{"n": "8.6.1", "txt": "Conceito e importância."}, {"n": "8.6.2", "txt": "Intoxicações por álcool, entorpecentes e outras substâncias."}, {"n": "8.6.3", "txt": "Exames toxicológicos."}]}, {"n": "8.7", "txt": "Psicopatologia Forense.", "subs": [{"n": "8.7.1", "txt": "Sanidade mental e imputabilidade penal."}, {"n": "8.7.2", "txt": "Doenças mentais e transtornos de personalidade com repercussão penal."}, {"n": "8.7.3", "txt": "Simulação e dissimulação."}, {"n": "8.7.4", "txt": "Perícia psiquiátrica forense."}]}, {"n": "8.8", "txt": "Criminologia e Vitimologia Forense.", "subs": [{"n": "8.8.1", "txt": "Aspectos médico-legais da criminalidade e da vitimização."}]}, {"n": "8.9", "txt": "Documentoscopia e Grafoscopia.", "subs": [{"n": "8.9.1", "txt": "Conceitos fundamentais."}, {"n": "8.9.2", "txt": "Análise de documentos."}, {"n": "8.9.3", "txt": "Análise de escrita e assinaturas."}, {"n": "8.9.4", "txt": "Falsificações."}]}, {"n": "8.10", "txt": "Criminologia.", "subs": [{"n": "8.10.1", "txt": "Conceito e objeto da Criminologia."}, {"n": "8.10.2", "txt": "Método da Criminologia."}, {"n": "8.10.3", "txt": "Criminologia Crítica e Criminologia Positivista."}]}, {"n": "8.11", "txt": "Escolas Criminológicas.", "subs": [{"n": "8.11.1", "txt": "Escola Clássica."}, {"n": "8.11.2", "txt": "Escola Positiva."}, {"n": "8.11.3", "txt": "Sociologia Criminal."}, {"n": "8.11.4", "txt": "Teorias do Etiquetamento."}, {"n": "8.11.5", "txt": "Criminologia Crítica e Abolicionismo Penal."}, {"n": "8.11.6", "txt": "Teorias do Conflito."}, {"n": "8.11.7", "txt": "Crimes em massa e criminologia contemporânea."}]}, {"n": "8.12", "txt": "Vitimologia.", "subs": [{"n": "8.12.1", "txt": "Conceito e classificação das vítimas."}, {"n": "8.12.2", "txt": "Papel da vítima na gênese do delito."}, {"n": "8.12.3", "txt": "Vitimização primária, secundária e terciária."}, {"n": "8.12.4", "txt": "Políticas de assistência à vítima."}]}, {"n": "8.13", "txt": "Controle Social do Crime.", "subs": [{"n": "8.13.1", "txt": "Conceito de controle social."}, {"n": "8.13.2", "txt": "Controle social formal e informal."}, {"n": "8.13.3", "txt": "Agências de controle social."}, {"n": "8.13.4", "txt": "Prevenção do delito."}]}, {"n": "8.14", "txt": "Criminologia e Política Criminal.", "subs": [{"n": "8.14.1", "txt": "Relação entre Criminologia, Direito Penal e Política Criminal."}, {"n": "8.14.2", "txt": "Modelos de Política Criminal."}]}, {"n": "8.15", "txt": "Criminologia e Atuação Policial.", "subs": [{"n": "8.15.1", "txt": "Importância do conhecimento criminológico para a investigação criminal e gestão da segurança pública."}, {"n": "8.15.2", "txt": "Perfil criminal."}, {"n": "8.15.3", "txt": "Leitura e interpretação de indicadores de criminalidade e estatísticas criminais aplicadas à atuação policial."}]}, {"n": "8.16", "txt": "Criminologia Digital.", "subs": [{"n": "8.16.1", "txt": "Perfil do criminoso cibernético e análise de crimes digitais."}, {"n": "8.16.2", "txt": "Deep web, dark web e ambientes digitais criminógenos."}, {"n": "8.16.3", "txt": "Vitimização digital e prevenção de crimes cibernéticos. AGENTE DE POLÍCIA JUDICIÁRIA E PAPILOSCOPISTA POLICIAL CONHECIMENTOS GERAIS"}]}]}, {"nome": "LÍNGUA PORTUGUESA", "itens": [{"n": "1.1", "txt": "Interpretação e compreensão de texto."}, {"n": "1.2", "txt": "Organização estrutural dos textos."}, {"n": "1.3", "txt": "Marcas de textualidade: coesão, coerência e intertextualidade."}, {"n": "1.4", "txt": "Modos de organização discursiva: descrição, narração, exposição, argumentação e injunção; características específicas de cada modo."}, {"n": "1.5", "txt": "Tipos textuais: informativo, publicitário, propagandístico, normativo, didático e divinatório; características específicas de cada tipo."}, {"n": "1.6", "txt": "Textos literários e não literários."}, {"n": "1.7", "txt": "Tipologia da frase portuguesa."}, {"n": "1.8", "txt": "Estrutura da frase portuguesa: operações de deslocamento, substituição, modificação e correção."}, {"n": "1.9", "txt": "Problemas estruturais das frases."}, {"n": "1.10", "txt": "Norma culta."}, {"n": "1.11", "txt": "Pontuação e sinais gráficos."}, {"n": "1.12", "txt": "Organização sintática das frases: termos e orações."}, {"n": "1.13", "txt": "Ordem direta e inversa."}, {"n": "1.14", "txt": "Tipos de discurso."}, {"n": "1.15", "txt": "Registros de linguagem."}, {"n": "1.16", "txt": "Funções da linguagem."}, {"n": "1.17", "txt": "Elementos dos atos de comunicação."}, {"n": "1.18", "txt": "Estrutura e formação de palavras."}, {"n": "1.19", "txt": "Formas de abreviação."}, {"n": "1.20", "txt": "Classes de palavras; aspectos morfológicos, sintáticos, semânticos e textuais de substantivos, adjetivos, artigos, numerais, pronomes, verbos, advérbios, conjunções e interjeições; modalizadores."}, {"n": "1.21", "txt": "Semântica: sentido próprio e figurado; antônimos, sinônimos, parônimos e hiperônimos."}, {"n": "1.22", "txt": "Polissemia e ambiguidade."}, {"n": "1.23", "txt": "Os dicionários: tipos e organização de verbetes."}, {"n": "1.24", "txt": "Vocabulário: neologismos, arcaísmos, estrangeirismos e latinismos."}, {"n": "1.25", "txt": "Ortografia e acentuação gráfica."}, {"n": "1.26", "txt": "A crase."}]}, {"nome": "RACIOCÍNIO LÓGICO-MATEMÁTICO", "itens": [{"n": "2.1", "txt": "Lógica: proposições, conectivos, equivalências lógicas, quantificadores e predicados."}, {"n": "2.2", "txt": "Conjuntos e suas operações; diagramas."}, {"n": "2.3", "txt": "Números"}]}]}, {"id": "mpsc-promotor-2026", "nome": "MPSC · Promotor 2026 (VUNESP)", "materias": [{"nome": "CONHECIMENTOS GERAIS DA LÍNGUA PORTUGUESA", "itens": [{"n": "1.", "txt": "Ortografia oficial: acentuação gráfica, crase, pontuação."}, {"n": "2.", "txt": "Morfologia: classes gramaticais (substantivo, artigo, numeral, adjetivo, pronome, verbo, advérbio, conjunção, preposição)."}, {"n": "3.", "txt": "Sintaxe: análise sintática."}, {"n": "4.", "txt": "Colocação pronominal."}, {"n": "5.", "txt": "Concordância verbal e nominal."}, {"n": "6.", "txt": "Regência verbal e nominal."}, {"n": "7.", "txt": "Verbo (tempo, modo, pessoa)."}, {"n": "8.", "txt": "Semântica e pragmática linguística (interpretação e efeito de sentidos)"}]}, {"nome": "FUNDAMENTOS E NOÇÕES GERAIS DE DIREITO", "itens": [{"n": "1.", "txt": "O acesso à justiça."}, {"n": "2.", "txt": "Introdução à sociologia da administração judiciária."}, {"n": "3.", "txt": "Conflitos sociais e mecanismos de resolução. Sistemas não-judiciais de composição de litígios, negociação, mediação e autocomposição."}, {"n": "4.", "txt": "Hermenêutica jurídica: interpretação, integração e aplicação do Direito."}, {"n": "5.", "txt": "Fontes do Direito objetivo (material e formal)."}, {"n": "6.", "txt": "Teorias da argumentação jurídica. Retórica e Nova Retórica."}, {"n": "7.", "txt": "Filosofia do Direito: o conceito de Justiça. Sentido lato de Justiça, como valor Universal. Sentido estrito de Justiça, como valor jurídico-político."}, {"n": "8.", "txt": "Interpretação do Direito: raciocínio lógico-dedutivo e método pela lógica do razoável."}, {"n": "9.", "txt": "Direito Digital: Transformação Digital no Poder Judiciário e Ministério Público. Tecnologia e inovação no contexto jurídico. Automação do processo. Inteligência Artificial e Direito. Audiências virtuais. Cortes remotas. Ciência de dados e Jurimetria."}, {"n": "10.", "txt": "LGPD e proteção de dados pessoais."}, {"n": "11.", "txt": "Resolução CNMP n. 281/2023 (Institui a Política Nacional e o Sistema Nacional de Proteção de Dados Pessoais no MP)."}, {"n": "12.", "txt": "Resolução CNJ n. 615/2025 (Regulamenta o uso de IA [incluindo IA generativa] no Poder Judiciário, com regras de governança, transparência, supervisão humana e mitigação de riscos)."}, {"n": "13.", "txt": "Ato n. 918/25/PGJ (Dispõe sobre a Política de Inteligência Artificial no âmbito do Ministério Público de Santa Catarina). 78"}]}, {"nome": "CRIMINOLOGIA E POLÍTICA CRIMINAL", "itens": [{"n": "1.", "txt": "Conceito."}, {"n": "2.", "txt": "Objeto: crime, criminoso e pena."}, {"n": "3.", "txt": "Processos de criminalização e descriminalização."}, {"n": "4.", "txt": "Teorias criminológicas."}, {"n": "5.", "txt": "Escolas criminais."}, {"n": "6.", "txt": "Problemas atuais de Política Criminal: segurança pública, crime organizado, corrupção, drogas, violência de gênero, sistema prisional, justiça restaurativa centrada na vítima e violência policial."}, {"n": "7.", "txt": "Vitimologia."}, {"n": "8.", "txt": "Direitos das vítimas e tutela penal."}, {"n": "9.", "txt": "Participação da vítima no processo penal."}]}, {"nome": "DIREITO CONSTITUCIONAL", "itens": [{"n": "1.", "txt": "Constitucionalismo: evolução histórica, neoconstitucionalismo e constitucionalismo no Brasil. Teoria da Constituição: conceito, classificação e concepções de Constituição. Sistema Constitucional Brasileiro: desenvolvimento histórico-político."}, {"n": "2.", "txt": "Teoria Geral do Estado: formas de governo, formas de Estado, sistemas de governo, sistemas de Estado."}, {"n": "3.", "txt": "Democracia: conceito e classificações. Estado Democrático de Direito: conceito, fundamentos e objetivos."}, {"n": "4.", "txt": "Teoria da Norma Constitucional: espécies, natureza, aplicabilidade e eficácia. Teoria dos Princípios. Regras e princípios. Métodos, princípios e limites da interpretação constitucional. Função interpretativa dos princípios. Colisão de normas constitucionais. Mutação constitucional: fundamentos e limites. Teoria da recepção, repristinação e desconstitucionalização."}, {"n": "5.", "txt": "Poder constituinte: conceito, espécies, limitações. Revisão e reforma da Constituição."}, {"n": "6.", "txt": "Constituição da República Federativa do Brasil até a data da realização da prova.", "subs": [{"n": "6.1", "txt": "Dos Princípios Fundamentais. Dignidade da Pessoa Humana."}, {"n": "6.2", "txt": "Dos Direitos e das Garantias Fundamentais. Teoria Geral dos Direitos Fundamentais: classificação, funções, dimensões, limites e restrições aos Direitos fundamentais. Direitos fundamentais em espécie: individuais, coletivos, sociais e difusos. Integração normativa. Nacionalidade, cidadania e 79 direitos políticos. Instrumentos de garantia dos direitos fundamentais."}, {"n": "6.3", "txt": "Da organização do Estado. Estado Federal. Organização político- administrativa e repartição de competências. Da Administração Pública. Princípios, licitação e contratações públicas, Concurso público, servidores públicos civis e militares. Improbidade administrativa. Responsabilidade civil objetiva do Poder Público."}, {"n": "6.4", "txt": "Organização dos Poderes (Executivo, Legislativo e Judiciário): organização, funcionamento e funções. Funções essenciais à Justiça. Ministério Público: organização, princípios, funções, garantias e vedação. Conselho Nacional do Ministério Público. Advocacia Pública e Defensoria Pública."}, {"n": "6.5", "txt": "Da Defesa do Estado e das Instituições Democráticas."}, {"n": "6.6", "txt": "Da Tributação e do Orçamento."}, {"n": "6.7", "txt": "Da Ordem Econômica e Financeira. Princípios Gerais da Atividade Econômica e do Sistema Financeiro Nacional."}, {"n": "6.8", "txt": "Da Ordem Social."}, {"n": "6.9", "txt": "Disposições Constitucionais Gerais e Disposições Constitucionais Transitórias."}]}, {"n": "7.", "txt": "Constituição do Estado de Santa Catarina de 1989 até a data da realização da prova.", "subs": [{"n": "7.1", "txt": "Dos Princípios fundamentais."}, {"n": "7.2", "txt": "Dos Direitos e das garantias fundamentais."}, {"n": "7.3", "txt": "Da Organização Político Administrativa do Estado."}, {"n": "7.4", "txt": "Da Organização dos Poderes (Executivo, Legislativo e Judiciário): organização, funcionamento e funções. Funções Essenciais à Justiça. Ministério Público: organização, princípios, funções, garantias e vedação. Advocacia do Estado e Defensoria Pública."}, {"n": "7.5", "txt": "Da Segurança Pública: Polícia Civil, Polícia Militar, Corpo de Bombeiros Militar, Polícia Penal, Defesa Civil e Polícia Científica."}, {"n": "7.6", "txt": "Dos Assuntos Municipais e Microrregionais."}, {"n": "7.7", "txt": "Das Finanças Públicas: orçamentos e tributação."}, {"n": "7.8", "txt": "Da Ordem Econômica e Financeira."}, {"n": "7.9", "txt": "Da Ordem Social."}, {"n": "7.10", "txt": "Disposições Gerais e Disposições Constitucionais Transitórias."}]}, {"n": "8.", "txt": "Jurisdição Constitucional. Controle de Constitucionalidade. Repercussão geral. Evolução no direito comparado e no direito brasileiro. Formas de Controle. Controle Difuso e Concentrado. Pressupostos de constitucionalidade das espécies normativas. O Processo de Controle de 80 Normas: Natureza, Espécies, Legitimação e Participação, Procedimentos, a Decisão e seus efeitos. Ações Específicas: Ação Direta de Inconstitucionalidade, Ação Declaratória de Constitucionalidade, Ação Direta de Inconstitucionalidade por Omissão, Arguição de Descumprimento de Preceito Fundamental, Representação Interventiva. Processo e julgamento da ação direta de inconstitucionalidade e da ação declaratória de constitucionalidade perante o Supremo Tribunal Federal (Lei n. 9.868/1999). Processo e julgamento da arguição de descumprimento de preceito fundamental (Lei n. 9.882/1999). Súmulas Vinculantes, Súmulas e precedentes constitucionais. Controle de convencionalidade: conceito, espécies e modalidades. Controle de Constitucionalidade Estadual. Procedimento e julgamento da ação direta de inconstitucionalidade perante o Tribunal de Justiça de Santa Catarina (Lei Estadual n. 12.069/2001). Coisa julgada e controle de constitucionalidade. Os efeitos das decisões no controle de constitucionalidade de normas. Interpretação conforme a Constituição e Declaração de inconstitucionalidade parcial sem redução de texto. Controle de Constitucionalidade de leis e atos normativos municipais."}]}, {"nome": "DIREITO PENAL", "itens": [{"n": "1.", "txt": "Lei de introdução ao Código Penal. Código Penal."}, {"n": "2.", "txt": "Princípios penais. O caráter subsidiário e fragmentário do Direito Penal."}, {"n": "3.", "txt": "Dogmática Penal."}, {"n": "4.", "txt": "Lei e norma penal."}, {"n": "5.", "txt": "Aplicação da lei penal no tempo e no espaço."}, {"n": "6.", "txt": "Analogia e interpretação analógica."}, {"n": "7.", "txt": "Teoria do delito: noções gerais."}, {"n": "8.", "txt": "Sistemas da teoria do delito: sistema causal, finalista e funcionalismo."}, {"n": "9.", "txt": "Conceitos de crime: conceito material, conceito formal tripartido e conceito integral de crime."}, {"n": "10.", "txt": "Tipo penal: noções gerais. Composição e estrutura dos tipos penais. Espécies de tipos."}, {"n": "11.", "txt": "Concurso aparente de leis."}, {"n": "12.", "txt": "Conduta: ação e omissão."}, {"n": "13.", "txt": "Tipicidade objetiva. Resultado. Relação de causalidade e causa INUS. A relação entre a omissão e o resultado."}, {"n": "14.", "txt": "Tipicidade subjetiva. Dolo e culpa. Cegueira 81 deliberada. Erro de tipo. Erro sobre a pessoa. Erro na execução."}, {"n": "15.", "txt": "Iter criminis: consumação e tentativa. Desistência voluntária. Arrependimento eficaz. Arrependimento posterior. Crime impossível. Delito putativo."}, {"n": "16.", "txt": "Teoria da imputação objetiva."}, {"n": "17.", "txt": "Autoria. Coautoria. Participação."}, {"n": "18.", "txt": "Ilicitude/antijuridicidade. noções gerais."}, {"n": "19.", "txt": "Causas de exclusão da ilicitude. Excesso."}, {"n": "20.", "txt": "Culpabilidade: noções gerais. Exigibilidade de conduta diversa."}, {"n": "21.", "txt": "Imputabilidade."}, {"n": "22.", "txt": "Causas de exclusão ou redução da culpabilidade. Erro de proibição. Descriminante putativa. Coação. Obediência hierárquica. Estado de necessidade desculpante. Embriaguez. Violenta emoção."}, {"n": "23.", "txt": "Punibilidade: noções gerais. Punibilidade abstrata e concreta."}, {"n": "24.", "txt": "Bem jurídico. Lesividade e dignidade penal/merecimento de pena."}, {"n": "25.", "txt": "Insignificância penal/bagatelas."}, {"n": "25.", "txt": "Concursos de delitos: formal, material e continuidade delitiva."}, {"n": "26.", "txt": "Responsabilidade penal da pessoa jurídica."}, {"n": "26.", "txt": "Sanção penal: modalidades, fundamentos, finalidades, teorias e princípios."}, {"n": "27.", "txt": "Aplicação da pena. Dosimetria penal e regimes de execução."}, {"n": "28.", "txt": "Efeitos da condenação."}, {"n": "29.", "txt": "Medidas de segurança."}, {"n": "30.", "txt": "Extinção da punibilidade."}, {"n": "31.", "txt": "Prescrição."}, {"n": "32.", "txt": "Crimes em espécie previstos no Código Penal."}, {"n": "33.", "txt": "Leis penais especiais."}, {"n": "34.", "txt": "Lei das Contravenções Penais (Decreto-Lei n. 3.688/1941)."}, {"n": "35.", "txt": "Lei n. 1.079/1950."}, {"n": "36.", "txt": "Decreto-Lei n. 201/1967."}, {"n": "37.", "txt": "Código Penal Militar (Decreto-Lei n. 1.001/1969)."}, {"n": "38.", "txt": "Lei do Parcelamento do Solo Urbano (Lei n. 6.766/1979)."}, {"n": "39.", "txt": "Crimes resultantes de preconceito de raça e cor (Lei n. 7.716/1989)."}, {"n": "40.", "txt": "Crimes contra as Pessoas com Deficiência (Lei n. 7.853/1989)."}, {"n": "41.", "txt": "Estatuto da Criança e do Adolescente (Lei n. 8.069/1990)."}, {"n": "42.", "txt": "Crimes hediondos (Lei n. 8.072/1990)."}, {"n": "43.", "txt": "Código de Defesa do Consumidor (Lei n. 8.078/1990)."}, {"n": "44.", "txt": "Crimes contra a ordem tributária, econômica e contra as relações de consumo (Lei n. 8.137/1990 e Lei n. 8.176/1991)."}, {"n": "45.", "txt": "Juizados especiais criminais (Lei n. 9.099/1995 e Lei n. 10.259/2001)."}, {"n": "46.", "txt": "Crimes contra a propriedade industrial (Lei n. 9.279/1996)."}, {"n": "47.", "txt": "Remoção ilegal de órgãos, tecidos e partes do corpo humano (Lei n. 9.434/1997)."}, {"n": "48.", "txt": "Tortura (Lei n. 82 9.455/1997)."}, {"n": "49.", "txt": "Código de Trânsito Brasileiro (Lei n. 9.503/1997)."}, {"n": "50.", "txt": "Crimes contra o Meio Ambiente (Lei n. 9.605/1998)."}, {"n": "51.", "txt": "Crimes contra a propriedade intelectual de programas de computador (Lei n. 9.609/1998)."}, {"n": "52.", "txt": "Lavagem de dinheiro (Lei n. 9.613/1998)."}, {"n": "53.", "txt": "Infrações penais de repercussão interestadual ou internacional que exigem repressão uniforme (Lei n. 10.446/2002)."}, {"n": "54.", "txt": "Crimes contra a Pessoa Idosa (Lei n. 10.741/2003)."}, {"n": "55.", "txt": "Estatuto do Desarmamento (Lei n. 10.826/2003)."}, {"n": "56.", "txt": "Lei de Falência (Lei n. 11.101/2005)."}, {"n": "57.", "txt": "Lei da Biossegurança (Lei n. 11.105/2005)."}, {"n": "58.", "txt": "Lei Maria da Penha (Lei n. 11.340/2006)."}, {"n": "59.", "txt": "Lei de Drogas (Lei n. 11.343/2006)."}, {"n": "60.", "txt": "Organizações criminosas (Lei n. 12.850/2013)."}, {"n": "61.", "txt": "Discriminação dos portadores do vírus da imunodeficiência humana (HIV) e doentes de AIDS (Lei n. 12.984/2014)."}, {"n": "62.", "txt": "Estatuto da Pessoa com Deficiência (Lei n. 13.146/2015)."}, {"n": "63.", "txt": "Lei Antiterrorismo (Lei n. 13.260/2016)."}, {"n": "64.", "txt": "Crime do Sistema de Garantia de Direitos da Criança e do Adolescente Vítima ou Testemunha de Violência (Lei n. 13.431/2017)."}, {"n": "65.", "txt": "Abuso de autoridade (Lei n. 13.869/2019)."}, {"n": "66.", "txt": "Lei Anticrime (Lei n. 13.964/2019)."}, {"n": "67.", "txt": "Lei de Prevenção e Enfrentamento da violência doméstica e familiar contra a criança e o adolescente (Lei n. 14.344/2022)."}, {"n": "68.", "txt": "Lei Geral do Esporte (Lei n. 14.597/2023)."}, {"n": "69.", "txt": "Política Antimanicomial do Poder Judiciário (Resolução CNJ n. 487/2023)."}, {"n": "70.", "txt": "Lei n. 14.811/24 (Lei de Proteção ao Bullying e Cyberbullying)."}]}, {"nome": "DIREITO PROCESSUAL PENAL", "itens": [{"n": "1.", "txt": "Norma processual penal. Princípios constitucionais e infraconstitucionais. Interpretação e integração."}, {"n": "2.", "txt": "A lei processual penal no tempo, no espaço e em relação às pessoas."}, {"n": "3.", "txt": "Teoria geral do processo penal. Sistemas processuais penais. Processo Penal Constitucional. Direitos e garantias constitucionais do acusado. Normas internacionais de proteção ao acusado. Pacto de São José da Costa Rica e Pacto Internacional sobre Direitos Civis e Políticos de Nova Iorque. Princípio do favor rei e suas derivações. Evolução 83 histórica da persecução penal no Brasil. As modificações na legislação processual penal brasileira após o Código de"}, {"n": "1941.", "txt": "Reformas pontuais do código de processo penal. Tendências atuais do processo penal brasileiro."}, {"n": "4.", "txt": "Lei de Introdução ao Código de Processo Penal e Código de Processo Penal."}, {"n": "5.", "txt": "Juiz de Garantias."}, {"n": "6.", "txt": "Investigação criminal: inquérito policial e outras espécies de investigação preliminar; atos de investigação pelo Ministério Público (Ato n. 397/2018/PGJ/MPSC; Resolução CNMP n. 181/2017). Controle externo da atividade policial. Direitos do preso e do indiciado."}, {"n": "7.", "txt": "Ação penal: de iniciativa pública e de iniciativa privada; denúncia e queixa; aditamentos; ação civil ex delicto. Acordo de não persecução penal."}, {"n": "8.", "txt": "Jurisdição e competência."}, {"n": "9.", "txt": "Questões e procedimentos incidentes."}, {"n": "10.", "txt": "Sequestro de bens (Decreto-Lei n. 3.240/41)."}, {"n": "11.", "txt": "Provas: sistemas de avaliação; ônus; limites éticos e jurídicos da prova; Teoria dos frutos da árvore envenenada."}, {"n": "12.", "txt": "Meios de prova: meios processuais e operacionais de combate ao crime organizado; aos crimes de colarinho branco; de lavagem de dinheiro; sigilos bancário, fiscal e telefônico; interceptações telefônicas; proteção a vítimas e testemunhas ameaçadas; e réu colaborador."}, {"n": "13.", "txt": "Ministério público: titularidade da ação penal e princípio acusatório. Ministério Público como parte e como fiscal da lei. Objetividade da atuação do Ministério Público. Efeitos dos princípios institucionais do Ministério Público no processo penal. Prerrogativas funcionais do Ministério Público."}, {"n": "14.", "txt": "Juiz: deveres judiciais em relação às partes."}, {"n": "15.", "txt": "Defesa Pública e particular. Defesa técnica e autodefesa."}, {"n": "16.", "txt": "O acusado."}, {"n": "17.", "txt": "Vítima."}, {"n": "18.", "txt": "Assistente de acusação."}, {"n": "19.", "txt": "Prisão em flagrante, prisão preventiva, medidas cautelares e a liberdade provisória. Prisão temporária (Lei n. 7.960/1989)."}, {"n": "20.", "txt": "Citações e intimações."}, {"n": "21.", "txt": "Sentença criminal e coisa julgada. Princípio da correlação."}, {"n": "22.", "txt": "Procedimento comum."}, {"n": "23.", "txt": "Procedimentos especiais e sumários previstos no Código de Processo Penal (Decreto-Lei n. 3.689/1941) e nas Leis extravagantes."}, {"n": "24.", "txt": "O Tribunal do Júri. 25. 84 Nulidades e recursos em geral."}, {"n": "26.", "txt": "Ações autônomas de impugnação: revisão criminal, habeas corpus e mandado de segurança em matéria penal (Lei n. 12.016/2009)."}, {"n": "27.", "txt": "Lei de Execução Penal. Graça, indulto e anistia."}, {"n": "28.", "txt": "Disposições gerais do Código de Processo Penal."}, {"n": "29.", "txt": "Aspectos processuais penais dos seguintes textos normativos: Código de Processo Penal Militar (Decreto-Lei n. 1.002/1969). Lei dos Crimes Hediondos (Lei n 8.072/1990). Juizados Especiais Criminais Estaduais (Lei n. 9.099/1995) e Federais (Lei n. 10.259/2001). Organizações criminosas (Lei n. 12.850/2013). Interceptação telefônica (Lei n. 9.296/1996). Código de Trânsito Brasileiro (Lei n. 9.503/1997). Lei dos crimes ambientais (Lei n. 9.605/1998). Lei de lavagem de dinheiro (Lei n. 9.613/1998). Proteção a vítimas e testemunhas (Lei n. 9.807/1999). Identificação criminal (Lei n. 12.037/2009). Sigilo das operações de instituições financeiras (Lei Complementar Federal n. 105/2001). Estatuto da Pessoa Idosa (Lei n. 10.741/2003). Lei de Falências (Lei n. 11.101/2005). Violência doméstica e familiar contra a mulher (Lei n. 11.340/2006). Investigação criminal conduzida pelo Delegado de Polícia (Lei n. 12.830/2013). Processo e julgamento colegiado em crimes praticados por organizações criminosas (Lei n. 12.694/2012). Audiência de Custódia (Resolução CNJ n. 213/2015). Tráfico de pessoas cometido no território nacional e no exterior (Lei n. 13.344/2016). Lei do Sistema de Garantia de Direitos da Criança e do Adolescente Vítima ou Testemunha de Violência (Lei n. 13.431/2017). Diretrizes para a realização do reconhecimento de pessoas em procedimentos e processos criminais e sua avaliação no âmbito do Poder Judiciário (Resolução CNJ n. 484/2022). Lei de Drogas (n. 11.343/2006)."}]}, {"nome": "EXECUÇÃO PENAL", "itens": [{"n": "1.", "txt": "Fundamentos constitucionais, conceito e princípios."}, {"n": "2.", "txt": "Objeto e aplicação da Lei de Execução Penal."}, {"n": "3.", "txt": "Classificação."}, {"n": "4.", "txt": "Assistência ao preso e ao egresso."}, {"n": "5.", "txt": "Direitos e deveres do preso."}, {"n": "6.", "txt": "Disciplina. Faltas e sanções. Procedimento disciplinar. 85 Regime disciplinar diferenciado."}, {"n": "7.", "txt": "Trabalho do preso."}, {"n": "8.", "txt": "Órgãos da execução penal."}, {"n": "9.", "txt": "Estabelecimentos Penais."}, {"n": "10.", "txt": "Execução das penas privativas de liberdade."}, {"n": "11.", "txt": "Execução das penas restritivas de direitos."}, {"n": "12.", "txt": "Execução das medidas de segurança."}, {"n": "13.", "txt": "Execução da pena de multa."}, {"n": "14.", "txt": "Incidentes da Execução."}, {"n": "15.", "txt": "Procedimento Judicial. Recursos."}, {"n": "16.", "txt": "Reabilitação."}]}, {"nome": "DIREITO CIVIL", "itens": [{"n": "1.", "txt": "Lei de Introdução às normas do Direito Brasileiro. Princípios fundamentais do direito civil."}, {"n": "2.", "txt": "Das pessoas: Das pessoas naturais e jurídicas. Da personalidade e da capacidade. Dos direitos da personalidade. Da proteção de dados como direito de personalidade. Da ausência. Da doação de órgãos e tecidos."}, {"n": "3.", "txt": "Das pessoas jurídicas: Disposições gerais. Constituição, extinção e responsabilidade. Associações, fundações e sociedades. Desconsideração da personalidade jurídica. Fiscalização das fundações pelo Ministério Público."}, {"n": "4.", "txt": "Do domicílio."}, {"n": "5.", "txt": "Dos bens: Dos bens considerados em si mesmos (bens imóveis, móveis, fungíveis e consumíveis, divisíveis, singulares e coletivos). Dos bens reciprocamente considerados. Bens públicos e particulares."}, {"n": "6.", "txt": "Dos fatos jurídicos. Dos atos jurídicos lícitos. Dos atos ilícitos. Do negócio jurídico: modalidade, forma, defeitos e nulidades. Da representação. Da condição, do termo e do encargo. Da interpretação do negócio jurídico. Da invalidade e da ineficácia do negócio jurídico."}, {"n": "7.", "txt": "Da prescrição e da decadência."}, {"n": "8.", "txt": "Da prova."}, {"n": "9.", "txt": "Do direito das obrigações: Das modalidades e efeitos. Adimplemento, extinção e inadimplemento. Da cláusula penal e arras. Da transferência das obrigações."}, {"n": "10.", "txt": "Responsabilidade civil: Responsabilidade subjetiva e objetiva. Responsabilidade contratual e extracontratual. Culpa, dano, antijuridicidade e nexo de causalidade. Excludentes de responsabilidade e excludentes de antijuridicidade. Dano moral e material. Indenização. Responsabilidade por fato de outrem. Responsabilidade por fato da coisa. 86 Responsabilidade civil e criminal."}, {"n": "11.", "txt": "Do enriquecimento sem causa."}, {"n": "12.", "txt": "Dos contratos em geral: Princípios. Elementos constitutivos. Pressupostos de validade. Interpretação. Classificação. Vícios redibitórios. Evicção. Da extinção do contrato."}, {"n": "13.", "txt": "Dos Contratos em espécie e dos atos unilaterais."}, {"n": "14.", "txt": "Do direito das coisas: Princípios. Da posse e de sua classificação. Da aquisição, efeitos e perda da posse. Da propriedade em geral. Histórico da propriedade e sua funcionalidade social. Da aquisição da propriedade imóvel e móvel. Usucapião constitucional urbana. Usucapião constitucional rural. Usucapião especial coletiva. Usucapião administrativa. Usucapião especial indígena. Da perda da propriedade. Das restrições ao direito da propriedade. Dos direitos de vizinhança. Do condomínio geral. Do condomínio edilício. Do condomínio de lotes. Do condomínio em multipropriedade. Novas formas de propriedade condominial. Da propriedade resolúvel. Da propriedade fiduciária. Dos direitos reais sobre coisa alheia. Da superfície. Das servidões. Do usufruto e da administração dos bens de filhos menores. Do uso. Da habitação. Do direito do promitente comprador. Do penhor, da hipoteca e da anticrese. Da laje. Incorporação. Parcelamento e Regularização do Solo Urbano. Estatuto da Cidade. Da atuação do Ministério Público em conflitos fundiários urbanos e rurais."}, {"n": "15.", "txt": "Do direito de família: Do casamento. Da capacidade matrimonial. Formalidades. Das relações de parentesco. Dos impedimentos. Das causas suspensivas. Do processo de habilitação. Da celebração do casamento. Das provas do casamento. Dos efeitos. Da eficácia do casamento. Da invalidade ou nulidade do casamento. Da dissolução da sociedade e do vínculo conjugal. Do direito assistencial. Dos alimentos. Da proteção da pessoa dos filhos. Da filiação: registral, biológica e socioafetiva. Do reconhecimento dos filhos. Da adoção. Do poder familiar. Do direito patrimonial. Do pacto antenupcial. Do regime de comunhão parcial. Do regime de comunhão universal. Do regime de participação final dos aquestos. Do regime de separação de bens. Da 87 união estável. Da guarda, tutela, curatela, da toma de decisão apoiada e da interdição. Do bem de família. Alienação Parental."}, {"n": "16.", "txt": "Dos direitos das sucessões: Da sucessão em geral. Da sucessão legítima. Da sucessão testamentária. Do testamento em geral. Da capacidade de testar. Das formas ordinárias do testamento. Da revogação. Dos codicilos. Dos testamentos especiais. Das disposições testamentárias. Dos legados. Herdeiros necessários. Do direito de acrescer entre herdeiros e legatários. Das substituições. Da deserdação. Da redução das disposições testamentárias. Da revogação. Do rompimento do testamento. Do testamenteiro. Do inventário e da partilha."}, {"n": "17.", "txt": "Registros Públicos: Registro de imóveis. Registro Civil das Pessoas Naturais. Lei n. 13.726/2018 (Lei da Desburocratização). Lei n. 9.265/96 (Lei da gratuidade dos atos necessários ao exercício da cidadania)."}]}, {"nome": "DIREITO PROCESSUAL CIVIL", "itens": [{"n": "1.", "txt": "Princípios do Processo Civil. Princípios constitucionais expressos e implícitos."}, {"n": "2.", "txt": "Teoria da ação: elementos, condições, tipologia das ações."}, {"n": "3.", "txt": "Normas processuais civis: normas fundamentais do processo civil, interpretação e aplicação das normas processuais."}, {"n": "4.", "txt": "Jurisdição e competência: conceituação."}, {"n": "5.", "txt": "Função jurisdicional: limites da jurisdição nacional, cooperação internacional. Competência interna: critérios determinantes. Competência absoluta e relativa. Modificação da competência. Cooperação nacional."}, {"n": "6.", "txt": "Sujeitos do processo. Partes e procuradores: capacidade e deveres. Litisconsórcio. Modalidades de intervenção de terceiros. Juiz e auxiliares da Justiça: poderes, deveres e responsabilidade. Impedimentos e suspeição. Ministério Público. Perfil constitucional. Intervenção como parte e como fiscal da lei. Racionalização da intervenção. Impedimentos e suspeição. Advocacia pública. Defensoria Pública."}, {"n": "7.", "txt": "Métodos de resolução dos litígios individuais e coletivos. Mecanismos de autocomposição, negociação, mediação, conciliação, arbitragem, práticas 88 restaurativas e convenções. Política Nacional de Incentivo à Autocomposição no âmbito do Ministério Público (Resolução CNMP n. 118/2014). Política Nacional de Incentivo à Atuação Resolutiva do Ministério Público brasileiro (Recomendação CNMP n. 54/2017)"}, {"n": "8.", "txt": "Atos processuais. Forma, tempo e lugar dos atos processuais. Prazos: verificação, natureza e contagem. Preclusão. Comunicação dos atos processuais. Fatos jurídicos processuais. Atos, fatos e negócios processuais. Nulidades: conceituação e classificação. Distribuição e registro. Valor da causa."}, {"n": "9.", "txt": "Tutela jurisdicional. Formas de tutela. Tutelas provisórias: conceituação e características. Tutela de urgência. Tutela antecipada e tutela cautelar requeridas em caráter antecedente. Tutela da evidência. Medidas cautelares contra o poder público."}, {"n": "10.", "txt": "Formação, suspensão e extinção do processo."}, {"n": "11.", "txt": "Processo de conhecimento e cumprimento de sentença."}, {"n": "12.", "txt": "Procedimento comum. Petição inicial, improcedência liminar do pedido, audiências de conciliação e mediação, contestação, reconvenção e revelia. Providências de saneamento. Julgamento conforme o estado do processo. Audiência de instrução e julgamento."}, {"n": "13.", "txt": "Provas. Teoria da prova. Provas lícitas e ilícitas. A função probatória no processo civil. Produção antecipada de prova. Ata notarial, depoimento pessoal, confissão, exibição de documento ou coisa. Prova documental: força probante, arguição de falsidade, produção e documentos eletrônicos. Prova testemunhal: admissibilidade, valor e produção. Prova pericial. Inspeções judiciais."}, {"n": "14.", "txt": "Sentença e coisa julgada. Elementos e efeitos da sentença. Remessa necessária. Julgamento das ações relativas a prestações de fazer, não fazer e entregar coisa. Conceito de coisa julgada. A coisa julgada no processo civil. Efeitos da coisa julgada. Liquidação de sentença."}, {"n": "15.", "txt": "Cumprimento das sentenças. Sentença que reconhece a exigibilidade de obrigação de pagar quantia certa: cumprimentos provisório e definitivo. Sentença que reconhece a exigibilidade da obrigação de prestar alimentos. Sentença 89 que reconhece a exigibilidade de obrigação de pagar quantia certa pela Fazenda Pública. Sentença que reconheça a exigibilidade de obrigação de fazer, de não fazer ou de entregar coisa."}, {"n": "16.", "txt": "Procedimentos especiais. Ação de consignação em pagamento. Ação de exigir contas. Ações possessórias. Ação de divisão e demarcação de terras particulares. Ação de dissolução parcial de sociedade. Inventário e partilha. Embargos de terceiro. Oposição. Habilitação. Ações de família. Ação de alimentos. Divórcio. Ação Monitória. Restauração de autos. Procedimentos de jurisdição voluntária."}, {"n": "17.", "txt": "Processo de execução. Execução em geral. Partes e competência. Requisitos da execução. Responsabilidade patrimonial. Execuções em espécie: obrigações de entrega de coisa, obrigações de fazer ou de não fazer, execuções por quantia certa, execuções contra a Fazenda Pública, execução de alimentos. Embargos à execução. Suspensão e extinção das execuções. Impenhorabilidade do bem de família."}, {"n": "18.", "txt": "Processos nos tribunais e meios de impugnação das decisões judiciais. Teoria dos recursos: conceito, classificações, juízo de admissibilidade e juízo de mérito. Duplo grau de jurisdição. Efeitos dos recursos. Recursos adesivos. Deveres dos tribunais. Ordem dos processos no tribunal. Teoria do precedente. Súmulas vinculantes."}, {"n": "19.", "txt": "Processos e incidentes de competência originária nos tribunais. Incidente de assunção de competência. Incidente de arguição de inconstitucionalidade. Conflito de competência. Homologação de decisões estrangeiras e concessão de exequatur à carta rogatória. Ação rescisória. Incidente de resolução de demandas repetitivas. Reclamação."}, {"n": "20.", "txt": "Recursos ordinários em espécie: apelação, agravo de instrumento, agravo interno, embargos de declaração. Disposições comuns e específicas."}, {"n": "21.", "txt": "Recursos para o Supremo Tribunal Federal e para o Superior Tribunal de Justiça. Recurso ordinário. Requisitos específicos dos recursos a tribunais superiores. Óbices de admissibilidade. Súmulas do STJ e do STF em matéria recursal. Recurso Extraordinário e Recurso Especial. Julgamento 90 dos recursos extraordinário e especial repetitivos. Agravo em Recurso Especial e Recurso Extraordinário. Embargos de Divergência."}, {"n": "22.", "txt": "Direito processual coletivo. Conceito e princípios das tutelas coletivas. Regramento da competência. Conexão e litispendência. Legitimidade ad causam. Inquérito civil: natureza jurídica, características, formas de instauração, arquivamento e o papel do Conselho Superior do Ministério Público. Compromisso de ajustamento de conduta: legitimados, conteúdo, limites, efeitos. Execução do compromisso de ajustamento de conduta. Especificidades do processo coletivo: intervenção de terceiros, liquidação e execução de sentença, coisa julgada e reexame necessário."}, {"n": "23.", "txt": "Ação civil pública. Ritos e medidas antecipatórias na proteção da probidade administrativa, patrimônio público, consumidor e meio ambiente. Ação de ressarcimento ao erário."}, {"n": "24.", "txt": "Juizados especiais cíveis e da Fazenda Pública."}, {"n": "25.", "txt": "Assistência judiciária."}, {"n": "26.", "txt": "Prescrição das ações contra a Fazenda Pública e suas dívidas (Decreto n. 20.910/1932 e Decreto-lei n. 4.597/1942)."}, {"n": "27.", "txt": "Ações constitucionais. Mandado de segurança (individual e coletivo). Mandado de injunção. Ação popular. Habeas data."}, {"n": "28.", "txt": "Processo judicial eletrônico. Informatização do processo judicial (Lei n. 11.419/2006)."}, {"n": "29.", "txt": "Lei de Introdução às Normas do Direito Brasileiro (Decreto-Lei n. 4.657/1942); Assistência Judiciária (Lei n. 1.060/1950); Ação Popular (Lei n. 4.717/1965); Ação de Alimentos (Lei n. 5.478/1968); Dissolução da sociedade conjugal e do casamento (Lei n. 6.515/1977); Impenhorabilidade do bem de família (Lei n. 8.009/1990); Concessão de medidas cautelares contra atos do Poder Público (Lei n. 8.437/1992); Investigação de Paternidade dos filhos havidos fora do casamento (Lei n. 8.560/1992); Juizados Especiais Cíveis (Lei n. 9.099/1995); A edição, a revisão e o cancelamento de enunciado de súmula vinculante pelo Supremo Tribunal Federal (Lei n. 11.417/2006)."}, {"n": "30.", "txt": "A mediação e a autocomposição de conflitos (Lei n. 13.140/2015). 91"}]}, {"nome": "DIREITOS DIFUSOS E COLETIVOS", "itens": [{"n": "(a)", "txt": "Processo Coletivo:", "subs": [{"n": "1.", "txt": "Teoria Geral da Tutela Coletiva. Princípios e Institutos. Tutela coletiva e direitos fundamentais. Características. Aplicação da proporcionalidade. Colisões de direitos fundamentais. Restrições a direitos fundamentais. Metodologia para aplicação da proporcionalidade."}, {"n": "2.", "txt": "Interesses difusos, coletivos e individuais homogêneos. Titularidade dos direitos coletivos lato sensu."}, {"n": "3.", "txt": "Microssistema de tutela coletiva."}, {"n": "4.", "txt": "Ações coletivas: instrumentos gerais e específicos, espécies de tutela, legitimidade, causa de pedir e pedido, prova, competência, litispendência, conexão e continência, litisconsórcio e assistência, prescrição, decadência, intervenção de terceiros, decisões, coisa julgada, recursos, cumprimento de sentença, liquidação, execução, abandono, desistência, reconvenção, ônus da prova, litigância de má-fé, despesas processuais e demais institutos correlatos."}, {"n": "5.", "txt": "Relações entre ações coletivas e ações individuais."}, {"n": "6.", "txt": "O processo coletivo como espécie de processo de interesse público. Modelos de tutela jurisdicional dos direitos coletivos: Modelo da Verbandsklage e Modelo das Class Actions."}, {"n": "7.", "txt": "Processo estrutural. Conceito. Objeto. Características. Participação e representação no processo estrutural. Técnicas de efetivação do processo estrutural. Execução consensual. Atuação do Ministério Público em problemas estruturais (Recomendação de Caráter Geral CNMP n. 5/2025/CN)."}, {"n": "8.", "txt": "Mecanismos de autocomposição: negociação, mediação, conciliação, arbitragem, processo restaurativo, convenções e negócios jurídicos processuais. Autocomposição em direitos coletivos (lato sensu) e indisponíveis (Resolução CNMP n. 118/2014)"}, {"n": "9.", "txt": "Procedimento Administrativo (Resolução CNMP n. 174/2017 e Ato n. 398/2018/PGJ). Protocolo para implementação de iniciativas em políticas públicas."}, {"n": "10.", "txt": "Audiências públicas. (Resolução CNMP n. 207/2020)."}, {"n": "11.", "txt": "Recursos nos processos coletivos. Incidente de resolução de demandas repetitivas (IRDR). Incidente de Assunção de Competência (IAC)."}, {"n": "12.", "txt": "Coisa julgada 92 coletiva."}, {"n": "13.", "txt": "Liquidação da sentença coletiva. Execução de sentença coletiva. Execução coletiva de títulos extrajudiciais."}, {"n": "14.", "txt": "Fundos de direitos difusos e coletivos. Fundo Estadual para Reconstituição de Bens Lesados (Lei Complementar Estadual n. 738/2019)."}, {"n": "15.", "txt": "Ministério Público no direito processual coletivo. Interesse e legitimação na atuação do Ministério Público na defesa dos interesses sociais, metaindividuais e individuais indisponíveis."}, {"n": "16.", "txt": "Inquérito Civil: objeto, instauração, poderes instrutórios, compromisso de ajustamento de condutas, recomendação e arquivamento. Resolução CNMP n. 23/2007 e Ato n. 395/2018/PGJ. Resolução CNMP n. 179/"}, {"n": "2017.", "txt": "Resolução CNMP n. 164/2017."}, {"n": "17.", "txt": "Aspectos processuais e principiológicos da Lei de Ação Civil Pública (Lei n. 7.347/1985), da Lei de Ação Popular (Lei n. 4.717/1965), do Código de Defesa do Consumidor (Lei n. 8.078/1990), da Lei do Mandado de Segurança (Lei n. 12.016/2009), da Lei de Improbidade Administrativa (Lei n. 8.429/1992), do Estatuto da Criança e do Adolescente (Lei n. 8.069/1990), do Estatuto da Pessoa Idosa (Lei n. 10.741/2003), da Lei de Proteção às Pessoas com Deficiência (Lei n. 7.853/1989) e da Lei Brasileira de Inclusão da Pessoa com Deficiência (Lei n. 13.146/2015). (b) - Direito Ambiental:"}, {"n": "1.", "txt": "Princípios do direito ambiental."}, {"n": "2.", "txt": "Tutela constitucional do meio ambiente."}, {"n": "3.", "txt": "Competência constitucional, administrativa, legislativa e jurisdicional em matéria ambiental."}, {"n": "4.", "txt": "Fontes do direito ambiental: normativas (ou formais), materiais e complementares."}, {"n": "5.", "txt": "Direito Ambiental Internacional. Conceito. Fontes do direito ambiental internacional. Princípios gerais do direito ambiental internacional."}, {"n": "6.", "txt": "Política Nacional do Meio Ambiente (Lei n. 6.938/1981)."}, {"n": "7.", "txt": "SISNAMA (Sistema Nacional do Meio Ambiente). SISMUMA (Sistema Municipal do Meio Ambiente). Criação do Instituto do Meio Ambiente (IMA) (Lei Estadual n. 17.354/2017)."}, {"n": "8.", "txt": "Licenciamento ambiental (Lei Complementar n. 140/2011 e Resoluções CONAMA n. 237/1997 n. 117/2017, 250/2024 e 93 251/2024). Sistema de Licenciamento. Tipos de licenciamento (Licença Prévia, Licença de Instalação e Licença de Operação). Função e Natureza Jurídica do Estudo de Impacto Ambiental (EIA). Conceito Jurídico do impacto ambiental. Exigência Constitucional dos Estudos de Impacto Ambiental. O Estudo Prévio e Relatório de Impacto Ambiental (Resolução Conama n. 1/1986). Competência legislativa sobre o EIA. Competência para exigir o EIA. Competência do CONAMA para estabelecer as diretrizes sobre o EIA. Normas Gerais. Conteúdo do EIA. RIMA. Audiência Pública. Lei n. 15.190/2025 (Nova Lei Geral do Licenciamento Ambiental)."}, {"n": "9.", "txt": "Dano Ambiental. Apuração do Dano Ambiental. Reparação do Dano Ambiental (Assento n. 1/2013/CSMP). Responsabilidade Administrativa, Civil e Penal por danos ao meio ambiente."}, {"n": "10.", "txt": "Política Nacional de Educação Ambiental (Lei n. 9.795/1999). Política Estadual de Educação Ambiental (Lei Estadual n. 13.558/2005)."}, {"n": "11.", "txt": "Política Nacional de Recursos Hídricos (Lei n. 9.433/1997). Política Estadual de Recursos Hídricos (Lei Estadual n. 9.748/1994). Avaliação integrada da bacia hidrográfica para fins de licenciamento ambiental (Lei Estadual n. 14.652/2009)."}, {"n": "12.", "txt": "Política Nacional dos Resíduos Sólidos (Lei n. 12.305/2010). Decreto n. 10.936/2022 (Regulamenta a Lei n. 12.305/2010, que institui a Política Nacional de Resíduos Sólidos)."}, {"n": "13.", "txt": "Política Nacional de Saneamento Básico (Lei n. 11.445/2007). Decreto n. 11.599/2023 (Dispõe sobre a prestação regionalizada dos serviços públicos de saneamento básico e dá outras providências). Política Estadual do Saneamento Básico (Lei Estadual n. 13.517/2005)."}, {"n": "14.", "txt": "Política Nacional de Pagamento por Serviços Ambientais (Lei n. 14.119/2021)."}, {"n": "15.", "txt": "Código Florestal (Lei n. 12.651/2012). Código Ambiental de Santa Catarina (Lei Estadual n. 14.675/2009)."}, {"n": "16.", "txt": "Direito Animal. Base normativa. Decreto n. 12.439 (Institui o Programa Nacional de Proteção e Manejo Populacional Ético de Cães e Gatos e o Cadastro Nacional de Animais Doméstico). Código Estadual de Proteção aos Animais (Lei Estadual n. 12.854/2003). 17. 94 Utilização e proteção do Bioma Mata Atlântica (Lei n. 11.428/2006 e Decreto n. 6.660/2008)."}, {"n": "18.", "txt": "Sistema Nacional de Unidades de Conservação da Natureza (SNUC) (Lei n. 9.985/2000)."}, {"n": "19.", "txt": "Parque Estadual da Serra do Tabuleiro (Lei Estadual n. 14.661/2009)."}, {"n": "20.", "txt": "Plano Nacional Gerenciamento Costeiro (Lei n. 7.661/1988). Plano Estadual de Gerenciamento Costeiro (Lei Estadual n. 13.553/2005)."}, {"n": "21.", "txt": "Direito social à moradia. Direito à cidade. Função social da propriedade urbana e rural. Estatuto da Terra (Lei n. 4.504/64). Estatuto da Cidade (Lei n. 10.257/2001). Plano Diretor Estratégico. Instrumentos de Política Urbana. Zoneamento Ambiental. Lei Complementar Estadual n. 495/2010 (Institui as Regiões Metropolitanas). Regularização Fundiária (Lei n. 13.465/2017 e Decreto n. 9.310/2018). Parcelamento do Solo Urbano (Lei n. 6.766/1979 e Lei Estadual n. 17.492/2018)."}, {"n": "22.", "txt": "Política Nacional de Mobilidade Urbana (Lei n. 12.587/2012)."}, {"n": "23.", "txt": "Política e Sistema de Proteção e Defesa Civil (Lei n. 12.608/2012). Decreto n. 10.692/2021 (Institui o Cadastro Nacional de Municípios com Áreas Suscetíveis à Ocorrência de Deslizamentos de Grande Impacto, Inundações Bruscas ou Processos Geológicos ou Hidrológicos Correlatos). Lei Estadual n. 16.601/2015 (Dispõe sobre a incorporação nos Planos Diretores dos documentos oficiais do Estado de Santa Catarina sobre estudos e mapeamentos de áreas de risco."}, {"n": "24.", "txt": "Política Nacional sobre Mudança do Clima (Lei n. 12.187/2009)."}, {"n": "25.", "txt": "Patrimônio Histórico e Artístico Nacional (Decreto-Lei n. 25/1937). Instrumentos jurídicos de proteção do patrimônio natural e cultural. Arts. 215, 216 e 216-A da Constituição da República Federativa do Brasil."}, {"n": "26.", "txt": "Lei da Biossegurança (Lei n. 11.105/2005)."}, {"n": "27.", "txt": "Lei dos Crimes Ambientais (Lei n. 9.605/1998). Infrações e sanções administrativas ambientais (Decreto n. 6.514/2008)."}, {"n": "28.", "txt": "Cadastro Ambiental Rural (Decreto n. 7.830/2012)."}, {"n": "29.", "txt": "Agrotóxicos (Lei n. 14.785/2023). Controle da produção, comércio, uso, consumo, transporte e armazenamento de agrotóxicos (Lei Estadual n. 11.069/1998). 95"}]}, {"n": "(c)", "txt": "Direito do Consumidor:", "subs": [{"n": "1.", "txt": "A proteção e defesa do consumidor na Constituição Federal."}, {"n": "2.", "txt": "Direito do consumidor: princípios e direitos básicos. Prevenção e reparação de danos."}, {"n": "3.", "txt": "Código de Defesa do Consumidor."}, {"n": "4.", "txt": "Relação jurídica de consumo."}, {"n": "5.", "txt": "Serviço público e Defesa do Consumidor."}, {"n": "6.", "txt": "Responsabilidade do fornecedor."}, {"n": "7.", "txt": "Garantias."}, {"n": "8.", "txt": "Decadência e prescrição."}, {"n": "9.", "txt": "Da desconsideração da Personalidade jurídica."}, {"n": "10.", "txt": "Oferta. Publicidade. Práticas abusivas. Cobrança de dívidas."}, {"n": "11.", "txt": "Bancos de Dados e Cadastros de consumidores."}, {"n": "12.", "txt": "Proteção contratual."}, {"n": "13.", "txt": "Sanções administrativas;"}, {"n": "14.", "txt": "Superendividamento."}, {"n": "15.", "txt": "Planos e Seguros Privados de Assistência à Saúde (Lei n. 9.656/1998)."}, {"n": "16.", "txt": "Lei Geral do Esporte (Lei n. 14.597/2023)."}, {"n": "17.", "txt": "Serviço de Atendimento ao Consumidor – SAC (Decreto n. 11.034/2022)."}, {"n": "18.", "txt": "Fiscalização e coibição da comercialização irregular de combustíveis (Lei Estadual n. 14.954/2009)."}, {"n": "19.", "txt": "Incorporações Imobiliárias (Lei n. 4.591/1964)."}, {"n": "20.", "txt": "Crimes contra o consumidor e relações de consumo (Lei n. 8.078/1990)."}, {"n": "21.", "txt": "Crimes contra a economia popular (Lei n. 1.521/1951)."}, {"n": "22.", "txt": "Crimes contra a ordem econômica e relações de consumo (Lei n. 8.137/1990 e Lei n. 8.176/1991)."}, {"n": "23.", "txt": "Lei Geral de Proteção de Dados – LGPD (Lei n. 13.709/2018)."}, {"n": "27.", "txt": "Lei do Marco Civil da Internet (Lei n. 12.965/2014)."}]}, {"n": "(d)", "txt": "Defesa da Moralidade Administrativa:", "subs": [{"n": "1.", "txt": "Lei n. 8.429/1992."}, {"n": "2.", "txt": "Princípios informadores da Administração Pública: Legalidade, Impessoalidade, Moralidade, Publicidade e Eficiência."}, {"n": "3.", "txt": "Tutela Civil do Patrimônio Público: antecedentes históricos."}, {"n": "4.", "txt": "Controle da Administração Pública: modalidades."}, {"n": "5.", "txt": "Danos ao Patrimônio Público."}, {"n": "6.", "txt": "Ato de improbidade administrativa."}, {"n": "7.", "txt": "Sujeito ativo e sujeito passivo dos atos de improbidade."}, {"n": "8.", "txt": "Conceito de agente público."}, {"n": "9.", "txt": "Categorias de atos de improbidade administrativa previstos na Lei n. 8.429/1992."}, {"n": "10.", "txt": "Condutas caracterizadoras de improbidade."}, {"n": "11.", "txt": "Sanções: natureza jurídica, espécies, aplicação e gradação."}, {"n": "12.", "txt": "A apuração administrativa e judicial 96 dos atos de improbidade administrativa."}, {"n": "13.", "txt": "Atos de improbidade administrativa previstos na legislação extravagante: Estatuto da Cidade (Lei n. 10.257/2001, Lei das Eleições (Lei n. 9.504/1997), Lei de Responsabilidade Fiscal (Lei Complementar n. 101/2000) e Lei Geral de Proteção de Dados – LGPD (Lei 13.709/2018)."}, {"n": "14.", "txt": "Acordo de Não Persecução Civil (Ato 513/2024/PGJ e Resolução CNMP n. 306/2025)."}, {"n": "15.", "txt": "Termo de Ajustamento de Conduta e Tutela da Moralidade Administrativa."}, {"n": "16.", "txt": "Lei das Organizações Sociais (Lei n. 9.637/1998)."}, {"n": "17.", "txt": "Lei do Marco Regulatório das Organizações da Sociedade Civil (Lei n. 13.019/2014)."}, {"n": "18.", "txt": "Tribunais de Contas: fundamento constitucional e funções."}, {"n": "19.", "txt": "Ação Popular e Ação Civil Pública em Defesa do Patrimônio Público."}, {"n": "20.", "txt": "Ação de Improbidade Administrativa: natureza jurídica, normas, disciplina processual, legitimação ativa e passiva, competência. Providências cautelares."}, {"n": "21.", "txt": "A atuação extrajudicial e judicial do Ministério Público em defesa do Patrimônio Público e da Moralidade Administrativa."}, {"n": "22.", "txt": "A prescrição da pretensão sancionatória dos atos de improbidade administrativa."}, {"n": "23.", "txt": "Crimes de Responsabilidade, Crimes próprios de Prefeitos e Infrações Político-Administrativas: Lei n. 1.079/1950 e Decreto- Lei n. 201/1967."}, {"n": "24.", "txt": "Crimes contra o processo licitatório (Lei n. 14.133/2021)."}, {"n": "25.", "txt": "Lei de Acesso à Informação (Lei n. 12.527/2011)."}, {"n": "26.", "txt": "Lei ‘Anticorrupção’ (Lei n. 12.846/2013)."}, {"n": "27.", "txt": "Lei dos Direitos dos Usuários dos Serviços Públicos (Lei 13.460/2017)."}, {"n": "28.", "txt": "Compliance e Integridade (Lei Estadual n. 17.715/2019)."}]}, {"n": "(e)", "txt": "Direitos Humanos e Cidadania:", "subs": [{"n": "1.", "txt": "Direitos Humanos: Polissemia conceitual. Perspectiva histórica. Universalidade X Relatividade. Proteção na Constituição de"}, {"n": "1988.", "txt": "Proteção internacional. Catálogo de direitos. Distinção entre direitos humanos e direitos fundamentais. Reserva do possível e mínimo existencial. Ministério Público e a defesa dos Direitos Humanos. Realização de encontros com os movimentos sociais 97 (Recomendação CNMP n. 61/17)."}, {"n": "2.", "txt": "Direitos das pessoas com Deficiência. Conselhos de Direitos das Pessoas com Deficiência. Criminalização do preconceito. Convenção Internacional sobre os direitos das pessoas com deficiência. Normas constitucionais sobre a proteção dos direitos das pessoas com deficiência. Teorias dos modos de compreensão médico e social da deficiência. Acessibilidade e tipos de barreiras. Capacitismo. Lei n. 7.853/1989; Lei n. 10.048/2000, Lei n. 10.098/2000, Decreto n. 5.296/2004, Lei n. 10.436/2002, Decreto n. 5.626/2005; Lei Brasileira de Inclusão da Pessoa com Deficiência (Lei n. 13.146/2015); Consolidação da legislação estadual que dispõe sobre os direitos das pessoas com deficiência (Lei Estadual n. 17.292/2017). Crimes contra a pessoa com deficiência (Lei n. 7.853/1989)."}, {"n": "3.", "txt": "Direitos da Pessoa Idosa. Direitos fundamentais e princípios. Etarismo, Idadismo e Ageísmo. Política de atendimento. Entidades de atendimento. Medidas protetivas. Conselhos da pessoa idosa. Fundos da pessoa idosa. Estatuto da Pessoa Idosa (Lei n. 10.741/2003). Política Nacional do Idoso (Lei n. 8.842/1994); Política Estadual do Idoso (Lei n. 11.436/2000, Lei n. 11.402/2000 e Lei n. 15.182/2010). Crimes contra a pessoa idosa. Resolução CNMP n. 154/2016."}, {"n": "4.", "txt": "Assistência Social. Sistema Único da Assistência Social: princípios, diretrizes, atribuições dos entes federativos, planejamento, financiamento e instâncias de controle social. Proteção social básica e especial. Serviços socioassistenciais. Benefícios eventuais (Decreto 6.307/2007). Conselhos de Assistência Social. Lei Orgânica da Assistência Social (Lei n. 8.742/1993). Resolução n. 109/2009 do Conselho Nacional de Assistência Social. Fundo Estadual de Assistência Social (Lei Estadual n. 17.819/2019). Política Nacional de Busca de Pessoas Desaparecidas (Lei n. 13.812/2019)."}, {"n": "5.", "txt": "Direitos da população em situação de rua (Decreto n. 7.053/2009). Recomendação CNMP n. 53/"}, {"n": "17.", "txt": "Recomendação CNMP n. 60/"}, {"n": "17.", "txt": "Política Nacional de Trabalho Digno e Cidadania para a População em Situação de Rua (Lei n. 14.821/2024). 98 Plano Nacional Ruas Visíveis. Sistema de Segurança Alimentar e Nutricional (Lei n. 11.346/2006). Política Nacional de Combate à Perda e ao Desperdício de Alimentos (Lei n. 15.224/2025)"}, {"n": "6.", "txt": "Enfrentamento ao preconceito e promoção de igualdade. Direito antidiscriminatório. Racismo. Conceito e espécies: racismo estrutural, institucional, ambiental, recreativo, religioso. Interseccionalidade entre raça, gênero e classe. Ações afirmativas. Lei n. 12.288/"}, {"n": "2010.", "txt": "Convenção Interamericana contra o Racismo, a Discriminação Racial e as Formas Correlatas de Intolerância. Homotransfobia. Direitos relacionados à proteção da identidade de gênero e da orientação sexual. Lei n. 11.340/"}, {"n": "06.", "txt": "Estatuto da Liberdade Religiosa no Estado de Santa Catarina (Lei n. 18.349/22)."}, {"n": "7.", "txt": "Direitos de migrantes, refugiados e apátridas. Lei n. 13.445/"}, {"n": "2017.", "txt": "Lei Estadual n. 18.018/2020."}, {"n": "8.", "txt": "Fundações. Normas que disciplinam as fundações na Lei n. 10.406/02 (Código Civil). Requisitos. Constituição. Dotação inicial. Órgãos. Fiscalização. Alteração dos estatutos. Extinção das fundações e destino dos bens. Atuação do Ministério Público. Registro de atos. Associações. Das atividades administrativas do Ministério Público de Santa Catarina na área das fundações (Ato n. 168/2017/PGJ)."}, {"n": "9.", "txt": "Saúde. Seguridade Social e Sistema Único de Saúde na Constituição da República Federativa do Brasil. Princípios e diretrizes do SUS. Condições para a promoção, a proteção e a recuperação da saúde. Organização e funcionamento do SUS (Lei Federal n. 8.080/1990 e Decreto Federal n. 7.508/2011; Lei Federal n. 8.142/1990; Lei Complementar n. 141/2012); Dos direitos e dos deveres dos usuários da saúde (Título I da Portaria de Consolidação MS/GM n. 1/2017). Política Nacional de Atenção Básica – PNAB (Anexo XXII da Portaria de Consolidação MS/GM n. 2/2017). Assistência Farmacêutica (definição dos componentes a partir da RENAME 2020); Conselho Nacional de Saúde (Resolução n. 453/2012); Consórcio Intermunicipal de Saúde (Lei n. 11.107/2005). Transparência nas Listas do SUS (Lei Estadual n. 17.066/2017 e Decreto Estadual n. 1.168/2017); 99 Transplante de Órgãos (Lei Federal n. 9.434/1997); Tratamento de paciente com neoplasia maligna comprovada (Lei n. 12.732/2012); Estatuto da Pessoa com Câncer (Lei n. 14.238/2021). Planejamento Familiar (Lei n. 9.263/1996). Violência Obstétrica (Capítulo V da Lei Estadual n. 18.322/2022 e Decreto Estadual n. 1.269/2017). Doulas (Lei Estadual n. 16.869/2016). Saúde Mental. Política de Saúde Mental. Reforma Psiquiátrica. Internação Psiquiátrica (Lei n. 10.216/2001). Rede de Atenção Psicossocial (Anexo V da Portaria de Consolidação MS/GM n. 3/2017). Auxílio-reabilitação psicossocial (Lei n. 10.708/2003). Política Nacional de Prevenção da Automutilação e do Suicídio (Lei n. 13.819/2019). Sistema Nacional de Políticas Públicas sobre Drogas e condições de atenção aos usuários ou dependentes de drogas (Lei n. 13.840/2019). Política Antimanicomial do Poder Judiciário (Resolução CNJ n. 487/2023). Comunidades Terapêuticas (RDC n. 29/2011 da ANVISA). Terceirização da Saúde."}, {"n": "10.", "txt": "Organizações Sociais (Lei n. 9.637/1998). Organizações da sociedade civil de interesse público (Lei n. 9.790/1999). Certificação das entidades beneficentes de assistência (Lei Complementar n. 187, de 2021). Regime jurídico das parcerias entre a Administração Pública e as organizações da sociedade civil (Lei n. 13.019/2014)."}]}]}, {"nome": "DIREITO DA CRIANÇA E DO ADOLESCENTE", "itens": [{"n": "1.", "txt": "Constituição da República Federativa do Brasil e a infância e juventude. A doutrina da proteção integral. A Convenção das Nações Unidas sobre os Direitos da Criança. Estatuto da Criança e do Adolescente (Lei n. 8.069/1990). Marco Legal da Primeira Infância (Lei n. 13.257/2016)."}, {"n": "2.", "txt": "Noções gerais, evolução histórica, conceitos e princípios do Direito da Criança e do Adolescente."}, {"n": "3.", "txt": "Política e sistema de atendimento. Sistema de Garantia dos Direitos. Trabalho articulado em rede."}, {"n": "4.", "txt": "Conselho Tutelar e Conselho de Direitos."}, {"n": "5.", "txt": "Fundo da Infância e Adolescência."}, {"n": "6.", "txt": "A Justiça da infância e juventude: juízes, promotores de justiça, defensores públicos, 100 advogados e técnicos."}, {"n": "7.", "txt": "Medidas protetivas e socioeducativas."}, {"n": "8.", "txt": "Crimes e infrações administrativas contra a criança e o adolescente."}, {"n": "9.", "txt": "Família natural e extensa."}, {"n": "10.", "txt": "Poder familiar (Código Civil)."}, {"n": "11.", "txt": "Guarda, tutela e adoção."}, {"n": "12.", "txt": "Ato infracional."}, {"n": "13.", "txt": "Sistema Nacional de Atendimento Socioeducativo (Lei n. 12.594/2012). Plano Nacional de Atendimento Socioeducativo (Resolução n. 160/2013 do Conselho Nacional dos Direitos da Criança e do Adolescente)."}, {"n": "14.", "txt": "Resoluções CONANDA n. 105 (Conselho de Direitos da Criança e do Adolescente), n. 106 (Conselho de Direitos da Criança e do Adolescente), n. 113 (Sistema de Garantia dos Direitos da Criança e do Adolescente), n. 116 (Conselho de Direitos da Criança e do Adolescente), n. 137 (criação e funcionamento dos Fundos Nacional, Estaduais, Municipais dos Direitos da Criança e do Adolescente), n. 231 (alteração da Resolução n. 170, para dispor sobre o processo de escolha em data unificada em todo o território nacional dos membros do Conselho Tutelar), n. 177 (direito da criança e do adolescente de não serem submetidos à excessiva medicalização), n. 180 (igualdade de direitos entre meninas e meninos nas políticas públicas de atenção, proteção e defesa de crianças e adolescentes), n. 235 (obrigação, aos Conselhos Estaduais, Distrital e Municipais dos Direitos da Criança e do Adolescente, de implementação de Comitês de Gestão Colegiada da Rede de Cuidado e Proteção Social das Crianças e Adolescentes Vítimas ou Testemunhas de Violência nas suas localidades)."}, {"n": "15.", "txt": "Resoluções Conjuntas CNAS/CONANDA n. 1/2009 (orientações técnicas para os serviços de acolhimento para crianças e adolescentes) e n. 1/17 (diretrizes políticas e metodológicas para o atendimento de crianças e de adolescentes em situação de rua no âmbito da política de assistência social); Resolução CNAS n. 119/2023 (parâmetros para a atuação do Sistema Único da Assistência Social/SUAS na relação interinstitucional da rede socioassistencial com o Sistema de Justiça e os outros Órgãos de Defesa e Garantia de Direitos)."}, {"n": "16.", "txt": "Resolução Conjunta 101 CONANDA/CONADE n. 1/2018 (diretrizes para o atendimento de crianças e de adolescentes com deficiência no sistema de garantia dos direitos da criança e do adolescente)."}, {"n": "17.", "txt": "Resoluções CNMP n. 67/2011 (fiscalização em unidades para cumprimento de medidas socioeducativas de internação e semiliberdade pelos membros do MP e situação de adolescentes privados de liberdade em cadeias públicas; n. 105/2014 (atuação dos membros do Ministério Público como órgão interveniente nos processos judiciais para a autorização para trabalho de crianças e adolescentes menores de 16 anos); n. 204/2019 (uniformização das fiscalizações, pelos membros do Ministério Público dos Estados e do Distrito Federal, junto aos programas municipais de atendimento para a execução das medidas socioeducativas em meio aberto, aplicadas a adolescentes em decorrência da prática de ato infracional); n. 287/2024 (proteção das crianças e adolescentes vítimas ou testemunhas de violência) e n. 293/2024 (atuação dos membros do Ministério Público na defesa do direito fundamental à convivência familiar e comunitária de crianças e adolescentes em serviços de acolhimento)."}, {"n": "18.", "txt": "Recomendações CNMP n. 26/2015 (uniformização da atuação do Ministério Público no processo de elaboração e implementação dos Sistemas Estaduais e Municipais de Atendimento Socioeducativo) e n. 33/2016 (diretrizes para a implementação e estruturação das Promotorias de Justiça da Infância e Juventude no âmbito do Ministério Público dos Estados e do Distrito Federal e Territórios)."}, {"n": "19.", "txt": "Provimentos do CNJ n. 149/2023 (certidão de nascimento nos estabelecimentos de saúde que realizam parto), n. 118/2021 (audiências concentradas nas Varas da Infância e Juventude), n. 63/2017 (reconhecimento voluntário e averbação de paternidade e maternidade socioafetiva) e n. 83/2019 (alteração da Seção II, que trata da Paternidade Socioafetiva, do Provimento CNJ n. 63/2017)."}, {"n": "20.", "txt": "Resoluções n. 165/2012 (normas gerais para o atendimento, pelo Poder Judiciário, ao adolescente em conflito com a lei no âmbito da internação 102 provisória e do cumprimento das medidas socioeducativas) e n. 295/2019 (autorização de viagem nacional para crianças e adolescentes)."}, {"n": "21.", "txt": "Lei Estadual n. 11.697/2001 (proibição da venda de cigarros e produtos similares a menores de dezoito anos no Estado de Santa Catarina e adota outras providências). Lei Estadual n. 11.603/2000 (sanções a serem aplicadas aos municípios que não mantiverem funcionando o Conselho Municipal dos Direitos da Criança e do Adolescente e o Conselho Tutelar). Lei Estadual n. 11.435/2000 (exposição e comercialização de revistas e publicações pornográficas em bancas de jornais e similares e outras providências)."}, {"n": "22.", "txt": "Programa de Combate à Intimidação Sistemática – Bullying (Lei n. 13.185/2015 e Lei Estadual n. 14.651/2009). Política Nacional de Prevenção da Automutilação e do Suicídio (Lei n. 13.819/2019)."}, {"n": "23.", "txt": "Lei n. 13.431/2017 (sistema de garantia de direitos da criança e do adolescente vítima ou testemunha de violência). Decreto n. 9.603/2018 (regulamentação da Lei n. 13.431/2017)."}, {"n": "24.", "txt": "Educação. O direito à educação na Constituição da República Federativa do Brasil. Lei de Diretrizes e Bases da Educação (Lei n. 9.394/1996). Lei n. 13.005/2014 (Plano Nacional de Educação). Resolução n. 5/2009 do Conselho Nacional de Educação (diretrizes curriculares nacionais para a educação infantil). Resolução n. 4/2010 do Conselho Nacional de Educação (diretrizes curriculares nacionais para a educação básica). Lei Complementar Estadual n. 170/1998 (Sistema Estadual de Educação). Resolução n. 100/2016 do Conselho Estadual de Educação (normas para a educação especial no Sistema Estadual de Educação de Santa Catarina). Recomendação CNMP n. 44 (atuação do Ministério Público no controle do dever de gasto mínimo em educação)."}, {"n": "25.", "txt": "Lei n. 15.211/2025 (Estatuto Digital da Criança e do Adolescente)."}]}, {"nome": "DIREITO ADMINISTRATIVO", "itens": [{"n": "1.", "txt": "Direito Administrativo: conceitos doutrinários e fontes. Teoria geral do direito administrativo. Princípios 103 gerais do direito administrativo."}, {"n": "2.", "txt": "Sistemas de Contencioso Administrativo e o Sistema Judiciário (Sistema de Controle Judicial)."}, {"n": "3.", "txt": "Administração Pública: organização e estrutura administrativa brasileira. Função administrativa estatal: definição, amplitude conceitual e tipos. Desconcentração e descentralização do poder. Administração Pública Direta e Indireta. Autarquias, fundações de direito público, consórcios públicos, empresas estatais, empresas públicas, sociedades de economia mista, empresas controladas, fundações públicas de direito privado, consórcios públicos com personalidade jurídica de direito privado, sociedade com participação estatal minoritária, empresas estatais de fato, entidades paraestatais. Estatuto jurídico da empresa pública, da sociedade de economia mista e de suas subsidiárias, no âmbito da União, dos Estados, do Distrito Federal e dos Municípios (Lei n. 13.303/2016). Administração Pública e Terceiro Setor: Organizações Sociais (Lei n. 9.637/1998 e Lei Estadual n. 12.929/2004) e Organizações da Sociedade Civil de Interesse Público (Lei n. 9.790/1999). Regime jurídico das parcerias voluntárias (Lei n. 13.019/2014)."}, {"n": "4.", "txt": "Regime Jurídico Administrativo: normas (regras e princípios) da Administração Pública."}, {"n": "5.", "txt": "Poderes da Administração Pública: poder normativo/regulamentar, poder disciplinar e poderes decorrentes da hierarquia. Poder vinculado e poder discricionário. Poder de polícia: conceito, fundamento, objeto e finalidade, extensão e limites, atributos e meios de atuação. O Regime Jurídico de Direito Público e a realização dos Direitos Fundamentais. Poderes e deveres do administrador público. O abuso do poder: excesso de poder, desvio de finalidade e omissão da Administração."}, {"n": "6.", "txt": "Bens Públicos: características gerais, classificação, regime jurídico, afetação e desafetação. Alienação e uso privado de bens públicos."}, {"n": "7.", "txt": "Atos Administrativos: conceito, elementos, formação, atributos, classificação, extinção, vícios e invalidação. Atos Discricionários e Vinculados. Requisitos ou elementos de validade. Atos nulos e anuláveis. Anulação e 104 revogação dos atos administrativos. Teoria dos Motivos Determinantes."}, {"n": "8.", "txt": "Contratos Administrativos: definição, características, modalidades, alteração e rescisão. Cláusulas Exorbitantes. Equilíbrio econômico- financeiro nos contratos administrativos. Alteração e execução contratual. Normas gerais de contratação de consórcios públicos (Lei n. 11.107/2005 e Decreto n. 6.017/2007)."}, {"n": "9.", "txt": "Licitação Pública: conceito, princípios, legislação, finalidade do procedimento licitatório, modalidades. Dispensa e Inexigibilidade de licitação. Legislação de licitação e contratos. Normas para licitações e contratos da Administração Pública (Lei n. 8.666/1993 e Lei n. 14.133/2021). Normas sobre o regime de concessão e permissão da prestação de serviços públicos (Lei n. 8.987/1995). Normas sobre a modalidade de licitação denominada pregão, para aquisição de bens e serviços comuns (Lei n. 10.520/2002, Decreto n. 7.174/2010 e Decreto n. 10.024/2019). Normas gerais para licitação e contratação pela administração pública de serviços de publicidade prestados por intermédio de agências de propaganda (Lei n. 12.232/2010). Regime Diferenciado de Contratações Públicas (Lei n. 12.462/2011)."}, {"n": "10.", "txt": "Serviços Públicos: definição, princípios e classificação. Serviço público em sentido amplo e em sentido estrito. Regime de concessão e permissão da prestação de serviços públicos (Lei n. 8.987/1995). Normas gerais para licitação e contratação de parceria público-privada no âmbito da administração pública (Lei n. 11.079/2004)."}, {"n": "11.", "txt": "Dos Servidores Públicos no âmbito da Constituição da República Federativa do Brasil. Agentes Públicos: definição, classificação e regime jurídico-constitucional. Agentes políticos. Condições de ingresso e sistema remuneratório. Cargo, emprego e função pública. Provimento e Investidura em Cargo Público. Direitos e Deveres. Responsabilidade do Agente Público."}, {"n": "12.", "txt": "Intervenções do Estado na Economia."}, {"n": "13.", "txt": "Intervenções do Estado na Propriedade Privada. Limitações administrativas, tombamento, requisição, servidão e desapropriação."}, {"n": "14.", "txt": "Responsabilidade Civil do Estado."}, {"n": "15.", "txt": "Controle 105 administrativo e judicial da Administração Pública. Formas e Momentos de Controle. Controle Interno e Externo. Controles administrativos (TCE), legislativos (Comissões Parlamentares) e judiciais."}, {"n": "16.", "txt": "Processo Administrativo (Lei n. 9.784/1999): Objetivos, fases, espécies e princípios do Processo Administrativo; recursos administrativos. Instância administrativa. Representação e reclamação administrativas. Pedido de reconsideração e recurso hierárquico próprio e impróprio. Prescrição e decadência administrativa. Processos disciplinares."}, {"n": "17.", "txt": "Ação Popular (Lei n. 4.717/1965); Improbidade Administrativa (Lei n. 8.429/1992); Responsabilização administrativa e civil de pessoas jurídicas pela prática de atos contra a administração pública, nacional ou estrangeira (Lei n. 12.846/2013); Mandado de Segurança (Lei n. 12.016/2009)."}, {"n": "18.", "txt": "Administração Pública e acesso à informação (Lei n. 12.527/2011)."}, {"n": "19.", "txt": "Lei de Introdução às normas do Direito brasileiro (Decreto-Lei n. 4.657/42)."}, {"n": "20.", "txt": "Lei de Acesso à Informação (Lei n. 12. 527/11)."}]}, {"nome": "DIREITO TRIBUTÁRIO E FINANCEIRO", "itens": [{"n": "1.", "txt": "Sistema Tributário Nacional (Constituição da República, Constituição do Estado de Santa Catarina e Código Tributário Nacional)."}, {"n": "2.", "txt": "O Estado e o poder de tributar."}, {"n": "3.", "txt": "Princípios constitucionais tributários."}, {"n": "4.", "txt": "Limitações ao poder de tributar."}, {"n": "5.", "txt": "Competência e capacidade tributárias."}, {"n": "6.", "txt": "Repartição das receitas tributárias."}, {"n": "7.", "txt": "Conceito e espécies de tributos: teoria geral."}, {"n": "8.", "txt": "Os tributos da União, dos Estados e dos Municípios."}, {"n": "9.", "txt": "Obrigação Tributária: disposições gerais; fato gerador; base de cálculo; alíquota; sujeito ativo; sujeito passivo."}, {"n": "10.", "txt": "Responsabilidade e substituição tributária."}, {"n": "11.", "txt": "Imunidade e isenção."}, {"n": "12.", "txt": "Crédito Tributário: lançamento, suspensão, extinção, exclusão, garantias e privilégios do crédito tributário."}, {"n": "13.", "txt": "Anistia e Remissão."}, {"n": "14.", "txt": "Prescrição e decadência."}, {"n": "15.", "txt": "Lei de Responsabilidade Fiscal (Lei Complementar n. 101/2000). 106"}]}, {"nome": "DIREITO FALIMENTAR", "itens": [{"n": "1.", "txt": "Sujeitos à lei de recuperações e falências."}, {"n": "2.", "txt": "Competência."}, {"n": "3.", "txt": "Intervenção do Ministério Público."}, {"n": "4.", "txt": "Verificação e habilitação dos créditos concursais. O Administrador Judicial. Comitê e Assembleia Geral de Credores."}, {"n": "5.", "txt": "Recuperação Judicial: Modalidades de recuperação. Do pedido e do processamento da Recuperação Judicial. Plano de Recuperação Judicial. Do Procedimento de Recuperação Judicial. Do Procedimento de Recuperação Judicial."}, {"n": "6.", "txt": "Decretação e convolação da recuperação em falência."}, {"n": "7.", "txt": "Falência: Pedidos de falência. Classificação dos Créditos. Pedido de Restituição. Procedimento para a Decretação da Falência."}, {"n": "8.", "txt": "Sentença de falência e seus efeitos: Efeitos em relação aos credores. Efeitos em relação ao falido e aos administradores e liquidantes. Efeitos em relação aos bens do falido e dos sócios da sociedade falida. Efeitos em relação aos contratos. Da Administração, arrecadação, realização do ativo e pagamento do passivo. Da Ineficácia e da Revogação de Atos Praticados antes da Falência."}, {"n": "9.", "txt": "Encerramento da falência."}, {"n": "10.", "txt": "Crimes nas recuperações judicial e extrajudicial e na falência. Competência. Legitimidade. Condição de Procedibilidade. Prescrição."}]}, {"nome": "DIREITO ELEITORAL", "itens": [{"n": "1.", "txt": "Direito Eleitoral: conceito, conteúdo e fontes."}, {"n": "2.", "txt": "A autonomia do Direito Eleitoral e sua relação com os demais ramos do Direito."}, {"n": "3.", "txt": "Princípios de Direito Eleitoral."}, {"n": "4.", "txt": "A Justiça Eleitoral: órgãos, competência, funções e poder regulamentar."}, {"n": "5.", "txt": "Ministério Público Eleitoral: organização e funções eleitorais."}, {"n": "6.", "txt": "Atuação do Ministério Público Eleitoral perante o Tribunal Superior Eleitoral, os Tribunais Regionais Eleitorais e as Zonas Eleitorais."}, {"n": "7.", "txt": "A fiscalização das eleições pelo Ministério Público Eleitoral."}, {"n": "8.", "txt": "Capacidade eleitoral."}, {"n": "9.", "txt": "Alistamento eleitoral: requisitos, fases, vedações, efeitos, obrigatoriedade e facultatividade."}, {"n": "10.", "txt": "Elegibilidade: conceito e requisitos. Inelegibilidades constitucionais e infraconstitucionais."}, {"n": "11.", "txt": "Registro de Candidatura. 12. 107 Condutas vedadas aos agentes públicos em campanhas eleitorais: abuso de poder; proibições e respectivas exceções."}, {"n": "13.", "txt": "Arrecadação e gastos de recursos e prestações de contas."}, {"n": "14.", "txt": "Propaganda partidária e propaganda eleitoral."}, {"n": "15.", "txt": "Ações e Recursos eleitorais."}, {"n": "16.", "txt": "Crimes eleitorais e processo penal eleitoral."}, {"n": "17.", "txt": "Legislação Eleitoral: Código Eleitoral (Lei n. 4.737/1965)."}, {"n": "18.", "txt": "Lei das Eleições (Lei n. 9.504/1997)."}, {"n": "19.", "txt": "Lei dos Partidos Políticos (Lei n. 9.096/1995). Lei das Inelegibilidades (Lei Complementar n. 64/1990, modificada pela Lei Complementar n. 135/2010)."}]}, {"nome": "LEGISLAÇÃO INSTITUCIONAL", "itens": [{"n": "1.", "txt": "Princípios institucionais, organização e atribuições do Ministério Público."}, {"n": "2.", "txt": "Carreira, deveres, direitos, prerrogativas e garantias dos membros do Ministério Público."}, {"n": "3.", "txt": "Regime disciplinar."}, {"n": "4.", "txt": "O Conselho Nacional do Ministério Público."}, {"n": "5.", "txt": "Lei n. 8.625/1993 (Lei Orgânica Nacional do Ministério Público), Lei Complementar n. 75/1993 (Lei Orgânica do Ministério Público da União) e Lei Complementar Estadual n. 738/2019 (Lei Orgânica do Ministério Público de Santa Catarina). Resolução CNMP n. 261/2023 (Código de Ética)."}, {"n": "6.", "txt": "Atuação Resolutiva (Recomendação CNMP n. 54/2017)."}, {"n": "7.", "txt": "Ato n. 395/2018/PGJ; Ato n. 397/2018/PGJ e Ato Conjunto n. 200/2015/PGJ/CGMP."}]}]}];

// Matérias cuja "Teoria" É o curso em vídeo (nos Cursos Isolados), e não uma lista de tópicos.
// Clicar em "Teoria" leva direto ao curso correspondente e mostra o progresso dele.
const CURSO_TEORIA = { adm: "cur_adm", civil: "cur_civil", pcivil: "cur_ppcivil", cdc: "cur_cdc", penal: "cur_penal", ppenal: "cur_ppenal", penesp: "cur_penesp" };

function subj(id, name, bloco, hasTeoria) {
  const dims = { leiSeca: LEI_SECA[id], jurisprudencia: JURIS_ITEMS, questoes: TOPICOS[id], anki: ANKI_ITEMS };
  if (CURSO_TEORIA[id]) dims.teoria = { curso: CURSO_TEORIA[id] };
  else if (hasTeoria) dims.teoria = TEORIA[id];
  return { id, name, bloco, dims };
}

const SECTIONS = [
  { tier: "base", subjects: [
    subj("const", "Direito Constitucional", "Bloco II", true),
    subj("adm", "Direito Administrativo", "Bloco III", true),
    subj("civil", "Direito Civil", "Bloco I", true),
    subj("pcivil", "Direito Processual Civil", "Bloco I", true),
    subj("penal", "Direito Penal", "Bloco II", true),
    subj("ppenal", "Direito Processual Penal", "Bloco II", true),
  ]},
  { tier: "altamedia", subjects: [
    subj("empres", "Direito Empresarial", "Bloco III", true),
    subj("trib", "Direito Financeiro e Tributário", "Bloco III", true),
    subj("cdc", "Direito do Consumidor", "Bloco I", false),
    subj("eca", "Direito da Criança e do Adolescente", "Bloco I", false),
    subj("amb", "Direito Ambiental", "Bloco III", false),
    subj("penesp", "Leis Penais e Processuais Penais Especiais", "Bloco II", false),
  ]},
  { tier: "baixamedia", subjects: [
    subj("civesp", "Leis Civis e Processuais Civis Especiais", "Bloco I", false),
    subj("eleit", "Direito Eleitoral", "Bloco II", false),
    subj("dh", "Direitos Humanos", "Bloco III", false),
    subj("human", "Noções Gerais de Direito e Formação Humanística", "Bloco III", false),
  ]},
];

// matérias usadas no detalhamento de % por prova nos Simulados
const MATERIAS_SIM = SECTIONS.flatMap((s) => s.subjects.map((x) => ({ id: x.id, name: x.name })));

// lookup de matéria por id (integração editais <-> painel)
const SUBJ_BY_ID = {};
SECTIONS.forEach((sec) => sec.subjects.forEach((s) => { SUBJ_BY_ID[s.id] = s; }));
const EDITAL_MAT_SUBJ = {
  "direito civil": "civil", "direito processual civil": "pcivil", "direito do consumidor": "cdc",
  "direito da criança e do adolescente": "eca", "direito penal": "penal", "direito processual penal": "ppenal",
  "direito constitucional": "const", "direito eleitoral": "eleit", "direito empresarial": "empres",
  "direito financeiro e tributário": "trib", "direito tributário e financeiro": "trib",
  "direito ambiental": "amb", "direito administrativo": "adm", "direito administrativo e gestão pública": "adm",
  "direitos humanos": "dh", "direitos humanos e cidadania": "dh",
  "noções gerais de direito e formação humanística": "human", "fundamentos e noções gerais de direito": "human",
};
function editalSubjId(nome) { return EDITAL_MAT_SUBJ[(nome || "").trim().toLowerCase()] || null; }

// menu de navegação lateral (âncoras das seções)
const NAV_TRIO = [
  { id: "sec-base", n: "1", label: "MATÉRIAS-BASE" },
  { id: "sec-altamedia", n: "2", label: "IMPORTÂNCIA MÉDIA-ALTA" },
  { id: "sec-baixamedia", n: "3", label: "IMPORTÂNCIA MÉDIA-BAIXA" },
];
const NAV_REST = [
  { id: "sec-informativos", label: "INFORMATIVOS" },
  { id: "sec-simulados", label: "SIMULADOS E PROVAS ANTERIORES" },
  { id: "sec-cursos", label: "CURSOS ISOLADOS" },
];
const NAV = [...NAV_TRIO, ...NAV_REST];

const DIM_LABEL = { teoria: "Teoria", leiSeca: "Lei Seca", jurisprudencia: "Jurisprudência", questoes: "Questões (temas TEC)", anki: "Anki" };
const DIM_ORDER = ["teoria", "leiSeca", "jurisprudencia", "questoes", "anki"];
const KEY_PREFIX = "tjsc-matriz5:";
const SIM_KEY_PREFIX = "tjsc-simulados3:";
const INFO_KEY_PREFIX = "tjsc-informativos2:";

export default function App() {
  const [data, setData] = useState({});
  const [simData, setSimData] = useState({});
  const [infoData, setInfoData] = useState({});
  const [cursoData, setCursoData] = useState({});
  const [editaisData, setEditaisData] = useState({});
  const [view, setView] = useState("main");
  const [openEdital, setOpenEdital] = useState(0);
  const [prioridades, setPrioridades] = useState([]);
  const [prioInput, setPrioInput] = useState("");
  const [simManuais, setSimManuais] = useState([]);
  const [manNome, setManNome] = useState("");
  const [manAno, setManAno] = useState("");
  const [open, setOpen] = useState(null);
  const [flash, setFlash] = useState(null);
  const [openYear, setOpenYear] = useState(SIMULADOS[0] ? SIMULADOS[0].grupo : null);
  const [openProva, setOpenProva] = useState(null);
  const [activeSec, setActiveSec] = useState(NAV[0].id);
  const [loaded, setLoaded] = useState(false);

  // destaca no menu lateral a seção visível
  useEffect(() => {
    if (!loaded || typeof IntersectionObserver === "undefined") return;
    const els = NAV.map((n) => document.getElementById(n.id)).filter(Boolean);
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) setActiveSec(e.target.id); });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [loaded]);

  const goTo = (id) => {
    const el = typeof document !== "undefined" && document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    (async () => {
      const next = {};
      for (const section of SECTIONS) {
        for (const s of section.subjects) {
          for (const dim of DIM_ORDER) {
            if (!s.dims[dim]) continue;
            const k = `${s.id}:${dim}`;
            try {
              const r = await window.storage.get(KEY_PREFIX + k);
              next[k] = r ? JSON.parse(r.value) : {};
            } catch {
              next[k] = {};
            }
          }
        }
      }
      const sim = {};
      for (const g of SIMULADOS) {
        for (const p of g.provas) {
          try {
            const r = await window.storage.get(SIM_KEY_PREFIX + p);
            sim[p] = r ? JSON.parse(r.value) : { checked: false, score: "" };
          } catch {
            sim[p] = { checked: false, score: "" };
          }
        }
      }
      const info = {};
      for (const org of ["stf", "stj"]) {
        for (const ed of INFORMATIVOS[org]) {
          const k = `${org}-${ed.num}`;
          try {
            const r = await window.storage.get(INFO_KEY_PREFIX + k);
            info[k] = r ? JSON.parse(r.value) : false;
          } catch {
            info[k] = false;
          }
        }
      }
      const cursos = {};
      for (const c of CURSOS_ISOLADOS) {
        const subs = c.sublistas ? c.sublistas.map((s) => s.nome) : [null];
        for (const sub of subs) {
          const storeKey = sub ? `${c.id}:${sub}` : c.id;
          try {
            const r = await window.storage.get(CURSO_KEY_PREFIX + storeKey);
            cursos[storeKey] = r ? JSON.parse(r.value) : {};
          } catch {
            cursos[storeKey] = {};
          }
        }
      }
      const eds = {};
      for (const e of EDITAIS) {
        try {
          const r = await window.storage.get(EDITAIS_KEY_PREFIX + e.id);
          eds[e.id] = r ? JSON.parse(r.value) : {};
        } catch {
          eds[e.id] = {};
        }
      }
      let prio = [];
      try { const r = await window.storage.get(PRIORIDADES_KEY); prio = r ? JSON.parse(r.value) : []; } catch { prio = []; }
      let manuais = [];
      try { const r = await window.storage.get(SIM_MANUAIS_KEY); manuais = r ? JSON.parse(r.value) : []; } catch { manuais = []; }
      setData(next);
      setSimData(sim);
      setInfoData(info);
      setCursoData(cursos);
      setEditaisData(eds);
      setPrioridades(prio);
      setSimManuais(manuais);
      setLoaded(true);
    })();
  }, []);

  const savePrioridades = (arr) => {
    setPrioridades(arr);
    try { window.storage.set(PRIORIDADES_KEY, JSON.stringify(arr)); } catch {}
  };
  const addPrioridade = () => {
    const t = prioInput.trim();
    if (!t) return;
    savePrioridades([...prioridades, { id: Date.now(), txt: t, done: false }]);
    setPrioInput("");
  };
  const togglePrioridade = (id) => savePrioridades(prioridades.map((p) => (p.id === id ? { ...p, done: !p.done } : p)));
  const removePrioridade = (id) => savePrioridades(prioridades.filter((p) => p.id !== id));

  const saveManuais = (arr) => {
    setSimManuais(arr);
    try { window.storage.set(SIM_MANUAIS_KEY, JSON.stringify(arr)); } catch {}
  };
  const addManual = () => {
    const nome = manNome.trim();
    const ano = (manAno.trim() || String(new Date().getFullYear()));
    if (!nome) return;
    if (simManuais.some((m) => m.nome === nome && m.ano === ano)) { setManNome(""); return; }
    saveManuais([...simManuais, { nome, ano }]);
    setManNome(""); setManAno("");
  };
  const removeManual = (nome, ano) => saveManuais(simManuais.filter((m) => !(m.nome === nome && m.ano === ano)));

  const toggleItem = async (subjId, dim, idx, extra) => {
    const k = `${subjId}:${dim}`;
    const cur = data[k] || {};
    const curItem = cur[idx] || {};
    const nextItem = extra !== undefined ? { ...curItem, ...extra } : { ...curItem, checked: !curItem.checked };
    const next = { ...cur, [idx]: nextItem };
    setData((p) => ({ ...p, [k]: next }));
    try {
      await window.storage.set(KEY_PREFIX + k, JSON.stringify(next));
    } catch {}
  };

  const toggleSim = async (prova, extra) => {
    const cur = simData[prova] || { checked: false, score: "" };
    const next = { ...cur, ...extra };
    setSimData((p) => ({ ...p, [prova]: next }));
    try {
      await window.storage.set(SIM_KEY_PREFIX + prova, JSON.stringify(next));
    } catch {}
  };

  // grava a % de uma matéria de uma prova (mescla no objeto mats)
  const setSimMat = (prova, matId, value) => {
    const cur = simData[prova] || {};
    toggleSim(prova, { mats: { ...(cur.mats || {}), [matId]: value } });
  };

  // % geral da prova = média das matérias preenchidas (arredondada)
  const provaOverall = (prova) => {
    const mats = (simData[prova] || {}).mats || {};
    const vals = Object.values(mats)
      .map((x) => parseFloat(String(x).replace(",", ".")))
      .filter((n) => !isNaN(n));
    if (!vals.length) return null;
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  };

  const toggleInfo = async (org, num) => {
    const k = `${org}-${num}`;
    const next = !infoData[k];
    setInfoData((p) => ({ ...p, [k]: next }));
    try {
      await window.storage.set(INFO_KEY_PREFIX + k, JSON.stringify(next));
    } catch {}
  };

  const toggleEdital = async (editalId, pathKey) => {
    const cur = editaisData[editalId] || {};
    const next = { ...cur, [pathKey]: !cur[pathKey] };
    setEditaisData((p) => ({ ...p, [editalId]: next }));
    try {
      await window.storage.set(EDITAIS_KEY_PREFIX + editalId, JSON.stringify(next));
    } catch {}
  };

  const toggleCurso = async (cursoId, subKey, idx) => {
    const storeKey = subKey ? `${cursoId}:${subKey}` : cursoId;
    const cur = cursoData[storeKey] || {};
    const next = { ...cur, [idx]: !cur[idx] };
    setCursoData((p) => ({ ...p, [storeKey]: next }));
    try {
      await window.storage.set(CURSO_KEY_PREFIX + storeKey, JSON.stringify(next));
    } catch {}
  };

  const fraction = (subjId, dim, items) => {
    const v = data[`${subjId}:${dim}`] || {};
    const done = items.filter((_, i) => v[i] && v[i].checked).length;
    return { done, total: items.length };
  };

  // progresso de um curso isolado (para as células "Teoria" que apontam para um curso)
  const cursoFraction = (cursoId) => {
    const c = CURSOS_ISOLADOS.find((x) => x.id === cursoId);
    if (!c) return { done: 0, total: 0 };
    if (c.sublistas) {
      let done = 0, total = 0;
      for (const sub of c.sublistas) {
        const v = cursoData[`${c.id}:${sub.nome}`] || {};
        total += sub.itens.length;
        done += sub.itens.filter((_, i) => v[i]).length;
      }
      return { done, total };
    }
    const v = cursoData[c.id] || {};
    let done = 0, total = 0;
    c.itens.forEach((it, i) => { if (it && it.h) return; total += 1; if (v[i]) done += 1; });
    return { done, total };
  };

  // fração de uma célula: se a "Teoria" for um curso, usa o progresso do curso
  const getFrac = (s, dim) => {
    const d = s.dims[dim];
    if (dim === "teoria" && d && d.curso) return cursoFraction(d.curso);
    return fraction(s.id, dim, d);
  };

  // progresso (%) de uma matéria no painel — média das dimensões (Teoria/Lei Seca/Juris/Questões/Anki)
  const subjProgress = (subjId) => {
    const s = SUBJ_BY_ID[subjId];
    if (!s) return null;
    const dims = DIM_ORDER.filter((dd) => s.dims[dd]);
    if (!dims.length) return null;
    const avg = dims.reduce((a, dim) => { const f = getFrac(s, dim); return a + (f.total ? f.done / f.total : 0); }, 0) / dims.length;
    return Math.round(avg * 100);
  };

  const scrollToCurso = (cursoId) => {
    setOpen(null);
    const el = typeof document !== "undefined" && document.getElementById(`curso-${cursoId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setFlash(cursoId);
      setTimeout(() => setFlash(null), 1800);
    }
  };

  const sectionStats = (section) => {
    let done = 0, total = 0;
    for (const s of section.subjects) {
      for (const dim of DIM_ORDER) {
        const items = s.dims[dim];
        if (!items) continue;
        const f = getFrac(s, dim);
        total += 1;
        if (f.total > 0 && f.done === f.total) done += 1;
      }
    }
    return { done, total };
  };

  const simDone = Object.values(simData).filter((v) => v.checked).length;
  const simTotal = SIMULADOS.reduce((a, g) => a + g.provas.length, 0) + simManuais.length;

  // grupos de simulados por ano (provas oficiais + provas manuais), ordenados
  const simGroups = (() => {
    const byYear = {};
    SIMULADOS.forEach((g) => {
      byYear[g.grupo] = (byYear[g.grupo] || []).concat(g.provas.map((p) => ({ nome: p, manual: false })));
    });
    simManuais.forEach((m) => {
      byYear[m.ano] = (byYear[m.ano] || []).concat([{ nome: m.nome, ano: m.ano, manual: true }]);
    });
    return Object.keys(byYear)
      .sort((a, b) => b.localeCompare(a))
      .map((ano) => ({ grupo: ano, provas: byYear[ano].sort((x, y) => x.nome.localeCompare(y.nome, "pt")) }));
  })();

  const matriz = SECTIONS.reduce(
    (a, sec) => { const st = sectionStats(sec); return { done: a.done + st.done, total: a.total + st.total }; },
    { done: 0, total: 0 }
  );
  const infoTotal = INFORMATIVOS.stf.length + INFORMATIVOS.stj.length;
  const infoDone = Object.values(infoData).filter(Boolean).length;
  const pct = (d, t) => (t ? Math.round((d / t) * 100) : 0);

  const Bar = ({ done, total, color }) => (
    <div className="bar"><i style={{ width: `${pct(done, total)}%`, background: color || "var(--gold)" }} /></div>
  );

  return (
    <div className="root">
      <style>{`
        :root {
          --bg:#0a0e13; --surface:#141a22; --surface-2:#1a212b; --surface-3:#212a35;
          --line:rgba(255,255,255,.07); --line-2:rgba(255,255,255,.12);
          --text:#eae7df; --muted:#95a1b0; --faint:#69737f;
          --gold:#f0c85a; --coral:#e8837a; --green:#59c98a; --green-bg:rgba(89,201,138,.14);
        }
        :root[data-theme="light"] {
          --bg:#f4f1ea; --surface:#ffffff; --surface-2:#f4f1e8; --surface-3:#e9e4d8;
          --line:rgba(0,0,0,.09); --line-2:rgba(0,0,0,.15);
          --text:#2a2620; --muted:#6a6357; --faint:#9a9082;
          --gold:#b7860f; --coral:#cf5a49; --green:#2fa96a; --green-bg:rgba(47,169,106,.12);
        }
        * { box-sizing: border-box; }
        .root {
          font-family: 'Inter',-apple-system,'Segoe UI',sans-serif;
          color: var(--text);
          min-height: 100%;
          padding: 0 18px 80px;
          background:
            radial-gradient(1100px 520px at 15% -8%, rgba(240,200,90,.09), transparent 60%),
            radial-gradient(900px 480px at 92% 4%, rgba(127,150,196,.10), transparent 60%),
            var(--bg);
        }
        :root[data-theme="light"] .root {
          background:
            radial-gradient(1100px 520px at 15% -8%, rgba(183,134,15,.07), transparent 60%),
            radial-gradient(900px 480px at 92% 4%, rgba(127,150,196,.10), transparent 60%),
            var(--bg);
        }
        :root[data-theme="light"] .stat { background: var(--surface); }
        :root[data-theme="light"] .pop, :root[data-theme="light"] .pop-head { background: rgba(255,255,255,.98); }
        .serif { font-family: 'Iowan Old Style','Georgia',serif; }
        .mono { font-family: 'SF Mono','JetBrains Mono','Consolas',monospace; font-variant-numeric: tabular-nums; }
        .wrap { max-width: 1080px; margin: 0 auto; }
        input[type=checkbox] { accent-color: var(--gold); width: 15px; height: 15px; cursor: pointer; }

        /* ---- hero ---- */
        .hero { padding: 40px 0 26px; }
        .eyebrow { font-size: 11px; letter-spacing: 2.4px; text-transform: uppercase; color: var(--gold); font-weight: 600; margin: 0 0 10px; }
        .hero h1 { font-size: clamp(26px, 4vw, 38px); line-height: 1.08; margin: 0 0 10px; letter-spacing: -.5px; font-weight: 600; }
        .hero h1 em { font-style: normal; color: var(--gold); }
        .hero p { font-size: 14px; color: var(--muted); margin: 0; max-width: 640px; line-height: 1.5; }
        .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-top: 26px; }
        .stat { background: linear-gradient(180deg, var(--surface), rgba(20,26,34,.6));
          border: 1px solid var(--line); border-radius: 16px; padding: 16px 18px; }
        .stat-top { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 12px; }
        .stat-label { font-size: 12px; color: var(--muted); font-weight: 500; }
        .stat-num { font-size: 15px; } .stat-num b { font-size: 22px; font-weight: 700; } .stat-num span { color: var(--faint); }
        .stat-pct { font-size: 12px; font-weight: 600; }

        /* ---- generic bar ---- */
        .bar { height: 6px; border-radius: 99px; background: rgba(255,255,255,.08); overflow: hidden; }
        .bar > i { display: block; height: 100%; border-radius: 99px; transition: width .35s ease; }

        /* ---- tier ---- */
        .tier { background: var(--surface); border: 1px solid var(--line); border-radius: 20px;
          padding: 6px 22px 22px; margin-bottom: 22px; scroll-margin-top: 62px; }

        /* menu lateral de navegação */
        .sidenav { position: fixed; top: 50%; left: calc((100vw - 1080px) / 2 - 234px);
          transform: translateY(-50%); z-index: 300; display: flex; flex-direction: column; gap: 8px; width: 214px; }
        .sidenav a { text-decoration: none; }
        .nav-editais { display: block; text-align: center; font-size: 12px; font-weight: 800; letter-spacing: .5px;
          color: var(--coral); background: var(--surface-2); border: 1px solid var(--line-2); border-radius: 12px;
          padding: 13px 12px; line-height: 1.3; transition: all .15s; }
        .nav-editais:hover { background: var(--surface-3); }
        .nav-editais.active { background: var(--coral); color: #10141a; border-color: var(--coral); }
        .nav-trio { display: flex; flex-direction: column; gap: 6px; background: var(--surface);
          border: 1px solid var(--line-2); border-radius: 14px; padding: 10px; }
        .nav-btn { display: flex; align-items: center; gap: 11px; padding: 11px 12px; border-radius: 11px;
          font-size: 12.5px; font-weight: 700; letter-spacing: .3px; color: var(--muted); line-height: 1.2;
          transition: background .15s, color .15s; }
        .nav-btn:hover { background: var(--surface-2); color: var(--text); }
        .nav-btn.active { color: var(--gold); background: var(--surface-2); }
        .nav-num { flex-shrink: 0; width: 26px; height: 26px; border-radius: 8px; display: grid; place-items: center;
          font-size: 14px; font-weight: 800; color: var(--faint); background: var(--surface-3); border: 1px solid var(--line-2); }
        .nav-btn.active .nav-num { color: #10141a; background: var(--gold); border-color: var(--gold); }
        .nav-rest { border: 1px solid var(--line); background: var(--surface); }
        @media (max-width: 1499px) { .sidenav { display: none; } }
        .tier-head { display: flex; align-items: center; gap: 14px; padding: 20px 2px 16px; }
        .tier-badge { width: 34px; height: 34px; border-radius: 11px; display: grid; place-items: center;
          font-weight: 700; font-size: 15px; color: #10141a; flex-shrink: 0; }
        .tier-title { font-size: 16px; font-weight: 650; margin: 0; letter-spacing: -.2px; }
        .tier-sub { font-size: 12px; color: var(--faint); margin-top: 1px; }
        .tier-count { margin-left: auto; text-align: right; font-size: 12px; color: var(--muted); white-space: nowrap; }

        /* ---- subject ---- */
        .subj { padding: 15px 0; border-top: 1px solid var(--line); }
        .subj:first-of-type { border-top: none; }
        .subj-head { display: flex; align-items: center; gap: 10px; margin-bottom: 11px; }
        .subj-name { font-size: 15px; font-weight: 600; color: var(--coral); letter-spacing: -.2px; }
        .bloco { font-size: 10.5px; font-weight: 600; letter-spacing: .3px; color: var(--muted);
          background: var(--surface-3); border: 1px solid var(--line-2); border-radius: 99px; padding: 3px 9px; }
        .cells { display: grid; grid-template-columns: repeat(var(--n,5), 1fr); gap: 9px; }
        @media (max-width: 720px) { .cells { grid-template-columns: repeat(2, 1fr) !important; } }

        .cell { position: relative; border: 1px solid var(--line-2); background: var(--surface-2);
          border-radius: 13px; padding: 11px 12px 12px; cursor: pointer; text-align: left; color: var(--text);
          font-family: inherit; transition: transform .12s, border-color .15s, background .15s; overflow: hidden; }
        .cell:hover { transform: translateY(-2px); border-color: rgba(255,255,255,.2); background: var(--surface-3); }
        .cell-label { font-size: 11.5px; font-weight: 600; color: var(--muted); display: flex; align-items: center; justify-content: space-between; gap: 6px; }
        .cell-frac { font-size: 19px; font-weight: 700; margin: 7px 0 9px; letter-spacing: -.5px; }
        .cell-frac small { font-size: 12px; font-weight: 500; color: var(--faint); }
        .cell[data-state="partial"] { border-color: rgba(240,200,90,.4); }
        .cell[data-state="partial"] .cell-frac { color: var(--gold); }
        .cell[data-state="done"] { border-color: rgba(89,201,138,.5); background: var(--green-bg); }
        .cell[data-state="done"] .cell-frac { color: var(--green); }
        .cell[data-state="done"] .cell-label { color: var(--green); }
        .check { width: 16px; height: 16px; border-radius: 50%; background: var(--green); color: #06120b;
          display: grid; place-items: center; font-size: 10px; font-weight: 900; }

        /* célula "Teoria" que aponta para um curso em vídeo */
        .cell-link { border-style: dashed; }
        .cell-link[data-state="empty"] { border-color: rgba(240,200,90,.45); }
        .cell-link .cell-label { color: var(--gold); }
        .cell-link[data-state="done"] .cell-label { color: var(--green); }
        .link-arrow { font-size: 9px; font-weight: 700; letter-spacing: .2px; color: var(--gold); opacity: .85; white-space: nowrap; }
        .curso-anchor { scroll-margin-top: 64px; border-radius: 16px; padding: 8px; margin-left: -8px; margin-right: -8px;
          transition: box-shadow .45s ease, background .45s ease; }
        .curso-anchor.flash { box-shadow: 0 0 0 2px var(--gold), 0 0 34px rgba(240,200,90,.35); background: rgba(240,200,90,.06); }

        /* ---- popover ---- */
        .pop { position: absolute; top: calc(100% + 8px); left: 0; z-index: 40; width: 340px; max-width: 88vw;
          max-height: 360px; overflow-y: auto; background: rgba(24,31,40,.97); backdrop-filter: blur(14px);
          border: 1px solid var(--line-2); border-radius: 16px; padding: 14px;
          box-shadow: 0 20px 50px rgba(0,0,0,.55); animation: pop .16s ease; }
        @keyframes pop { from { opacity:0; transform: translateY(-6px) scale(.98);} to {opacity:1; transform:none;} }
        .pop-head { display: flex; align-items: baseline; justify-content: space-between;
          padding-bottom: 10px; margin-bottom: 10px; border-bottom: 1px solid var(--line); position: sticky; top: -14px;
          background: rgba(24,31,40,.98); }
        .pop-head b { font-size: 13px; } .pop-head span { font-size: 11px; color: var(--faint); }
        .pop-item { padding: 6px; border-radius: 8px; margin-bottom: 2px; }
        .pop-item:hover { background: rgba(255,255,255,.04); }
        .pop-item label { display: flex; align-items: flex-start; gap: 9px; font-size: 12.5px; cursor: pointer; line-height: 1.35; }
        .pop-item label > span { flex: 1; }
        .pop-item.checked label > span { color: var(--faint); text-decoration: line-through; text-decoration-color: rgba(255,255,255,.25); }
        .field { width: 100%; margin: 6px 0 0 24px; background: var(--bg); border: 1px solid var(--line-2);
          border-radius: 7px; color: var(--text); font-size: 11.5px; padding: 5px 8px; font-family: inherit; }
        .field:focus { outline: none; border-color: var(--gold); }
        .score { width: 54px; background: var(--bg); border: 1px solid var(--line-2); border-radius: 7px;
          color: var(--text); font-size: 12px; padding: 4px 6px; text-align: center; font-family: inherit; flex-shrink: 0; }
        .score:focus { outline: none; border-color: var(--gold); }

        /* ---- panels (info / simulados / cursos) ---- */
        .panel { background: var(--surface); border: 1px solid var(--line); border-radius: 20px; padding: 24px; margin-top: 22px; scroll-margin-top: 62px; }
        .panel-head { display: flex; align-items: center; gap: 12px; margin-bottom: 6px; }
        .panel-head h2 { font-size: 15px; font-weight: 650; margin: 0; letter-spacing: .2px; }
        .panel-dot { width: 9px; height: 9px; border-radius: 50%; background: var(--gold); box-shadow: 0 0 12px var(--gold); }
        .panel-count { margin-left: auto; font-size: 12px; color: var(--muted); }
        .panel p.desc { font-size: 12.5px; color: var(--faint); margin: 0 0 18px; line-height: 1.5; }
        .col-label { font-size: 11px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: var(--muted); margin-bottom: 9px; }

        .info-row, .sim-row { display: flex; align-items: center; gap: 10px; font-size: 13px; padding: 9px 12px;
          border-radius: 11px; background: var(--surface-2); border: 1px solid var(--line); margin-bottom: 7px; cursor: pointer; transition: background .15s; }
        .info-row:hover, .sim-row:hover { background: var(--surface-3); }
        .info-row .date { margin-left: auto; }
        .info-link { color: var(--text); text-decoration: none; font-weight: 500; }
        .info-link:hover { color: var(--gold); text-decoration: underline; }

        /* Simulados: acordeão por ano + % por matéria */
        .sim-year { border: 1px solid var(--line); border-radius: 12px; margin-bottom: 8px; overflow: hidden; background: var(--surface-2); }
        .year-head { width: 100%; display: flex; align-items: center; gap: 10px; padding: 11px 14px; background: transparent;
          border: none; cursor: pointer; color: var(--text); font-family: inherit; font-size: 14px; font-weight: 700; letter-spacing: .5px; }
        .year-head:hover { background: var(--surface-3); }
        .year-arrow { color: var(--gold); font-size: 11px; width: 12px; }
        .year-count { margin-left: auto; font-size: 11px; color: var(--faint); font-weight: 500; }
        .year-body { padding: 2px 12px 10px; }
        .sim-prova { border-top: 1px solid var(--line); }
        .sim-prova:first-child { border-top: none; }
        .sim-prova-row { display: flex; align-items: center; gap: 10px; }
        .sim-name { flex: 1; display: flex; align-items: center; gap: 9px; background: transparent; border: none; cursor: pointer;
          color: var(--text); font-family: inherit; font-size: 13px; text-align: left; padding: 8px 4px; border-radius: 8px; }
        .sim-name:hover { background: var(--surface-3); }
        .sim-arrow { color: var(--faint); font-size: 10px; width: 10px; flex-shrink: 0; }
        .sim-overall { font-size: 12px; font-weight: 700; color: var(--gold); flex-shrink: 0; }
        .sim-mats { display: grid; grid-template-columns: 1fr 1fr; gap: 5px 18px; padding: 6px 4px 12px 24px; }
        .sim-mat { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--muted); }
        .sim-mat > span { flex: 1; }
        @media (max-width: 640px) { .sim-mats { grid-template-columns: 1fr; } }

        .curso-box { background: var(--surface-2); border: 1px solid var(--line); border-radius: 13px;
          padding: 12px 14px; max-height: 260px; overflow-y: auto; }
        .curso-item { display: flex; align-items: flex-start; gap: 9px; font-size: 12.5px; padding: 4px 0; cursor: pointer; line-height: 1.4; }
        .curso-item > span:not(.dur):not(.idx) { flex: 1; }
        .curso-item.checked > span:not(.dur) { color: var(--faint); text-decoration: line-through; text-decoration-color: rgba(255,255,255,.25); }
        .curso-item .dur { margin-left: auto; padding-left: 8px; font-size: 10.5px; color: var(--faint); flex-shrink: 0; }
        .curso-head { font-size: 11px; font-weight: 700; letter-spacing: .5px; text-transform: uppercase; color: var(--gold);
          margin: 14px 0 7px; padding-top: 9px; border-top: 1px solid var(--line); }
        .curso-box > .curso-head:first-child { margin-top: 0; padding-top: 0; border-top: none; }
        .idx { color: var(--faint); flex-shrink: 0; font-size: 11px; }

        /* botão de acesso aos editais (no topo do painel) */
        .editais-open { margin-top: 18px; display: inline-flex; align-items: center; gap: 8px; cursor: pointer;
          background: var(--surface-2); color: var(--text); border: 1px solid var(--line-2); border-radius: 11px;
          padding: 10px 16px; font: inherit; font-size: 13px; font-weight: 600; transition: background .15s, border-color .15s; }
        .editais-open:hover { background: var(--surface-3); border-color: var(--coral); color: var(--coral); }

        /* página de editais verticalizados */
        .editais-page { padding-top: 8px; }
        .edital-back { cursor: pointer; background: transparent; border: none; color: var(--muted); font: inherit;
          font-size: 13px; padding: 6px 0; margin-bottom: 6px; }
        .edital-back:hover { color: var(--gold); }
        .edital-tabs { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 22px; }
        .edital-tab { cursor: pointer; background: var(--surface); border: 1px solid var(--line-2); border-radius: 999px;
          padding: 9px 16px; font: inherit; font-size: 13px; font-weight: 600; color: var(--muted); transition: all .15s; }
        .edital-tab:hover { color: var(--text); border-color: var(--muted); }
        .edital-tab.active { background: var(--gold); color: #10141a; border-color: var(--gold); }
        .edital-materia { background: var(--surface); border: 1px solid var(--line); border-radius: 16px; padding: 18px 20px; margin-bottom: 16px; }
        .edital-materia-head { display: flex; align-items: baseline; gap: 12px; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid var(--line); }
        .edital-materia-head h3 { margin: 0; font-size: 15px; font-weight: 700; color: var(--coral); letter-spacing: .2px; }
        .edital-count { margin-left: auto; font-size: 11px; color: var(--faint); }
        .edital-link { font-size: 10px; font-weight: 700; letter-spacing: .3px; text-transform: uppercase; color: var(--gold);
          background: rgba(240,200,90,.12); border: 1px solid rgba(240,200,90,.35); border-radius: 999px; padding: 2px 9px; }
        .edital-item { margin-bottom: 4px; }
        .edital-line { display: flex; align-items: flex-start; gap: 9px; font-size: 13px; line-height: 1.45; padding: 5px 6px;
          border-radius: 8px; cursor: pointer; }
        .edital-line:hover { background: var(--surface-2); }
        .edital-line.checked .edital-txt { color: var(--faint); text-decoration: line-through; text-decoration-color: rgba(255,255,255,.22); }
        .edital-n { color: var(--gold); font-weight: 700; flex-shrink: 0; min-width: 22px; }
        .edital-sub { margin-left: 26px; font-size: 12.5px; }
        .edital-sub .edital-n { color: var(--muted); font-weight: 600; min-width: 26px; }

        /* post-it de PRIORIDADES */
        .postit { width: 300px; margin: 22px 0 4px auto; background: #f7e7a3; color: #3a3320;
          border-radius: 5px; padding: 15px 16px 18px; box-shadow: 0 12px 26px rgba(0,0,0,.32); transform: rotate(-1.2deg); }
        .postit-head { font-weight: 800; letter-spacing: .5px; font-size: 13px; margin-bottom: 11px; padding-bottom: 9px;
          border-bottom: 1px dashed rgba(0,0,0,.18); }
        .postit-add { display: flex; gap: 6px; margin-bottom: 10px; }
        .postit-add input { flex: 1; min-width: 0; background: rgba(255,255,255,.55); border: 1px solid rgba(0,0,0,.16);
          border-radius: 6px; padding: 7px 9px; font: inherit; font-size: 12px; color: #3a3320; }
        .postit-add input::placeholder { color: #9a8c50; }
        .postit-add button { width: 32px; flex-shrink: 0; border: none; border-radius: 6px; background: #3a3320;
          color: #f7e7a3; font-size: 17px; line-height: 1; cursor: pointer; }
        .postit-add button:hover { background: #56492a; }
        .postit-list { display: flex; flex-direction: column; max-height: 320px; overflow-y: auto; }
        .postit-empty { font-size: 12px; color: #9a8c50; font-style: italic; padding: 4px 2px; }
        .postit-item { display: flex; align-items: flex-start; gap: 8px; font-size: 12.5px; line-height: 1.35;
          padding: 6px 2px; border-bottom: 1px solid rgba(0,0,0,.07); }
        .postit-item input[type=checkbox] { accent-color: #7a6a1a; margin-top: 1px; }
        .postit-item span { flex: 1; }
        .postit-item.done span { text-decoration: line-through; color: #9a8c50; }
        .postit-x { border: none; background: transparent; color: #b8a558; cursor: pointer; font-size: 16px; line-height: 1; padding: 0 2px; flex-shrink: 0; }
        .postit-x:hover { color: #cf5a49; }

        /* adicionar prova avulsa (simulados) */
        .man-add { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
        .man-nome { flex: 1; min-width: 180px; background: var(--surface-2); border: 1px solid var(--line-2);
          border-radius: 9px; padding: 9px 11px; font: inherit; font-size: 13px; color: var(--text); }
        .man-ano { width: 70px; background: var(--surface-2); border: 1px solid var(--line-2); border-radius: 9px;
          padding: 9px 10px; font: inherit; font-size: 13px; color: var(--text); text-align: center; }
        .man-nome:focus, .man-ano:focus { outline: none; border-color: var(--coral); }
        .man-btn { cursor: pointer; background: var(--surface-3); border: 1px solid var(--line-2); border-radius: 9px;
          padding: 9px 14px; font: inherit; font-size: 13px; font-weight: 600; color: var(--text); }
        .man-btn:hover { border-color: var(--coral); color: var(--coral); }
        .man-tag { font-size: 9.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .4px; color: var(--coral);
          border: 1px solid var(--coral); border-radius: 999px; padding: 1px 6px; margin-left: 8px; vertical-align: middle; }
        .man-del { border: none; background: transparent; color: var(--faint); cursor: pointer; font-size: 17px; line-height: 1; padding: 0 4px; flex-shrink: 0; }
        .man-del:hover { color: var(--coral); }
      `}</style>

      <nav className="sidenav" aria-label="Navegação por seções">
        <a
          href="#editais"
          className={`nav-editais${view === "editais" ? " active" : ""}`}
          onClick={(e) => { e.preventDefault(); setView("editais"); window.scrollTo(0, 0); }}
        >
          EDITAIS VERTICALIZADOS
        </a>
        <div className="nav-trio">
          {NAV_TRIO.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              className={`nav-btn${view === "main" && activeSec === n.id ? " active" : ""}`}
              onClick={(e) => { e.preventDefault(); setView("main"); setTimeout(() => goTo(n.id), 0); }}
            >
              <span className="nav-num">{n.n}</span>
              <span className="nav-label">{n.label}</span>
            </a>
          ))}
        </div>
        {NAV_REST.map((n) => (
          <a
            key={n.id}
            href={`#${n.id}`}
            className={`nav-btn nav-rest${view === "main" && activeSec === n.id ? " active" : ""}`}
            onClick={(e) => { e.preventDefault(); setView("main"); setTimeout(() => goTo(n.id), 0); }}
          >
            <span className="nav-label">{n.label}</span>
          </a>
        ))}
      </nav>

      <div className="wrap">
        {view === "editais" && (
          <section className="editais-page">
            <button className="edital-back" onClick={() => setView("main")}>← Voltar ao painel</button>
            <p className="eyebrow">Painel de Estudos</p>
            <h1 className="serif" style={{ marginBottom: 18 }}>Editais Verticalizados</h1>
            {EDITAIS.length === 0 ? (
              <p className="desc">Nenhum edital cadastrado ainda.</p>
            ) : (
              <>
                <div className="edital-tabs">
                  {EDITAIS.map((e, i) => (
                    <button key={e.id} className={`edital-tab${openEdital === i ? " active" : ""}`} onClick={() => setOpenEdital(i)}>
                      {e.nome}
                    </button>
                  ))}
                </div>
                {(() => {
                  const ed = EDITAIS[openEdital] || EDITAIS[0];
                  const v = editaisData[ed.id] || {};
                  return (
                    <div className="edital-body">
                      {ed.materias.map((m, mi) => {
                        let done = 0, total = 0;
                        m.itens.forEach((it, ii) => {
                          total++; if (v[`${mi}.${ii}`]) done++;
                          (it.subs || []).forEach((s, si) => { total++; if (v[`${mi}.${ii}.${si}`]) done++; });
                        });
                        return (
                          <div key={mi} className="edital-materia">
                            <div className="edital-materia-head">
                              <h3>{m.nome}</h3>
                              {(() => {
                                const sid = editalSubjId(m.nome);
                                const pp = sid ? subjProgress(sid) : null;
                                return pp != null ? (
                                  <span className="edital-link" title="Progresso desta matéria no painel principal (Teoria/Lei Seca/Jurisprudência/Questões/Anki)">
                                    painel {pp}%
                                  </span>
                                ) : null;
                              })()}
                              <span className="mono edital-count">{done}/{total}</span>
                            </div>
                            {m.itens.map((it, ii) => {
                              const kk = `${mi}.${ii}`;
                              return (
                                <div key={ii} className="edital-item">
                                  <label className={`edital-line${v[kk] ? " checked" : ""}`}>
                                    <input type="checkbox" checked={!!v[kk]} onChange={() => toggleEdital(ed.id, kk)} style={{ marginTop: 3 }} />
                                    {it.n && <span className="edital-n">{it.n}</span>}
                                    <span className="edital-txt">{it.txt}</span>
                                  </label>
                                  {(it.subs || []).map((s, si) => {
                                    const sk = `${mi}.${ii}.${si}`;
                                    return (
                                      <label key={si} className={`edital-line edital-sub${v[sk] ? " checked" : ""}`}>
                                        <input type="checkbox" checked={!!v[sk]} onChange={() => toggleEdital(ed.id, sk)} style={{ marginTop: 3 }} />
                                        {s.n && <span className="edital-n">{s.n}</span>}
                                        <span className="edital-txt">{s.txt}</span>
                                      </label>
                                    );
                                  })}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </>
            )}
          </section>
        )}

        {view === "main" && (<>
        {/* ---------- HERO ---------- */}
        <header className="hero">
          <p className="eyebrow">Painel de Estudos</p>
          <h1 className="serif">Carreiras Jurídicas<br /><em>Magistratura Estadual e Ministério Público</em></h1>
          <button className="editais-open" onClick={() => { setView("editais"); window.scrollTo(0, 0); }}>📋 Editais Verticalizados</button>

          <div className="stats">
            <div className="stat">
              <div className="stat-top">
                <span className="stat-label">Matriz · fontes completas</span>
                <span className="stat-pct" style={{ color: "var(--gold)" }}>{pct(matriz.done, matriz.total)}%</span>
              </div>
              <div className="stat-num" style={{ marginBottom: 10 }}><b>{matriz.done}</b><span> / {matriz.total}</span></div>
              <Bar done={matriz.done} total={matriz.total} color="var(--gold)" />
            </div>
            <div className="stat">
              <div className="stat-top">
                <span className="stat-label">Simulados resolvidos</span>
                <span className="stat-pct" style={{ color: "var(--coral)" }}>{pct(simDone, simTotal)}%</span>
              </div>
              <div className="stat-num" style={{ marginBottom: 10 }}><b>{simDone}</b><span> / {simTotal}</span></div>
              <Bar done={simDone} total={simTotal} color="var(--coral)" />
            </div>
            <div className="stat">
              <div className="stat-top">
                <span className="stat-label">Informativos lidos</span>
                <span className="stat-pct" style={{ color: "#7f96c4" }}>{pct(infoDone, infoTotal)}%</span>
              </div>
              <div className="stat-num" style={{ marginBottom: 10 }}><b>{infoDone}</b><span> / {infoTotal}</span></div>
              <Bar done={infoDone} total={infoTotal} color="#7f96c4" />
            </div>
          </div>
        </header>

        {/* ---------- PRIORIDADES (post-it) ---------- */}
        <aside className="postit">
          <div className="postit-head">📌 PRIORIDADES</div>
          <div className="postit-add">
            <input value={prioInput} onChange={(e) => setPrioInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addPrioridade(); }} placeholder="nova tarefa solta..." />
            <button onClick={addPrioridade} title="Adicionar">+</button>
          </div>
          <div className="postit-list">
            {prioridades.length === 0 && <div className="postit-empty">nada por aqui ✨</div>}
            {prioridades.map((p) => (
              <div key={p.id} className={`postit-item${p.done ? " done" : ""}`}>
                <input type="checkbox" checked={p.done} onChange={() => togglePrioridade(p.id)} />
                <span>{p.txt}</span>
                <button className="postit-x" onClick={() => removePrioridade(p.id)} title="Remover">×</button>
              </div>
            ))}
          </div>
        </aside>

        {/* ---------- MATRIZ ---------- */}
        {SECTIONS.map((section) => {
          const meta = TIER_META[section.tier];
          const stats = sectionStats(section);
          return (
            <section key={section.tier} id={`sec-${section.tier}`} className="tier">
              <div className="tier-head">
                <div className="tier-badge" style={{ background: meta.color }}>{meta.n}</div>
                <div>
                  <h2 className="tier-title" style={{ color: meta.color }}>{meta.label}</h2>
                  <div className="tier-sub">{meta.sub}</div>
                </div>
                <div className="tier-count">
                  <div>{stats.done}/{stats.total} completos</div>
                  <div style={{ width: 120, marginTop: 6 }}><Bar done={stats.done} total={stats.total} color={meta.color} /></div>
                </div>
              </div>

              {section.subjects.map((s) => {
                const dims = DIM_ORDER.filter((d) => s.dims[d]);
                return (
                  <div key={s.id} className="subj">
                    <div className="subj-head">
                      <span className="subj-name">{s.name}</span>
                      <span className="bloco">{s.bloco}</span>
                    </div>
                    <div className="cells" style={{ "--n": dims.length }}>
                      {dims.map((dim) => {
                        const items = s.dims[dim];
                        const isCurso = dim === "teoria" && items && items.curso;
                        const f = getFrac(s, dim);
                        const ratio = f.total ? f.done / f.total : 0;
                        const state = ratio === 1 ? "done" : ratio > 0 ? "partial" : "empty";
                        const barColor = ratio === 1 ? "var(--green)" : "var(--gold)";
                        const key = `${s.id}:${dim}`;
                        const showNote = dim === "leiSeca";
                        const showScore = dim === "questoes";
                        if (isCurso) {
                          return (
                            <div key={dim} style={{ position: "relative" }}>
                              <button className="cell cell-link" data-state={state} onClick={() => scrollToCurso(items.curso)} title="Ver o curso em vídeo nos Cursos Isolados">
                                <div className="cell-label">
                                  {DIM_LABEL[dim]}
                                  {state === "done" ? <span className="check">✓</span> : <span className="link-arrow">ver curso ↓</span>}
                                </div>
                                <div className="cell-frac mono">{f.done}<small> /{f.total}</small></div>
                                <Bar done={f.done} total={f.total} color={barColor} />
                              </button>
                            </div>
                          );
                        }
                        return (
                          <div key={dim} style={{ position: "relative" }}>
                            <button className="cell" data-state={state} onClick={() => setOpen(open === key ? null : key)}>
                              <div className="cell-label">
                                {DIM_LABEL[dim]}
                                {state === "done" && <span className="check">✓</span>}
                              </div>
                              <div className="cell-frac mono">{f.done}<small> /{f.total}</small></div>
                              <Bar done={f.done} total={f.total} color={barColor} />
                            </button>
                            {open === key && (
                              <div className="pop">
                                <div className="pop-head">
                                  <b>{DIM_LABEL[dim]}</b>
                                  <span className="mono">{f.done}/{f.total}</span>
                                </div>
                                {items.map((label, idx) => {
                                  const v = (data[key] || {})[idx] || {};
                                  return (
                                    <div key={idx} className={`pop-item${v.checked ? " checked" : ""}`}>
                                      <label>
                                        <input type="checkbox" checked={!!v.checked} onChange={() => toggleItem(s.id, dim, idx)} style={{ marginTop: 1 }} />
                                        <span>{label}</span>
                                        {showScore && (
                                          <input className="score mono" placeholder="%" value={v.score || ""} onClick={(e) => e.stopPropagation()} onChange={(e) => toggleItem(s.id, dim, idx, { score: e.target.value })} />
                                        )}
                                      </label>
                                      {showNote && (
                                        <input className="field" placeholder="até qual artigo li..." value={v.note || ""} onClick={(e) => e.stopPropagation()} onChange={(e) => toggleItem(s.id, dim, idx, { note: e.target.value })} />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </section>
          );
        })}

        {/* ---------- INFORMATIVOS ---------- */}
        <section id="sec-informativos" className="panel">
          <div className="panel-head">
            <span className="panel-dot" />
            <h2>INFORMATIVOS DE JURISPRUDÊNCIA</h2>
            <span className="panel-count mono">{infoDone}/{infoTotal} lidos</span>
          </div>
          <p className="desc">Informativos Semanais</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
            {["stf", "stj"].map((org) => (
              <div key={org}>
                <div className="col-label" style={{ color: "var(--coral)" }}>{org.toUpperCase()}</div>
                {INFORMATIVOS[org].map((ed) => (
                  <div key={ed.num} className="info-row" onClick={() => toggleInfo(org, ed.num)}>
                    <input type="checkbox" checked={!!infoData[`${org}-${ed.num}`]} onChange={() => {}} />
                    <a className="info-link" href={infoUrl(org, ed.num)} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} title="Abrir o PDF desta edição">
                      Informativo {ed.num} ↗
                    </a>
                    <span className="date mono" style={{ marginLeft: "auto", fontSize: 11, color: "var(--faint)" }}>{ed.date}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* ---------- SIMULADOS ---------- */}
        <section id="sec-simulados" className="panel">
          <div className="panel-head">
            <span className="panel-dot" style={{ background: "var(--coral)", boxShadow: "0 0 12px var(--coral)" }} />
            <h2>SIMULADOS | PROVAS ANTERIORES</h2>
            <span className="panel-count mono">{simDone}/{simTotal} resolvidas</span>
          </div>
          <p className="desc">FGV 2026-2024</p>

          <div className="man-add">
            <input className="man-nome" placeholder="Adicionar prova avulsa (ex.: TJ RS 2026)" value={manNome}
              onChange={(e) => setManNome(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addManual(); }} />
            <input className="man-ano" placeholder="ano" value={manAno}
              onChange={(e) => setManAno(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addManual(); }} />
            <button className="man-btn" onClick={addManual}>+ Adicionar</button>
          </div>

          {simGroups.map((g) => {
            const isYearOpen = openYear === g.grupo;
            const yearDone = g.provas.filter((p) => (simData[p.nome] || {}).checked).length;
            return (
              <div key={g.grupo} className="sim-year">
                <button className="year-head" onClick={() => setOpenYear(isYearOpen ? null : g.grupo)}>
                  <span className="year-arrow">{isYearOpen ? "▾" : "▸"}</span>
                  <span className="year-label">{g.grupo}</span>
                  <span className="year-count mono">{yearDone}/{g.provas.length}</span>
                </button>
                {isYearOpen && (
                  <div className="year-body">
                    {g.provas.map((p) => {
                      const nome = p.nome;
                      const v = simData[nome] || {};
                      const overall = provaOverall(nome);
                      const isOpen = openProva === nome;
                      return (
                        <div key={nome} className="sim-prova">
                          <div className="sim-prova-row">
                            <input type="checkbox" checked={!!v.checked} onChange={() => toggleSim(nome, { checked: !v.checked })} />
                            <button className="sim-name" onClick={() => setOpenProva(isOpen ? null : nome)}>
                              <span className="sim-arrow">{isOpen ? "▾" : "▸"}</span>
                              <span style={{ flex: 1 }}>{nome}{p.manual && <span className="man-tag">avulsa</span>}</span>
                              <span className="sim-overall mono">{overall == null ? "—" : overall + "%"}</span>
                            </button>
                            {p.manual && <button className="man-del" title="Remover prova avulsa" onClick={() => removeManual(nome, g.grupo)}>×</button>}
                          </div>
                          {isOpen && (
                            <div className="sim-mats">
                              {MATERIAS_SIM.map((m) => (
                                <label key={m.id} className="sim-mat">
                                  <span>{m.name}</span>
                                  <input className="score mono" placeholder="%" value={(v.mats && v.mats[m.id]) || ""} onChange={(e) => setSimMat(nome, m.id, e.target.value)} />
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </section>

        {/* ---------- CURSOS ISOLADOS ---------- */}
        <section id="sec-cursos" className="panel">
          <div className="panel-head">
            <span className="panel-dot" style={{ background: "#7f96c4", boxShadow: "0 0 12px #7f96c4" }} />
            <h2>CURSOS ISOLADOS</h2>
          </div>
          {CURSOS_ISOLADOS.map((c) => {
            if (c.sublistas) {
              return (
                <div key={c.id} id={`curso-${c.id}`} className={`curso-anchor${flash === c.id ? " flash" : ""}`} style={{ marginBottom: 20 }}>
                  <div className="subj-name" style={{ marginBottom: 10 }}>{c.nome}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    {c.sublistas.map((sub) => {
                      const storeKey = `${c.id}:${sub.nome}`;
                      const v = cursoData[storeKey] || {};
                      const done = sub.itens.filter((_, i) => v[i]).length;
                      return (
                        <div key={sub.nome}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8, gap: 8 }}>
                            <span className="col-label" style={{ marginBottom: 0 }}>{sub.nome}</span>
                            <span className="mono" style={{ fontSize: 11, color: "var(--faint)" }}>{done}/{sub.itens.length}</span>
                          </div>
                          <div style={{ marginBottom: 10 }}><Bar done={done} total={sub.itens.length} color="#7f96c4" /></div>
                          <div className="curso-box">
                            {sub.itens.map((item, idx) => (
                              <label key={idx} className={`curso-item${v[idx] ? " checked" : ""}`}>
                                <input type="checkbox" checked={!!v[idx]} onChange={() => toggleCurso(c.id, sub.nome, idx)} style={{ marginTop: 2 }} />
                                <span className="idx mono">{idx + 1}.</span>
                                <span>{item}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }
            const v = cursoData[c.id] || {};
            const total = c.itens.filter((it) => !(it && it.h)).length;
            const done = c.itens.filter((it, i) => !(it && it.h) && v[i]).length;
            return (
              <div key={c.id} id={`curso-${c.id}`} className={`curso-anchor${flash === c.id ? " flash" : ""}`} style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8, gap: 8 }}>
                  <span className="subj-name">{c.nome}</span>
                  <span className="mono" style={{ fontSize: 11, color: "var(--faint)" }}>{done}/{total}</span>
                </div>
                <div style={{ marginBottom: 10 }}><Bar done={done} total={total} color="#7f96c4" /></div>
                <div className="curso-box">
                  {c.itens.map((item, idx) => {
                    if (item && item.h) return <div key={idx} className="curso-head">{item.h}</div>;
                    const label = typeof item === "string" ? item : item.t;
                    const dur = typeof item === "object" ? item.d : null;
                    return (
                      <label key={idx} className={`curso-item${v[idx] ? " checked" : ""}`}>
                        <input type="checkbox" checked={!!v[idx]} onChange={() => toggleCurso(c.id, null, idx)} style={{ marginTop: 2 }} />
                        <span>{label}</span>
                        {dur && <span className="dur mono">{dur}</span>}
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>
        </>)}

        {!loaded && <div style={{ textAlign: "center", color: "var(--faint)", fontSize: 12, marginTop: 24 }}>carregando progresso salvo...</div>}
      </div>
    </div>
  );
}
