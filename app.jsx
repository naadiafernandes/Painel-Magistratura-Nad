import { useState, useEffect, useRef } from "react";

// ---------- Shared checklists ----------
const JURIS_ITEMS = ["Súmulas Vinculantes", "Súmulas STF", "Súmulas STJ", "Teses de Repercussão Geral (RG)", "Temas de Recurso Repetitivo (RR)", "Jurisprudência em Teses (STJ)"];

const ANKI_ITEMS = ["Cards da matéria", "Caderno de erros da matéria", "Pontos de prova da matéria", "Outros cards da matéria"];

const SIMULADOS = [
  { grupo: "2026", provas: ["TJ BA 2026", "TJ GO 2026 (59º Concurso)", "TJ PA 2026", "TJ PR 2026", "MPE GO 2026", "MPE MT 2026", "MPE RJ 2026 (XXXIX)", "MPE SC 2026 (45º Concurso)", "MPE MS 2026 (XXXI Concurso)", "TRF2 2026 (XIX Concurso)", "ENAM 2026 — 5º Exame"] },
  { grupo: "2025", provas: ["TJ SC 2025 (1ª Aplicação)", "TJ CE 2025", "TJ MS 2025", "TJ SE 2025", "TJ TO 2025", "MPE ES 2025", "MPE RJ 2025 (XXXVIII)", "MPE PR 2025", "MPE RS 2025", "MPE BA 2025", "MPE DFT 2025 (33º Concurso)", "TRF1 2025 (XVIII)", "TRF3 2025", "TRF5 2025 (XV)", "TRF6 2025", "ENAM 2025 — 4º Exame", "ENAM 2025 — 3º Exame"] },
  { grupo: "2024", provas: ["ENAM 2024 — 2º Exame", "ENAM 2024 — Reaplicação Manaus", "ENAM 2024 — 1ª Edição (2024.1)"] },
];

// Banca organizadora de cada prova — usada só para exibir a tag colorida; não altera o "nome" (chave de progresso salvo).
const SIMULADOS_BANCA = {
  "TJ BA 2026": "FGV",
  "TJ GO 2026 (59º Concurso)": "FGV",
  "TJ PA 2026": "FGV",
  "TJ PR 2026": "FGV",
  "MPE GO 2026": "FGV",
  "MPE MT 2026": "FGV",
  "MPE RJ 2026 (XXXIX)": "FGV",
  "MPE SC 2026 (45º Concurso)": "Vunesp",
  "MPE MS 2026 (XXXI Concurso)": "FAPEC",
  "TRF2 2026 (XIX Concurso)": "FGV",
  "ENAM 2026 — 5º Exame": "FGV",
  "TJ SC 2025 (1ª Aplicação)": "FGV",
  "TJ CE 2025": "FGV",
  "TJ MS 2025": "FGV",
  "TJ SE 2025": "FGV",
  "TJ TO 2025": "FGV",
  "MPE ES 2025": "FGV",
  "MPE RJ 2025 (XXXVIII)": "FGV",
  "MPE PR 2025": "Própria",
  "MPE RS 2025": "Própria",
  "MPE BA 2025": "CEFET-BA",
  "MPE DFT 2025 (33º Concurso)": "Própria",
  "TRF1 2025 (XVIII)": "FGV",
  "TRF3 2025": "FGV",
  "TRF5 2025 (XV)": "FGV",
  "TRF6 2025": "FGV",
  "ENAM 2025 — 4º Exame": "FGV",
  "ENAM 2025 — 3º Exame": "FGV",
  "ENAM 2024 — 2º Exame": "FGV",
  "ENAM 2024 — Reaplicação Manaus": "FGV",
  "ENAM 2024 — 1ª Edição (2024.1)": "FGV",
};

// Cor de cada banca para a tag (matiz/saturação/luminosidade, para poder variar a opacidade)
const BANCA_HSL = {
  FGV: [45, 76, 63],
  Vunesp: [205, 66, 70],
  FAPEC: [280, 60, 73],
  "CEFET-BA": [30, 70, 65],
  Própria: [210, 8, 65],
};
// Bancas fora do mapa fixo (ex.: digitadas manualmente) ganham uma cor gerada
// por hash do nome — sempre a mesma cor para o mesmo nome, sem precisar cadastrar.
function bancaHSL(b) {
  if (BANCA_HSL[b]) return BANCA_HSL[b];
  let hash = 0;
  for (let i = 0; i < b.length; i++) hash = (hash * 31 + b.charCodeAt(i)) >>> 0;
  return [hash % 360, 62, 63];
}
function bancaColor(b) { const [h, s, l] = bancaHSL(b); return `hsl(${h}, ${s}%, ${l}%)`; }
function bancaBg(b, alpha) { const [h, s, l] = bancaHSL(b); return `hsla(${h}, ${s}%, ${l}%, ${alpha})`; }

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
// colunas de acompanhamento por tópico do edital (estilo Normio): Estudo + Revisões
const ED_ESTUDO = [
  { f: "t", lbl: "Teoria", full: "Teoria" },
  { f: "l", lbl: "Lei Seca", full: "Lei Seca" },
  { f: "q", lbl: "Questões", full: "Questões" },
  { f: "j", lbl: "Juris", full: "Jurisprudência" },
  { f: "a", lbl: "Anki", full: "Anki (criar cards)" },
];
const ED_REV = [{ f: "r1", lbl: "1ª" }, { f: "r2", lbl: "2ª" }, { f: "r3", lbl: "3ª" }];
// normaliza o valor salvo de um tópico: aceita o formato antigo (booleano) e o novo (objeto de 6 flags)
function editalCell(raw) {
  if (raw && typeof raw === "object") return raw;
  if (raw === true) return { t: true, l: true, q: true }; // dado antigo "concluído" → vira estudo completo
  return {};
}
// um tópico conta como "estudado" quando Teoria + Lei Seca + Questões estão marcados
function editalDone(cell) { return !!(cell.t && cell.l && cell.q); }
const PRIORIDADES_KEY = "tjsc-prioridades:list";
const ES_CHECK_KEY = "tjsc-es-checklist:list";
const REGISTROS_KEY = "tjsc-registros:v1";
const DATAPROVA_KEY = "tjsc-dataprova:v1";
const METAS_KEY = "tjsc-metas:v1";
const REVSTATUS_KEY = "tjsc-revstatus:v1";
// fontes de estudo do "Registrar estudo" (categorias do ESTUDEI, adaptadas)
const REG_FONTES = [
  { id: "teoria",   label: "Teoria",         color: "#7fa8e6" },
  { id: "leiseca",  label: "Lei seca",       color: "#5fbf87" },
  { id: "juris",    label: "Jurisprudência", color: "#b48ee6" },
  { id: "questoes", label: "Questões",       color: "#e6c060" },
  { id: "revisao",  label: "Revisão",        color: "#e68a8a" },
  { id: "simulado", label: "Simulado",       color: "#e69a5f" },
  { id: "anki",     label: "Anki",           color: "#e6739a" },
];
const regFonte = (id) => REG_FONTES.find((f) => f.id === id) || { id, label: id, color: "#9995a4" };
const fmtTempo = (min) => { min = Math.max(0, Math.round(min || 0)); const h = Math.floor(min / 60), m = min % 60; return h ? `${h}h${m ? String(m).padStart(2, "0") : "00"}` : `${m}min`; };
const SIM_MANUAIS_KEY = "tjsc-simulados-manuais:list";
const SIM_HIDDEN_KEY = "tjsc-simulados-ocultas:list";

// ---------- Editais verticalizados (dados injetados pelo build) ----------
const EDITAIS = (typeof window !== "undefined" && window.EDITAIS) || []; /* dados em editais.js */

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

// ícones de linha para o menu lateral (estilo Normio)
const NAV_ICON_PATHS = {
  home: <><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></>,
  file: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /></>,
  book: <><path d="M4 5a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0-2 2z" /><path d="M4 19a2 2 0 0 0 2 2h13" /></>,
  layers: <><path d="M12 3 3 8l9 5 9-5z" /><path d="M3 13l9 5 9-5" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><path d="M12 8h.01" /></>,
  clipboard: <><rect x="7" y="4" width="10" height="17" rx="2" /><path d="M9.5 4V3h5v1" /><path d="M9.5 9h5M9.5 13h5M9.5 17h3" /></>,
  video: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M10 9l5 3-5 3z" /></>,
  pie: <><circle cx="12" cy="12" r="9" /><path d="M12 12V3" /><path d="M12 12l7.8 4.5" /></>,
  refresh: <><path d="M20 12a8 8 0 1 1-2.3-5.6" /><path d="M20 4v4h-4" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>,
  chart: <><path d="M5 21V10" /><path d="M12 21V4" /><path d="M19 21v-7" /></>,
  inbox: <><path d="M4 13l2.5-8h11L20 13" /><path d="M4 13v6h16v-6" /><path d="M4 13h5l1 2h4l1-2h5" /></>,
};
function Ic({ n }) {
  return (
    <svg className="nav-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {NAV_ICON_PATHS[n] || null}
    </svg>
  );
}
// grupos do menu lateral
const NAV_GROUPS = [
  { label: "ESTUDEI", items: [
    { key: "es-painel", icon: "home", label: "Painel", kind: "view", view: "es-painel" },
    { key: "es-materias", icon: "layers", label: "Matérias", kind: "view", view: "es-materias" },
    { key: "es-editais", icon: "file", label: "Editais Verticalizados", kind: "view", view: "editais" },
    { key: "es-ciclos", icon: "pie", label: "Ciclos", kind: "view", view: "es-ciclos" },
    { key: "es-revisoes", icon: "refresh", label: "Revisões", kind: "view", view: "es-revisoes" },
    { key: "es-historico", icon: "clock", label: "Histórico", kind: "view", view: "es-historico" },
    { key: "es-estatisticas", icon: "chart", label: "Estatísticas", kind: "view", view: "es-estatisticas" },
    { key: "sec-simulados", icon: "clipboard", label: "Simulados", kind: "anchor" },
  ] },
  { label: "Navegação", items: [
    { key: "painel", icon: "home", label: "Painel", kind: "home" },
    { key: "diario", icon: "book", label: "Diário de estudos", kind: "view", view: "diario" },
    { key: "caixa", icon: "inbox", label: "Caixa de entrada", kind: "view", view: "caixa" },
  ] },
  { label: "Matérias", items: [
    { key: "sec-base", n: "1", label: "Matérias-base", kind: "anchor" },
    { key: "sec-altamedia", n: "2", label: "Importância média-alta", kind: "anchor" },
    { key: "sec-baixamedia", n: "3", label: "Importância média-baixa", kind: "anchor" },
  ] },
  { label: "Acervo", items: [
    { key: "sec-informativos", icon: "info", label: "Informativos", kind: "anchor" },
    { key: "sec-cursos", icon: "video", label: "Cursos isolados", kind: "anchor" },
  ] },
];

const DIM_LABEL = { teoria: "Teoria", leiSeca: "Lei Seca", jurisprudencia: "Jurisprudência", questoes: "Questões (temas TEC)", anki: "Anki" };
const DIM_ORDER = ["teoria", "leiSeca", "jurisprudencia", "questoes", "anki"];
const KEY_PREFIX = "tjsc-matriz5:";
const SIM_KEY_PREFIX = "tjsc-simulados3:";
const INFO_KEY_PREFIX = "tjsc-informativos2:";
const DIARIO_KEY = "tjsc-diario:v1";
const DIARIO_TAGS_KEY = "tjsc-diario-tags:v1";

// Tags de "Fonte" que já vêm prontas (a Nadia pode criar as dela com qualquer cor)
const DEFAULT_FONTE_TAGS = [
  { id: "lei",      label: "Lei seca",       color: "#5fbf87" },
  { id: "juris",    label: "Jurisprudência", color: "#b48ee6" },
  { id: "questoes", label: "Questões",       color: "#e6c060" },
  { id: "doutrina", label: "Doutrina",       color: "#7fa8e6" },
  { id: "anki",     label: "Anki",           color: "#e68a8a" },
];
// cores sugeridas ao criar uma tag nova
const TAG_COLOR_PRESETS = ["#5fbf87", "#7fa8e6", "#b48ee6", "#e6c060", "#e68a8a", "#4fbfc0", "#e69a5f", "#9bc45f", "#e675a8", "#8a94a6"];
// deixa a cor da tag bonita em qualquer formato (hex ou hsl), com fundo/borda suaves
function chipStyle(color) {
  return {
    color,
    background: `color-mix(in srgb, ${color} 16%, transparent)`,
    borderColor: `color-mix(in srgb, ${color} 40%, transparent)`,
  };
}

// ---------- Diário de estudos: classificação automática das frases ----------
// Cada matéria ganha uma cor própria (matiz/saturação/luminosidade) para a tag colorida.
const MATERIA_HSL = {
  const:  [265, 55, 67], adm:    [210, 62, 63], civil:  [150, 46, 55], pcivil: [172, 48, 52],
  penal:  [8, 72, 64],   ppenal: [24, 76, 60],  empres: [288, 46, 67], trib:   [128, 40, 52],
  cdc:    [332, 58, 69], eca:    [192, 58, 60], amb:    [96, 46, 50],  penesp: [350, 60, 64],
  civesp: [50, 62, 58],  eleit:  [235, 48, 68], dh:     [16, 60, 63],  human:  [305, 32, 64],
};
function materiaHSL(id) { return MATERIA_HSL[id] || [210, 8, 65]; }
function materiaColor(id) { const [h, s, l] = materiaHSL(id); return `hsl(${h}, ${s}%, ${l}%)`; }
function materiaBg(id, a) { const [h, s, l] = materiaHSL(id); return `hsla(${h}, ${s}%, ${l}%, ${a})`; }

