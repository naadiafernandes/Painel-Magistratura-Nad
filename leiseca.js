/* Vade mecum progressivo da Nadia. A lei entra AOS POUCOS — só os diplomas e artigos
   que ela está lendo. O Claude preenche isto sob pedido (ex.: "põe o CPP, art. 1º a 62").
   Formato de cada diploma:
   { id, nome, atualizado, planalto, blocos:[ {t:"h", txt, sub?:true} | {t:"art", num, caput, itens:[{m,txt}], paragrafos:[{rot,txt}] } ] } */
window.LEISECA = [
  {
    id: "cpp",
    nome: "Código de Processo Penal",
    atualizado: "11/08/2026",
    planalto: "https://www.planalto.gov.br/ccivil_03/decreto-lei/del3689compilado.htm",
    blocos: [
      { t: "h", txt: "LIVRO I" },
      { t: "h", txt: "DO PROCESSO EM GERAL", sub: true },
      { t: "h", txt: "TÍTULO I" },
      { t: "h", txt: "DISPOSIÇÕES PRELIMINARES", sub: true },
      {
        t: "art", num: "1º",
        caput: "O processo penal reger-se-á, em todo o território brasileiro, por este Código, ressalvados:",
        itens: [
          { m: "I", txt: "os tratados, as convenções e regras de direito internacional;" },
          { m: "II", txt: "as prerrogativas constitucionais do Presidente da República, dos ministros de Estado, nos crimes conexos com os do Presidente da República, e dos ministros do Supremo Tribunal Federal, nos crimes de responsabilidade (Constituição, arts. 86, 89, § 2º, e 100);" },
          { m: "III", txt: "os processos da competência da Justiça Militar;" },
          { m: "IV", txt: "os processos da competência do tribunal especial (Constituição, art. 122, no 17);" },
          { m: "V", txt: "os processos por crimes de imprensa. (Vide ADPF nº 130)" }
        ],
        paragrafos: [
          { rot: "Parágrafo único.", txt: "Aplicar-se-á, entretanto, este Código aos processos referidos nos nos IV e V, quando as leis especiais que os regulam não dispuserem de modo diverso." }
        ]
      }
    ]
  }
];
