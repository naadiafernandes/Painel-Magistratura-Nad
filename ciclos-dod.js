/* Mapa dos temas da fila de Jurisprudência (ciclos.js) para as CATEGORIAS e SUBCATEGORIAS
   do Buscador Dizer o Direito (IDs colhidos do próprio buscador).
   - CAT_BY_M: matéria (código m) -> id da Categoria no buscador (usado no fallback com aspas).
   - MAP: "m|nome do tema" -> [categoria, subcategoria]. Só entra quando o tema encaixa bem
     numa subcategoria; quando não encaixa, cai no fallback (categoria + palavra-chave entre aspas). */
window.CICLOS_DOD = {
  CAT_BY_M: {
    const: 1, adm: 2, eleit: 3, civil: 4, cdc: 5, eca: 7, empres: 8, amb: 9,
    pcivil: 10, penal: 11, ppenal: 12, trib: 14, penesp: 11, civesp: 10,
    intl: 16, prev: 15, trab: 17, proctrab: 17
  },
  MAP: {
    // Constitucional (cat 1)
    "const|Organização, Competências e Bens dos Entes": [1, 2],
    "const|Controle de Constitucionalidade": [1, 3],
    "const|Direitos e Deveres Individuais e Coletivos": [1, 1],
    "const|Processo Legislativo": [1, 6],
    "const|Fiscalização Contábil, Financeira e Orçamentária": [1, 7],
    "const|Outros Assuntos Constitucionais": [1, 13],
    "const|Disposições Gerais do Poder Judiciário": [1, 9],
    "const|Órgãos do Poder Judiciário": [1, 9],
    "const|Deputados e Senadores": [1, 5],
    "const|Intervenção Federal e Estadual": [1, 2],
    "const|Organização Político-administrativa": [1, 2],
    "const|Direitos Sociais e dos Trabalhadores": [1, 1],
    "const|Remédios Constitucionais": [1, 1],
    "const|Poder Executivo": [1, 8],

    // Administrativo (cat 2)
    "adm|Responsabilidade Civil do Estado": [2, 16],
    "adm|Agentes Públicos": [2, 22],
    "adm|Concurso Público": [2, 21],
    "adm|Improbidade Administrativa": [2, 23],
    "adm|Desapropriação": [2, 19],
    "adm|Serviços Públicos": [2, 203],
    "adm|Licitações e Contratos": [2, 17],
    "adm|Poderes da Administração": [2, 202],
    "adm|Processo Administrativo Disciplinar": [2, 20],
    "adm|Administração Indireta": [2, 15],
    "adm|Outros Assuntos de Dir. Administrativo": [2, 24],
    "adm|Princípios da Administração": [2, 14],
    "adm|Tombamento": [2, 19],
    "adm|Bens Públicos": [2, 213],

    // Eleitoral (cat 3)
    "eleit|Partidos Políticos": [3, 27],
    "eleit|Ações Específicas Eleitorais": [3, 31],
    "eleit|Eleições": [3, 30],
    "eleit|Outros Assuntos Eleitorais": [3, 30],

    // Civil (cat 4)
    "civil|Responsabilidade Civil": [4, 39],
    "civil|Espécies de Contrato": [4, 40],
    "civil|Contratos em Geral": [4, 40],
    "civil|Direito das Coisas": [4, 175],
    "civil|Pessoas Jurídicas": [4, 34],
    "civil|Pessoas Naturais": [4, 33],
    "civil|Direito das Sucessões": [4, 47],
    "civil|Obrigações": [4, 38],
    "civil|Fatos Jurídicos": [4, 35],

    // Empresarial (cat 8)
    "empres|Recuperação Judicial e Falência": [8, 68],
    "empres|Propriedade Industrial": [8, 64],
    "empres|Títulos de Crédito": [8, 66],
    "empres|Contratos Mercantis": [8, 65],
    "empres|Sociedade": [8, 67],

    // Ambiental (cat 9)
    "amb|Infrações e Responsabilidade Civil Ambiental": [9, 71],
    "amb|Demais Temas de Direito Ambiental": [9, 73],
    "amb|Direito Ambiental Constitucional": [9, 73],

    // Processual Civil (cat 10)
    "pcivil|Recursos": [10, 86],
    "pcivil|Cumprimento da Sentença": [10, 89],
    "pcivil|Processo de Execução": [10, 89],
    "pcivil|Normas Fundamentais": [10, 176],
    "pcivil|Assuntos Diversos de Processo Civil": [10, 81],
    "pcivil|Tutela Provisória": [10, 79],

    // Penal (cat 11)
    "penal|Penas": [11, 96],
    "penal|Crimes Contra o Patrimônio": [11, 106],
    "penal|Princípios do Direito Penal": [11, 199],
    "penal|Crimes Contra a Dignidade Sexual": [11, 108],
    "penal|Crimes Contra a Pessoa": [11, 103],
    "penal|Crimes Contra a Fé Pública": [11, 110],
    "penal|Outros Assuntos de Matéria Penal": [11, 216],

    // Leis Penais Especiais -> Penal (cat 11) / Proc. Penal (cat 12)
    "penesp|Lei 11.340 (Violência Doméstica)": [11, 122],
    "penesp|Lei 11.343 (Drogas)": [11, 123],
    "penesp|Lei 9.605 (Crimes Ambientais)": [11, 120],
    "penesp|Estatuto do Desarmamento": [11, 121],
    "penesp|Crimes do ECA": [11, 115],
    "penesp|Tópicos Mesclados de Leis Penais Especiais": [11, 124],
    "penesp|Lavagem de Dinheiro (Lei 9.613)": [11, 124],
    "penesp|LEP (Lei 7.210)": [12, 139],
    "penesp|Juizados Criminais (Lei 9.099)": [12, 138],
    "penesp|Lei 9.296 (Interceptação)": [12, 131],

    // Processual Penal (cat 12)
    "ppenal|Competência": [12, 127],
    "ppenal|Ação Penal": [12, 126],
    "ppenal|Assuntos Diversos de Processo Penal": [12, 134],
    "ppenal|Prisão, Cautelares e Liberdade": [12, 128],
    "ppenal|Teoria Geral da Prova": [12, 130],
    "ppenal|Provas em Espécie": [12, 130],
    "ppenal|Nulidades Processuais": [12, 133],
    "ppenal|Recursos em Espécie": [12, 136],
    "ppenal|Procedimento Comum": [12, 129],
    "ppenal|Inquérito Policial": [12, 125],

    // Tributário (cat 14)
    "trib|ICMS": [14, 154],
    "trib|IPVA": [14, 154],
    "trib|ITCMD": [14, 154],
    "trib|IPTU": [14, 155],
    "trib|ITBI": [14, 155],
    "trib|ISS": [14, 155],
    "trib|Imunidades Tributárias": [14, 149],
    "trib|Extinção do Crédito Tributário": [14, 209],
    "trib|Princípios Tributários": [14, 148],
    "trib|Taxas, Preços Públicos e Pedágio": [14, 150],
    "trib|Contribuições Especiais": [14, 156],
    "trib|Obrigação Tributária": [14, 151],
    "trib|Garantias e Privilégios do Crédito": [14, 157],
    "trib|Lançamento e Constituição do Crédito": [14, 157],
    "trib|Dívida Ativa Tributária": [14, 157],
    "trib|Certidão Negativa": [14, 157],
    "trib|Outros Assuntos Tributários": [14, 157],

    // Leis Civis Especiais -> Proc. Civil (cat 10) / Civil (4) / Adm (2)
    "civesp|Ação Civil Pública": [10, 93],
    "civesp|Direitos Individuais Homogêneos e Difusos": [10, 93],
    "civesp|Mandado de Segurança": [10, 92],
    "civesp|Juizados Especiais Cíveis": [10, 91],
    "civesp|Outros Assuntos de Leis Civis Especiais": [10, 81],
    "civesp|Impenhorabilidade do Bem de Família": [4, 37],
    "civesp|Ação Popular": [2, 207]
  }
};