// tira acentos e deixa minúsculo, para casar as palavras-chave sem depender de acento/caixa
function diaNorm(s) { return (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }

// palavras que identificam cada matéria (processo penal/civil tratados à parte, antes)
const MAT_KW = {
  const:  [/constituc/, /\bcf\b/, /controle de constitucionalidade/, /poder constituinte/, /direitos fundamentais/],
  adm:    [/administrativ/, /improbidade/, /licitac/, /\b14\.?133\b/, /servidor(es)? public/, /desapropriac/, /ato administrativo/],
  civil:  [/\bcivil\b/, /codigo civil/, /responsabilidade civil/, /\bcontrat/, /sucess/, /\bfamilia\b/, /obrigac/, /posse\b/, /usucapi/, /prescric/],
  penal:  [/\bpenal\b/, /codigo penal/, /teoria do (crime|delito)/, /dosimetria/, /crimes contra/],
  empres: [/empresarial/, /\bempresa\b/, /societari/, /falencia/, /recuperacao judicial/, /titulo de credito/, /\bcheque\b/, /duplicata/, /sociedade/],
  trib:   [/tributar/, /financeiro/, /\btributos?\b/, /\bctn\b/, /\bicms\b/, /execucao fiscal/, /credito tributario/],
  cdc:    [/consumidor/, /\bcdc\b/, /relacao de consumo/],
  eca:    [/crianca/, /adolescente/, /\beca\b/, /infancia/, /socioeducat/, /sinase/, /ato infracional/],
  amb:    [/ambiental/, /meio ambiente/, /\bflorestal\b/, /unidades de conservacao/, /licenciamento ambiental/],
  penesp: [/leis? penais? especiais/, /lei de drogas/, /\bdrogas\b/, /organizacoes criminosas/, /maria da penha/, /crimes hediondos/, /lavagem de dinheiro/, /desarmamento/, /\btrafico\b/, /crimes ambientais/],
  civesp: [/juizados/, /\bjecc\b/, /mandado de seguranca/, /acao civil publica/, /acao popular/, /mandado de injuncao/, /\bmediacao\b/, /arbitragem/],
  eleit:  [/eleitoral/, /eleicoes/, /inelegibilidade/, /propaganda eleitoral/],
  dh:     [/direitos humanos/, /\bdh\b/, /pacto de san jose/, /convencao americana/, /pessoa com deficiencia/, /interamericano/],
  human:  [/humanistica/, /formacao humanistica/, /sociologia/, /filosofia do direito/, /hermeneutica/, /\betica\b/, /jusnaturalismo/, /juspositivismo/],
};
// devolve a lista de ids de matéria detectados na frase
function detectMaterias(texto) {
  let t = " " + diaNorm(texto) + " ";
  const found = [];
  const add = (id) => { if (!found.includes(id)) found.push(id); };
  if (/process(o|ual)?\s*penal|proc\.?\s*penal|\bcpp\b/.test(t)) { add("ppenal"); t = t.replace(/process(o|ual)?\s*penal/g, " "); }
  if (/process(o|ual)?\s*civil|\bcpc\b/.test(t)) { add("pcivil"); t = t.replace(/process(o|ual)?\s*civil/g, " "); }
  for (const id of Object.keys(MAT_KW)) {
    if (MAT_KW[id].some((re) => re.test(t))) add(id);
  }
  return found;
}
// tipo de atividade (só para a etiqueta): questões, teoria, revisão, aula, simulado, anki
function detectTipo(texto) {
  const t = diaNorm(texto);
  if (/\bquesto|\bcorrig|resolvi|refiz|bateria de quest|\btec\b/.test(t)) return "Questões";
  if (/simulad/.test(t)) return "Simulado";
  if (/\banki\b|flashcard|flash card/.test(t)) return "Anki";
  if (/revis/.test(t)) return "Revisão";
  if (/assist|\baula|\bvideo|\bcurso\b|professor|videoaula/.test(t)) return "Aula";
  if (/leitura|\bler\b|teoria|resum|estud|doutrin|\bvade\b|lei seca|\blei\b/.test(t)) return "Teoria";
  return "Estudo";
}
const BANCAS_CONHECIDAS = ["FGV", "Cebraspe", "Cespe", "Vunesp", "FCC", "FUNDATEC", "IBFC", "Quadrix", "FAPEC", "IADES", "AOCP", "Consulplan", "IESES", "Legalle", "Selecon", "IBADE"];
function detectBanca(texto) {
  const t = diaNorm(texto);
  for (const b of BANCAS_CONHECIDAS) { if (t.includes(diaNorm(b))) return b === "Cespe" ? "Cebraspe" : b; }
  return null;
}
// contexto = banca · órgão · ano (o que estiver na frase)
function detectContexto(texto) {
  const parts = [];
  const banca = detectBanca(texto); if (banca) parts.push(banca);
  const orgao = (texto.match(/\b(tj\s?[a-z]{2}|trf\s?\d|mp[a-z]{2,3}|enam|stf|stj|tst|tse)\b/i) || [])[0];
  if (orgao) parts.push(orgao.toUpperCase().replace(/\s+/g, ""));
  const ano = (diaNorm(texto).match(/\b20\d{2}\b/) || [])[0];
  if (ano && !parts.includes(ano)) parts.push(ano);
  return parts.join(" · ");
}
// deixa a frase "bonitinha": espaços, maiúscula inicial e ponto final
function beautifyFrase(texto) {
  let s = (texto || "").trim().replace(/\s+/g, " ");
  if (!s) return s;
  s = s.charAt(0).toUpperCase() + s.slice(1);
  if (!/[.!?…]$/.test(s)) s += ".";
  return s;
}

// ---------- Caixa de entrada: cole qualquer material e vira nota (você escolhe a matéria; o tópico vem do edital) ----------
const CAIXA_KEY = "tjsc-caixa:v2";
const CAIXA_KEY_OLD = "tjsc-caixa:v1";
const CAIXA_SEED_FLAG = "tjsc-caixa-seed:v2";
const CAIXA_UID = () => "n" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const CAIXA_DESTINOS = [
  { id: "edital",  label: "Nota no edital verticalizado", ic: "M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z M14 3v5h5" },
  { id: "anki",    label: "Card do Anki",                 ic: "M4 7a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z M8 5h9a2 2 0 0 1 2 2v9" },
  { id: "guardar", label: "Só guardar",                   ic: "M6 3h12a1 1 0 0 1 1 1v16l-7-4-7 4V4a1 1 0 0 1 1-1z" },
];
const CAIXA_CORES = ["#378ADD", "#4CA65E", "#E24B4A", "#D9A017", "#8B7FE0"];
// todas as matérias que a Nadia pode escolher na mão
const CAIXA_MATS = ["const", "adm", "civil", "pcivil", "penal", "ppenal", "empres", "trib", "cdc", "eca", "amb", "eleit", "dh", "human", "penesp", "civesp"];
// matéria do painel -> nome da matéria no edital verticalizado (TJSC), pra buscar os tópicos reais
const CAIXA_MAT_EDITAL = {
  const: "DIREITO CONSTITUCIONAL", adm: "DIREITO ADMINISTRATIVO", civil: "DIREITO CIVIL",
  pcivil: "DIREITO PROCESSUAL CIVIL", penal: "DIREITO PENAL", ppenal: "DIREITO PROCESSUAL PENAL",
  empres: "DIREITO EMPRESARIAL", trib: "DIREITO FINANCEIRO E TRIBUTÁRIO", cdc: "DIREITO DO CONSUMIDOR",
  eca: "DIREITO DA CRIANÇA E DO ADOLESCENTE", amb: "DIREITO AMBIENTAL", eleit: "DIREITO ELEITORAL",
  dh: "DIREITOS HUMANOS", human: "NOÇÕES GERAIS DE DIREITO E FORMAÇÃO HUMANÍSTICA",
};
// lista os tópicos (itens de 1º nível) daquela matéria no edital verticalizado
function caixaTopicosEdital(matId) {
  const nome = CAIXA_MAT_EDITAL[matId];
  if (!nome || typeof window === "undefined" || !window.EDITAIS || !window.EDITAIS[0]) return [];
  const mat = (window.EDITAIS[0].materias || []).find((m) => m.nome === nome);
  if (!mat) return [];
  const out = [];
  (mat.itens || []).forEach((it) => { const t = (it.txt || "").trim().replace(/\.$/, ""); if (t) out.push(t); });
  return out;
}
// palpite do tópico do edital que mais combina com o texto (a Nadia confirma/troca)
function caixaMelhorTopico(texto, topicos) {
  if (!topicos.length) return "";
  const t = diaNorm(texto);
  let best = "", score = 0;
  topicos.forEach((top) => {
    let s = 0;
    diaNorm(top).split(/[^a-z0-9]+/).forEach((w) => { if (w.length > 4 && t.includes(w)) s++; });
    if (s > score) { score = s; best = top; }
  });
  return score > 0 ? best : "";
}
// último recurso: varre TODAS as matérias do edital e devolve a matéria+tópico que mais combinam com o texto
// (assim a nota sempre chega com um palpite, mesmo sem palavra óbvia da matéria; a Nadia confere depois)
function caixaPalpiteGlobal(texto) {
  const t = diaNorm(texto);
  let bestMat = "", bestTop = "", bestScore = 0;
  for (const matId of Object.keys(CAIXA_MAT_EDITAL)) {
    caixaTopicosEdital(matId).forEach((top) => {
      let s = 0;
      diaNorm(top).split(/[^a-z0-9]+/).forEach((w) => { if (w.length > 4 && t.includes(w)) s++; });
      if (s > bestScore) { bestScore = s; bestMat = matId; bestTop = top; }
    });
  }
  return bestScore > 0 ? { matId: bestMat, topico: bestTop } : null;
}
function caixaEsc(s) { return (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function caixaTxtToHtml(s) { return caixaEsc(s).replace(/\n/g, "<br>"); }
// acha, no edital verticalizado, o endereço (matéria + tópico) onde a nota deve ser arquivada
function caixaResolveEdital(matId, topico) {
  if (!matId || !topico || typeof window === "undefined" || !window.EDITAIS || !window.EDITAIS[0]) return null;
  const ed = window.EDITAIS[0];
  const nome = CAIXA_MAT_EDITAL[matId];
  if (!nome) return null;
  const mi = (ed.materias || []).findIndex((m) => m.nome === nome);
  if (mi < 0) return null;
  const itens = ed.materias[mi].itens || [];
  const norm = (s) => (s || "").trim().replace(/\.$/, "");
  const ii = itens.findIndex((it) => norm(it.txt) === norm(topico));
  if (ii < 0) return null;
  return { editalId: ed.id, pathKey: mi + "." + ii, label: ed.materias[mi].nome + " › " + norm(itens[ii].txt) };
}
// monta o texto (rich) que a nota vira como caixinha dentro do tópico do edital
function caixaNotaToHtml(n) {
  let h = "<b>" + caixaEsc(n.destaque || "") + "</b>";
  if (n.verMais && n.verMais.replace(/<[^>]*>/g, "").trim()) h += "<br><br>" + n.verMais;
  if (n.fonte) h += "<br><br><i>" + caixaEsc(n.fonte) + "</i>";
  return h;
}
// mapeia a categoria do Buscador -> id da matéria do painel (quando a frase não denuncia sozinha)
function caixaCatToMat(cat) {
  const c = diaNorm(cat);
  if (/process(o|ual)?\s*penal/.test(c)) return "ppenal";
  if (/process(o|ual)?\s*civil/.test(c)) return "pcivil";
  if (/administrativ|improbidade/.test(c)) return "adm";
  if (/constitucional|garantias fundamentais|poder judiciario|poder legislativo|poder executivo|controle de constitucional|nacionalidade|remedios constitucionais|organizacao (do estado|dos poderes)|repartic(ao|ao de) competencias/.test(c)) return "const";
  if (/eleitoral/.test(c)) return "eleit";
  if (/consumidor/.test(c)) return "cdc";
  if (/crianca|adolescente/.test(c)) return "eca";
  if (/empresarial/.test(c)) return "empres";
  if (/ambiental/.test(c)) return "amb";
  if (/tributar|financeir/.test(c)) return "trib";
  if (/\bpenal\b/.test(c)) return "penal";
  if (/\bcivil\b/.test(c)) return "civil";
  return null;
}
function caixaMatLabel(id) {
  if (typeof SUBJ_BY_ID !== "undefined" && SUBJ_BY_ID[id]) return SUBJ_BY_ID[id].name.replace(/^Direito /, "");
  return ({ const: "Constitucional", adm: "Administrativo", civil: "Civil", pcivil: "Processual Civil", penal: "Penal", ppenal: "Processual Penal", empres: "Empresarial", trib: "Financeiro e Tributário", cdc: "Consumidor", eca: "Criança e Adolescente", amb: "Ambiental", penesp: "Penal Especial", civesp: "Civil Especial", eleit: "Eleitoral", dh: "Direitos Humanos", human: "Humanística" })[id] || id;
}
// quebra um material colado em um ou vários julgados (separador: "Adicionado ao caderno em: ...")
function caixaSplit(text) {
  const marker = /Adicionado ao caderno em:[^\n]*/g;
  const parts = []; let last = 0, m;
  while ((m = marker.exec(text))) { parts.push(text.slice(last, m.index)); last = m.index + m[0].length; }
  const tail = text.slice(last);
  if (tail.trim()) parts.push(tail);
  return parts.map((s) => s.trim()).filter(Boolean);
}
// lê um bloco e monta a nota: Destaque (título), Ver mais (resto), matéria(s) sugerida(s), tópico do edital, fonte
function caixaParseBloco(bloco) {
  const linhas = bloco.split("\n").map((l) => l.trim()).filter(Boolean);
  const flag = (l) => /^(lido|favorito|julgado|tese|novo!?)$/i.test(l);
  const idxJ = linhas.findIndex((l) => /^(JULGADO|TESE)$/i.test(l));
  const cabec = (idxJ >= 0 ? linhas.slice(0, idxJ) : linhas.slice(0, 3)).filter((l) => !flag(l));
  const corpo = idxJ >= 0 ? linhas.slice(idxJ + 1) : linhas;
  const categoria = cabec[0] || "";
  const assunto = cabec[1] || "";
  const destaque = (corpo[0] || categoria || "Material colado").trim();
  const resto = corpo.slice(1).join("\n").trim();
  const favorito = linhas.some((l) => /^favorito$/i.test(l));
  const infos = [...bloco.matchAll(/Info\s*\d+/gi)].map((x) => x[0].replace(/\s+/g, " "));
  const corte = /\bSTF\b/.test(bloco) ? "STF" : (/\bSTJ\b/.test(bloco) ? "STJ" : "");
  const info = infos.length ? infos[infos.length - 1] : "";
  const fonte = [corte, info].filter(Boolean).join(" · ");
  // palpite de matéria (a Nadia troca na mão): categoria do Buscador manda; só senão lemos o corpo
  let mats = [];
  const principal = caixaCatToMat(categoria);
  if (principal) mats = [principal];
  else mats = detectMaterias(bloco).slice(0, 1);
  const topicos = mats.length ? caixaTopicosEdital(mats[0]) : [];
  let topico = caixaMelhorTopico(destaque + " " + assunto + " " + resto.slice(0, 240), topicos);
  // se não deu pra cravar a matéria (ou o tópico), chuta pelo edital inteiro pra nunca vir vazio
  if (!mats.length || !topico) {
    const g = caixaPalpiteGlobal(destaque + " " + assunto + " " + resto.slice(0, 400));
    if (g) {
      if (!mats.length) mats = [g.matId];
      if (!topico && mats[0] === g.matId) topico = g.topico;
    }
  }
  topico = topico || assunto || "";
  return { id: CAIXA_UID(), destaque, verMais: caixaTxtToHtml(resto), mats, topico, fonte, favorito, destino: null, ts: Date.now() };
}
function caixaParse(text) { return caixaSplit(text).map(caixaParseBloco); }
// normaliza notas antigas (v1) pro novo formato, sem perder nada
function caixaNormalize(n) {
  if (!n) return null;
  const destaque = n.destaque != null ? n.destaque : (n.titulo || "");
  let verMais = n.verMais;
  if (verMais == null) {
    let corpo = n.raw || "";
    if (destaque && corpo.indexOf(destaque) === 0) corpo = corpo.slice(destaque.length).trim();
    verMais = caixaTxtToHtml(corpo);
  }
  return { id: n.id || CAIXA_UID(), destaque, verMais, mats: n.mats || [], topico: n.topico || n.assunto || "", fonte: n.fonte || "", favorito: !!n.favorito, destino: n.destino || null, ts: n.ts || Date.now() };
}
// caixinha editável (título ou "Ver mais"): recebe html inicial uma vez e salva ao sair
function CaixaEdit({ html, plain, onSave, onFocus, className, placeholder }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.innerHTML = html || ""; }, []);
  return (
    <div ref={ref} className={className} contentEditable suppressContentEditableWarning
      data-ph={placeholder} onFocus={onFocus}
      onBlur={() => onSave(plain ? ref.current.innerText : ref.current.innerHTML)} />
  );
}

function CaixaView({ onBack, onArquivarEdital }) {
  const [notas, setNotas] = useState([]);
  const [texto, setTexto] = useState("");
  const [aberto, setAberto] = useState({});
  const [matPicker, setMatPicker] = useState(null);
  const [aviso, setAviso] = useState({});
  const [impMsg, setImpMsg] = useState("");
  const [destFoco, setDestFoco] = useState(null);
  const [carregou, setCarregou] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => { try { document.execCommand("styleWithCSS", false, true); } catch (e) {} }, []);
  useEffect(() => {
    (async () => {
      let arr = null;
      try { const r = await window.storage.get(CAIXA_KEY); arr = r ? JSON.parse(r.value) : null; } catch { arr = null; }
      if (arr) { arr = arr.map(caixaNormalize).filter(Boolean); }
      else {
        let v1 = null;
        try { const r1 = await window.storage.get(CAIXA_KEY_OLD); v1 = r1 ? JSON.parse(r1.value) : null; } catch {}
        if (v1 && v1.length) { arr = v1.map(caixaNormalize).filter(Boolean); }
        else {
          let semeado = null;
          try { const f = await window.storage.get(CAIXA_SEED_FLAG); semeado = f ? f.value : null; } catch {}
          arr = (!semeado && typeof window.CAIXA_SEED === "string") ? caixaParse(window.CAIXA_SEED) : [];
        }
        try { window.storage.set(CAIXA_KEY, JSON.stringify(arr)); window.storage.set(CAIXA_SEED_FLAG, "1"); } catch {}
      }
      setNotas(arr); setCarregou(true);
    })();
  }, []);

  const persist = (arr) => { setNotas(arr); try { window.storage.set(CAIXA_KEY, JSON.stringify(arr)); } catch {} };
  const guardar = () => { const novas = caixaParse(texto); if (!novas.length) return; persist([...novas, ...notas]); setTexto(""); };
  const importarArquivo = (ev) => {
    const f = ev.target.files && ev.target.files[0];
    if (!f) return;
    const rd = new FileReader();
    rd.onload = () => {
      let arr = null;
      try { arr = JSON.parse(rd.result); } catch { arr = null; }
      if (!Array.isArray(arr)) { setImpMsg("Arquivo inválido — precisa ser a lista de notas que eu preparei."); return; }
      const novas = arr.map(caixaNormalize).filter(Boolean);
      persist([...novas, ...notas]);
      setImpMsg(novas.length + " nota(s) trazidas do arquivo, no topo da caixa.");
    };
    rd.readAsText(f);
    ev.target.value = "";
  };
  const remover = (id) => persist(notas.filter((n) => n.id !== id));
  const esvaziar = () => { if (window.confirm("Apagar TODAS as notas da caixa de entrada? Isso não pode ser desfeito.")) { persist([]); setImpMsg(""); } };
  const update = (id, patch) => persist(notas.map((n) => n.id === id ? { ...n, ...patch } : n));
  const setDestino = (id, d) => persist(notas.map((n) => n.id === id ? { ...n, destino: n.destino === d ? null : d } : n));
  const clickDestino = (n, d) => {
    if (d !== "edital") { setDestino(n.id, d); return; }
    const r = onArquivarEdital ? onArquivarEdital(n) : { ok: false };
    if (r && r.ok) {
      persist(notas.filter((x) => x.id !== n.id));   // mandou pro edital → sai da caixa
      setImpMsg("Foi pro edital: " + r.label + " — e saiu da caixa.");
    } else {
      setAviso((a) => ({ ...a, [n.id]: "Escolha a matéria e o tópico acima para mandar pro edital." }));
    }
  };
  const toggleFav = (id) => persist(notas.map((n) => n.id === id ? { ...n, favorito: !n.favorito } : n));
  const toggleAberto = (id) => setAberto((o) => ({ ...o, [id]: !o[id] }));
  const toggleMat = (id, mid) => persist(notas.map((n) => {
    if (n.id !== id) return n;
    const has = n.mats.includes(mid);
    const mats = has ? n.mats.filter((x) => x !== mid) : [...n.mats, mid];
    let topico = n.topico;
    if (!topico && mats.length) { const sug = caixaMelhorTopico(n.destaque, caixaTopicosEdital(mats[0])); if (sug) topico = sug; }
    return { ...n, mats, topico };
  }));
  const fmt = (cmd) => (ev) => { ev.preventDefault(); document.execCommand(cmd, false, null); };
  const cor = (c) => (ev) => { ev.preventDefault(); document.execCommand("foreColor", false, c === "reset" ? getComputedStyle(document.body).color : c); };
  const topicoOpts = (n) => { const base = n.mats.length ? caixaTopicosEdital(n.mats[0]) : []; return (n.topico && !base.includes(n.topico)) ? [n.topico, ...base] : base; };

  return (
    <section className="caixa-page">
      <style>{`
        .caixa-page{ padding-top:8px; max-width:1000px; }
        .caixa-compose{ background:var(--surface); border:1px solid var(--line); border-radius:16px; padding:16px; margin-bottom:22px; }
        .caixa-ta{ width:100%; box-sizing:border-box; min-height:120px; resize:vertical; background:var(--surface-2); color:var(--text);
          border:1px solid var(--line-2); border-radius:12px; padding:13px 14px; font:inherit; font-size:14px; line-height:1.55; }
        .caixa-ta::placeholder{ color:var(--faint); }
        .caixa-compose-bar{ display:flex; align-items:center; justify-content:space-between; gap:12px; margin-top:11px; flex-wrap:wrap; }
        .caixa-hint{ font-size:12px; color:var(--faint); line-height:1.4; flex:1; min-width:180px; }
        .caixa-go{ font:inherit; font-size:13px; font-weight:800; cursor:pointer; background:var(--gold); color:var(--on-accent,#10141a);
          border:none; border-radius:10px; padding:10px 18px; white-space:nowrap; }
        .caixa-go:disabled{ opacity:.45; cursor:default; }
        .caixa-import{ font:inherit; font-size:12.5px; font-weight:700; cursor:pointer; color:var(--muted); background:var(--surface-2);
          border:1px solid var(--line-2); border-radius:10px; padding:10px 14px; white-space:nowrap; }
        .caixa-import:hover{ color:var(--text); }
        .caixa-impmsg{ font-size:12px; color:var(--green); margin-top:9px; }
        .caixa-card{ background:var(--surface); border:1px solid var(--line); border-radius:16px; padding:15px 17px; margin-bottom:13px; }
        .caixa-lbl{ font-size:10px; letter-spacing:1.2px; text-transform:uppercase; color:var(--faint); font-weight:700; margin-bottom:5px; }
        .caixa-lbl-row{ display:flex; align-items:center; gap:10px; margin-bottom:5px; min-height:24px; flex-wrap:wrap; }
        .caixa-lbl-row .caixa-lbl{ margin-bottom:0; }
        .caixa-dtb{ display:inline-flex; align-items:center; gap:5px; flex-wrap:wrap; }
        .caixa-dtb button{ font:inherit; min-width:24px; height:22px; cursor:pointer; color:var(--text); background:var(--surface-2);
          border:1px solid var(--line-2); border-radius:5px; font-size:12px; padding:0 6px; }
        .caixa-dtb button:hover{ background:var(--surface-3); }
        .caixa-dtb .caixa-sw{ height:16px !important; width:16px !important; min-width:16px !important; }
        .caixa-destaque{ font-size:15px; font-weight:700; color:var(--text); line-height:1.42; outline:none; border-radius:6px; }
        .caixa-destaque:focus{ box-shadow:0 0 0 2px color-mix(in srgb,var(--gold) 45%,transparent); }
        .caixa-destaque:empty:before,.caixa-veditor:empty:before{ content:attr(data-ph); color:var(--faint); }
        .caixa-metarow{ display:flex; flex-wrap:wrap; gap:6px; align-items:center; margin-top:11px; }
        .caixa-metalbl{ font-size:11px; color:var(--faint); }
        .caixa-chip{ font-size:11.5px; font-weight:700; padding:3px 9px; border-radius:999px; border:1px solid; display:inline-flex; align-items:center; gap:5px; }
        .caixa-chip.fonte{ color:var(--gold); border-color:color-mix(in srgb,var(--gold) 40%,transparent); background:color-mix(in srgb,var(--gold) 14%,transparent); }
        .caixa-chip-x{ cursor:pointer; background:none; border:none; color:inherit; font-size:13px; line-height:1; padding:0; opacity:.7; }
        .caixa-chip-x:hover{ opacity:1; }
        .caixa-addmat{ font:inherit; font-size:11.5px; font-weight:700; cursor:pointer; color:var(--faint); background:var(--surface-2);
          border:1px dashed var(--line-2); border-radius:999px; padding:3px 10px; }
        .caixa-addmat:hover{ color:var(--text); }
        .caixa-matpick{ display:flex; flex-wrap:wrap; gap:5px; margin-top:8px; padding:9px; background:var(--surface-2); border:1px solid var(--line); border-radius:10px; }
        .caixa-matpick-b{ font:inherit; font-size:11.5px; font-weight:700; cursor:pointer; color:var(--muted); background:var(--surface);
          border:1px solid var(--line-2); border-radius:999px; padding:3px 10px; }
        .caixa-topsel{ font:inherit; font-size:12.5px; color:var(--text); background:var(--surface-2); border:1px solid var(--line-2);
          border-radius:8px; padding:5px 8px; max-width:300px; }
        .caixa-fav{ margin-left:auto; cursor:pointer; background:none; border:none; font-size:15px; line-height:1; color:var(--faint); }
        .caixa-fav.on{ color:var(--gold); }
        .caixa-toggle{ font:inherit; font-size:12px; font-weight:700; color:var(--gold); background:none; border:none; cursor:pointer; padding:10px 0 0; }
        .caixa-vermais{ margin-top:9px; border:1px solid var(--line); border-radius:11px; overflow:hidden; }
        .caixa-vtoolbar{ display:flex; align-items:center; gap:6px; flex-wrap:wrap; padding:7px 9px; background:var(--surface-2); border-bottom:1px solid var(--line); }
        .caixa-vtoolbar button{ font:inherit; min-width:28px; height:26px; cursor:pointer; color:var(--text); background:var(--surface);
          border:1px solid var(--line-2); border-radius:6px; font-size:13px; padding:0 7px; }
        .caixa-vtoolbar button:hover{ background:var(--surface-3); }
        .caixa-vsep{ width:1px; height:18px; background:var(--line-2); margin:0 2px; }
        .caixa-sw{ width:20px !important; min-width:20px !important; height:20px !important; padding:0 !important; border-radius:50% !important; border:1px solid var(--line-2) !important; }
        .caixa-veditor{ padding:11px 12px; font-size:13.5px; line-height:1.6; color:var(--muted); min-height:64px; outline:none; }
        .caixa-actions{ display:flex; flex-wrap:wrap; gap:7px; margin-top:12px; padding-top:12px; border-top:1px solid var(--line); }
        .caixa-act{ font:inherit; font-size:12.5px; font-weight:700; cursor:pointer; color:var(--muted); background:var(--surface-2);
          border:1px solid var(--line-2); border-radius:9px; padding:7px 11px; display:inline-flex; align-items:center; gap:6px; }
        .caixa-act:hover{ color:var(--text); }
        .caixa-act.on{ color:var(--on-accent,#10141a); background:var(--gold); border-color:var(--gold); }
        .caixa-act svg{ width:15px; height:15px; }
        .caixa-del{ margin-left:auto; color:var(--faint); border-color:transparent; background:none; }
        .caixa-del:hover{ color:var(--coral); }
        .caixa-empty{ text-align:center; color:var(--faint); font-size:13.5px; margin-top:30px; line-height:1.6; }
        .caixa-count{ font-size:12px; color:var(--faint); margin-bottom:14px; }
        .caixa-esvaziar{ font:inherit; font-size:11.5px; font-weight:700; color:var(--coral); background:none; border:none; cursor:pointer; margin-left:12px; padding:0; }
        .caixa-esvaziar:hover{ text-decoration:underline; }
        .caixa-aviso{ font-size:12px; color:var(--green); margin-top:9px; }
      `}</style>
      <button className="edital-back" onClick={onBack}>← Voltar ao painel</button>
      <p className="eyebrow">Painel de Estudos</p>
      <h1 className="serif" style={{ marginBottom: 6 }}>Caixa de entrada</h1>
      <p className="desc" style={{ marginBottom: 18 }}>Cole qualquer coisa. Vira uma nota: você escolhe a matéria, o tópico vem do seu edital verticalizado, e depois decide o que ela vira.</p>

      <div className="caixa-compose">
        <textarea className="caixa-ta" value={texto} onChange={(e) => setTexto(e.target.value)}
          placeholder="Cole aqui um julgado do Buscador, um trecho de lei, uma questão ou uma frase sua… (pode colar vários de uma vez)" />
        <div className="caixa-compose-bar">
          <span className="caixa-hint">A fonte (ex.: Info 1204) e um palpite de matéria vêm sozinhos. Você ajusta.</span>
          <input ref={fileRef} type="file" accept="application/json,.json" style={{ display: "none" }} onChange={importarArquivo} />
          <button className="caixa-import" onClick={() => fileRef.current && fileRef.current.click()}>Importar notas (arquivo)</button>
          <button className="caixa-go" onClick={guardar} disabled={!texto.trim()}>Guardar na caixa</button>
        </div>
        {impMsg && <div className="caixa-impmsg">{impMsg}</div>}
      </div>

      {carregou && (notas.length === 0 ? (
        <p className="caixa-empty">Sua caixa está vazia.<br />Cole o primeiro material acima — ele aterrissa aqui já organizado.</p>
      ) : (
        <>
          <p className="caixa-count">{notas.length} {notas.length === 1 ? "nota guardada" : "notas guardadas"}<button className="caixa-esvaziar" onClick={esvaziar}>esvaziar a caixa</button></p>
          {notas.map((n) => {
            const open = !!aberto[n.id];
            return (
              <div key={n.id} className="caixa-card">
                <div className="caixa-lbl-row">
                  <span className="caixa-lbl">Destaque</span>
                  {destFoco === n.id && (
                    <span className="caixa-dtb">
                      <button title="Negrito" style={{ fontWeight: 800 }} onMouseDown={fmt("bold")}>N</button>
                      <button title="Itálico" style={{ fontStyle: "italic" }} onMouseDown={fmt("italic")}>I</button>
                      <button title="Sublinhado" style={{ textDecoration: "underline" }} onMouseDown={fmt("underline")}>S</button>
                      <button className="caixa-sw" style={{ background: "var(--text)" }} title="Cor padrão" onMouseDown={cor("reset")} />
                      {CAIXA_CORES.map((c) => <button key={c} className="caixa-sw" style={{ background: c }} title="Cor" onMouseDown={cor(c)} />)}
                    </span>
                  )}
                </div>
                <CaixaEdit className="caixa-destaque" html={n.destaque || ""} placeholder="Título em destaque…" onFocus={() => setDestFoco(n.id)} onSave={(t) => { update(n.id, { destaque: t }); setDestFoco(null); }} />

                <div className="caixa-metarow">
                  <span className="caixa-metalbl">Matéria:</span>
                  {n.mats.map((mid) => (
                    <span key={mid} className="caixa-chip" style={chipStyle(materiaColor(mid))}>
                      {caixaMatLabel(mid)}
                      <button className="caixa-chip-x" title="Tirar" onClick={() => toggleMat(n.id, mid)}>×</button>
                    </span>
                  ))}
                  <button className="caixa-addmat" onClick={() => setMatPicker((p) => p === n.id ? null : n.id)}>＋ matéria</button>
                </div>
                {matPicker === n.id && (
                  <div className="caixa-matpick">
                    {CAIXA_MATS.map((mid) => {
                      const on = n.mats.includes(mid);
                      return (
                        <button key={mid} className="caixa-matpick-b" style={on ? chipStyle(materiaColor(mid)) : null} onClick={() => toggleMat(n.id, mid)}>
                          {on ? "✓ " : ""}{caixaMatLabel(mid)}
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="caixa-metarow">
                  <span className="caixa-metalbl">Tópico do edital:</span>
                  <select className="caixa-topsel" value={n.topico} onChange={(e) => update(n.id, { topico: e.target.value })}>
                    <option value="">— escolher —</option>
                    {topicoOpts(n).map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {n.fonte && <span className="caixa-chip fonte">{n.fonte}</span>}
                  <button className={"caixa-fav" + (n.favorito ? " on" : "")} title="Favorito" onClick={() => toggleFav(n.id)}>{n.favorito ? "★" : "☆"}</button>
                </div>

                <button className="caixa-toggle" onClick={() => toggleAberto(n.id)}>{open ? "▾ Ver mais" : "▸ Ver mais"}</button>
                {open && (
                  <div className="caixa-vermais">
                    <div className="caixa-vtoolbar">
                      <button title="Negrito" style={{ fontWeight: 800 }} onMouseDown={fmt("bold")}>N</button>
                      <button title="Itálico" style={{ fontStyle: "italic" }} onMouseDown={fmt("italic")}>I</button>
                      <button title="Sublinhado" style={{ textDecoration: "underline" }} onMouseDown={fmt("underline")}>S</button>
                      <span className="caixa-vsep" />
                      <button className="caixa-sw" style={{ background: "var(--text)" }} title="Cor padrão" onMouseDown={cor("reset")} />
                      {CAIXA_CORES.map((c) => <button key={c} className="caixa-sw" style={{ background: c }} title="Cor" onMouseDown={cor(c)} />)}
                    </div>
                    <CaixaEdit className="caixa-veditor" html={n.verMais} placeholder="Escreva ou cole aqui o resto do conteúdo…" onSave={(h) => update(n.id, { verMais: h })} />
                  </div>
                )}

                <div className="caixa-actions">
                  {CAIXA_DESTINOS.map((d) => {
                    const on = d.id === "edital" ? (!!n.arquivadoEdital || n.destino === "edital") : n.destino === d.id;
                    const lbl = (d.id === "edital" && n.arquivadoEdital) ? "✓ no edital verticalizado" : d.label;
                    return (
                      <button key={d.id} className={"caixa-act" + (on ? " on" : "")} onClick={() => clickDestino(n, d.id)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d.ic} /></svg>
                        {lbl}
                      </button>
                    );
                  })}
                  <button className="caixa-act caixa-del" title="Apagar nota" onClick={() => remover(n.id)}>apagar</button>
                </div>
                {aviso[n.id] && <div className="caixa-aviso">{aviso[n.id]}</div>}
              </div>
            );
          })}
        </>
      ))}
    </section>
  );
}

// ---------- Página de notas de um tópico do edital (caixinhas arrastáveis, rich text) ----------
const TN_UID = () => "b" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const TN_FORE = ["#e68a8a", "#7fa8e6", "#7bd39a", "#e6c060", "#c79bff"];
const TN_BACK = ["none", "#5a3d3d", "#3d4a5a", "#3d5a45", "#5a5030", "#4a3d5a"];
const TN_TAGS = [["#a9c4ef", "127,168,230"], ["#e6c060", "230,192,96"], ["#7bd39a", "123,211,154"], ["#e68a8a", "230,138,138"], ["#c79bff", "199,155,255"], ["#5fbfc0", "95,191,192"]];

// Blocos do edital TJSC (Juiz 2025): bloco de cada matéria + importância (%) dentro do bloco
const TJSC_BLOCOS = {
  "DIREITO CIVIL": { b: 1, imp: 30 },
  "DIREITO PROCESSUAL CIVIL": { b: 1, imp: 30 },
  "DIREITO DO CONSUMIDOR": { b: 1, imp: 15 },
  "DIREITO DA CRIANÇA E DO ADOLESCENTE": { b: 1, imp: 15 },
  "DIREITO CONSTITUCIONAL": { b: 2, imp: 35 },
  "DIREITO PENAL": { b: 2, imp: 25 },
  "DIREITO PROCESSUAL PENAL": { b: 2, imp: 25 },
  "DIREITO ELEITORAL": { b: 2, imp: 8 },
  "DIREITO ADMINISTRATIVO": { b: 3, imp: 35 },
  "DIREITO EMPRESARIAL": { b: 3, imp: 20 },
  "DIREITO FINANCEIRO E TRIBUTÁRIO": { b: 3, imp: 20 },
  "DIREITO AMBIENTAL": { b: 3, imp: 15 },
  "DIREITOS HUMANOS": { b: 3, imp: 5 },
  "NOÇÕES GERAIS DE DIREITO E FORMAÇÃO HUMANÍSTICA": { b: 3, imp: 5 },
};
const BLOCO_LBL = { 1: "Bloco I", 2: "Bloco II", 3: "Bloco III" };

function TopicNotes({ label, materia, initial, onBack, onSave }) {
  const [boxes, setBoxes] = useState(() => {
    const arr = initial && initial.length ? initial : [{ id: TN_UID(), html: "", tags: [] }];
    return arr.map((b) => ({ id: b.id || TN_UID(), html: b.html || "", tags: (b.tags || []).map((t) => ({ label: t.label, ci: t.ci || 0 })) }));
  });
  const refs = useRef({});
  const savedRange = useRef(null);
  const dragId = useRef(null);
  const pending = useRef(null);
  const [overId, setOverId] = useState(null);
  const tagCounter = useRef(boxes.reduce((n, b) => n + b.tags.length, 0));

  useEffect(() => { try { document.execCommand("styleWithCSS", false, true); } catch (e) {} }, []);
  useEffect(() => {
    const onSel = () => {
      const s = document.getSelection();
      if (!s || !s.rangeCount) return;
      const r = s.getRangeAt(0);
      for (const id in refs.current) {
        if (refs.current[id] && refs.current[id].contains(r.commonAncestorContainer)) { savedRange.current = r.cloneRange(); break; }
      }
    };
    document.addEventListener("selectionchange", onSel);
    return () => document.removeEventListener("selectionchange", onSel);
  }, []);

  const collect = () => boxes.map((b) => ({ id: b.id, html: refs.current[b.id] ? refs.current[b.id].innerHTML : b.html, tags: b.tags }));
  const persist = (arr) => onSave(arr.map((b) => ({ id: b.id, html: b.html, tags: b.tags })));
  const commit = (arr) => { setBoxes(arr); persist(arr); };

  const restore = () => {
    const r = savedRange.current; if (!r) return;
    // o seletor de cor (roda) tira o foco da caixinha; devolve o foco pra caixinha certa antes de aplicar
    for (const id in refs.current) {
      if (refs.current[id] && refs.current[id].contains(r.commonAncestorContainer)) { refs.current[id].focus(); break; }
    }
    const s = document.getSelection(); s.removeAllRanges(); s.addRange(r);
  };
  const exec = (cmd) => { restore(); try { document.execCommand(cmd, false, null); } catch (e) {} };
  const applyColor = (kind, color) => {
    restore();
    // "reset" volta a letra pra cor padrão do tema (preta no claro, clara no escuro)
    const c = color === "reset" ? getComputedStyle(document.body).color : color;
    try { document.execCommand(kind === "fore" ? "foreColor" : "hiliteColor", false, c); } catch (e) {}
  };

  const addBox = () => {
    const nb = { id: TN_UID(), html: "", tags: [] };
    const next = [...collect(), nb];
    commit(next);
    setTimeout(() => { const el = refs.current[nb.id]; if (el) el.focus(); }, 0);
  };
  const delBox = (id) => {
    let arr = collect().filter((b) => b.id !== id);
    if (!arr.length) arr = [{ id: TN_UID(), html: "", tags: [] }];
    delete refs.current[id];
    commit(arr);
  };
  const blurBox = () => { const arr = collect(); setBoxes(arr); persist(arr); };

  const addTag = (id) => {
    const label = window.prompt("Nome da tag (ex.: STF, Decorar, Pegadinha):");
    if (!label || !label.trim()) return;
    const ci = tagCounter.current++ % TN_TAGS.length;
    commit(collect().map((b) => (b.id === id ? { ...b, tags: [...b.tags, { label: label.trim(), ci }] } : b)));
  };
  const removeTag = (id, idx) => commit(collect().map((b) => (b.id === id ? { ...b, tags: b.tags.filter((_, i) => i !== idx) } : b)));

  const onDragStart = (id) => { dragId.current = id; pending.current = collect(); };
  const onDragEnd = () => { dragId.current = null; pending.current = null; setOverId(null); };
  const onDragOver = (e, id) => { e.preventDefault(); if (dragId.current && dragId.current !== id) setOverId(id); };
  const onDrop = (e, id) => {
    e.preventDefault();
    const src = dragId.current;
    const arr = pending.current || collect();
    if (!src || src === id) { onDragEnd(); return; }
    const from = arr.findIndex((b) => b.id === src);
    if (from < 0) { onDragEnd(); return; }
    const r = e.currentTarget.getBoundingClientRect();
    const after = e.clientY - r.top > r.height / 2;
    const moved = arr.splice(from, 1)[0];
    const to = arr.findIndex((b) => b.id === id);
    arr.splice(after ? to + 1 : to, 0, moved);
    commit(arr);
    onDragEnd();
  };

  const back = () => { persist(collect()); onBack(); };

  const swatchRow = (kind, colors) => (
    <span className="tn-sw-row">
      {kind === "fore" && (
        <span className="tn-sw" style={{ background: "var(--text)" }} title="cor padrão" onMouseDown={(e) => e.preventDefault()} onClick={() => applyColor("fore", "reset")} />
      )}
      {colors.map((c, i) =>
        c === "none" ? (
          <span key={i} className="tn-sw none" title="sem fundo" onMouseDown={(e) => e.preventDefault()} onClick={() => applyColor("back", "transparent")} />
        ) : (
          <span key={i} className="tn-sw" style={{ background: c }} onMouseDown={(e) => e.preventDefault()} onClick={() => applyColor(kind, c)} />
        )
      )}
      <span className="tn-sw pick" title="qualquer cor">
        <input type="color" onMouseDown={(e) => e.stopPropagation()} onChange={(e) => applyColor(kind, e.target.value)} />
      </span>
    </span>
  );

  return (
    <section className="tn-page">
      <button className="edital-back" onClick={back}>← Voltar ao edital</button>
      {materia && <p className="eyebrow">{materia}</p>}
      <h1 className="serif tn-title">{label}</h1>
      <p className="tn-hint">Suas notas sobre este tópico. Selecione um trecho para colorir; arraste pelo ⠿ para reordenar.</p>

      <div className="tn-list">
        {boxes.map((b) => (
          <div key={b.id} className={`tn-box${overId === b.id ? " over" : ""}`} onDragOver={(e) => onDragOver(e, b.id)} onDrop={(e) => onDrop(e, b.id)}>
            <div className="tn-handle" draggable title="Arrastar" onDragStart={() => onDragStart(b.id)} onDragEnd={onDragEnd}>⠿</div>
            <button className="tn-del" title="Excluir caixinha" onClick={() => delBox(b.id)}>✕</button>
            {b.tags.length > 0 && (
              <div className="tn-tags">
                {b.tags.map((t, i) => {
                  const pair = TN_TAGS[t.ci % TN_TAGS.length];
                  return (
                    <span key={i} className="tn-tag" style={{ background: `rgba(${pair[1]},.16)`, color: pair[0] }}>
                      {t.label}
                      <span className="tn-tag-x" onClick={() => removeTag(b.id, i)}>✕</span>
                    </span>
                  );
                })}
              </div>
            )}
            <div
              className="tn-content"
              contentEditable
              suppressContentEditableWarning
              ref={(el) => { if (el) refs.current[b.id] = el; }}
              data-ph="Escreva aqui…"
              onBlur={blurBox}
              dangerouslySetInnerHTML={{ __html: b.html }}
            />
            <div className="tn-toolbar">
              <button className="tn-tb b" title="Negrito" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("bold")}>B</button>
              <button className="tn-tb i" title="Itálico" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("italic")}>I</button>
              <button className="tn-tb u" title="Sublinhado" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("underline")}>U</button>
              <span className="tn-sep" />
              <span className="tn-lbl">letra</span>
              {swatchRow("fore", TN_FORE)}
              <span className="tn-sep" />
              <span className="tn-lbl">fundo</span>
              {swatchRow("back", TN_BACK)}
              <span className="tn-sep" />
              <button className="tn-tb" title="Adicionar tag" onMouseDown={(e) => e.preventDefault()} onClick={() => addTag(b.id)}>+ tag</button>
            </div>
          </div>
        ))}
      </div>

      <button className="tn-add" onClick={addBox}>+ Nova caixinha de texto</button>
    </section>
  );
}

// ===== ESTUDEI: telas de estrutura (ainda sem conteúdo) =====
function EsStub({ title, sub, blocks, onBack }) {
  return (
    <section className="editais-page es-page">
      <button className="edital-back" onClick={onBack}>← Voltar ao painel</button>
      <p className="eyebrow">ESTUDEI</p>
      <h1 className="serif" style={{ marginBottom: 10 }}>{title}</h1>
      {sub && <p className="es-sub">{sub}</p>}
      <div className="es-hint">🚧 Estrutura pronta — o conteúdo você vai preenchendo aos poucos.</div>
      <div className="es-grid">
        {blocks.map((b, i) => (
          <div className="es-box" key={i}>
            <div className="es-t">{b.t}</div>
            {b.d && <div className="es-d">{b.d}</div>}
            <div className="es-empty">vazio por enquanto</div>
          </div>
        ))}
      </div>
    </section>
  );
}
const ES_PAGES = {
  "es-painel": { title: "Painel", sub: "A tela inicial: seu ritmo, seus ciclos e o que estudar agora.", blocks: [
    { t: "Cards de topo", d: "Tempo de estudo, desempenho, progresso no edital, data da prova" },
    { t: "Frase do dia" },
    { t: "Prioridades", d: "Sua caixa de anotações soltas" },
    { t: "Constância", d: "Dias seguidos + fita de dias" },
    { t: "Ciclos", d: "Pizzas por fonte: teoria, lei seca, jurisprudência, questões" },
    { t: "Painel de matérias", d: "Tabela: tempo, acertos, erros, %" },
    { t: "Meta da semana", d: "Horas, questões, revisões" },
    { t: "Histórico da semana", d: "Barras por dia" },
    { t: "Revisões de hoje" },
  ] },
  "es-materias": { title: "Matérias", sub: "As disciplinas e, dentro delas, o material + acompanhamento.", blocks: [
    { t: "Grade de matérias", d: "Tópicos estudados/totais, questões" },
    { t: "Nova matéria" },
    { t: "Página da matéria", d: "Cards de topo, histórico, revisões, edital verticalizado, evolução" },
  ] },
  "es-editais": { title: "Editais", sub: "A verticalização geral por matéria e tópico.", blocks: [
    { t: "Progresso no edital" },
    { t: "Lista de matérias (sanfona)", d: "Acertos, erros, %, barra" },
    { t: "Tópicos", d: "Com acompanhamento, notas e link do material" },
  ] },
  "es-ciclos": { title: "Ciclos", sub: "O planejamento em pizza — o coração visual.", blocks: [
    { t: "Pizza do ciclo", d: "Fatias por bloco, total no centro" },
    { t: "Sequência dos estudos", d: "Blocos com barra: estudado / alvo" },
    { t: "Editar ciclo", d: "Blocos + minutos, duplicar, remover" },
    { t: "Ciclos completos / progresso" },
    { t: "Recomeçar · replanejar · remover" },
  ] },
  "es-revisoes": { title: "Revisões", sub: "Sem prazos. Só entra quando você conclui o tópico.", blocks: [
    { t: "A fazer" },
    { t: "Feitas" },
    { t: "Guardadas" },
    { t: "Filtros", d: "Por matéria / fonte" },
  ] },
  "es-historico": { title: "Histórico", sub: "Linha do tempo de tudo que você estudou.", blocks: [
    { t: "Cards de topo" },
    { t: "Por dia", d: "Matéria, tópico, tempo, acertos/erros, fonte" },
    { t: "Filtros" },
  ] },
  "es-estatisticas": { title: "Estatísticas", sub: "Os gráficos do seu estudo.", blocks: [
    { t: "Desempenho", d: "Rosca %, questões, acertos/erros" },
    { t: "Tempo de estudo", d: "Média/dia, dias estudados, total" },
    { t: "Constância" },
    { t: "Evolução no tempo" },
    { t: "Horas de estudo" },
    { t: "Filtros" },
  ] },
  "es-simulados": { title: "Simulados", sub: "Registrar simulados e acompanhar o desempenho.", blocks: [
    { t: "Simulados realizados" },
    { t: "Último simulado", d: "Acertos, brancos, erros, %" },
    { t: "Seu desempenho" },
    { t: "Novo simulado" },
  ] },
};

// ===== ESTUDEI: Registrar estudo (janelinha) =====
function RegistroModal({ inicial, onClose, onSave }) {
  const init = inicial || {};
  const editando = !!init.id;
  const materias = [...new Set(SECTIONS.flatMap((s) => s.subjects.map((x) => x.name)))].sort();
  const localISO = (ts) => { const d = new Date(ts); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
  const whenTs = (ts) => {
    if (!ts) return { q: "hoje", d: "" };
    const day = new Date(ts); day.setHours(0, 0, 0, 0);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const diff = Math.round((today - day) / 86400000);
    if (diff === 0) return { q: "hoje", d: "" };
    if (diff === 1) return { q: "ontem", d: "" };
    return { q: "outra", d: localISO(ts) };
  };
  const w0 = whenTs(init.ts);
  const [quando, setQuando] = useState(w0.q);
  const [dataOutra, setDataOutra] = useState(w0.d);
  const [fonte, setFonte] = useState(init.fonte || "teoria");
  const [materia, setMateria] = useState(init.materia || "");
  const [topico, setTopico] = useState(init.topico || "");
  const [horas, setHoras] = useState(init.tempo ? String(Math.floor(init.tempo / 60) || "") : "");
  const [min, setMin] = useState(init.tempo ? String(init.tempo % 60 || "") : "");
  const [acertos, setAcertos] = useState(init.acertos ? String(init.acertos) : "");
  const [erros, setErros] = useState(init.erros ? String(init.erros) : "");
  const [coment, setComent] = useState(init.coment || "");
  const [concluido, setConcluido] = useState(!!init.concluido);

  const podeSalvar = fonte && materia.trim();
  const salvar = () => {
    if (!podeSalvar) return;
    let ts = Date.now();
    if (quando === "ontem") ts = Date.now() - 86400000;
    else if (quando === "outra" && dataOutra) { const p = Date.parse(dataOutra + "T12:00:00"); if (!isNaN(p)) ts = p; }
    else if (quando === "hoje" && editando && whenTs(init.ts).q === "hoje") ts = init.ts;
    const tempo = (parseInt(horas || 0, 10) * 60) + parseInt(min || 0, 10);
    onSave({
      id: init.id || Date.now(), ts, fonte,
      materia: materia.trim(), topico: topico.trim(), tempo,
      acertos: parseInt(acertos || 0, 10), erros: parseInt(erros || 0, 10),
      coment: coment.trim(), concluido,
    });
  };

  return (
    <div className="reg-overlay" onClick={onClose}>
      <div className="reg-modal" onClick={(e) => e.stopPropagation()}>
        <div className="reg-head"><span>{editando ? "Editar estudo" : "Registrar estudo"}</span><button className="reg-close" onClick={onClose} title="Fechar">×</button></div>
        <div className="reg-body">
          <div className="reg-when">
            {[["hoje", "Hoje"], ["ontem", "Ontem"], ["outra", "Outra data"]].map(([k, l]) => (
              <button key={k} className={`reg-pill${quando === k ? " on" : ""}`} onClick={() => setQuando(k)}>{l}</button>
            ))}
            {quando === "outra" && <input type="date" className="reg-date" value={dataOutra} onChange={(e) => setDataOutra(e.target.value)} />}
          </div>

          <label className="reg-lbl">Fonte</label>
          <div className="reg-fontes">
            {REG_FONTES.map((f) => (
              <button key={f.id} className={`reg-chip${fonte === f.id ? " on" : ""}`} onClick={() => setFonte(f.id)}
                style={fonte === f.id ? { color: f.color, borderColor: f.color, background: `color-mix(in srgb, ${f.color} 16%, transparent)` } : undefined}>{f.label}</button>
            ))}
          </div>

          <div className="reg-2col">
            <div>
              <label className="reg-lbl">Matéria</label>
              <input className="reg-in" list="reg-materias" value={materia} onChange={(e) => setMateria(e.target.value)} placeholder="ex.: Direito Administrativo" />
              <datalist id="reg-materias">{materias.map((m) => <option key={m} value={m} />)}</datalist>
            </div>
            <div>
              <label className="reg-lbl">Tópico <span className="reg-opt">(opcional)</span></label>
              <input className="reg-in" value={topico} onChange={(e) => setTopico(e.target.value)} placeholder="ex.: Súmulas do STJ" />
            </div>
          </div>

          <div className="reg-3col">
            <div>
              <label className="reg-lbl">Tempo</label>
              <div className="reg-time">
                <input className="reg-in reg-num" type="number" min="0" value={horas} onChange={(e) => setHoras(e.target.value)} placeholder="0" /><span>h</span>
                <input className="reg-in reg-num" type="number" min="0" max="59" value={min} onChange={(e) => setMin(e.target.value)} placeholder="00" /><span>min</span>
              </div>
            </div>
            <div><label className="reg-lbl">Acertos</label><input className="reg-in reg-num" type="number" min="0" value={acertos} onChange={(e) => setAcertos(e.target.value)} placeholder="0" /></div>
            <div><label className="reg-lbl">Erros</label><input className="reg-in reg-num" type="number" min="0" value={erros} onChange={(e) => setErros(e.target.value)} placeholder="0" /></div>
          </div>

          <label className="reg-lbl">Comentário <span className="reg-opt">(opcional)</span></label>
          <textarea className="reg-in reg-area" value={coment} onChange={(e) => setComent(e.target.value)} placeholder="o que estudou, o que faltou..." />

          <label className="reg-check">
            <input type="checkbox" checked={concluido} onChange={(e) => setConcluido(e.target.checked)} />
            <span>Concluí este tópico — mandar pra revisão <small>(sem prazo)</small></span>
          </label>
        </div>
        <div className="reg-foot">
          <button className="reg-cancel" onClick={onClose}>Cancelar</button>
          <button className="reg-save" onClick={salvar} disabled={!podeSalvar}>Salvar</button>
        </div>
      </div>
    </div>
  );
}

// ===== ESTUDEI: Histórico dos registros =====
function RegHistorico({ registros, onBack, onDelete, onEdit }) {
  const ordenado = [...registros].sort((a, b) => b.ts - a.ts);
  const grupos = [], byDay = {};
  for (const r of ordenado) {
    const key = new Date(r.ts).toISOString().slice(0, 10);
    if (!byDay[key]) { byDay[key] = { key, ts: r.ts, itens: [] }; grupos.push(byDay[key]); }
    byDay[key].itens.push(r);
  }
  const fmtDia = (ts) => new Date(ts).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  const totalDia = (g) => g.itens.reduce((s, r) => s + (r.tempo || 0), 0);

  return (
    <section className="editais-page es-page">
      <button className="edital-back" onClick={onBack}>← Voltar ao painel</button>
      <p className="eyebrow">ESTUDEI</p>
      <h1 className="serif" style={{ marginBottom: 10 }}>Histórico</h1>
      <p className="es-sub">Tudo que você registrou, dia a dia.</p>
      {registros.length === 0 ? (
        <div className="es-hint">Nada registrado ainda — toque em <b style={{ margin: "0 4px" }}>＋ Registrar estudo</b> pra começar.</div>
      ) : grupos.map((g) => (
        <div className="hist-day" key={g.key}>
          <div className="hist-dayhead"><span>{fmtDia(g.ts)}</span><span className="hist-daytot">{fmtTempo(totalDia(g))}</span></div>
          {g.itens.map((r) => <RegRow key={r.id} r={r} onEdit={onEdit} onDelete={onDelete} />)}
        </div>
      ))}
    </section>
  );
}

// ===== ESTUDEI: agregados dos registros =====
function aggFontes(registros) {
  const m = {};
  for (const r of registros) {
    const k = r.fonte || "outro";
    if (!m[k]) m[k] = { tempo: 0, acertos: 0, erros: 0, n: 0 };
    m[k].tempo += r.tempo || 0; m[k].acertos += r.acertos || 0; m[k].erros += r.erros || 0; m[k].n += 1;
  }
  return m;
}
function CiclosPizzas({ registros }) {
  const agg = aggFontes(registros);
  const fontes = REG_FONTES.filter((f) => agg[f.id]);
  const total = Object.values(agg).reduce((s, a) => s + a.tempo, 0);
  if (!fontes.length) return <div className="es-hint">Registre um estudo pra ver seus ciclos encherem.</div>;
  return (
    <div className="ciclo-grid">
      {fontes.map((f) => {
        const a = agg[f.id];
        const p = total ? Math.round((a.tempo / total) * 100) : 0;
        const q = a.acertos + a.erros;
        return (
          <div className="ciclo-card" key={f.id}>
            <div className="ciclo-donut" style={{ "--p": p, "--c": f.color }}>
              <div className="ciclo-hole"><b>{fmtTempo(a.tempo)}</b></div>
            </div>
            <div className="ciclo-nm" style={{ color: f.color }}>{f.label}</div>
            <div className="ciclo-mt">{p}% do tempo{q ? ` · ${a.acertos}/${q}q` : ""}</div>
          </div>
        );
      })}
    </div>
  );
}
function Constancia({ registros }) {
  const dias = new Set(registros.map((r) => new Date(r.ts).toDateString()));
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const key = (offset) => new Date(today.getTime() - offset * 86400000).toDateString();
  let streak = 0;
  for (let i = dias.has(key(0)) ? 0 : 1; i < 500; i++) { if (dias.has(key(i))) streak++; else break; }
  const cells = [];
  for (let i = 27; i >= 0; i--) cells.push({ i, on: dias.has(key(i)), hoje: i === 0 });
  return (
    <div className="panel es-consta">
      <div className="consta-head"><span>Constância nos estudos</span><b>{streak} {streak === 1 ? "dia" : "dias"} seguidos</b></div>
      <div className="consta-strip">
        {cells.map((c) => <span key={c.i} className={`consta-day${c.on ? " on" : ""}${c.hoje ? " today" : ""}`} />)}
      </div>
    </div>
  );
}

// ===== ESTUDEI: frase do dia, data da prova, meta da semana =====
const FRASES = [
  "Nada é em vão. Se não é bênção, é lição.",
  "Um pouco todo dia vira aprovação.",
  "Disciplina é lembrar do que você quer.",
  "A vaga é sua; falta só o caminho até ela.",
  "Constância vence intensidade.",
  "Cada questão resolvida é um degrau.",
  "Você já passou por dias mais difíceis. Segue.",
  "Foco no próximo tópico, não no edital inteiro.",
  "O esforço de hoje é a tranquilidade da prova.",
  "Estudar cansada também conta — e conta muito.",
];
function FraseDoDia() {
  const now = new Date();
  const doy = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  return (
    <div className="panel frase-card">
      <span className="frase-mk">“</span>
      <span className="frase-tx">{FRASES[doy % FRASES.length]}</span>
    </div>
  );
}
function DataProva({ data, nome, onSave }) {
  const [editing, setEditing] = useState(false);
  const [d, setD] = useState(data || "");
  const [n, setN] = useState(nome || "");
  const dias = data ? Math.max(0, Math.ceil((Date.parse(data + "T00:00:00") - Date.now()) / 86400000)) : null;
  const fmt = (iso) => new Date(iso + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  if (editing || !data) {
    return (
      <div className="panel dp-card">
        <div className="dp-lbl">Data da prova</div>
        <input className="reg-in" placeholder="ex.: TJSC · Juiz" value={n} onChange={(e) => setN(e.target.value)} style={{ margin: "8px 0" }} />
        <input className="reg-in" type="date" value={d} onChange={(e) => setD(e.target.value)} />
        <div className="dp-actions">
          {data && <button className="reg-cancel" onClick={() => { setEditing(false); setD(data); setN(nome || ""); }}>Cancelar</button>}
          <button className="reg-save" onClick={() => { if (d) { onSave({ data: d, nome: n.trim() }); setEditing(false); } }} disabled={!d}>Salvar</button>
        </div>
      </div>
    );
  }
  return (
    <div className="panel dp-card">
      <div className="dp-lbl">Data da prova{nome ? ` · ${nome}` : ""}</div>
      <div className="dp-big">{dias}<small> {dias === 1 ? "dia" : "dias"}</small></div>
      <div className="dp-date">{fmt(data)}<button className="dp-edit" onClick={() => setEditing(true)}>editar</button></div>
    </div>
  );
}
function MetaSemana({ registros, metas, onSave }) {
  const [editing, setEditing] = useState(false);
  const [h, setH] = useState(metas.horas);
  const [q, setQ] = useState(metas.questoes);
  const [rv, setRv] = useState(metas.revisoes);
  const ws = (() => { const dt = new Date(); dt.setHours(0, 0, 0, 0); dt.setDate(dt.getDate() - dt.getDay()); return dt.getTime(); })();
  const wk = registros.filter((r) => r.ts >= ws);
  const minStudied = wk.reduce((s, r) => s + (r.tempo || 0), 0);
  const qDone = wk.reduce((s, r) => s + (r.acertos || 0) + (r.erros || 0), 0);
  const rDone = wk.filter((r) => r.concluido).length;
  const pct = (a, b) => (b > 0 ? Math.min(100, Math.round((a / b) * 100)) : 0);
  if (editing) {
    return (
      <div className="panel meta-card">
        <div className="meta-head"><span>Meta da semana</span></div>
        <div className="meta-editrow"><label>Horas</label><input className="reg-in reg-num" type="number" min="0" value={h} onChange={(e) => setH(e.target.value)} /></div>
        <div className="meta-editrow"><label>Questões</label><input className="reg-in reg-num" type="number" min="0" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <div className="meta-editrow"><label>Revisões</label><input className="reg-in reg-num" type="number" min="0" value={rv} onChange={(e) => setRv(e.target.value)} /></div>
        <div className="dp-actions">
          <button className="reg-cancel" onClick={() => { setEditing(false); setH(metas.horas); setQ(metas.questoes); setRv(metas.revisoes); }}>Cancelar</button>
          <button className="reg-save" onClick={() => { onSave({ horas: +h || 0, questoes: +q || 0, revisoes: +rv || 0 }); setEditing(false); }}>Salvar</button>
        </div>
      </div>
    );
  }
  return (
    <div className="panel meta-card">
      <div className="meta-head"><span>Meta da semana</span><button className="dp-edit" onClick={() => setEditing(true)}>editar</button></div>
      <div className="meta-row"><div className="meta-lab"><b>Horas de estudo</b><span>{fmtTempo(minStudied)} / {metas.horas}h</span></div><div className="meta-track"><i style={{ width: pct(minStudied, metas.horas * 60) + "%" }} /></div></div>
      <div className="meta-row"><div className="meta-lab"><b>Questões</b><span>{qDone} / {metas.questoes}</span></div><div className="meta-track"><i style={{ width: pct(qDone, metas.questoes) + "%" }} /></div></div>
      <div className="meta-row"><div className="meta-lab"><b>Revisões</b><span>{rDone} / {metas.revisoes}</span></div><div className="meta-track"><i style={{ width: pct(rDone, metas.revisoes) + "%" }} /></div></div>
    </div>
  );
}

// ===== ESTUDEI: linha de um registro (reusada no Histórico e na Matéria) =====
function RegRow({ r, onEdit, onDelete }) {
  const f = regFonte(r.fonte);
  return (
    <div className="hist-row">
      <span className="hist-bar" style={{ background: f.color }} />
      <div className="hist-main">
        <div className="hist-mat">{r.materia}{r.topico ? <span className="hist-top"> · {r.topico}</span> : null}</div>
        {r.coment ? <div className="hist-com">{r.coment}</div> : null}
      </div>
      <div className="hist-meta">
        {(r.acertos || r.erros) ? <span className="hist-qa">{r.acertos}✓ {r.erros}✗</span> : null}
        {r.tempo ? <span className="hist-tempo">{fmtTempo(r.tempo)}</span> : null}
        <span className="hist-fonte" style={{ color: f.color, background: `color-mix(in srgb, ${f.color} 15%, transparent)` }}>{f.label}</span>
        {r.concluido ? <span className="hist-done" title="Concluído → revisão">✓ tópico</span> : null}
      </div>
      {onEdit ? <button className="hist-edit" onClick={() => onEdit(r)} title="Editar">✎</button> : null}
      {onDelete ? <button className="hist-del" onClick={() => onDelete(r.id)} title="Apagar">×</button> : null}
    </div>
  );
}

// ===== ESTUDEI: Matérias =====
function MateriasGrid({ registros, onOpen, onBack }) {
  const todas = [...new Set(SECTIONS.flatMap((s) => s.subjects.map((x) => x.name)))].sort();
  const agg = {};
  for (const r of registros) {
    const k = r.materia; if (!k) continue;
    if (!agg[k]) agg[k] = { tempo: 0, acertos: 0, erros: 0, n: 0 };
    agg[k].tempo += r.tempo || 0; agg[k].acertos += r.acertos || 0; agg[k].erros += r.erros || 0; agg[k].n += 1;
  }
  const extras = Object.keys(agg).filter((m) => !todas.includes(m)).sort();
  const lista = [...todas, ...extras];
  // cada matéria: em qual bloco fica (da grade) e qual o peso dela (do edital, pra ordenar)
  const BLOCO_NUM = { "Bloco I": 1, "Bloco II": 2, "Bloco III": 3 };
  const info = {};
  for (const s of SECTIONS) for (const x of s.subjects) {
    if (info[x.name]) continue;
    const imp = (TJSC_BLOCOS[x.name.toUpperCase()] || {}).imp;
    info[x.name] = { b: BLOCO_NUM[x.bloco] || 9, imp: imp == null ? -1 : imp };
  }
  const card = (m) => {
    const a = agg[m]; const q = a ? a.acertos + a.erros : 0;
    const perc = q ? Math.round((a.acertos / q) * 100) : null;
    return (
      <button className="mat-card" key={m} onClick={() => onOpen(m)}>
        <div className="mat-nome">{m}</div>
        <div className="mat-stats">
          <span>{a ? fmtTempo(a.tempo) : "sem estudo"}</span>
          {a ? <span>{a.n} registro{a.n > 1 ? "s" : ""}</span> : null}
          {perc != null ? <span className="mat-perc">{perc}%</span> : null}
        </div>
      </button>
    );
  };
  const cols = [1, 2, 3].map((bn) => ({
    b: bn,
    mats: lista.filter((m) => info[m] && info[m].b === bn)
      .sort((x, y) => info[y].imp - info[x].imp || x.localeCompare(y, "pt")),
  }));
  const outras = lista.filter((m) => !info[m] || info[m].b === 9);
  return (
    <section className="editais-page es-page">
      <button className="edital-back" onClick={onBack}>← Voltar ao painel</button>
      <p className="eyebrow">ESTUDEI</p>
      <h1 className="serif" style={{ marginBottom: 10 }}>Matérias</h1>
      <p className="es-sub">Cada coluna é um bloco do edital, da matéria que mais pesa pra que menos pesa. Toque numa pra ver tudo que você registrou nela.</p>
      <div className="mat-cols">
        {cols.map((c) => (
          <div className="mat-col" key={c.b}>
            <div className={`mat-col-head b${c.b}`}>{BLOCO_LBL[c.b]}</div>
            {c.mats.map((m) => card(m))}
          </div>
        ))}
      </div>
      {outras.length > 0 && (
        <>
          <div className="mat-col-head outras">Outras</div>
          <div className="mat-grid">{outras.map((m) => card(m))}</div>
        </>
      )}
    </section>
  );
}
function MateriaDetail({ materia, registros, onBack, onEdit, onDelete }) {
  const regs = registros.filter((r) => r.materia === materia).sort((a, b) => b.ts - a.ts);
  const tempo = regs.reduce((s, r) => s + (r.tempo || 0), 0);
  const ac = regs.reduce((s, r) => s + (r.acertos || 0), 0);
  const er = regs.reduce((s, r) => s + (r.erros || 0), 0);
  const q = ac + er;
  const bl = TJSC_BLOCOS[(materia || "").toUpperCase()];
  return (
    <section className="editais-page es-page">
      <button className="edital-back" onClick={onBack}>← Voltar às matérias</button>
      <p className="eyebrow">ESTUDEI · Matéria</p>
      <h1 className="serif" style={{ marginBottom: bl ? 8 : 14 }}>{materia}</h1>
      {bl && (
        <div className="mat-peso">
          <span className={`ed-bloco-tag b${bl.b}`}>{BLOCO_LBL[bl.b]}</span>
          <span className="mat-peso-txt">peso <b>{bl.imp}%</b> dentro do bloco</span>
        </div>
      )}
      <div className="mat-topcards">
        <div className="panel"><div className="dp-lbl">Tempo</div><div className="dp-big mat-big">{fmtTempo(tempo)}</div></div>
        <div className="panel"><div className="dp-lbl">Questões</div><div className="dp-big mat-big">{q}<small>{q ? ` · ${Math.round((ac / q) * 100)}%` : ""}</small></div></div>
        <div className="panel"><div className="dp-lbl">Registros</div><div className="dp-big mat-big">{regs.length}</div></div>
      </div>
      {regs.length ? (<><div className="sechead-es">Por fonte</div><CiclosPizzas registros={regs} /></>) : null}
      <div className="sechead-es">Registros</div>
      {regs.length === 0 ? <div className="es-hint">Nada registrado nesta matéria ainda.</div>
        : regs.map((r) => <RegRow key={r.id} r={r} onEdit={onEdit} onDelete={onDelete} />)}
    </section>
  );
}

// ===== ESTUDEI: Revisões (só o que você concluiu; sem prazo) =====
function RevisoesView({ registros, revStatus, onMark, onBack }) {
  const [aba, setAba] = useState("fazer");
  const feitas = revStatus.feitas || [], guardadas = revStatus.guardadas || [];
  const concl = registros.filter((r) => r.concluido);
  const buckets = {
    fazer: concl.filter((r) => !feitas.includes(r.id) && !guardadas.includes(r.id)),
    feitas: concl.filter((r) => feitas.includes(r.id)),
    guardadas: concl.filter((r) => guardadas.includes(r.id)),
  };
  const abas = [["fazer", "A fazer"], ["feitas", "Feitas"], ["guardadas", "Guardadas"]];
  const lista = buckets[aba].sort((a, b) => b.ts - a.ts);
  return (
    <section className="editais-page es-page">
      <button className="edital-back" onClick={onBack}>← Voltar ao painel</button>
      <p className="eyebrow">ESTUDEI</p>
      <h1 className="serif" style={{ marginBottom: 10 }}>Revisões</h1>
      <p className="es-sub">Sem prazos. Um tópico só entra aqui quando você o conclui num registro.</p>
      <div className="rev-tabs">
        {abas.map(([k, l]) => (
          <button key={k} className={`rev-tab${aba === k ? " on" : ""}`} onClick={() => setAba(k)}>{l} <span className="rev-n">{buckets[k].length}</span></button>
        ))}
      </div>
      {lista.length === 0 ? (
        <div className="es-hint">{aba === "fazer" ? "Nada pra revisar. Marque \"concluí este tópico\" num registro pra ele aparecer aqui." : "Vazio por aqui."}</div>
      ) : lista.map((r) => {
        const f = regFonte(r.fonte);
        return (
          <div className="rev-item" key={r.id}>
            <span className="hist-bar" style={{ background: f.color }} />
            <div className="hist-main">
              <div className="hist-mat">{r.materia}{r.topico ? <span className="hist-top"> · {r.topico}</span> : null}</div>
              <div className="rev-when">concluído em {new Date(r.ts).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</div>
            </div>
            <span className="hist-fonte" style={{ color: f.color, background: `color-mix(in srgb, ${f.color} 15%, transparent)` }}>{f.label}</span>
            <div className="rev-actions">
              {aba === "fazer" && <><button className="rev-btn ok" onClick={() => onMark(r.id, "feitas")}>revisei</button><button className="rev-btn" onClick={() => onMark(r.id, "guardadas")}>guardar</button></>}
              {aba !== "fazer" && <button className="rev-btn" onClick={() => onMark(r.id, "fazer")}>voltar</button>}
            </div>
          </div>
        );
      })}
    </section>
  );
}

// ===== ESTUDEI: Estatísticas =====
function EstatisticasView({ registros, onBack }) {
  const tempo = registros.reduce((s, r) => s + (r.tempo || 0), 0);
  const ac = registros.reduce((s, r) => s + (r.acertos || 0), 0);
  const er = registros.reduce((s, r) => s + (r.erros || 0), 0);
  const q = ac + er; const perc = q ? Math.round((ac / q) * 100) : 0;
  const dias = new Set(registros.map((r) => new Date(r.ts).toDateString())).size;
  const media = dias ? Math.round(tempo / dias) : 0;
  const matAgg = {};
  for (const r of registros) {
    const k = r.materia; if (!k) continue;
    if (!matAgg[k]) matAgg[k] = { ac: 0, er: 0 };
    matAgg[k].ac += r.acertos || 0; matAgg[k].er += r.erros || 0;
  }
  const matPerf = Object.keys(matAgg).map((m) => ({ m, ...matAgg[m], q: matAgg[m].ac + matAgg[m].er }))
    .filter((x) => x.q > 0).map((x) => ({ ...x, p: Math.round((x.ac / x.q) * 100) })).sort((a, b) => b.q - a.q);
  return (
    <section className="editais-page es-page">
      <button className="edital-back" onClick={onBack}>← Voltar ao painel</button>
      <p className="eyebrow">ESTUDEI</p>
      <h1 className="serif" style={{ marginBottom: 14 }}>Estatísticas</h1>
      {registros.length === 0 ? <div className="es-hint">Registre estudos pra ver suas estatísticas.</div> : (<>
        <div className="stat-grid">
          <div className="panel stat-desemp">
            <div className="dp-lbl">Desempenho</div>
            <div className="desemp-donut" style={{ "--p": perc }}><div className="ciclo-hole"><b>{perc}%</b></div></div>
            <div className="stat-sub">{ac} acertos · {er} erros</div>
          </div>
          <div className="panel"><div className="dp-lbl">Tempo total</div><div className="dp-big mat-big">{fmtTempo(tempo)}</div></div>
          <div className="panel"><div className="dp-lbl">Dias estudados</div><div className="dp-big mat-big">{dias}</div></div>
          <div className="panel"><div className="dp-lbl">Média por dia</div><div className="dp-big mat-big">{fmtTempo(media)}</div></div>
        </div>
        <div className="sechead-es">Tempo por fonte</div>
        <CiclosPizzas registros={registros} />
        {matPerf.length ? (<><div className="sechead-es">Desempenho por matéria</div>
          <div className="panel">
            {matPerf.map((x) => (
              <div className="meta-row" key={x.m}>
                <div className="meta-lab"><b>{x.m}</b><span>{x.ac}/{x.q} · {x.p}%</span></div>
                <div className="meta-track"><i style={{ width: x.p + "%" }} /></div>
              </div>
            ))}
          </div></>) : null}
      </>)}
    </section>
  );
}

export default function App() {
  const [data, setData] = useState({});
  const [simData, setSimData] = useState({});
  const [infoData, setInfoData] = useState({});
  const [cursoData, setCursoData] = useState({});
  const [editaisData, setEditaisData] = useState({});
  const [diario, setDiario] = useState([]);
  const [diarioTags, setDiarioTags] = useState({ fonte: DEFAULT_FONTE_TAGS, materia: [] });
  const [composeTitulo, setComposeTitulo] = useState("");
  const [composeFontes, setComposeFontes] = useState([]);
  const [composeMats, setComposeMats] = useState([]);
  const [diarioPeriodo, setDiarioPeriodo] = useState("semana");
  const [diarioHasText, setDiarioHasText] = useState(false);
  const [newTag, setNewTag] = useState(null); // { group, label, color, applyTo }
  const [editId, setEditId] = useState(null); // registro sendo editado
  const [editTitulo, setEditTitulo] = useState("");
  const diarioRef = useRef(null);
  const editRef = useRef(null);
  // ao entrar em edição, joga o texto salvo na caixa uma única vez (sem sobrescrever a digitação depois)
  useEffect(() => {
    if (editId != null && editRef.current) {
      const alvo = diario.find((x) => x.id === editId);
      editRef.current.innerHTML = alvo ? (alvo.html || alvo.texto || "") : "";
      editRef.current.focus();
    }
  }, [editId]);
  const [view, setView] = useState("es-painel");
  const [openEdital, setOpenEdital] = useState(0);
  const [openMat, setOpenMat] = useState({});
  const [openNote, setOpenNote] = useState(null); // chave do tópico com a caixinha de Observações aberta
  const [noteDraft, setNoteDraft] = useState("");
  const [openTopic, setOpenTopic] = useState(null); // { editalId, key, label, materia } — página de notas do tópico
  const [prioridades, setPrioridades] = useState([]);
  const [esCheck, setEsCheck] = useState([]);
  const [esCheckInput, setEsCheckInput] = useState("");
  const [registros, setRegistros] = useState([]);
  const [dataProva, setDataProva] = useState(null);
  const [metas, setMetas] = useState({ horas: 20, questoes: 300, revisoes: 8 });
  const [revStatus, setRevStatus] = useState({ feitas: [], guardadas: [] });
  const [matAberta, setMatAberta] = useState(null);
  const [regOpen, setRegOpen] = useState(false);
  const [regEditing, setRegEditing] = useState(null);
  const [regToast, setRegToast] = useState(false);
  useEffect(() => { setMatAberta(null); }, [view]);
  const [prioInput, setPrioInput] = useState("");
  const [simManuais, setSimManuais] = useState([]);
  const [simHidden, setSimHidden] = useState([]);
  const [manNome, setManNome] = useState("");
  const [manAno, setManAno] = useState("");
  const [manBanca, setManBanca] = useState("");
  const [matAddInput, setMatAddInput] = useState("");
  const [open, setOpen] = useState(null);
  const [flash, setFlash] = useState(null);
  const [openYear, setOpenYear] = useState(SIMULADOS[0] ? SIMULADOS[0].grupo : null);
  const [openProva, setOpenProva] = useState(null);
  const [activeSec, setActiveSec] = useState(NAV[0].id);
  const [loaded, setLoaded] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [navOpen, setNavOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.innerWidth >= 1025;
  });

  // guarda a preferência de menu aberto/fechado
  useEffect(() => {
    try { localStorage.setItem("navOpen", navOpen ? "1" : "0"); } catch (e) {}
  }, [navOpen]);

  // fecha o menu ao navegar em telas estreitas (onde vira sobreposição)
  const closeNavIfNarrow = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1025) setNavOpen(false);
  };

  // mostra o botão "voltar ao topo" depois de rolar um pouco
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
      let esck = [];
      try { const r = await window.storage.get(ES_CHECK_KEY); esck = r ? JSON.parse(r.value) : []; } catch { esck = []; }
      let regs = [];
      try { const r = await window.storage.get(REGISTROS_KEY); regs = r ? JSON.parse(r.value) : []; } catch { regs = []; }
      let dp = null;
      try { const r = await window.storage.get(DATAPROVA_KEY); dp = r ? JSON.parse(r.value) : null; } catch { dp = null; }
      let mt = { horas: 20, questoes: 300, revisoes: 8 };
      try { const r = await window.storage.get(METAS_KEY); if (r) mt = { ...mt, ...JSON.parse(r.value) }; } catch {}
      let rvs = { feitas: [], guardadas: [] };
      try { const r = await window.storage.get(REVSTATUS_KEY); if (r) rvs = { feitas: [], guardadas: [], ...JSON.parse(r.value) }; } catch {}
      let manuais = [];
      try { const r = await window.storage.get(SIM_MANUAIS_KEY); manuais = r ? JSON.parse(r.value) : []; } catch { manuais = []; }
      let ocultas = [];
      try { const r = await window.storage.get(SIM_HIDDEN_KEY); ocultas = r ? JSON.parse(r.value) : []; } catch { ocultas = []; }
      let diaEntries = [];
      try { const r = await window.storage.get(DIARIO_KEY); diaEntries = r ? JSON.parse(r.value) : []; } catch { diaEntries = []; }
      let diaTags = null;
      try { const r = await window.storage.get(DIARIO_TAGS_KEY); diaTags = r ? JSON.parse(r.value) : null; } catch { diaTags = null; }
      setData(next);
      setSimData(sim);
      setInfoData(info);
      setCursoData(cursos);
      setEditaisData(eds);
      setPrioridades(prio);
      setEsCheck(esck);
      setRegistros(regs);
      setDataProva(dp);
      setMetas(mt);
      setRevStatus(rvs);
      setSimManuais(manuais);
      setSimHidden(ocultas);
      setDiario(diaEntries);
      if (diaTags && diaTags.fonte) setDiarioTags({ fonte: diaTags.fonte, materia: diaTags.materia || [] });
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

  const saveEsCheck = (arr) => {
    setEsCheck(arr);
    try { window.storage.set(ES_CHECK_KEY, JSON.stringify(arr)); } catch {}
  };
  const addEsCheck = () => {
    const t = esCheckInput.trim();
    if (!t) return;
    saveEsCheck([...esCheck, { id: Date.now(), txt: t, done: false }]);
    setEsCheckInput("");
  };
  const toggleEsCheck = (id) => saveEsCheck(esCheck.map((p) => (p.id === id ? { ...p, done: !p.done } : p)));
  const removeEsCheck = (id) => saveEsCheck(esCheck.filter((p) => p.id !== id));

  // ---------- Registrar estudo ----------
  const saveRegistros = (arr) => { setRegistros(arr); try { window.storage.set(REGISTROS_KEY, JSON.stringify(arr)); } catch {} };
  const upsertRegistro = (r) => {
    const existe = registros.some((x) => x.id === r.id);
    saveRegistros(existe ? registros.map((x) => (x.id === r.id ? r : x)) : [r, ...registros]);
    setRegOpen(false); setRegEditing(null);
    setRegToast(true); setTimeout(() => setRegToast(false), 2200);
  };
  const removeRegistro = (id) => saveRegistros(registros.filter((r) => r.id !== id));
  const abrirRegistro = (r) => { setRegEditing(r || null); setRegOpen(true); };
  const fecharRegistro = () => { setRegOpen(false); setRegEditing(null); };
  const saveDataProva = (v) => { setDataProva(v); try { window.storage.set(DATAPROVA_KEY, JSON.stringify(v)); } catch {} };
  const saveMetas = (v) => { setMetas(v); try { window.storage.set(METAS_KEY, JSON.stringify(v)); } catch {} };
  const marcarRevisao = (id, destino) => {
    const next = { feitas: (revStatus.feitas || []).filter((x) => x !== id), guardadas: (revStatus.guardadas || []).filter((x) => x !== id) };
    if (destino === "feitas") next.feitas.push(id);
    else if (destino === "guardadas") next.guardadas.push(id);
    setRevStatus(next); try { window.storage.set(REVSTATUS_KEY, JSON.stringify(next)); } catch {}
  };

  // ---------- Diário de estudos ----------
  const saveDiario = (arr) => {
    setDiario(arr);
    try { window.storage.set(DIARIO_KEY, JSON.stringify(arr)); } catch {}
  };
  const saveDiarioTags = (t) => {
    setDiarioTags(t);
    try { window.storage.set(DIARIO_TAGS_KEY, JSON.stringify(t)); } catch {}
  };
  // aplica negrito/itálico/sublinhado/tachado no texto que está sendo escrito/editado
  const fmtOn = (cmd, ref) => {
    try { document.execCommand(cmd, false); } catch {}
    if (ref && ref.current) ref.current.focus();
  };
  const fmtDiario = (cmd) => fmtOn(cmd, diarioRef);
  const addDiario = () => {
    const el = diarioRef.current;
    const plain = (el ? el.innerText : "").trim();
    if (!plain) return;
    const html = (el ? el.innerHTML : "").trim();
    const mats = detectMaterias(plain);
    composeMats.forEach((m) => { if (!mats.includes(m)) mats.push(m); });
    const entry = {
      id: Date.now(),
      ts: Date.now(),
      titulo: composeTitulo.trim() || detectContexto(plain),
      html,
      fontes: composeFontes.slice(),
      mats,
    };
    saveDiario([entry, ...diario]);
    if (el) el.innerHTML = "";
    setComposeTitulo("");
    setComposeFontes([]);
    setComposeMats([]);
    setDiarioHasText(false);
  };
  const removeDiario = (id) => saveDiario(diario.filter((e) => e.id !== id));
  // edição de um registro já salvo (título + texto com formatação)
  const startEditDiario = (e) => {
    setEditId(e.id);
    setEditTitulo(e.titulo || e.contexto || "");
  };
  const cancelEditDiario = () => { setEditId(null); setEditTitulo(""); };
  const saveEditDiario = (id) => {
    const el = editRef.current;
    if (!el) return;
    const plain = el.innerText.trim();
    if (!plain) return; // não deixa apagar tudo por engano
    const html = el.innerHTML.trim();
    saveDiario(diario.map((e) => (e.id === id ? { ...e, titulo: editTitulo.trim(), html, texto: undefined } : e)));
    cancelEditDiario();
  };
  // adiciona/tira uma matéria de um registro (para corrigir a classificação na mão)
  const toggleMatDiario = (id, matId) => {
    saveDiario(diario.map((e) => {
      if (e.id !== id) return e;
      const has = (e.mats || []).includes(matId);
      return { ...e, mats: has ? e.mats.filter((m) => m !== matId) : [...(e.mats || []), matId] };
    }));
  };
  // adiciona/tira uma tag de Fonte de um registro
  const toggleFonteDiario = (id, fid) => {
    saveDiario(diario.map((e) => {
      if (e.id !== id) return e;
      const has = (e.fontes || []).includes(fid);
      return { ...e, fontes: has ? e.fontes.filter((f) => f !== fid) : [...(e.fontes || []), fid] };
    }));
  };
  const toggleComposeFonte = (fid) => {
    setComposeFontes((f) => (f.includes(fid) ? f.filter((x) => x !== fid) : [...f, fid]));
  };
  const toggleComposeMat = (mid) => {
    setComposeMats((m) => (m.includes(mid) ? m.filter((x) => x !== mid) : [...m, mid]));
  };
  // abre o mesmo painel, mas para editar uma tag que já existe (renomear/trocar cor/excluir)
  const openEditTag = (group, tag) => setNewTag({ mode: "edit", group, id: tag.id, label: tag.label, color: tag.color });
  // cria uma tag nova (Fonte ou Matéria) com a cor escolhida — ou salva a edição
  const commitNewTag = () => {
    if (!newTag) return;
    const label = newTag.label.trim();
    if (!label) return;
    if (newTag.mode === "edit") {
      const next = { ...diarioTags, [newTag.group]: diarioTags[newTag.group].map((t) => (t.id === newTag.id ? { ...t, label, color: newTag.color } : t)) };
      saveDiarioTags(next);
      setNewTag(null);
      return;
    }
    const id = "t" + Date.now();
    const tag = { id, label, color: newTag.color };
    const next = { ...diarioTags, [newTag.group]: [...diarioTags[newTag.group], tag] };
    saveDiarioTags(next);
    const applyTo = newTag.applyTo;
    if (applyTo) {
      if (applyTo.kind === "compose") setComposeFontes((f) => [...f, id]);
      else if (applyTo.kind === "compose-mat") setComposeMats((m) => [...m, id]);
      else if (applyTo.kind === "card") {
        if (newTag.group === "fonte") toggleFonteDiario(applyTo.cardId, id);
        else toggleMatDiario(applyTo.cardId, id);
      }
    }
    setNewTag(null);
  };
  // remove uma tag do painel (some dos registros também)
  const deleteTag = (group, id) => {
    const next = { ...diarioTags, [group]: diarioTags[group].filter((t) => t.id !== id) };
    saveDiarioTags(next);
    if (group === "fonte") {
      setComposeFontes((f) => f.filter((x) => x !== id));
      saveDiario(diario.map((e) => ({ ...e, fontes: (e.fontes || []).filter((f) => f !== id) })));
    } else {
      setComposeMats((m) => m.filter((x) => x !== id));
      saveDiario(diario.map((e) => ({ ...e, mats: (e.mats || []).filter((m) => m !== id) })));
    }
  };
  // nome + cor de uma tag de matéria (matéria pode ser uma disciplina ou uma tag criada)
  const matTagInfo = (id) => {
    const custom = diarioTags.materia.find((t) => t.id === id);
    if (custom) return { label: custom.label, color: custom.color };
    if (SUBJ_BY_ID[id]) return { label: SUBJ_BY_ID[id].name.replace(/^Direito /, ""), color: materiaColor(id) };
    return { label: id, color: "hsl(210, 8%, 65%)" };
  };
  const fonteTagInfo = (id) => {
    const t = diarioTags.fonte.find((x) => x.id === id);
    return t ? { label: t.label, color: t.color } : { label: id, color: "#8a94a6" };
  };
  // todas as matérias disponíveis (disciplinas + tags de matéria criadas)
  const materiaOptions = () => [
    ...MATERIAS_SIM.map((s) => ({ id: s.id, label: s.name.replace(/^Direito /, ""), color: materiaColor(s.id) })),
    ...diarioTags.materia.map((t) => ({ id: t.id, label: t.label, color: t.color })),
  ];

  // agrupa os registros por dia (mais recente primeiro) e monta o rótulo do dia
  const diaKey = (ts) => { const d = new Date(ts); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; };
  const rotuloDia = (ts) => {
    const d = new Date(ts), hoje = new Date();
    const ontem = new Date(); ontem.setDate(hoje.getDate() - 1);
    if (diaKey(ts) === diaKey(hoje.getTime())) return "Hoje";
    if (diaKey(ts) === diaKey(ontem.getTime())) return "Ontem";
    const s = d.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
    return s.charAt(0).toUpperCase() + s.slice(1);
  };
  const diarioPorDia = () => {
    const grupos = [];
    let atual = null;
    for (const e of diario) {
      const k = diaKey(e.ts);
      if (!atual || atual.k !== k) { atual = { k, ts: e.ts, itens: [] }; grupos.push(atual); }
      atual.itens.push(e);
    }
    return grupos;
  };
  // resumo do topo: registros na semana, sequência de dias e matéria mais estudada
  const diarioResumo = () => {
    const agora = Date.now();
    const semana = diario.filter((e) => e.ts >= agora - 7 * 86400000).length;
    const dias = new Set(diario.map((e) => diaKey(e.ts)));
    let streak = 0; const cur = new Date();
    if (!dias.has(diaKey(cur.getTime()))) cur.setDate(cur.getDate() - 1);
    while (dias.has(diaKey(cur.getTime()))) { streak++; cur.setDate(cur.getDate() - 1); }
    const tally = {};
    diario.forEach((e) => (e.mats || []).forEach((m) => { tally[m] = (tally[m] || 0) + 1; }));
    let topId = null, topN = 0;
    for (const id of Object.keys(tally)) { if (tally[id] > topN) { topN = tally[id]; topId = id; } }
    const topNome = topId && SUBJ_BY_ID[topId] ? SUBJ_BY_ID[topId].name.replace(/^Direito /, "") : "—";
    return { semana, streak, topNome };
  };
  // extrato do acompanhamento: números do período escolhido (semana/mês/ano/tudo)
  const diarioExtrato = (periodo) => {
    const now = new Date();
    let start = 0;
    if (periodo === "semana") { const d = new Date(now); const dow = (d.getDay() + 6) % 7; d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - dow); start = d.getTime(); }
    else if (periodo === "mes") { start = new Date(now.getFullYear(), now.getMonth(), 1).getTime(); }
    else if (periodo === "ano") { start = new Date(now.getFullYear(), 0, 1).getTime(); }
    const itens = diario.filter((e) => e.ts >= start);
    const count = itens.length;
    const dias = new Set(itens.map((e) => diaKey(e.ts))).size;
    // sequência de dias seguidos (sempre global, é o "pique" atual)
    const allDias = new Set(diario.map((e) => diaKey(e.ts)));
    let streak = 0; const cur = new Date();
    if (!allDias.has(diaKey(cur.getTime()))) cur.setDate(cur.getDate() - 1);
    while (allDias.has(diaKey(cur.getTime()))) { streak++; cur.setDate(cur.getDate() - 1); }
    // ranking por matéria e por fonte
    const matTally = {}; const fonteTally = {};
    itens.forEach((e) => {
      (e.mats || []).forEach((m) => { matTally[m] = (matTally[m] || 0) + 1; });
      (e.fontes || []).forEach((f) => { fonteTally[f] = (fonteTally[f] || 0) + 1; });
    });
    const mats = Object.keys(matTally).map((id) => ({ id, n: matTally[id], ...matTagInfo(id) })).sort((a, b) => b.n - a.n);
    const fontes = Object.keys(fonteTally).map((id) => ({ id, n: fonteTally[id], ...fonteTagInfo(id) })).sort((a, b) => b.n - a.n);
    const media = dias ? count / dias : 0;
    return { count, dias, streak, mats, fontes, media };
  };

  const saveManuais = (arr) => {
    setSimManuais(arr);
    try { window.storage.set(SIM_MANUAIS_KEY, JSON.stringify(arr)); } catch {}
  };
  const addManual = () => {
    const nome = manNome.trim();
    const ano = (manAno.trim() || String(new Date().getFullYear()));
    const banca = manBanca.trim();
    if (!nome) return;
    if (simManuais.some((m) => m.nome === nome && m.ano === ano)) { setManNome(""); return; }
    saveManuais([...simManuais, { nome, ano, banca: banca || null }]);
    setManNome(""); setManAno(""); setManBanca("");
  };
  const removeManual = (nome, ano) => saveManuais(simManuais.filter((m) => !(m.nome === nome && m.ano === ano)));
  const saveHidden = (arr) => {
    setSimHidden(arr);
    try { window.storage.set(SIM_HIDDEN_KEY, JSON.stringify(arr)); } catch {}
  };
  // exclui uma prova: manual → remove da lista; automática → oculta (guarda o nome)
  const deleteProva = (p, ano) => {
    if (p.manual) removeManual(p.nome, ano);
    else if (!simHidden.includes(p.nome)) saveHidden([...simHidden, p.nome]);
  };

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

  // matérias mostradas numa prova = sugeridas (menos as removidas) + avulsas dessa prova
  const provaMats = (prova) => {
    const v = simData[prova] || {};
    const hidden = v.hidden || [];
    const sugeridas = MATERIAS_SIM.filter((m) => !hidden.includes(m.id)).map((m) => ({ key: m.id, name: m.name, custom: false }));
    const avulsas = (v.custom || []).map((c) => ({ key: c.id, name: c.name, custom: true }));
    return [...sugeridas, ...avulsas];
  };
  // grava acertos/questões de uma matéria: field = "a" (acertos) ou "q" (questões)
  const setMat = (prova, key, field, value) => {
    const cur = simData[prova] || {};
    const mats = { ...(cur.mats || {}) };
    const prev = mats[key] && typeof mats[key] === "object" ? mats[key] : {};
    mats[key] = { ...prev, [field]: value };
    toggleSim(prova, { mats });
  };
  const hideMat = (prova, matId) => {
    const cur = simData[prova] || {};
    toggleSim(prova, { hidden: [...(cur.hidden || []), matId] });
  };
  const addProvaMat = (prova) => {
    const name = matAddInput.trim();
    if (!name) return;
    const cur = simData[prova] || {};
    toggleSim(prova, { custom: [...(cur.custom || []), { id: "c" + Date.now(), name }] });
    setMatAddInput("");
  };
  const removeCustomMat = (prova, id) => {
    const cur = simData[prova] || {};
    const mats = { ...(cur.mats || {}) };
    delete mats[id];
    toggleSim(prova, { custom: (cur.custom || []).filter((c) => c.id !== id), mats });
  };
  // % de uma matéria (acertos/questões)
  const matPct = (md) => {
    const a = parseFloat(md && md.a), q = parseFloat(md && md.q);
    if (isNaN(q) || q <= 0) return null;
    return Math.round((isNaN(a) ? 0 : a) / q * 100);
  };
  // totais da prova: soma acertos e questões de todas as matérias preenchidas
  const provaTotals = (prova) => {
    const v = simData[prova] || {};
    let a = 0, q = 0;
    provaMats(prova).forEach((m) => {
      const md = (v.mats || {})[m.key] || {};
      const qq = parseFloat(md.q), aa = parseFloat(md.a);
      if (!isNaN(qq) && qq > 0) { q += qq; a += isNaN(aa) ? 0 : aa; }
    });
    return q > 0 ? { a, q, pct: Math.round(a / q * 100) } : null;
  };

  const toggleInfo = async (org, num) => {
    const k = `${org}-${num}`;
    const next = !infoData[k];
    setInfoData((p) => ({ ...p, [k]: next }));
    try {
      await window.storage.set(INFO_KEY_PREFIX + k, JSON.stringify(next));
    } catch {}
  };

  // marca/desmarca UMA caixinha (Teoria, Lei Seca, Questões, 1ª/2ª/3ª revisão) de um tópico
  const toggleEditalCell = async (editalId, pathKey, field) => {
    const cur = editaisData[editalId] || {};
    const cell = editalCell(cur[pathKey]);
    const nextCell = { ...cell, [field]: !cell[field] };
    const next = { ...cur, [pathKey]: nextCell };
    setEditaisData((p) => ({ ...p, [editalId]: next }));
    try {
      await window.storage.set(EDITAIS_KEY_PREFIX + editalId, JSON.stringify(next));
    } catch {}
  };

  // salva (ou limpa) a Observação de um tópico do edital
  const saveEditalNote = async (editalId, pathKey, text) => {
    const t = (text || "").trim();
    const cur = editaisData[editalId] || {};
    const cell = editalCell(cur[pathKey]);
    const nextCell = { ...cell };
    if (t) nextCell.obs = t; else delete nextCell.obs;
    const next = { ...cur, [pathKey]: nextCell };
    setEditaisData((p) => ({ ...p, [editalId]: next }));
    try {
      await window.storage.set(EDITAIS_KEY_PREFIX + editalId, JSON.stringify(next));
    } catch {}
    setOpenNote(null);
  };

  // salva as caixinhas de notas (rich text) de um tópico do edital
  const saveEditalNotes = async (editalId, pathKey, notas) => {
    const cur = editaisData[editalId] || {};
    const cell = editalCell(cur[pathKey]);
    const nextCell = { ...cell };
    const clean = (notas || []).filter((b) => ((b.html || "").replace(/<[^>]*>/g, "").replace(/ /g, " ").trim()) || (b.tags && b.tags.length));
    if (clean.length) nextCell.notas = clean; else delete nextCell.notas;
    const next = { ...cur, [pathKey]: nextCell };
    setEditaisData((p) => ({ ...p, [editalId]: next }));
    try { await window.storage.set(EDITAIS_KEY_PREFIX + editalId, JSON.stringify(next)); } catch {}
  };

  // arquiva uma nota da Caixa de entrada como caixinha dentro do tópico certo do edital verticalizado
  const arquivarNoEdital = (nota) => {
    const r = caixaResolveEdital(nota.mats && nota.mats[0], nota.topico);
    if (!r) return { ok: false };
    const box = { id: TN_UID(), html: caixaNotaToHtml(nota), tags: nota.fonte ? [{ label: nota.fonte, ci: 1 }] : [] };
    const cur = editaisData[r.editalId] || {};
    const cell = editalCell(cur[r.pathKey]);
    const nextCell = { ...cell, notas: [...(cell.notas || []), box] };
    const next = { ...cur, [r.pathKey]: nextCell };
    setEditaisData((p) => ({ ...p, [r.editalId]: next }));
    try { window.storage.set(EDITAIS_KEY_PREFIX + r.editalId, JSON.stringify(next)); } catch {}
    return { ok: true, label: r.label };
  };

  // abre a página de notas de um tópico (só no edital TJSC Juiz 2025)
  const openTopicPage = (ed, key, node) => {
    const mi = parseInt(String(key).split(".")[0], 10);
    const materia = (ed.materias[mi] && ed.materias[mi].nome) || "";
    const label = `${node.n ? node.n + " " : ""}${node.txt}`;
    setOpenTopic({ editalId: ed.id, key, label, materia });
    window.scrollTo(0, 0);
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
  const simTotal = SIMULADOS.reduce((a, g) => a + g.provas.filter((p) => !simHidden.includes(p)).length, 0) + simManuais.length;

  // grupos de simulados por ano (provas oficiais + provas manuais), ordenados
  const simGroups = (() => {
    const byYear = {};
    SIMULADOS.forEach((g) => {
      byYear[g.grupo] = (byYear[g.grupo] || []).concat(g.provas.filter((p) => !simHidden.includes(p)).map((p) => ({ nome: p, manual: false, banca: SIMULADOS_BANCA[p] || null })));
    });
    simManuais.forEach((m) => {
      byYear[m.ano] = (byYear[m.ano] || []).concat([{ nome: m.nome, ano: m.ano, manual: true, banca: m.banca || null }]);
    });
    return Object.keys(byYear)
      .filter((ano) => byYear[ano].length > 0)
      .sort((a, b) => b.localeCompare(a))
      .map((ano) => ({
        grupo: ano,
        provas: byYear[ano].sort((x, y) => {
          const cx = (simData[x.nome] || {}).checked ? 1 : 0;
          const cy = (simData[y.nome] || {}).checked ? 1 : 0;
          if (cx !== cy) return cx - cy; // resolvidas vão para o fim
          return x.nome.localeCompare(y.nome, "pt");
        }),
      }));
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
          --bg:#121215; --surface:#18181b; --surface-2:#1f1f23; --surface-3:#27272a;
          --line:#27272a; --line-2:#3f3f46;
          --text:#fafafa; --muted:#a1a1aa; --faint:#71717a;
          --gold:#facc15; --gold2:#facc15; --coral:#f0997b; --green:#4ade80; --green-bg:rgba(74,222,128,.14);
          --sidebar:#161619; --nav-active-bg:#27272a; --hero:#0f1929; --accent-btn:#facc15; --on-accent:#1a1206;
        }
        :root[data-theme="light"] {
          --bg:#fafafa; --surface:#ffffff; --surface-2:#f4f4f5; --surface-3:#e4e4e7;
          --line:#e4e4e7; --line-2:#d4d4d8;
          --text:#18181b; --muted:#71717a; --faint:#a1a1aa;
          --gold:#ca8a04; --gold2:#ca8a04; --coral:#c2410c; --green:#15803d; --green-bg:#e9f6ee;
          --sidebar:#f4f4f5; --nav-active-bg:#ffffff; --hero:#1e293b; --accent-btn:#ca8a04; --on-accent:#ffffff;
        }
        /* cor do app por humor (sobrepõe o dourado, em qualquer tema) */
        :root[data-cor="amarelo"] { --gold:#EAA92E; --accent-btn:#EAA92E; --gold2:#E07A54; --coral:#2B5A82; --on-accent:#3a2c08; }
        :root[data-cor="rosa"] { --gold:#E85D9A; --accent-btn:#E85D9A; --gold2:#F2B23A; --coral:#2F6FE4; --on-accent:#ffffff; }
        :root[data-cor="azul"] { --gold:#2F6FE4; --accent-btn:#2F6FE4; --gold2:#EE3B34; --coral:#F2B23A; --on-accent:#ffffff; }
        :root[data-cor="roxo"] { --gold:#7C4DE0; --accent-btn:#7C4DE0; --gold2:#F2B23A; --coral:#17B8A6; --on-accent:#ffffff; }
        * { box-sizing: border-box; }
        .root {
          font-family: ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;
          color: var(--text);
          min-height: 100%;
          padding: 0 clamp(16px,3vw,40px) 90px;
          background: var(--bg);
        }
        @media (min-width: 1025px) {
          .root { padding-left: 296px; }
        }
        :root[data-theme="light"] .stat { background: var(--surface); }
        :root[data-theme="light"] .pop, :root[data-theme="light"] .pop-head { background: rgba(255,255,255,.98); }
        .serif { font-family: inherit; font-weight: 800; letter-spacing: -.5px; }
        .mono { font-family: 'SF Mono','JetBrains Mono','Consolas',monospace; font-variant-numeric: tabular-nums; }
        .wrap { max-width: 1080px; margin: 0 auto; }
        input[type=checkbox] { appearance: none; -webkit-appearance: none; margin: 0; width: 18px; height: 18px;
          border-radius: 5px; border: 1.7px solid var(--line-2); background: transparent; cursor: pointer; flex-shrink: 0;
          display: inline-grid; place-items: center; transition: background .16s ease, border-color .16s ease, box-shadow .16s ease; }
        input[type=checkbox]:hover { border-color: var(--green); }
        input[type=checkbox]:checked { background: var(--green); border-color: var(--green); box-shadow: 0 0 0 4px rgba(89,201,138,.22); }
        input[type=checkbox]:checked::after { content: ""; width: 9px; height: 5px; border-left: 2.3px solid #06120b;
          border-bottom: 2.3px solid #06120b; transform: rotate(-45deg); margin-top: -2px; }

        /* ---- hero ---- */
        .hero { background: var(--hero); border-radius: 18px; padding: 30px 34px; margin: 26px 0 20px; }
        .eyebrow { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: var(--gold); font-weight: 700; margin: 0 0 12px; }
        .hero h1 { font-size: clamp(24px, 3.6vw, 33px); line-height: 1.1; margin: 0 0 12px; letter-spacing: -.6px; font-weight: 800; color: #f8fafc; }
        .hero h1 em { font-style: normal; color: var(--gold); }
        .hero-sub { font-size: 14.5px; color: #cbd5e1; margin: 0; max-width: 620px; line-height: 1.55; }
        .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin: 0 0 22px; }
        @media (max-width: 720px) { .stats { grid-template-columns: 1fr; } }
        .stat { background: var(--surface);
          border: 1px solid var(--line); border-radius: 16px; padding: 16px 18px; }
        .stat-top { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 12px; }
        .stat-label { font-size: 12px; color: var(--muted); font-weight: 500; }
        .stat-num { font-size: 15px; } .stat-num b { font-size: 22px; font-weight: 700; } .stat-num span { color: var(--faint); }
        .stat-pct { font-size: 12px; font-weight: 600; }

        /* ---- generic bar ---- */
        .bar { height: 6px; border-radius: 99px; background: var(--surface-3); overflow: hidden; }
        .bar > i { display: block; height: 100%; border-radius: 99px; transition: width .35s ease; }

        /* ---- tier ---- */
        .tier { background: var(--surface); border: 1px solid var(--line); border-radius: 20px;
          padding: 6px 22px 22px; margin-bottom: 22px; scroll-margin-top: 62px; }

        /* ===== menu lateral (estilo Normio) ===== */
        .sidebar { position: fixed; top: 46px; left: 0; bottom: 0; width: 264px; z-index: 300;
          background: var(--sidebar); border-right: 1px solid var(--line);
          display: flex; flex-direction: column; padding: 16px 14px 26px;
          overflow-y: auto; transition: transform .24s ease; }
        .sidebar a, .sidebar button { text-decoration: none; }
        .side-logo { display: flex; align-items: center; gap: 9px; padding: 4px 8px 6px; }
        .side-logo .mark { width: 30px; height: 30px; border-radius: 9px; background: var(--accent-btn); color: var(--on-accent);
          display: grid; place-items: center; font-size: 16px; font-weight: 800; flex-shrink: 0; }
        .side-logo .name { font-size: 17px; font-weight: 800; letter-spacing: -.3px; color: var(--text); }
        .nav-group { margin-top: 18px; }
        .nav-group-label { font-size: 10.5px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
          color: var(--faint); padding: 0 10px 7px; }
        .nav-item { display: flex; align-items: center; gap: 11px; width: 100%; padding: 9px 10px; border-radius: 8px;
          font-size: 13px; font-weight: 500; color: var(--muted); line-height: 1.2; background: transparent;
          border: none; cursor: pointer; text-align: left; font-family: inherit; transition: background .14s, color .14s; margin-bottom: 1px; }
        .nav-item:hover { background: var(--surface-3); color: var(--text); }
        .nav-item.active { background: var(--nav-active-bg); color: var(--text); font-weight: 600; box-shadow: inset 2px 0 0 var(--gold); }
        :root[data-theme="light"] .nav-item.active { box-shadow: inset 2px 0 0 var(--gold), 0 1px 3px rgba(0,0,0,.07); }
        .nav-ic { width: 18px; height: 18px; flex-shrink: 0; opacity: .8; }
        .nav-item.active .nav-ic { opacity: 1; color: var(--gold); }
        .nav-n { flex-shrink: 0; width: 21px; height: 21px; border-radius: 6px; display: grid; place-items: center;
          font-size: 11px; font-weight: 700; color: var(--faint); background: var(--surface-3); }
        .nav-item.active .nav-n { color: var(--on-accent); background: var(--gold); }
        .nav-item .lbl { flex: 1; }

        /* botão de recolher/expandir (só em telas estreitas) */
        .nav-toggle { position: fixed; top: 53px; left: 12px; z-index: 400; display: none;
          width: 42px; height: 42px; border-radius: 12px; place-items: center;
          border: 1px solid var(--line-2); background: var(--surface); color: var(--muted); cursor: pointer;
          box-shadow: 0 4px 14px rgba(0,0,0,.18); transition: background .15s, color .15s, transform .15s; }
        .nav-toggle:hover { background: var(--surface-3); color: var(--text); }
        .nav-toggle:active { transform: scale(.94); }
        .nav-toggle svg { width: 20px; height: 20px; }
        .nav-backdrop { position: fixed; inset: 0; z-index: 290; background: rgba(0,0,0,.5);
          opacity: 0; pointer-events: none; transition: opacity .24s ease; }
        @media (max-width: 1024px) {
          .sidebar { box-shadow: 0 18px 44px rgba(0,0,0,.4); }
          .sidebar.closed { transform: translateX(-100%); }
          .nav-toggle { display: grid; }
          .nav-backdrop.active { opacity: 1; pointer-events: auto; }
        }
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
        .cell:hover { transform: translateY(-2px); border-color: var(--line-2); background: var(--surface-3); }
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
        .pop-item:hover { background: var(--surface-2); }
        .pop-item label { display: flex; align-items: flex-start; gap: 9px; font-size: 12.5px; cursor: pointer; line-height: 1.35; }
        .pop-item label > span { flex: 1; }
        .pop-item.checked label > span { color: var(--faint); text-decoration: line-through; text-decoration-color: var(--line-2); }
        .field { width: calc(100% - 24px); margin: 6px 0 0 24px; background: var(--bg); border: 1px solid var(--line-2);
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
        .sim-overall { font-size: 12px; font-weight: 700; color: var(--gold); flex-shrink: 0; min-width: 34px; text-align: right; }
        .sim-frac { font-size: 11px; color: var(--faint); flex-shrink: 0; }
        .banca-tag { font-size: 10px; font-weight: 700; letter-spacing: .3px; padding: 2px 7px; border-radius: 999px; flex-shrink: 0; white-space: nowrap; }
        .sim-mats { display: flex; flex-direction: column; gap: 3px; padding: 8px 4px 10px 24px; }
        .sim-mat { display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: var(--muted); padding: 2px 0; }
        .sim-mat-name { flex: 1; min-width: 0; }
        .sim-de { color: var(--faint); font-size: 11px; }
        .qn { width: 46px; background: var(--surface-2); border: 1px solid var(--line-2); border-radius: 7px; color: var(--text);
          font-size: 12px; padding: 5px 4px; text-align: center; }
        .qn:focus { outline: none; border-color: var(--green); }
        .sim-mat-pct { width: 40px; text-align: right; font-weight: 700; color: var(--green); font-size: 11.5px; }
        .sim-mat-del { font-size: 12px; opacity: .38; }
        .sim-mat-add { display: flex; gap: 7px; margin-top: 8px; padding-top: 8px; border-top: 1px dashed var(--line); }
        .sim-mat-add input { flex: 1; min-width: 0; background: var(--surface-2); border: 1px solid var(--line-2); border-radius: 8px;
          color: var(--text); font: inherit; font-size: 12px; padding: 7px 9px; }
        .sim-mat-add input:focus { outline: none; border-color: var(--coral); }
        .sim-mat-add button { width: 32px; flex-shrink: 0; border: 1px solid var(--line-2); background: var(--surface-3);
          color: var(--text); border-radius: 8px; font-size: 16px; cursor: pointer; }
        .sim-mat-add button:hover { border-color: var(--coral); color: var(--coral); }

        .curso-box { background: var(--surface-2); border: 1px solid var(--line); border-radius: 13px;
          padding: 12px 14px; max-height: 260px; overflow-y: auto; }
        .curso-item { display: flex; align-items: flex-start; gap: 9px; font-size: 12.5px; padding: 4px 0; cursor: pointer; line-height: 1.4; }
        .curso-item > span:not(.dur):not(.idx) { flex: 1; }
        .curso-item.checked > span:not(.dur) { color: var(--faint); text-decoration: line-through; text-decoration-color: var(--line-2); }
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

        /* ---------- Diário de estudos ---------- */
        .diario-page { padding-top: 8px; max-width: 1000px; }
        .diario-layout { display: grid; grid-template-columns: minmax(0, 1fr) 290px; gap: 22px; align-items: start; }
        .diario-main { min-width: 0; }
        .diario-side { position: sticky; top: 62px; }
        /* painel de acompanhamento (extratos) */
        .diario-acomp { background: var(--surface); border: 1px solid var(--line-2); border-radius: 16px; padding: 16px 16px 18px; }
        .diario-acomp-title { font-size: 13px; font-weight: 800; letter-spacing: .2px; color: var(--text); margin-bottom: 12px; }
        .diario-acomp-tabs { display: flex; gap: 3px; background: var(--surface-2); border-radius: 11px; padding: 3px; margin-bottom: 16px; }
        .diario-acomp-tab { flex: 1; cursor: pointer; font: inherit; font-size: 12px; font-weight: 700; color: var(--muted);
          background: transparent; border: none; border-radius: 8px; padding: 7px 4px; transition: all .12s; }
        .diario-acomp-tab:hover { color: var(--text); }
        .diario-acomp-tab.on { background: var(--gold); color: var(--on-accent, #10141a); }
        .diario-acomp-big { font-size: 34px; font-weight: 800; color: var(--text); line-height: 1; }
        .diario-acomp-big small { font-size: 13px; font-weight: 600; color: var(--muted); margin-left: 7px; }
        .diario-acomp-mini { display: grid; grid-template-columns: repeat(3, 1fr); gap: 7px; margin: 14px 0 2px; }
        .diario-acomp-cell { background: var(--surface-2); border-radius: 10px; padding: 9px 4px; text-align: center; }
        .diario-acomp-cell b { display: block; font-size: 16px; color: var(--text); }
        .diario-acomp-cell span { font-size: 10px; color: var(--muted); letter-spacing: .2px; }
        .diario-acomp-sec { font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: var(--muted); margin: 18px 0 9px; }
        .diario-acomp-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
        .diario-acomp-row-lbl { font-size: 12px; font-weight: 700; width: 88px; flex-shrink: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .diario-acomp-track { flex: 1; height: 7px; background: var(--surface-3); border-radius: 99px; overflow: hidden; }
        .diario-acomp-track i { display: block; height: 100%; border-radius: 99px; }
        .diario-acomp-n { font-size: 12px; font-weight: 700; color: var(--muted); min-width: 14px; text-align: right; }
        .diario-acomp-empty { font-size: 12px; color: var(--faint); font-style: italic; margin: 4px 0 2px; }
        @media (max-width: 860px) { .diario-layout { grid-template-columns: 1fr; } .diario-side { position: static; } }
        .diario-compose { background: var(--surface); border: 1px solid var(--line-2); border-radius: 16px;
          padding: 12px 14px; margin-bottom: 24px; display: flex; flex-direction: column; gap: 10px; }
        .diario-titulo-input { background: var(--surface-2); color: var(--text); border: 1px solid var(--line);
          border-radius: 10px; padding: 9px 12px; font: inherit; font-size: 13px; font-weight: 600; }
        .diario-titulo-input:focus { outline: none; border-color: var(--gold); }
        .diario-titulo-input::placeholder { color: var(--faint); font-weight: 500; }
        .diario-toolbar { display: flex; gap: 4px; }
        .diario-toolbar button { cursor: pointer; width: 32px; height: 30px; background: var(--surface-2);
          border: 1px solid var(--line); border-radius: 8px; color: var(--muted); font-size: 14px; }
        .diario-toolbar button:hover { color: var(--text); border-color: var(--muted); }
        .diario-input { min-height: 84px; background: var(--surface-2); color: var(--text);
          border: 1px solid var(--line); border-radius: 12px; padding: 12px 14px; font: inherit; font-size: 15px;
          line-height: 1.55; overflow-y: auto; }
        .diario-input:focus { outline: none; border-color: var(--gold); }
        .diario-input:empty:before { content: attr(data-placeholder); color: var(--faint); pointer-events: none; }
        .diario-compose-tags { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
        .diario-compose-lbl { font-size: 11px; letter-spacing: 1px; text-transform: uppercase; color: var(--muted);
          font-weight: 700; margin-right: 2px; }
        .diario-tagpick-wrap { display: inline-flex; align-items: center; border-radius: 999px;
          border: 1px solid var(--line-2); background: var(--surface-2); overflow: hidden; }
        .diario-tagpick-wrap.on { border-style: solid; }
        .diario-tagpick-wrap:hover { filter: brightness(1.08); }
        .diario-tagpick-lbl { cursor: pointer; font: inherit; font-size: 12px; font-weight: 700; color: inherit;
          background: transparent; border: none; padding: 4px 3px 4px 11px; }
        .diario-tagpick-edit { cursor: pointer; background: transparent; border: none; color: inherit; opacity: .45;
          font-size: 11px; line-height: 1; padding: 4px 8px 4px 3px; }
        .diario-tagpick-edit:hover { opacity: 1; }
        .diario-tag-new { cursor: pointer; font: inherit; font-size: 12px; font-weight: 600; border-radius: 999px;
          padding: 4px 11px; background: transparent; border: 1px dashed var(--line-2); color: var(--muted); }
        .diario-tag-new:hover { color: var(--gold); border-color: var(--gold); }
        .diario-compose-hint { font-size: 11px; color: var(--faint); font-style: italic; }
        .diario-add { cursor: pointer; align-self: flex-start; white-space: nowrap; background: var(--gold); color: var(--on-accent);
          border: none; border-radius: 12px; padding: 11px 22px; font: inherit; font-size: 14px; font-weight: 700; }
        .diario-add:hover { filter: brightness(1.05); }
        .diario-add:disabled { cursor: default; background: var(--surface-3); color: var(--faint); }
        .diario-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 26px; }
        .diario-stat { background: var(--surface); border: 1px solid var(--line); border-radius: 14px; padding: 12px 14px;
          display: flex; flex-direction: column; gap: 4px; }
        .diario-stat-label { font-size: 11px; letter-spacing: 1.2px; text-transform: uppercase; color: var(--muted); }
        .diario-stat-num { font-size: 24px; font-weight: 700; color: var(--text); }
        .diario-stat-num small { font-size: 13px; font-weight: 500; color: var(--muted); }
        .diario-dia { margin-bottom: 22px; }
        .diario-dia-head { font-size: 12px; letter-spacing: 1.4px; text-transform: uppercase; color: var(--gold);
          font-weight: 700; margin: 0 0 10px 2px; }
        .diario-card { background: var(--surface); border: 1px solid var(--line); border-radius: 16px;
          padding: 14px 16px; margin-bottom: 10px; position: relative; }
        .diario-card:has(.diario-addmat[open]) { z-index: 60; }
        .diario-card-top { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
        .diario-tipo { font-size: 11px; font-weight: 700; letter-spacing: .4px; color: var(--muted);
          background: var(--surface-3); border-radius: 8px; padding: 3px 9px; }
        .diario-ctx { font-size: 12px; color: var(--faint); }
        .diario-titulo { font-size: 13px; font-weight: 700; color: var(--gold); letter-spacing: .3px; }
        .diario-card-fontes { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
        .diario-edit-btn { margin-left: auto; cursor: pointer; background: transparent; border: none; color: var(--faint);
          font-size: 15px; line-height: 1; padding: 0 3px; }
        .diario-edit-btn:hover { color: var(--gold); }
        .diario-del { cursor: pointer; background: transparent; border: none; color: var(--faint);
          font-size: 20px; line-height: 1; padding: 0 4px; }
        .diario-del:hover { color: var(--coral); }
        .diario-edit { display: flex; flex-direction: column; gap: 10px; margin-bottom: 4px; }
        .diario-edit-actions { display: flex; gap: 8px; justify-content: flex-end; }
        .diario-edit-cancel { cursor: pointer; background: transparent; border: none; color: var(--muted);
          font: inherit; font-size: 13px; padding: 8px 12px; }
        .diario-edit-cancel:hover { color: var(--text); }
        .diario-edit-save { cursor: pointer; background: var(--green); color: #fff; border: none; border-radius: 10px;
          padding: 9px 18px; font: inherit; font-size: 13px; font-weight: 700; }
        .diario-edit-save:hover { filter: brightness(1.05); }
        .diario-txt { margin: 0 0 12px; font-size: 15px; line-height: 1.55; color: var(--text); }
        .diario-chips { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
        .diario-chip { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 700;
          border: 1px solid transparent; border-radius: 999px; padding: 3px 6px 3px 11px; }
        .diario-chip-x { cursor: pointer; background: transparent; border: none; color: inherit; opacity: .55;
          font-size: 14px; line-height: 1; padding: 0 2px; }
        .diario-chip-x:hover { opacity: 1; }
        .diario-chip-none { font-size: 12px; color: var(--faint); font-style: italic; }
        .diario-addmat { position: relative; }
        .diario-addmat summary { list-style: none; cursor: pointer; width: 24px; height: 24px; border-radius: 999px;
          border: 1px dashed var(--line-2); color: var(--muted); display: inline-flex; align-items: center;
          justify-content: center; font-size: 15px; font-weight: 700; }
        .diario-addmat summary::-webkit-details-marker { display: none; }
        .diario-addmat summary:hover { color: var(--gold); border-color: var(--gold); }
        .diario-addmat-pop { position: absolute; z-index: 50; top: 30px; left: 0; background: var(--surface-2);
          border: 1px solid var(--line-2); border-radius: 12px; padding: 6px; display: flex; flex-direction: column;
          gap: 2px; box-shadow: 0 10px 30px rgba(0,0,0,.35); max-height: 260px; overflow-y: auto; min-width: 220px; }
        .diario-addmat-pop button { cursor: pointer; background: transparent; border: none; text-align: left;
          font: inherit; font-size: 13px; font-weight: 600; padding: 6px 10px; border-radius: 8px; }
        .diario-addmat-pop button:hover { background: var(--surface-3); }
        .diario-pop-group { font-size: 10px; letter-spacing: 1px; text-transform: uppercase; color: var(--muted);
          font-weight: 700; padding: 8px 10px 3px; }
        .diario-pop-new { color: var(--gold) !important; font-style: italic; }
        /* modal de criar tag */
        .diario-tagmodal-bg { position: fixed; inset: 0; z-index: 200; background: rgba(0,0,0,.55);
          display: flex; align-items: center; justify-content: center; padding: 20px; }
        .diario-tagmodal { background: var(--surface); border: 1px solid var(--line-2); border-radius: 16px;
          padding: 20px; width: 320px; max-width: 100%; display: flex; flex-direction: column; gap: 14px;
          box-shadow: 0 20px 60px rgba(0,0,0,.5); }
        .diario-tagmodal-title { font-size: 15px; font-weight: 700; color: var(--text); }
        .diario-tagmodal-input { background: var(--surface-2); color: var(--text); border: 1px solid var(--line);
          border-radius: 10px; padding: 10px 12px; font: inherit; font-size: 14px; }
        .diario-tagmodal-input:focus { outline: none; border-color: var(--gold); }
        .diario-tagmodal-colors { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
        .diario-swatch { cursor: pointer; width: 26px; height: 26px; border-radius: 999px; border: 2px solid transparent;
          padding: 0; }
        .diario-swatch.on { border-color: var(--text); box-shadow: 0 0 0 2px var(--surface), 0 0 0 4px var(--muted); }
        .diario-swatch-custom { cursor: pointer; width: 26px; height: 26px; border-radius: 999px; overflow: hidden;
          border: 1px dashed var(--line-2); display: inline-flex; position: relative; }
        .diario-swatch-custom input { position: absolute; inset: -6px; width: 40px; height: 40px; border: none;
          padding: 0; background: transparent; cursor: pointer; }
        .diario-tagmodal-preview { display: flex; }
        .diario-tagmodal-actions { display: flex; gap: 8px; align-items: center; }
        .diario-tagmodal-del { cursor: pointer; background: transparent; border: none; color: var(--coral);
          font: inherit; font-size: 13px; font-weight: 600; padding: 8px 4px; margin-right: auto; }
        .diario-tagmodal-del:hover { text-decoration: underline; }
        .diario-tagmodal-cancel { cursor: pointer; background: transparent; border: none; color: var(--muted);
          font: inherit; font-size: 13px; padding: 8px 12px; }
        .diario-tagmodal-cancel:hover { color: var(--text); }
        .diario-tagmodal-ok { cursor: pointer; background: var(--green); color: #fff; border: none; border-radius: 10px;
          padding: 9px 18px; font: inherit; font-size: 13px; font-weight: 700; }
        .diario-tagmodal-ok:hover { filter: brightness(1.05); }
        .diario-tagmodal-ok:disabled { cursor: default; background: var(--surface-3); color: var(--faint); filter: none; }
        @media (max-width: 640px) {
          .diario-add { align-self: stretch; text-align: center; }
          .diario-stats { grid-template-columns: 1fr; }
        }

        .edital-back { cursor: pointer; background: transparent; border: none; color: var(--muted); font: inherit;
          font-size: 13px; padding: 6px 0; margin-bottom: 6px; }
        .edital-back:hover { color: var(--gold); }
        .edital-tabs { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 22px; }
        .edital-tab { cursor: pointer; background: var(--surface); border: 1px solid var(--line-2); border-radius: 999px;
          padding: 9px 16px; font: inherit; font-size: 13px; font-weight: 600; color: var(--muted); transition: all .15s; }
        .edital-tab:hover { color: var(--text); border-color: var(--muted); }
        .edital-tab.active { background: var(--gold); color: var(--on-accent); border-color: var(--gold); }
        /* ===== Editais: tabela de acompanhamento (estilo Normio) ===== */
        .edital-table { background: var(--surface); border: 1px solid var(--line); border-radius: 14px; overflow: hidden; }
        .ed-head { display: flex; align-items: flex-end; gap: 12px; padding: 12px 16px 10px; background: var(--surface); border-bottom: 1px solid var(--line-2); }
        .ed-head-topic { font-size: 11px; font-weight: 700; letter-spacing: .8px; color: var(--muted); text-transform: uppercase; flex: 1; }
        .ed-checks { display: flex; align-items: center; flex-shrink: 0; }
        .ed-head .ed-checks { align-items: flex-end; }
        .ed-grp { display: flex; align-items: center; }
        .ed-grp.col { flex-direction: column; align-items: stretch; }
        .ed-grp-title { font-size: 10px; font-weight: 700; letter-spacing: .8px; text-transform: uppercase; color: var(--gold); text-align: center; margin-bottom: 5px; }
        .ed-cols { display: flex; }
        .ed-col { display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .ed-col.est { width: 58px; }
        .ed-col.rev { width: 34px; }
        .ed-collabel { font-size: 10.5px; color: var(--faint); font-weight: 600; text-align: center; line-height: 1.15; }
        .ed-vdiv { width: 1px; align-self: stretch; background: var(--line-2); margin: 0 9px; }
        .ed-vdiv.tall { min-height: 32px; }
        .ed-materia + .ed-materia .ed-band, .ed-head + .ed-materia .ed-band { border-top: 1px solid var(--line); }
        .ed-band { width: 100%; display: flex; align-items: center; gap: 10px; padding: 11px 16px; background: var(--surface-2);
          border: none; border-left: 3px solid var(--coral); cursor: pointer; font: inherit; text-align: left; }
        .ed-band:hover h3 { color: var(--gold); }
        .ed-band h3 { margin: 0; font-size: 14px; font-weight: 700; color: var(--coral); letter-spacing: .2px; transition: color .15s; }
        .mat-arrow { color: var(--gold); font-size: 11px; flex-shrink: 0; }
        .edital-count { margin-left: auto; font-size: 11px; color: var(--faint); }
        .edital-link { font-size: 10px; font-weight: 700; letter-spacing: .3px; text-transform: uppercase; color: var(--gold);
          background: rgba(240,200,90,.12); border: 1px solid rgba(240,200,90,.35); border-radius: 999px; padding: 2px 9px; }
        /* tag do bloco + peso (%) da matéria, e cabeçalho de cada bloco (edital TJSC) */
        .ed-bloco-tag { font-size: 10px; font-weight: 700; letter-spacing: .3px; text-transform: uppercase; border-radius: 999px; padding: 2px 9px; flex-shrink: 0; }
        .ed-bloco-tag.b1 { color: #6c9be6; background: rgba(127,168,230,.14); border: 1px solid rgba(127,168,230,.36); }
        .ed-bloco-tag.b2 { color: #b58ae6; background: rgba(199,155,255,.14); border: 1px solid rgba(199,155,255,.36); }
        .ed-bloco-tag.b3 { color: #d3a63f; background: rgba(230,192,96,.14); border: 1px solid rgba(230,192,96,.36); }
        .ed-imp { font-size: 10.5px; font-weight: 700; color: var(--muted); flex-shrink: 0; }
        .ed-bloco-sep { padding: 12px 16px 6px; font-size: 11px; font-weight: 800; letter-spacing: .8px; text-transform: uppercase; border-top: 1px solid var(--line); }
        .ed-bloco-sep.b1 { color: #6c9be6; } .ed-bloco-sep.b2 { color: #b58ae6; } .ed-bloco-sep.b3 { color: #d3a63f; }
        .ed-row { display: flex; align-items: center; gap: 12px; padding: 6px 16px; border-top: 1px solid var(--line); }
        .ed-row:hover { background: var(--surface-2); }
        .ed-topic { flex: 1; min-width: 0; display: flex; align-items: baseline; gap: 8px; font-size: 13px; line-height: 1.4; }
        .ed-row.d1 .ed-topic { padding-left: 22px; }
        .ed-row.d2 .ed-topic { padding-left: 44px; }
        .ed-row.done .edital-txt { color: var(--muted); }
        .ed-check { width: 17px; height: 17px; margin: 0; }
        .edital-n { color: var(--gold); font-weight: 700; flex-shrink: 0; min-width: 22px; }
        .edital-txt { font-weight: 400; }
        .edital-txt.b { font-weight: 650; }
        /* coluna e caixinha de Observações */
        .ed-col.note { width: 34px; }
        .ed-note-btn { width: 24px; height: 24px; border-radius: 7px; border: 1px solid var(--line-2);
          background: var(--surface); color: var(--faint); font-size: 13px; line-height: 1; cursor: pointer;
          display: flex; align-items: center; justify-content: center; transition: all .13s; }
        .ed-note-btn:hover { border-color: var(--gold); color: var(--gold); }
        .ed-note-btn.has { background: var(--gold); border-color: var(--gold); color: var(--on-accent); }
        .ed-note-btn.open { border-color: var(--gold); color: var(--gold); }
        .ed-obs-flag { color: var(--gold); font-size: 11px; flex-shrink: 0; }
        .ed-nota-badge { display: inline-flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700;
          min-width: 20px; padding: 1px 7px; border-radius: 99px; background: var(--green-bg); color: var(--green); flex-shrink: 0; }
        .ed-row.has-notas { background: var(--green-bg); box-shadow: inset 3px 0 0 var(--green); }
        .ed-row.has-notas:hover { filter: brightness(1.03); }
        .ed-row.has-obs { background: rgba(240,200,90,.10); border-left: 3px solid var(--gold); }
        .ed-row.has-obs:hover { background: rgba(240,200,90,.16); }
        .ed-note-edit { padding: 4px 16px 12px 40px; border-top: 1px solid var(--line); background: rgba(240,200,90,.06); }
        .ed-note-area { width: 100%; min-height: 66px; resize: vertical; box-sizing: border-box; font: inherit; font-size: 13px;
          line-height: 1.45; color: var(--text); background: var(--surface); border: 1px solid var(--line-2); border-radius: 9px; padding: 9px 11px; }
        .ed-note-area:focus { outline: none; border-color: var(--gold); }
        .ed-note-actions { display: flex; gap: 8px; margin-top: 8px; }
        .ed-note-save { cursor: pointer; border: none; border-radius: 8px; padding: 6px 16px; font: inherit; font-size: 12.5px;
          font-weight: 700; background: var(--gold); color: var(--on-accent); }
        .ed-note-save:hover { filter: brightness(1.06); }
        .ed-note-cancel, .ed-note-clear { cursor: pointer; border: 1px solid var(--line-2); border-radius: 8px; padding: 6px 14px;
          font: inherit; font-size: 12.5px; font-weight: 600; background: transparent; color: var(--muted); }
        .ed-note-cancel:hover { border-color: var(--muted); color: var(--text); }
        .ed-note-clear { color: var(--coral); border-color: transparent; }
        .ed-note-clear:hover { border-color: var(--coral); }
        /* nome do tópico clicável (edital TJSC) */
        .edital-txt-btn { border: none; background: transparent; padding: 0; margin: 0; text-align: left; cursor: pointer; color: inherit; font: inherit; }
        .edital-txt-btn:hover .edital-txt { color: var(--gold); text-decoration: underline; text-underline-offset: 2px; }
        /* página de notas de um tópico (caixinhas arrastáveis) */
        .tn-page { max-width: 860px; }
        .tn-title { margin: 2px 0 4px; }
        .tn-hint { color: var(--muted); font-size: 13px; margin: 0 0 22px; }
        .tn-list { display: flex; flex-direction: column; }
        .tn-box { position: relative; background: var(--surface); border: 1px solid var(--line); border-radius: 16px;
          padding: 14px 16px 14px 42px; margin: 10px 0; transition: border-color .15s, box-shadow .15s; }
        .tn-box:focus-within { border-color: var(--gold); box-shadow: 0 0 0 4px rgba(250,204,21,.10); }
        .tn-box.over { box-shadow: 0 -3px 0 -1px var(--gold); }
        .tn-handle { position: absolute; left: 8px; top: 12px; width: 24px; height: 30px; display: flex; align-items: center;
          justify-content: center; color: var(--faint); cursor: grab; border-radius: 7px; user-select: none; font-size: 16px; }
        .tn-handle:hover { background: var(--surface-3); color: var(--text); }
        .tn-handle:active { cursor: grabbing; }
        .tn-del { position: absolute; right: 10px; top: 10px; border: none; background: transparent; color: var(--faint);
          cursor: pointer; font-size: 14px; border-radius: 7px; width: 26px; height: 26px; opacity: 0; transition: .15s; }
        .tn-box:hover .tn-del, .tn-box:focus-within .tn-del { opacity: 1; }
        .tn-del:hover { background: var(--surface-3); color: var(--coral); }
        .tn-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
        .tn-tag { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 99px; }
        .tn-tag-x { cursor: pointer; opacity: .55; font-weight: 700; }
        .tn-tag-x:hover { opacity: 1; }
        .tn-content { outline: none; font-size: 15px; line-height: 1.62; min-height: 24px; color: var(--text); }
        .tn-content:empty::before { content: attr(data-ph); color: var(--faint); }
        .tn-content b, .tn-content strong { font-weight: 700; }
        .tn-content u { text-decoration: underline; }
        .tn-toolbar { display: none; gap: 4px; align-items: center; flex-wrap: wrap; margin-top: 10px; padding-top: 10px; border-top: 1px dashed var(--line-2); }
        .tn-box:focus-within .tn-toolbar { display: flex; }
        .tn-tb { border: 1px solid var(--line-2); background: var(--surface-2); color: var(--text); border-radius: 8px; height: 30px;
          min-width: 30px; padding: 0 8px; cursor: pointer; font-size: 13px; display: inline-flex; align-items: center; justify-content: center; font-family: inherit; }
        .tn-tb:hover { background: var(--surface-3); }
        .tn-tb.b { font-weight: 800; } .tn-tb.i { font-style: italic; font-family: Georgia, serif; } .tn-tb.u { text-decoration: underline; }
        .tn-sep { width: 1px; height: 20px; background: var(--line-2); margin: 0 3px; }
        .tn-lbl { font-size: 11px; color: var(--muted); margin: 0 2px 0 4px; }
        .tn-sw-row { display: inline-flex; gap: 4px; align-items: center; }
        .tn-sw { width: 20px; height: 20px; border-radius: 6px; cursor: pointer; border: 1px solid rgba(128,128,128,.35); position: relative; }
        .tn-sw:hover { transform: scale(1.12); }
        .tn-sw.none { background: transparent; border-style: dashed; }
        .tn-sw.none::after { content: ""; position: absolute; left: 2px; right: 2px; top: 9px; height: 1.5px; background: var(--coral); transform: rotate(-45deg); }
        .tn-sw.pick { background: conic-gradient(red, orange, yellow, lime, cyan, blue, magenta, red); border-radius: 50%; overflow: hidden; }
        .tn-sw.pick input { position: absolute; inset: 0; opacity: 0; cursor: pointer; padding: 0; border: 0; width: 100%; height: 100%; }
        .tn-add { margin-top: 14px; border: 1.5px dashed var(--line-2); background: transparent; color: var(--muted);
          border-radius: 14px; padding: 14px; width: 100%; cursor: pointer; font-size: 14px; font-weight: 500; font-family: inherit; }
        .tn-add:hover { border-color: var(--gold); color: var(--gold); }
        @media (max-width: 720px) {
          .ed-col.est { width: 40px; }
          .ed-col.rev { width: 27px; }
          .ed-col.note { width: 28px; }
          .ed-note-btn { width: 22px; height: 22px; }
          .ed-collabel { font-size: 9px; }
          .ed-vdiv { margin: 0 5px; }
          .ed-head, .ed-band, .ed-row { padding-left: 10px; padding-right: 10px; gap: 8px; }
          .ed-note-edit { padding-left: 12px; padding-right: 10px; }
        }
        .to-top { position: fixed; right: 22px; bottom: 22px; width: 46px; height: 46px; border-radius: 50%;
          border: 1px solid var(--line-2); background: var(--surface-2); color: var(--gold); font-size: 20px; line-height: 1;
          cursor: pointer; box-shadow: 0 6px 18px rgba(0,0,0,.28); opacity: 0; transform: translateY(12px); pointer-events: none;
          transition: opacity .2s, transform .2s, background .15s; z-index: 200; }
        .to-top.show { opacity: 1; transform: translateY(0); pointer-events: auto; }
        .to-top:hover { background: var(--gold); color: var(--on-accent); }

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
        .man-add { display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap; }
        .man-nome { flex: 1; min-width: 180px; background: var(--surface-2); border: 1px solid var(--line-2);
          border-radius: 9px; padding: 9px 11px; font: inherit; font-size: 13px; color: var(--text); }
        .man-ano { width: 70px; background: var(--surface-2); border: 1px solid var(--line-2); border-radius: 9px;
          padding: 9px 10px; font: inherit; font-size: 13px; color: var(--text); text-align: center; }
        .man-banca { width: 110px; background: var(--surface-2); border: 1px solid var(--line-2); border-radius: 9px;
          padding: 9px 10px; font: inherit; font-size: 13px; color: var(--text); text-align: center; }
        .man-nome:focus, .man-ano:focus, .man-banca:focus { outline: none; border-color: var(--coral); }
        .man-btn { cursor: pointer; background: var(--surface-3); border: 1px solid var(--line-2); border-radius: 9px;
          padding: 9px 14px; font: inherit; font-size: 13px; font-weight: 600; color: var(--text); }
        .man-btn:hover { border-color: var(--coral); color: var(--coral); }
        .man-tag { font-size: 9.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .4px; color: var(--coral);
          border: 1px solid var(--coral); border-radius: 999px; padding: 1px 6px; margin-left: 8px; vertical-align: middle; }
        .man-del { border: none; background: transparent; cursor: pointer; font-size: 14px; line-height: 1; padding: 2px 5px;
          flex-shrink: 0; opacity: .45; filter: grayscale(.3); transition: opacity .15s, transform .1s; }
        .man-del:hover { opacity: 1; transform: scale(1.15); }

        /* ===== refinamentos: popover, post-it ===== */
        .root { overflow-x: clip; }
        .pop { width: 300px; left: 50%; margin-left: -150px; max-width: calc(100vw - 28px); }
        @media (max-width: 640px){ .pop { width: calc(100vw - 28px); margin-left: calc(-50vw + 14px); } }
        .postit { background: var(--surface); color: var(--text); border: 1px solid var(--line-2); border-left: 3px solid var(--gold);
          border-radius: 14px; box-shadow: 0 8px 22px rgba(0,0,0,.18); transform: none; padding: 16px 16px 18px; }
        .postit-head { color: var(--gold); border-bottom: 1px solid var(--line); font-weight: 700; letter-spacing: .6px; }
        .postit-add input { background: var(--surface-2); border: 1px solid var(--line-2); color: var(--text); border-radius: 8px; }
        .postit-add input::placeholder { color: var(--faint); }
        .postit-add button { background: var(--gold); color: var(--on-accent); border-radius: 8px; }
        .postit-empty { color: var(--faint); }
        .postit-item { border-bottom: 1px solid var(--line); }
        .postit-item.done span { color: var(--faint); }
        .postit-x { color: var(--faint); }

        /* ===== ESTUDEI: telas de estrutura vazias ===== */
        .es-page { max-width: 980px; }
        .es-sub { font-size: 13.5px; color: var(--muted); margin: 0 0 14px; max-width: 640px; line-height: 1.55; }
        .es-hint { display: inline-flex; align-items: center; gap: 8px; font-size: 12.5px; color: var(--muted);
          background: var(--surface-2); border: 1px solid var(--line-2); border-radius: 999px; padding: 7px 14px; margin: 2px 0 22px; }
        .es-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(215px, 1fr)); gap: 14px; }
        .es-box { border: 1.5px dashed var(--line-2); border-radius: 16px; padding: 16px 16px 14px; background: var(--surface);
          min-height: 98px; display: flex; flex-direction: column; gap: 6px; transition: border-color .15s; }
        .es-box:hover { border-color: var(--gold); }
        .es-box .es-t { font-size: 13.5px; font-weight: 700; color: var(--text); letter-spacing: -.1px; }
        .es-box .es-d { font-size: 12px; color: var(--faint); line-height: 1.45; }
        .es-box .es-empty { margin-top: auto; font-size: 11px; color: var(--faint); font-style: italic; opacity: .75; }

        /* ===== Registrar estudo (botão flutuante + janelinha) ===== */
        .reg-fab { position: fixed; right: 20px; bottom: 20px; z-index: 400; display: inline-flex; align-items: center; gap: 8px;
          background: var(--gold); color: var(--on-accent); border: none; border-radius: 999px; padding: 12px 18px; cursor: pointer;
          font: inherit; font-size: 14px; font-weight: 700; box-shadow: 0 8px 24px rgba(0,0,0,.28); }
        .reg-fab:hover { filter: brightness(1.05); }
        .reg-fab-ic { font-size: 18px; line-height: 1; margin-top: -1px; }
        @media (max-width: 640px){ .reg-fab-tx { display: none; } .reg-fab { padding: 15px; } .reg-fab-ic { margin: 0; } }

        .reg-overlay { position: fixed; inset: 0; z-index: 600; background: rgba(0,0,0,.5); backdrop-filter: blur(2px);
          display: flex; align-items: flex-start; justify-content: center; padding: 40px 16px; overflow-y: auto; }
        .reg-modal { width: 560px; max-width: 100%; background: var(--surface); border: 1px solid var(--line-2); border-radius: 18px;
          box-shadow: 0 20px 60px rgba(0,0,0,.4); overflow: hidden; }
        .reg-head { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid var(--line);
          font-size: 16px; font-weight: 700; color: var(--text); }
        .reg-close { background: transparent; border: none; color: var(--faint); font-size: 24px; line-height: 1; cursor: pointer; }
        .reg-close:hover { color: var(--text); }
        .reg-body { padding: 6px 20px 18px; display: flex; flex-direction: column; }
        .reg-lbl { font-size: 11px; letter-spacing: .5px; text-transform: uppercase; color: var(--faint); font-weight: 700; margin: 12px 0 6px; }
        .reg-opt { text-transform: none; letter-spacing: 0; font-weight: 500; color: var(--faint); }
        .reg-when { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-top: 6px; }
        .reg-pill, .reg-chip { background: var(--surface-2); border: 1px solid var(--line-2); color: var(--muted); border-radius: 999px;
          padding: 7px 14px; font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; }
        .reg-pill.on { background: var(--gold); color: var(--on-accent); border-color: var(--gold); }
        .reg-fontes { display: flex; gap: 8px; flex-wrap: wrap; }
        .reg-date { background: var(--surface-2); border: 1px solid var(--line-2); color: var(--text); border-radius: 8px; padding: 7px 10px; font: inherit; font-size: 13px; }
        .reg-in { width: 100%; background: var(--surface-2); border: 1px solid var(--line-2); color: var(--text); border-radius: 10px;
          padding: 10px 12px; font: inherit; font-size: 14px; box-sizing: border-box; }
        .reg-in::placeholder { color: var(--faint); }
        .reg-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .reg-3col { display: grid; grid-template-columns: 1.4fr 1fr 1fr; gap: 12px; align-items: end; }
        @media (max-width: 560px){ .reg-2col, .reg-3col { grid-template-columns: 1fr; } }
        .reg-time { display: flex; align-items: center; gap: 6px; }
        .reg-time span { color: var(--faint); font-size: 13px; }
        .reg-num { text-align: center; }
        .reg-area { min-height: 62px; resize: vertical; }
        .reg-check { display: flex; align-items: center; gap: 9px; margin-top: 16px; font-size: 13.5px; color: var(--text); cursor: pointer; }
        .reg-check small { color: var(--faint); }
        .reg-foot { display: flex; justify-content: flex-end; gap: 10px; padding: 14px 20px; border-top: 1px solid var(--line); }
        .reg-cancel { background: transparent; border: 1px solid var(--line-2); color: var(--muted); border-radius: 10px; padding: 9px 18px; font: inherit; font-weight: 600; cursor: pointer; }
        .reg-save { background: var(--gold); color: var(--on-accent); border: none; border-radius: 10px; padding: 9px 22px; font: inherit; font-weight: 700; cursor: pointer; }
        .reg-save:disabled { opacity: .45; cursor: not-allowed; }
        .reg-toast { position: fixed; left: 50%; bottom: 26px; transform: translateX(-50%); z-index: 700; background: var(--green);
          color: #06210f; font-weight: 700; font-size: 13.5px; padding: 10px 18px; border-radius: 999px; box-shadow: 0 8px 24px rgba(0,0,0,.3); }

        /* ===== Histórico dos registros ===== */
        .hist-day { margin-top: 18px; }
        .hist-dayhead { display: flex; justify-content: space-between; align-items: baseline; padding: 0 4px 8px; border-bottom: 1px solid var(--line);
          font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: var(--muted); }
        .hist-daytot { color: var(--gold2); }
        .hist-row { display: flex; align-items: center; gap: 12px; padding: 12px 4px; border-bottom: 1px solid var(--line); }
        .hist-bar { width: 4px; align-self: stretch; border-radius: 3px; flex: none; }
        .hist-main { flex: 1; min-width: 0; }
        .hist-mat { font-size: 14px; font-weight: 600; color: var(--text); }
        .hist-top { color: var(--muted); font-weight: 500; }
        .hist-com { font-size: 12.5px; color: var(--faint); margin-top: 2px; }
        .hist-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; justify-content: flex-end; }
        .hist-qa, .hist-tempo { font-size: 12.5px; color: var(--muted); font-variant-numeric: tabular-nums; }
        .hist-fonte { font-size: 11.5px; font-weight: 700; padding: 3px 9px; border-radius: 999px; white-space: nowrap; }
        .hist-done { font-size: 11px; font-weight: 700; color: var(--green); white-space: nowrap; }
        .hist-del { background: transparent; border: none; color: var(--faint); font-size: 18px; line-height: 1; cursor: pointer; flex: none; }
        .hist-del:hover { color: var(--coral); }
        .hist-edit { background: transparent; border: none; color: var(--faint); font-size: 15px; line-height: 1; cursor: pointer; flex: none; }
        .hist-edit:hover { color: var(--gold); }
        @media (max-width: 560px){ .hist-row { flex-wrap: wrap; } .hist-meta { width: 100%; justify-content: flex-start; } }

        /* ===== Ciclos (pizzas) ===== */
        .ciclo-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 14px; margin-top: 6px; }
        .ciclo-card { background: var(--surface); border: 1px solid var(--line-2); border-radius: 16px; padding: 18px 14px 16px; text-align: center; }
        .ciclo-donut { width: 106px; height: 106px; margin: 0 auto; border-radius: 50%;
          background: conic-gradient(var(--c) calc(var(--p) * 1%), var(--surface-2) 0); display: grid; place-items: center; }
        .ciclo-hole { width: 74px; height: 74px; border-radius: 50%; background: var(--surface); display: grid; place-items: center; }
        .ciclo-hole b { font-size: 15px; font-weight: 700; color: var(--text); font-variant-numeric: tabular-nums; }
        .ciclo-nm { font-size: 14px; font-weight: 700; margin-top: 11px; }
        .ciclo-mt { font-size: 11.5px; color: var(--faint); margin-top: 3px; }

        /* ===== Constância ===== */
        .es-consta { margin-top: 8px; }
        .consta-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 12px;
          font-size: 13px; font-weight: 600; color: var(--muted); }
        .consta-head b { color: var(--gold2); font-size: 14px; }
        .consta-strip { display: grid; grid-template-columns: repeat(auto-fill, minmax(20px, 1fr)); gap: 6px; }
        .consta-day { aspect-ratio: 1; border-radius: 6px; background: var(--surface-2); border: 1px solid var(--line-2); }
        .consta-day.on { background: var(--gold); border-color: transparent; }
        .consta-day.today { outline: 2px solid var(--gold); outline-offset: 2px; }
        .sechead-es { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: var(--muted); margin: 26px 4px 12px; }

        /* ===== banner de entrada do ESTUDEI + bolinhas de cor ===== */
        .es-hero { position: relative; margin-top: 4px; }
        .es-hero-cor { position: absolute; top: 16px; right: 18px; display: flex; gap: 8px; }
        .cor-dot { width: 21px; height: 21px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; padding: 0; transition: transform .12s, border-color .15s; }
        .cor-dot:hover { transform: scale(1.15); }
        .cor-dot.on { border-color: #fff; box-shadow: 0 0 0 1px rgba(0,0,0,.3); }
        @media (max-width: 560px){ .es-hero-cor { position: static; justify-content: flex-end; margin-bottom: 14px; } }

        /* ===== Painel: frase, data da prova, meta ===== */
        .frase-card { display: flex; align-items: center; gap: 12px; margin-top: 8px; }
        .frase-mk { font-family: Georgia, "Times New Roman", serif; font-size: 40px; line-height: .5; color: var(--gold); opacity: .55; }
        .frase-tx { font-size: 15px; font-style: italic; color: var(--text); }
        .painel-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px; }
        @media (max-width: 720px){ .painel-2col { grid-template-columns: 1fr; } }

        /* checklist rápido do ESTUDEI — bem destacado */
        .checkes { margin: 20px 0 4px; background: color-mix(in srgb, var(--gold) 12%, var(--surface));
          border: 1px solid color-mix(in srgb, var(--gold) 45%, var(--line)); border-left: 5px solid var(--gold);
          border-radius: 16px; padding: 16px 18px; box-shadow: 0 6px 22px color-mix(in srgb, var(--gold) 18%, transparent); }
        .checkes-head { font-weight: 800; letter-spacing: .4px; font-size: 13.5px; color: var(--gold);
          margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid color-mix(in srgb, var(--gold) 30%, var(--line)); }
        .checkes-add { display: flex; gap: 8px; margin-bottom: 12px; }
        .checkes-add input { flex: 1; min-width: 0; background: var(--surface); border: 1px solid var(--line-2);
          color: var(--text); border-radius: 10px; padding: 10px 12px; font: inherit; font-size: 13.5px; }
        .checkes-add input::placeholder { color: var(--faint); }
        .checkes-add input:focus { outline: none; box-shadow: 0 0 0 2px color-mix(in srgb, var(--gold) 45%, transparent); }
        .checkes-add button { width: 40px; flex-shrink: 0; border: none; border-radius: 10px; background: var(--gold);
          color: var(--on-accent, #10141a); font-size: 20px; font-weight: 700; cursor: pointer; line-height: 1; }
        .checkes-add button:hover { filter: brightness(1.08); }
        .checkes-list { display: flex; flex-direction: column; max-height: 340px; overflow-y: auto; }
        .checkes-empty { font-size: 13px; color: var(--faint); font-style: italic; padding: 4px 2px; }
        .checkes-item { display: flex; align-items: flex-start; gap: 10px; font-size: 14px; line-height: 1.4;
          padding: 9px 2px; border-bottom: 1px solid var(--line); }
        .checkes-item:last-child { border-bottom: none; }
        .checkes-item input[type=checkbox] { accent-color: var(--gold); margin-top: 2px; width: 16px; height: 16px; flex-shrink: 0; }
        .checkes-item span { flex: 1; color: var(--text); }
        .checkes-item.done span { text-decoration: line-through; color: var(--faint); }
        .checkes-x { border: none; background: transparent; color: var(--faint); cursor: pointer; font-size: 18px; line-height: 1; padding: 0 2px; flex-shrink: 0; }
        .checkes-x:hover { color: var(--coral); }
        .dp-card, .meta-card { display: flex; flex-direction: column; margin-top: 0; }
        .dp-lbl { font-size: 12px; letter-spacing: .4px; text-transform: uppercase; color: var(--faint); font-weight: 700; }
        .dp-big { font-size: 34px; font-weight: 800; color: var(--text); margin: 8px 0 2px; font-variant-numeric: tabular-nums; }
        .dp-big small { font-size: 15px; font-weight: 600; color: var(--muted); }
        .dp-date { font-size: 13px; color: var(--muted); display: flex; align-items: center; }
        .dp-edit { background: transparent; border: none; color: var(--gold); font: inherit; font-size: 12.5px; font-weight: 600; cursor: pointer; margin-left: 8px; }
        .dp-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px; }
        .meta-head { display: flex; justify-content: space-between; align-items: center; font-size: 12px; letter-spacing: .4px; text-transform: uppercase; color: var(--faint); font-weight: 700; margin-bottom: 14px; }
        .meta-row { margin-bottom: 14px; }
        .meta-row:last-child { margin-bottom: 0; }
        .meta-lab { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px; color: var(--text); }
        .meta-lab span { color: var(--muted); font-variant-numeric: tabular-nums; }
        .meta-track { height: 8px; border-radius: 999px; background: var(--surface-2); overflow: hidden; }
        .meta-track i { display: block; height: 100%; background: var(--gold); border-radius: 999px; }
        .meta-editrow { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
        .meta-editrow label { font-size: 13px; color: var(--muted); }
        .meta-editrow input { width: 100px; }

        /* ===== Matérias ===== */
        .mat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px; margin-top: 6px; }
        .mat-cols { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 10px; align-items: start; }
        .mat-col { display: flex; flex-direction: column; gap: 12px; }
        .mat-col-head { font-size: 11px; font-weight: 800; letter-spacing: .8px; text-transform: uppercase; padding: 6px 4px 4px; border-bottom: 1px solid var(--line); }
        .mat-col-head.b1 { color: #6c9be6; } .mat-col-head.b2 { color: #b58ae6; } .mat-col-head.b3 { color: #d3a63f; }
        .mat-col-head.outras { color: var(--muted); margin-top: 22px; }
        @media (max-width: 720px) { .mat-cols { grid-template-columns: 1fr; } }
        .mat-peso { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
        .mat-peso-txt { font-size: 12.5px; color: var(--muted); }
        .mat-peso-txt b { color: var(--gold2); font-weight: 700; }
        .mat-card { text-align: left; background: var(--surface); border: 1px solid var(--line-2); border-radius: 16px; padding: 16px 18px; cursor: pointer; font: inherit; color: var(--text); transition: border-color .15s; }
        .mat-card:hover { border-color: var(--gold); }
        .mat-nome { font-size: 14.5px; font-weight: 700; color: var(--coral); }
        .mat-stats { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 8px; font-size: 12.5px; color: var(--muted); }
        .mat-perc { color: var(--gold2); font-weight: 700; }
        .mat-topcards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 4px; }
        .mat-topcards .panel { margin-top: 0; }
        .mat-big { font-size: 26px; }
        .mat-big small { font-size: 14px; color: var(--muted); font-weight: 600; }
        @media (max-width: 560px){ .mat-topcards { grid-template-columns: 1fr; } }

        /* ===== Revisões ===== */
        .rev-tabs { display: flex; gap: 8px; margin: 6px 0 16px; flex-wrap: wrap; }
        .rev-tab { background: var(--surface-2); border: 1px solid var(--line-2); color: var(--muted); border-radius: 999px; padding: 7px 14px; font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; }
        .rev-tab.on { background: var(--gold); color: var(--on-accent); border-color: var(--gold); }
        .rev-n { opacity: .7; font-size: 11.5px; }
        .rev-item { display: flex; align-items: center; gap: 12px; padding: 12px 4px; border-bottom: 1px solid var(--line); }
        .rev-when { font-size: 12px; color: var(--faint); margin-top: 2px; }
        .rev-actions { display: flex; gap: 8px; flex: none; }
        .rev-btn { background: var(--surface-2); border: 1px solid var(--line-2); color: var(--muted); border-radius: 8px; padding: 6px 12px; font: inherit; font-size: 12.5px; font-weight: 600; cursor: pointer; }
        .rev-btn:hover { color: var(--text); }
        .rev-btn.ok { background: var(--green-bg); border-color: transparent; color: var(--green); }
        @media (max-width: 560px){ .rev-item { flex-wrap: wrap; } .rev-actions { width: 100%; } }

        /* ===== Estatísticas ===== */
        .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; margin-top: 6px; }
        .stat-grid .panel { margin-top: 0; }
        .stat-desemp { text-align: center; }
        .desemp-donut { width: 110px; height: 110px; margin: 12px auto 6px; border-radius: 50%;
          background: conic-gradient(var(--green) calc(var(--p) * 1%), color-mix(in srgb, var(--coral) 55%, transparent) 0); display: grid; place-items: center; }
        .stat-sub { font-size: 12px; color: var(--muted); margin-top: 4px; }
      `}</style>

      <button
        className="nav-toggle"
        onClick={() => setNavOpen((v) => !v)}
        aria-label={navOpen ? "Recolher menu" : "Abrir menu"}
        aria-expanded={navOpen}
        title={navOpen ? "Recolher menu" : "Abrir menu"}
      >
        {navOpen ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="16" rx="2" /><line x1="9" y1="4" x2="9" y2="20" />
            <path d="M15 9l-2 3 2 3" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" />
          </svg>
        )}
      </button>

      <div
        className={`nav-backdrop${navOpen ? " active" : ""}`}
        onClick={() => setNavOpen(false)}
        aria-hidden="true"
      />

      <aside className={`sidebar${navOpen ? "" : " closed"}`} aria-label="Navegação">
        <div className="side-logo">
          <span className="mark">⚖</span>
          <span className="name">MagisNAD</span>
        </div>
        {NAV_GROUPS.map((g) => (
          <div className="nav-group" key={g.label}>
            <div className="nav-group-label">{g.label}</div>
            {g.items.map((it) => {
              const active =
                it.kind === "view" ? view === it.view
                : it.kind === "home" ? (view === "main" && !showTop)
                : (view === "main" && showTop && activeSec === it.key);
              const handle = (e) => {
                e.preventDefault();
                setOpenTopic(null); // fecha a página de notas do tópico ao navegar pelo menu (senão fica sobreposta)
                if (it.kind === "view") { setView(it.view); window.scrollTo(0, 0); }
                else if (it.kind === "home") { setView("main"); window.scrollTo({ top: 0, behavior: "smooth" }); }
                else { setView("main"); setTimeout(() => goTo(it.key), 0); }
                closeNavIfNarrow();
              };
              return (
                <button key={it.key} className={`nav-item${active ? " active" : ""}`} onClick={handle}>
                  {it.n ? <span className="nav-n">{it.n}</span> : <Ic n={it.icon} />}
                  <span className="lbl">{it.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </aside>

      <button className="reg-fab" onClick={() => abrirRegistro(null)} title="Registrar estudo">
        <span className="reg-fab-ic">＋</span><span className="reg-fab-tx">Registrar estudo</span>
      </button>
      {regOpen && <RegistroModal inicial={regEditing} onClose={fecharRegistro} onSave={upsertRegistro} />}
      {regToast && <div className="reg-toast">Estudo registrado ✓</div>}

      <div className="wrap">
        {openTopic && (() => {
          const tcell = editalCell((editaisData[openTopic.editalId] || {})[openTopic.key]);
          const initial = tcell.notas && tcell.notas.length
            ? tcell.notas
            : (tcell.obs && tcell.obs.trim()
                ? [{ id: "seed", html: tcell.obs.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\n/g, "<br>"), tags: [] }]
                : []);
          return (
            <TopicNotes
              key={openTopic.editalId + "|" + openTopic.key}
              label={openTopic.label}
              materia={openTopic.materia}
              initial={initial}
              onBack={() => setOpenTopic(null)}
              onSave={(notas) => saveEditalNotes(openTopic.editalId, openTopic.key, notas)}
            />
          );
        })()}
        {view === "editais" && !openTopic && (
          <section className="editais-page">
            <button className="edital-back" onClick={() => setView("es-painel")}>← Voltar ao painel</button>
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
                  const RICH = ed.id === "tjsc-juiz-2025"; // este edital usa página de notas por tópico
                  const BLOCOS = RICH ? TJSC_BLOCOS : null; // matéria → { bloco, importância }
                  // ordem de exibição das matérias: por bloco (I→II→III) e, dentro, da mais pra menos importante
                  const matOrder = ed.materias.map((m, mi) => ({ m, mi }));
                  if (BLOCOS) {
                    const ordKeys = Object.keys(BLOCOS);
                    const ordOf = (nome) => { const i = ordKeys.indexOf(nome); return i < 0 ? 999 : i; };
                    matOrder.sort((a, b) => {
                      const A = BLOCOS[a.m.nome] || { b: 9, imp: 0 };
                      const B = BLOCOS[b.m.nome] || { b: 9, imp: 0 };
                      return A.b - B.b || B.imp - A.imp || ordOf(a.m.nome) - ordOf(b.m.nome);
                    });
                  }
                  const renderNode = (node, key, depth) => {
                    const kids = node.subs || [];
                    const hasKids = kids.length > 0;
                    const bold = depth === 0 || hasKids;
                    const cell = editalCell(v[key]);
                    const hasNotas = !!(cell.notas && cell.notas.length);
                    const hasObs = !!(cell.obs && cell.obs.trim());
                    const flag = RICH ? (hasNotas || hasObs) : hasObs;
                    const noteKey = `${ed.id}|${key}`;
                    const noteOpen = openNote === noteKey;
                    const check = (c) => (
                      <span key={c.f} className={`ed-col ${c.rev ? "rev" : "est"}`}>
                        <input type="checkbox" className="ed-check" checked={!!cell[c.f]}
                          onChange={() => toggleEditalCell(ed.id, key, c.f)} aria-label={c.full || c.lbl} title={c.full || c.lbl} />
                      </span>
                    );
                    return (
                      <React.Fragment key={key}>
                        <div className={`ed-row d${depth}${editalDone(cell) ? " done" : ""}${RICH && hasNotas ? " has-notas" : flag ? " has-obs" : ""}`}>
                          <div className="ed-topic">
                            {node.n && <span className="edital-n">{node.n}</span>}
                            {RICH ? (
                              <button type="button" className="edital-txt-btn" title="Abrir minhas notas deste tópico" onClick={() => openTopicPage(ed, key, node)}>
                                <span className={`edital-txt${bold ? " b" : ""}`}>{node.txt}</span>
                              </button>
                            ) : (
                              <span className={`edital-txt${bold ? " b" : ""}`}>{node.txt}</span>
                            )}
                            {RICH && hasNotas ? (
                              <span className="ed-nota-badge" title={`${cell.notas.length} caixinha(s) de nota`}>✎</span>
                            ) : flag ? (
                              <span className="ed-obs-flag" title={RICH ? "Este tópico tem notas" : "Este tópico tem observação"}>✎</span>
                            ) : null}
                          </div>
                          <div className="ed-checks">
                            <div className="ed-grp">{ED_ESTUDO.map((c) => check(c))}</div>
                            <span className="ed-vdiv" />
                            <div className="ed-grp">{ED_REV.map((c) => check({ ...c, rev: true }))}</div>
                            <span className="ed-vdiv" />
                            <span className="ed-col note">
                              <button
                                type="button"
                                className={`ed-note-btn${flag ? " has" : ""}${noteOpen ? " open" : ""}`}
                                title={RICH ? "Abrir minhas notas deste tópico" : hasObs ? "Ver/editar observação" : "Adicionar observação"}
                                aria-label="Observações"
                                onClick={() => {
                                  if (RICH) { openTopicPage(ed, key, node); return; }
                                  if (noteOpen) { setOpenNote(null); }
                                  else { setNoteDraft(cell.obs || ""); setOpenNote(noteKey); }
                                }}
                              >✎</button>
                            </span>
                          </div>
                        </div>
                        {!RICH && noteOpen && (
                          <div className="ed-note-edit">
                            <textarea
                              className="ed-note-area"
                              value={noteDraft}
                              autoFocus
                              placeholder="Escreva sua observação sobre este tópico…"
                              onChange={(e) => setNoteDraft(e.target.value)}
                            />
                            <div className="ed-note-actions">
                              <button type="button" className="ed-note-save" onClick={() => saveEditalNote(ed.id, key, noteDraft)}>Salvar</button>
                              <button type="button" className="ed-note-cancel" onClick={() => setOpenNote(null)}>Cancelar</button>
                              {hasObs && <button type="button" className="ed-note-clear" onClick={() => saveEditalNote(ed.id, key, "")}>Apagar</button>}
                            </div>
                          </div>
                        )}
                        {kids.map((c, ci) => renderNode(c, `${key}.${ci}`, depth + 1))}
                      </React.Fragment>
                    );
                  };
                  return (
                    <div className="edital-table">
                      <div className="ed-head">
                        <div className="ed-topic ed-head-topic">Tópico</div>
                        <div className="ed-checks">
                          <div className="ed-grp col">
                            <div className="ed-grp-title">Estudo</div>
                            <div className="ed-cols">{ED_ESTUDO.map((c) => <span key={c.f} className="ed-col est ed-collabel" title={c.full || c.lbl}>{c.lbl}</span>)}</div>
                          </div>
                          <span className="ed-vdiv tall" />
                          <div className="ed-grp col">
                            <div className="ed-grp-title">Revisões</div>
                            <div className="ed-cols">{ED_REV.map((c) => <span key={c.f} className="ed-col rev ed-collabel">{c.lbl}</span>)}</div>
                          </div>
                          <span className="ed-vdiv tall" />
                          <div className="ed-grp col">
                            <div className="ed-grp-title">Obs.</div>
                            <div className="ed-cols"><span className="ed-col note ed-collabel">nota</span></div>
                          </div>
                        </div>
                      </div>
                      {matOrder.map(({ m, mi }, idx) => {
                        let done = 0, total = 0;
                        const countNode = (node, key) => {
                          total++; if (editalDone(editalCell(v[key]))) done++;
                          (node.subs || []).forEach((c, ci) => countNode(c, `${key}.${ci}`));
                        };
                        m.itens.forEach((it, ii) => countNode(it, `${mi}.${ii}`));
                        const matKey = `${ed.id}:${mi}`;
                        const matOpen = !!openMat[matKey];
                        const bl = BLOCOS ? BLOCOS[m.nome] : null;
                        const prevBl = BLOCOS && idx > 0 ? BLOCOS[matOrder[idx - 1].m.nome] : null;
                        const showHead = bl && (!prevBl || prevBl.b !== bl.b);
                        return (
                          <React.Fragment key={mi}>
                            {showHead && <div className={`ed-bloco-sep b${bl.b}`}>{BLOCO_LBL[bl.b]}</div>}
                            <div className="ed-materia">
                              <button className={`ed-band${matOpen ? " open" : ""}`} onClick={() => setOpenMat((p) => ({ ...p, [matKey]: !p[matKey] }))}>
                                <span className="mat-arrow">{matOpen ? "▾" : "▸"}</span>
                                <h3>{m.nome}</h3>
                                <span className="mono edital-count">{done}/{total}</span>
                              </button>
                              {matOpen && m.itens.map((it, ii) => renderNode(it, `${mi}.${ii}`, 0))}
                            </div>
                          </React.Fragment>
                        );
                      })}
                    </div>
                  );
                })()}
              </>
            )}
          </section>
        )}

        {view === "diario" && (
          <section className="diario-page">
            <button className="edital-back" onClick={() => setView("es-painel")}>← Voltar ao painel</button>
            <p className="eyebrow">Painel de Estudos</p>
            <h1 className="serif" style={{ marginBottom: 18 }}>Diário de Estudos</h1>

            <div className="diario-layout">
              <div className="diario-main">
              <div className="diario-compose">
              <input
                className="diario-titulo-input"
                placeholder="Título (ex.: FGV · TJSC · 2026) — opcional"
                value={composeTitulo}
                onChange={(e) => setComposeTitulo(e.target.value)}
              />

              <div className="diario-toolbar">
                <button type="button" title="Negrito" onMouseDown={(ev) => { ev.preventDefault(); fmtDiario("bold"); }} style={{ fontWeight: 800 }}>B</button>
                <button type="button" title="Itálico" onMouseDown={(ev) => { ev.preventDefault(); fmtDiario("italic"); }} style={{ fontStyle: "italic" }}>I</button>
                <button type="button" title="Sublinhado" onMouseDown={(ev) => { ev.preventDefault(); fmtDiario("underline"); }} style={{ textDecoration: "underline" }}>U</button>
                <button type="button" title="Tachado (⌘⇧X)" onMouseDown={(ev) => { ev.preventDefault(); fmtDiario("strikeThrough"); }} style={{ textDecoration: "line-through" }}>S</button>
              </div>

              <div
                ref={diarioRef}
                className="diario-input"
                contentEditable
                suppressContentEditableWarning
                data-placeholder="O que você estudou hoje?"
                onInput={(e) => setDiarioHasText(!!e.currentTarget.innerText.trim())}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); addDiario(); return; }
                  if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "x") { e.preventDefault(); fmtDiario("strikeThrough"); }
                }}
              />

              <div className="diario-compose-tags">
                <span className="diario-compose-lbl">Fonte</span>
                {diarioTags.fonte.map((t) => {
                  const on = composeFontes.includes(t.id);
                  return (
                    <span key={t.id} className={`diario-tagpick-wrap${on ? " on" : ""}`} style={on ? chipStyle(t.color) : { color: t.color }}>
                      <button type="button" className="diario-tagpick-lbl" onClick={() => toggleComposeFonte(t.id)}>{t.label}</button>
                      <button type="button" className="diario-tagpick-edit" title="Editar tag" onClick={() => openEditTag("fonte", t)}>✎</button>
                    </span>
                  );
                })}
                <button type="button" className="diario-tag-new"
                  onClick={() => setNewTag({ group: "fonte", label: "", color: TAG_COLOR_PRESETS[0], applyTo: { kind: "compose" } })}>＋ nova fonte</button>
              </div>

              <div className="diario-compose-tags">
                <span className="diario-compose-lbl">Matéria</span>
                {diarioTags.materia.map((t) => {
                  const on = composeMats.includes(t.id);
                  return (
                    <span key={t.id} className={`diario-tagpick-wrap${on ? " on" : ""}`} style={on ? chipStyle(t.color) : { color: t.color }}>
                      <button type="button" className="diario-tagpick-lbl" onClick={() => toggleComposeMat(t.id)}>{t.label}</button>
                      <button type="button" className="diario-tagpick-edit" title="Editar tag" onClick={() => openEditTag("materia", t)}>✎</button>
                    </span>
                  );
                })}
                <button type="button" className="diario-tag-new"
                  onClick={() => setNewTag({ group: "materia", label: "", color: TAG_COLOR_PRESETS[5], applyTo: { kind: "compose-mat" } })}>＋ nova matéria</button>
                <span className="diario-compose-hint">a matéria também é reconhecida sozinha pela frase</span>
              </div>

              <button className="diario-add" onClick={addDiario} disabled={!diarioHasText}>+ Registrar</button>
            </div>

            {diario.length === 0 ? (
              <p className="desc" style={{ marginTop: 24, textAlign: "center", opacity: .7 }}>Nenhum registro ainda. Escreva a primeira frase acima.</p>
            ) : (
              diarioPorDia().map((g) => (
                <div key={g.k} className="diario-dia">
                  <div className="diario-dia-head">{rotuloDia(g.ts)}</div>
                  {g.itens.map((e) => {
                    const titulo = e.titulo || e.contexto || "";
                    const html = e.html || e.texto || "";
                    const fontes = e.fontes || [];
                    const mats = e.mats || [];
                    return (
                    <div key={e.id} className="diario-card">
                      {fontes.length > 0 && (
                        <div className="diario-card-fontes">
                          {fontes.map((f) => {
                            const info = fonteTagInfo(f);
                            return (
                              <span key={f} className="diario-chip" style={chipStyle(info.color)}>
                                {info.label}
                                <button className="diario-chip-x" onClick={() => toggleFonteDiario(e.id, f)} title="Tirar esta tag">×</button>
                              </span>
                            );
                          })}
                        </div>
                      )}
                      {editId === e.id ? (
                        <div className="diario-edit">
                          <input className="diario-titulo-input" placeholder="Título (ex.: FGV · TJSC · 2026) — opcional"
                            value={editTitulo} onChange={(ev) => setEditTitulo(ev.target.value)} />
                          <div className="diario-toolbar">
                            <button type="button" title="Negrito" onMouseDown={(ev) => { ev.preventDefault(); fmtOn("bold", editRef); }} style={{ fontWeight: 800 }}>B</button>
                            <button type="button" title="Itálico" onMouseDown={(ev) => { ev.preventDefault(); fmtOn("italic", editRef); }} style={{ fontStyle: "italic" }}>I</button>
                            <button type="button" title="Sublinhado" onMouseDown={(ev) => { ev.preventDefault(); fmtOn("underline", editRef); }} style={{ textDecoration: "underline" }}>U</button>
                            <button type="button" title="Tachado (⌘⇧X)" onMouseDown={(ev) => { ev.preventDefault(); fmtOn("strikeThrough", editRef); }} style={{ textDecoration: "line-through" }}>S</button>
                          </div>
                          <div ref={editRef} className="diario-input" contentEditable suppressContentEditableWarning
                            onKeyDown={(ev) => {
                              if (ev.key === "Enter" && (ev.metaKey || ev.ctrlKey)) { ev.preventDefault(); saveEditDiario(e.id); return; }
                              if ((ev.metaKey || ev.ctrlKey) && ev.shiftKey && ev.key.toLowerCase() === "x") { ev.preventDefault(); fmtOn("strikeThrough", editRef); }
                            }} />
                          <div className="diario-edit-actions">
                            <button className="diario-edit-cancel" onClick={cancelEditDiario}>Cancelar</button>
                            <button className="diario-edit-save" onClick={() => saveEditDiario(e.id)}>Salvar</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="diario-card-top">
                            {titulo && <span className="diario-titulo">{titulo}</span>}
                            {fontes.length === 0 && e.tipo && <span className="diario-tipo">{e.tipo}</span>}
                            <button className="diario-edit-btn" title="Editar registro" onClick={() => startEditDiario(e)}>✎</button>
                            <button className="diario-del" title="Excluir registro" onClick={() => removeDiario(e.id)}>×</button>
                          </div>
                          <div className="diario-txt" dangerouslySetInnerHTML={{ __html: html }} />
                        </>
                      )}
                      <div className="diario-chips">
                        {fontes.length === 0 && mats.length === 0 && <span className="diario-chip-none">sem tags — toque em ＋ para marcar</span>}
                        {mats.map((m) => {
                          const info = matTagInfo(m);
                          return (
                            <span key={m} className="diario-chip" style={chipStyle(info.color)}>
                              {info.label}
                              <button className="diario-chip-x" onClick={() => toggleMatDiario(e.id, m)} title="Tirar esta matéria">×</button>
                            </span>
                          );
                        })}
                        <details className="diario-addmat">
                          <summary title="Adicionar tag">+</summary>
                          <div className="diario-addmat-pop">
                            <div className="diario-pop-group">Fonte</div>
                            {diarioTags.fonte.filter((t) => !fontes.includes(t.id)).map((t) => (
                              <button key={t.id} onClick={() => toggleFonteDiario(e.id, t.id)} style={{ color: t.color }}>{t.label}</button>
                            ))}
                            <button className="diario-pop-new" onClick={() => setNewTag({ group: "fonte", label: "", color: TAG_COLOR_PRESETS[0], applyTo: { kind: "card", cardId: e.id } })}>＋ nova fonte</button>
                            <div className="diario-pop-group">Matéria</div>
                            {materiaOptions().filter((o) => !mats.includes(o.id)).map((o) => (
                              <button key={o.id} onClick={() => toggleMatDiario(e.id, o.id)} style={{ color: o.color }}>{o.label}</button>
                            ))}
                            <button className="diario-pop-new" onClick={() => setNewTag({ group: "materia", label: "", color: TAG_COLOR_PRESETS[5], applyTo: { kind: "card", cardId: e.id } })}>＋ nova matéria</button>
                          </div>
                        </details>
                      </div>
                    </div>
                    );
                  })}
                </div>
              ))
            )}
              </div>

              <aside className="diario-side">
                <div className="diario-acomp">
                  <div className="diario-acomp-title">📊 Acompanhamento</div>
                  <div className="diario-acomp-tabs">
                    {[["semana", "Semana"], ["mes", "Mês"], ["ano", "Ano"], ["tudo", "Tudo"]].map(([id, lbl]) => (
                      <button key={id} type="button" className={`diario-acomp-tab${diarioPeriodo === id ? " on" : ""}`} onClick={() => setDiarioPeriodo(id)}>{lbl}</button>
                    ))}
                  </div>
                  {(() => {
                    const x = diarioExtrato(diarioPeriodo);
                    if (x.count === 0) return <p className="diario-acomp-empty">Nada registrado nesse período ainda.</p>;
                    const maxMat = x.mats[0] ? x.mats[0].n : 1;
                    const maxFonte = x.fontes[0] ? x.fontes[0].n : 1;
                    return (
                      <>
                        <div className="diario-acomp-big">{x.count}<small>{x.count === 1 ? "registro" : "registros"}</small></div>
                        <div className="diario-acomp-mini">
                          <div className="diario-acomp-cell"><b>{x.dias}</b><span>{x.dias === 1 ? "dia" : "dias"}</span></div>
                          <div className="diario-acomp-cell"><b>{Math.round(x.media)}</b><span>por dia</span></div>
                          <div className="diario-acomp-cell"><b>{x.streak}🔥</b><span>sequência</span></div>
                        </div>
                        {x.mats.length > 0 && (
                          <>
                            <div className="diario-acomp-sec">Por matéria</div>
                            {x.mats.slice(0, 6).map((m) => (
                              <div key={m.id} className="diario-acomp-row">
                                <span className="diario-acomp-row-lbl" style={{ color: m.color }}>{m.label}</span>
                                <span className="diario-acomp-track"><i style={{ width: `${Math.max(6, Math.round(m.n / maxMat * 100))}%`, background: m.color }} /></span>
                                <span className="diario-acomp-n">{m.n}</span>
                              </div>
                            ))}
                          </>
                        )}
                        {x.fontes.length > 0 && (
                          <>
                            <div className="diario-acomp-sec">Por fonte</div>
                            {x.fontes.slice(0, 6).map((f) => (
                              <div key={f.id} className="diario-acomp-row">
                                <span className="diario-acomp-row-lbl" style={{ color: f.color }}>{f.label}</span>
                                <span className="diario-acomp-track"><i style={{ width: `${Math.max(6, Math.round(f.n / maxFonte * 100))}%`, background: f.color }} /></span>
                                <span className="diario-acomp-n">{f.n}</span>
                              </div>
                            ))}
                          </>
                        )}
                      </>
                    );
                  })()}
                </div>
              </aside>
            </div>

            {newTag && (
              <div className="diario-tagmodal-bg" onClick={() => setNewTag(null)}>
                <div className="diario-tagmodal" onClick={(ev) => ev.stopPropagation()}>
                  <div className="diario-tagmodal-title">{newTag.mode === "edit" ? "Editar" : "Nova"} tag de {newTag.group === "fonte" ? "Fonte" : "Matéria"}</div>
                  <input
                    autoFocus
                    className="diario-tagmodal-input"
                    placeholder={newTag.group === "fonte" ? "Ex.: Súmula, etc." : "Ex.: Prática, etc."}
                    value={newTag.label}
                    onChange={(ev) => setNewTag({ ...newTag, label: ev.target.value })}
                    onKeyDown={(ev) => { if (ev.key === "Enter") commitNewTag(); }}
                  />
                  <div className="diario-tagmodal-colors">
                    {TAG_COLOR_PRESETS.map((c) => (
                      <button key={c} type="button" className={`diario-swatch${newTag.color === c ? " on" : ""}`}
                        style={{ background: c }} onClick={() => setNewTag({ ...newTag, color: c })} />
                    ))}
                    <label className="diario-swatch-custom" title="Escolher qualquer cor">
                      <input type="color" value={newTag.color} onChange={(ev) => setNewTag({ ...newTag, color: ev.target.value })} />
                    </label>
                  </div>
                  <div className="diario-tagmodal-preview">
                    <span className="diario-chip" style={chipStyle(newTag.color)}>{newTag.label.trim() || "prévia"}</span>
                  </div>
                  <div className="diario-tagmodal-actions">
                    {newTag.mode === "edit" && (
                      <button className="diario-tagmodal-del" onClick={() => { deleteTag(newTag.group, newTag.id); setNewTag(null); }}>Excluir</button>
                    )}
                    <button className="diario-tagmodal-cancel" onClick={() => setNewTag(null)}>Cancelar</button>
                    <button className="diario-tagmodal-ok" onClick={commitNewTag} disabled={!newTag.label.trim()}>{newTag.mode === "edit" ? "Salvar" : "Criar tag"}</button>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {view === "es-materias" && (matAberta
          ? <MateriaDetail materia={matAberta} registros={registros} onBack={() => setMatAberta(null)} onEdit={abrirRegistro} onDelete={removeRegistro} />
          : <MateriasGrid registros={registros} onOpen={setMatAberta} onBack={() => setView("es-painel")} />
        )}
        {view === "es-revisoes" && (
          <RevisoesView registros={registros} revStatus={revStatus} onMark={marcarRevisao} onBack={() => setView("es-painel")} />
        )}
        {view === "es-estatisticas" && (
          <EstatisticasView registros={registros} onBack={() => setView("es-painel")} />
        )}
        {view === "es-historico" && (
          <RegHistorico registros={registros} onBack={() => setView("es-painel")} onDelete={removeRegistro} onEdit={abrirRegistro} />
        )}
        {view === "es-ciclos" && (
          <section className="editais-page es-page">
            <button className="edital-back" onClick={() => setView("es-painel")}>← Voltar ao painel</button>
            <p className="eyebrow">ESTUDEI</p>
            <h1 className="serif" style={{ marginBottom: 10 }}>Ciclos</h1>
            <p className="es-sub">Cada fonte enche conforme você registra — o tempo total manda no tamanho da fatia.</p>
            <CiclosPizzas registros={registros} />
          </section>
        )}
        {view === "es-painel" && (
          <section className="editais-page es-page">
            <header className="hero es-hero">
              <p className="eyebrow">Painel de estudos</p>
              <h1>Bom estudo, <em>Nádia</em></h1>
              <p className="hero-sub">Seu ritmo, seus ciclos e o que estudar agora — tudo numa tela só.</p>
            </header>

            {/* ---------- CHECKLIST RÁPIDO (ESTUDEI) ---------- */}
            <aside className="checkes">
              <div className="checkes-head">📌 NÃO ESQUECER</div>
              <div className="checkes-add">
                <input value={esCheckInput} onChange={(e) => setEsCheckInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") addEsCheck(); }} placeholder="tarefa rápida" />
                <button onClick={addEsCheck} title="Adicionar">+</button>
              </div>
              <div className="checkes-list">
                {esCheck.map((p) => (
                  <div key={p.id} className={`checkes-item${p.done ? " done" : ""}`}>
                    <input type="checkbox" checked={p.done} onChange={() => toggleEsCheck(p.id)} />
                    <span>{p.txt}</span>
                    <button className="checkes-x" onClick={() => removeEsCheck(p.id)} title="Remover">×</button>
                  </div>
                ))}
              </div>
            </aside>

            <FraseDoDia />
            <div className="painel-2col">
              <DataProva data={dataProva && dataProva.data} nome={dataProva && dataProva.nome} onSave={saveDataProva} />
              <MetaSemana registros={registros} metas={metas} onSave={saveMetas} />
            </div>
            <Constancia registros={registros} />
            <div className="sechead-es">Ciclos</div>
            <CiclosPizzas registros={registros} />
          </section>
        )}

        {view === "caixa" && (
          <CaixaView onBack={() => setView("es-painel")} onArquivarEdital={arquivarNoEdital} />
        )}

        {view === "main" && (<>
        {/* ---------- HERO ---------- */}
        <header className="hero">
          <p className="eyebrow">Painel de Estudos</p>
          <h1 className="serif">Carreiras jurídicas <em>— Magistratura Estadual e Ministério Público</em></h1>
          <p className="hero-sub">Acompanhe seu progresso por matéria, edital e diário de estudos, tudo em um só lugar.</p>
        </header>

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
          <p className="desc">2026-2024 · várias bancas</p>

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
                      const tot = provaTotals(nome);
                      const isOpen = openProva === nome;
                      return (
                        <div key={nome} className="sim-prova">
                          <div className="sim-prova-row">
                            <input type="checkbox" checked={!!v.checked} onChange={() => toggleSim(nome, { checked: !v.checked })} />
                            <button className="sim-name" onClick={() => setOpenProva(isOpen ? null : nome)}>
                              <span className="sim-arrow">{isOpen ? "▾" : "▸"}</span>
                              <span style={{ flex: 1 }}>{nome}</span>
                              {p.banca && <span className="banca-tag" style={{ background: bancaBg(p.banca, .16), color: bancaColor(p.banca), border: "1px solid " + bancaBg(p.banca, .4) }}>{p.banca}</span>}
                              {tot && <span className="sim-frac mono">{tot.a}/{tot.q}</span>}
                              <span className="sim-overall mono">{tot == null ? "—" : tot.pct + "%"}</span>
                            </button>
                            <button className="man-del" title="Excluir esta prova" onClick={() => deleteProva(p, g.grupo)}>🗑</button>
                          </div>
                          {isOpen && (
                            <div className="sim-mats">
                              {provaMats(nome).map((m) => {
                                const md = (v.mats || {})[m.key] || {};
                                const pctm = matPct(md);
                                return (
                                  <div key={m.key} className="sim-mat">
                                    <span className="sim-mat-name">{m.name}</span>
                                    <input className="qn mono" placeholder="—" inputMode="numeric" value={md.a || ""} onChange={(e) => setMat(nome, m.key, "a", e.target.value)} />
                                    <span className="sim-de">de</span>
                                    <input className="qn mono" placeholder="—" inputMode="numeric" value={md.q || ""} onChange={(e) => setMat(nome, m.key, "q", e.target.value)} />
                                    <span className="sim-mat-pct mono">{pctm == null ? "" : pctm + "%"}</span>
                                    <button className="man-del sim-mat-del" title="Remover matéria desta prova" onClick={() => (m.custom ? removeCustomMat(nome, m.key) : hideMat(nome, m.key))}>🗑</button>
                                  </div>
                                );
                              })}
                              <div className="sim-mat-add">
                                <input placeholder="+ adicionar matéria a esta prova..." value={matAddInput}
                                  onChange={(e) => setMatAddInput(e.target.value)}
                                  onKeyDown={(e) => { if (e.key === "Enter") addProvaMat(nome); }} />
                                <button onClick={() => addProvaMat(nome)}>+</button>
                              </div>
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

          <div className="man-add">
            <input className="man-nome" placeholder="Adicionar prova (ex.: TJ RS 2026)" value={manNome}
              onChange={(e) => setManNome(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addManual(); }} />
            <input className="man-ano" placeholder="ano" value={manAno}
              onChange={(e) => setManAno(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addManual(); }} />
            <input className="man-banca" placeholder="banca" value={manBanca}
              onChange={(e) => setManBanca(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addManual(); }} />
            <button className="man-btn" onClick={addManual}>+ Adicionar</button>
          </div>
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

      <button
        className={`to-top${showTop ? " show" : ""}`}
        aria-label="Voltar ao topo"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >↑</button>
    </div>
  );
}
