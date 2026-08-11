/* Vade mecum progressivo da Nadia. A lei entra AOS POUCOS — só os diplomas e artigos
   que ela está lendo. O Claude preenche isto sob pedido (ex.: "põe o CPP, art. 1º a 62"),
   SEMPRE com o texto do Planalto. Formato de cada diploma:
   { id, nome, atualizado, planalto, blocos:[ {t:"h",txt,sub?} | {t:"art",num,partes:[{t:"caput"|"inc"|"ali"|"par",marca?,txt}]} ] } */
window.LEISECA = [
 {
  "id": "cpp",
  "nome": "Código de Processo Penal",
  "atualizado": "11/08/2026",
  "planalto": "https://www.planalto.gov.br/ccivil_03/decreto-lei/del3689compilado.htm",
  "blocos": [
   {
    "t": "h",
    "txt": "LIVRO I"
   },
   {
    "t": "h",
    "txt": "DO PROCESSO EM GERAL",
    "sub": true
   },
   {
    "t": "h",
    "txt": "TÍTULO I"
   },
   {
    "t": "h",
    "txt": "DISPOSIÇÕES PRELIMINARES",
    "sub": true
   },
   {
    "t": "art",
    "num": "1º",
    "partes": [
     {
      "t": "caput",
      "txt": "O processo penal reger-se-á, em todo o território brasileiro, por este Código, ressalvados:"
     },
     {
      "t": "inc",
      "marca": "I",
      "txt": "os tratados, as convenções e regras de direito internacional;"
     },
     {
      "t": "inc",
      "marca": "II",
      "txt": "as prerrogativas constitucionais do Presidente da República, dos ministros de Estado, nos crimes conexos com os do Presidente da República, e dos ministros do Supremo Tribunal Federal, nos crimes de responsabilidade (Constituição, arts. 86, 89, § 2º, e 100);"
     },
     {
      "t": "inc",
      "marca": "III",
      "txt": "os processos da competência da Justiça Militar;"
     },
     {
      "t": "inc",
      "marca": "IV",
      "txt": "os processos da competência do tribunal especial (Constituição, art. 122, no 17);"
     },
     {
      "t": "inc",
      "marca": "V",
      "txt": "os processos por crimes de imprensa. (Vide ADPF nº 130)"
     },
     {
      "t": "par",
      "marca": "Parágrafo único.",
      "txt": "Aplicar-se-á, entretanto, este Código aos processos referidos nos nos IV e V, quando as leis especiais que os regulam não dispuserem de modo diverso."
     }
    ]
   },
   {
    "t": "h",
    "txt": "TÍTULO III"
   },
   {
    "t": "h",
    "txt": "DA AÇÃO PENAL",
    "sub": true
   },
   {
    "t": "art",
    "num": "24",
    "partes": [
     {
      "t": "caput",
      "txt": "Nos crimes de ação pública, esta será promovida por denúncia do Ministério Público, mas dependerá, quando a lei o exigir, de requisição do Ministro da Justiça, ou de representação do ofendido ou de quem tiver qualidade para representá-lo."
     },
     {
      "t": "par",
      "marca": "§ 1º",
      "txt": "No caso de morte do ofendido ou quando declarado ausente por decisão judicial, o direito de representação passará ao cônjuge, ascendente, descendente ou irmão. (Parágrafo único renumerado pela Lei nº 8.699, de 27.8.1993)"
     },
     {
      "t": "par",
      "marca": "§ 2º",
      "txt": "Seja qual for o crime, quando praticado em detrimento do patrimônio ou interesse da União, Estado e Município, a ação penal será pública. (Incluído pela Lei nº 8.699, de 27.8.1993)"
     }
    ]
   },
   {
    "t": "art",
    "num": "25",
    "partes": [
     {
      "t": "caput",
      "txt": "A representação será irretratável, depois de oferecida a denúncia."
     }
    ]
   },
   {
    "t": "art",
    "num": "26",
    "partes": [
     {
      "t": "caput",
      "txt": "A ação penal, nas contravenções, será iniciada com o auto de prisão em flagrante ou por meio de portaria expedida pela autoridade judiciária ou policial."
     }
    ]
   },
   {
    "t": "art",
    "num": "27",
    "partes": [
     {
      "t": "caput",
      "txt": "Qualquer pessoa do povo poderá provocar a iniciativa do Ministério Público, nos casos em que caiba a ação pública, fornecendo-lhe, por escrito, informações sobre o fato e a autoria e indicando o tempo, o lugar e os elementos de convicção."
     }
    ]
   },
   {
    "t": "art",
    "num": "28",
    "partes": [
     {
      "t": "caput",
      "txt": "Ordenado o arquivamento do inquérito policial ou de quaisquer elementos informativos da mesma natureza, o órgão do Ministério Público comunicará à vítima, ao investigado e à autoridade policial e encaminhará os autos para a instância de revisão ministerial para fins de homologação, na forma da lei. (Redação dada pela Lei nº 13.964, de 2019) (Vigência) (Vide ADI 6.298) (Vide ADI 6.300) (Vide ADI 6.305)"
     },
     {
      "t": "par",
      "marca": "§ 1º",
      "txt": "Se a vítima, ou seu representante legal, não concordar com o arquivamento do inquérito policial, poderá, no prazo de 30 (trinta) dias do recebimento da comunicação, submeter a matéria à revisão da instância competente do órgão ministerial, conforme dispuser a respectiva lei orgânica. (Incluído pela Lei nº 13.964, de 2019) (Vigência) (Vide ADI 6.298)"
     },
     {
      "t": "par",
      "marca": "§ 2º",
      "txt": "Nas ações penais relativas a crimes praticados em detrimento da União, Estados e Municípios, a revisão do arquivamento do inquérito policial poderá ser provocada pela chefia do órgão a quem couber a sua representação judicial. (Incluído pela Lei nº 13.964, de 2019) (Vigência)"
     }
    ]
   },
   {
    "t": "art",
    "num": "28-A",
    "partes": [
     {
      "t": "caput",
      "txt": "Não sendo caso de arquivamento e tendo o investigado confessado formal e circunstancialmente a prática de infração penal sem violência ou grave ameaça e com pena mínima inferior a 4 (quatro) anos, o Ministério Público poderá propor acordo de não persecução penal, desde que necessário e suficiente para reprovação e prevenção do crime, mediante as seguintes condições ajustadas cumulativa e alternativamente: (Incluído pela Lei nº 13.964, de 2019) (Vigência) (Vide ADI 6.298)"
     },
     {
      "t": "inc",
      "marca": "I",
      "txt": "reparar o dano ou restituir a coisa à vítima, exceto na impossibilidade de fazê-lo; (Incluído pela Lei nº 13.964, de 2019) (Vigência)"
     },
     {
      "t": "inc",
      "marca": "II",
      "txt": "renunciar voluntariamente a bens e direitos indicados pelo Ministério Público como instrumentos, produto ou proveito do crime; (Incluído pela Lei nº 13.964, de 2019) (Vigência)"
     },
     {
      "t": "inc",
      "marca": "III",
      "txt": "prestar serviço à comunidade ou a entidades públicas por período correspondente à pena mínima cominada ao delito diminuída de um a dois terços, em local a ser indicado pelo juízo da execução, na forma do art. 46 do Decreto-Lei nº 2.848, de 7 de dezembro de 1940 (Código Penal); (Incluído pela Lei nº 13.964, de 2019) (Vigência) (Vide ADI 6.298)"
     },
     {
      "t": "inc",
      "marca": "IV",
      "txt": "pagar prestação pecuniária, a ser estipulada nos termos do art. 45 do Decreto-Lei nº 2.848, de 7 de dezembro de 1940 (Código Penal), a entidade pública ou de interesse social, a ser indicada pelo juízo da execução, que tenha, preferencialmente, como função proteger bens jurídicos iguais ou semelhantes aos aparentemente lesados pelo delito; ou (Incluído pela Lei nº 13.964, de 2019) (Vigência) (Vide ADI 6.298)"
     },
     {
      "t": "inc",
      "marca": "V",
      "txt": "cumprir, por prazo determinado, outra condição indicada pelo Ministério Público, desde que proporcional e compatível com a infração penal imputada. (Incluído pela Lei nº 13.964, de 2019) (Vigência)"
     },
     {
      "t": "par",
      "marca": "§ 1º",
      "txt": "Para aferição da pena mínima cominada ao delito a que se refere o caput deste artigo, serão consideradas as causas de aumento e diminuição aplicáveis ao caso concreto. (Incluído pela Lei nº 13.964, de 2019) (Vigência)"
     },
     {
      "t": "par",
      "marca": "§ 2º",
      "txt": "O disposto no caput deste artigo não se aplica nas seguintes hipóteses: (Incluído pela Lei nº 13.964, de 2019) (Vigência)"
     },
     {
      "t": "inc",
      "marca": "I",
      "txt": "se for cabível transação penal de competência dos Juizados Especiais Criminais, nos termos da lei; (Incluído pela Lei nº 13.964, de 2019) (Vigência)"
     },
     {
      "t": "inc",
      "marca": "II",
      "txt": "se o investigado for reincidente ou se houver elementos probatórios que indiquem conduta criminal habitual, reiterada ou profissional, exceto se insignificantes as infrações penais pretéritas; (Incluído pela Lei nº 13.964, de 2019) (Vigência)"
     },
     {
      "t": "inc",
      "marca": "III",
      "txt": "ter sido o agente beneficiado nos 5 (cinco) anos anteriores ao cometimento da infração, em acordo de não persecução penal, transação penal ou suspensão condicional do processo; e (Incluído pela Lei nº 13.964, de 2019) (Vigência)"
     },
     {
      "t": "inc",
      "marca": "IV",
      "txt": "nos crimes praticados no âmbito de violência doméstica ou familiar, ou praticados contra a mulher por razões da condição de sexo feminino, em favor do agressor. (Incluído pela Lei nº 13.964, de 2019) (Vigência)"
     },
     {
      "t": "par",
      "marca": "§ 3º",
      "txt": "O acordo de não persecução penal será formalizado por escrito e será firmado pelo membro do Ministério Público, pelo investigado e por seu defensor. (Incluído pela Lei nº 13.964, de 2019) (Vigência)"
     },
     {
      "t": "par",
      "marca": "§ 4º",
      "txt": "Para a homologação do acordo de não persecução penal, será realizada audiência na qual o juiz deverá verificar a sua voluntariedade, por meio da oitiva do investigado na presença do seu defensor, e sua legalidade. (Incluído pela Lei nº 13.964, de 2019) (Vigência)"
     },
     {
      "t": "par",
      "marca": "§ 5º",
      "txt": "Se o juiz considerar inadequadas, insuficientes ou abusivas as condições dispostas no acordo de não persecução penal, devolverá os autos ao Ministério Público para que seja reformulada a proposta de acordo, com concordância do investigado e seu defensor. (Incluído pela Lei nº 13.964, de 2019) (Vigência) (Vide ADI 6.298)"
     },
     {
      "t": "par",
      "marca": "§ 6º",
      "txt": "Homologado judicialmente o acordo de não persecução penal, o juiz devolverá os autos ao Ministério Público para que inicie sua execução perante o juízo de execução penal. (Incluído pela Lei nº 13.964, de 2019) (Vigência)"
     },
     {
      "t": "par",
      "marca": "§ 7º",
      "txt": "O juiz poderá recusar homologação à proposta que não atender aos requisitos legais ou quando não for realizada a adequação a que se refere o § 5º deste artigo. (Incluído pela Lei nº 13.964, de 2019) (Vigência) (Vide ADI 6.298)"
     },
     {
      "t": "par",
      "marca": "§ 8º",
      "txt": "Recusada a homologação, o juiz devolverá os autos ao Ministério Público para a análise da necessidade de complementação das investigações ou o oferecimento da denúncia. (Incluído pela Lei nº 13.964, de 2019) (Vigência) (Vide ADI 6.298)"
     },
     {
      "t": "par",
      "marca": "§ 9º",
      "txt": "A vítima será intimada da homologação do acordo de não persecução penal e de seu descumprimento. (Incluído pela Lei nº 13.964, de 2019) (Vigência)"
     },
     {
      "t": "par",
      "marca": "§ 10",
      "txt": "Descumpridas quaisquer das condições estipuladas no acordo de não persecução penal, o Ministério Público deverá comunicar ao juízo, para fins de sua rescisão e posterior oferecimento de denúncia. (Incluído pela Lei nº 13.964, de 2019) (Vigência)"
     },
     {
      "t": "par",
      "marca": "§ 11",
      "txt": "O descumprimento do acordo de não persecução penal pelo investigado também poderá ser utilizado pelo Ministério Público como justificativa para o eventual não oferecimento de suspensão condicional do processo. (Incluído pela Lei nº 13.964, de 2019) (Vigência)"
     },
     {
      "t": "par",
      "marca": "§ 12",
      "txt": "A celebração e o cumprimento do acordo de não persecução penal não constarão de certidão de antecedentes criminais, exceto para os fins previstos no inciso III do § 2º deste artigo. (Incluído pela Lei nº 13.964, de 2019) (Vigência)"
     },
     {
      "t": "par",
      "marca": "§ 13",
      "txt": "Cumprido integralmente o acordo de não persecução penal, o juízo competente decretará a extinção de punibilidade. (Incluído pela Lei nº 13.964, de 2019) (Vigência)"
     },
     {
      "t": "par",
      "marca": "§ 14",
      "txt": "No caso de recusa, por parte do Ministério Público, em propor o acordo de não persecução penal, o investigado poderá requerer a remessa dos autos a órgão superior, na forma do art. 28 deste Código. (Incluído pela Lei nº 13.964, de 2019) (Vigência)"
     }
    ]
   },
   {
    "t": "art",
    "num": "29",
    "partes": [
     {
      "t": "caput",
      "txt": "Será admitida ação privada nos crimes de ação pública, se esta não for intentada no prazo legal, cabendo ao Ministério Público aditar a queixa, repudiá-la e oferecer denúncia substitutiva, intervir em todos os termos do processo, fornecer elementos de prova, interpor recurso e, a todo tempo, no caso de negligência do querelante, retomar a ação como parte principal."
     }
    ]
   },
   {
    "t": "art",
    "num": "30",
    "partes": [
     {
      "t": "caput",
      "txt": "Ao ofendido ou a quem tenha qualidade para representá-lo caberá intentar a ação privada."
     }
    ]
   },
   {
    "t": "art",
    "num": "31",
    "partes": [
     {
      "t": "caput",
      "txt": "No caso de morte do ofendido ou quando declarado ausente por decisão judicial, o direito de oferecer queixa ou prosseguir na ação passará ao cônjuge, ascendente, descendente ou irmão."
     }
    ]
   },
   {
    "t": "art",
    "num": "32",
    "partes": [
     {
      "t": "caput",
      "txt": "Nos crimes de ação privada, o juiz, a requerimento da parte que comprovar a sua pobreza, nomeará advogado para promover a ação penal."
     },
     {
      "t": "par",
      "marca": "§ 1º",
      "txt": "Considerar-se-á pobre a pessoa que não puder prover às despesas do processo, sem privar-se dos recursos indispensáveis ao próprio sustento ou da família."
     },
     {
      "t": "par",
      "marca": "§ 2º",
      "txt": "Será prova suficiente de pobreza o atestado da autoridade policial em cuja circunscrição residir o ofendido."
     }
    ]
   },
   {
    "t": "art",
    "num": "33",
    "partes": [
     {
      "t": "caput",
      "txt": "Se o ofendido for menor de 18 anos, ou mentalmente enfermo, ou retardado mental, e não tiver representante legal, ou colidirem os interesses deste com os daquele, o direito de queixa poderá ser exercido por curador especial, nomeado, de ofício ou a requerimento do Ministério Público, pelo juiz competente para o processo penal."
     }
    ]
   },
   {
    "t": "art",
    "num": "34",
    "partes": [
     {
      "t": "caput",
      "txt": "Se o ofendido for menor de 21 e maior de 18 anos, o direito de queixa poderá ser exercido por ele ou por seu representante legal."
     }
    ]
   },
   {
    "t": "art",
    "num": "35",
    "partes": [
     {
      "t": "caput",
      "txt": "(Revogado pela Lei nº 9.520, de 27.11.1997)"
     }
    ]
   },
   {
    "t": "art",
    "num": "36",
    "partes": [
     {
      "t": "caput",
      "txt": "Se comparecer mais de uma pessoa com direito de queixa, terá preferência o cônjuge, e, em seguida, o parente mais próximo na ordem de enumeração constante do art. 31, podendo, entretanto, qualquer delas prosseguir na ação, caso o querelante desista da instância ou a abandone."
     }
    ]
   },
   {
    "t": "art",
    "num": "37",
    "partes": [
     {
      "t": "caput",
      "txt": "As fundações, associações ou sociedades legalmente constituídas poderão exercer a ação penal, devendo ser representadas por quem os respectivos contratos ou estatutos designarem ou, no silêncio destes, pelos seus diretores ou sócios-gerentes."
     }
    ]
   },
   {
    "t": "art",
    "num": "38",
    "partes": [
     {
      "t": "caput",
      "txt": "Salvo disposição em contrário, o ofendido, ou seu representante legal, decairá no direito de queixa ou de representação, se não o exercer dentro do prazo de seis meses, contado do dia em que vier a saber quem é o autor do crime, ou, no caso do art. 29, do dia em que se esgotar o prazo para o oferecimento da denúncia."
     },
     {
      "t": "par",
      "marca": "§ 1º",
      "txt": "Verificar-se-á a decadência do direito de queixa ou representação, dentro do mesmo prazo, nos casos dos arts. 24, parágrafo único, e 31. (Redação dada pela Lei nº 15.438, de 2026)"
     },
     {
      "t": "par",
      "marca": "§ 2º",
      "txt": "Nos crimes praticados no âmbito de violência doméstica e familiar contra a mulher, a ofendida decairá do direito de queixa ou de representação se não o exercer no prazo de 12 (doze) meses, contado do dia em que vier a saber quem é o autor do crime, ou, no caso do art. 29 deste Código, do dia em que se esgotar o prazo para o oferecimento de denúncia. (Incluído pela Lei nº 15.438, de 2026)"
     }
    ]
   },
   {
    "t": "art",
    "num": "39",
    "partes": [
     {
      "t": "caput",
      "txt": "O direito de representação poderá ser exercido, pessoalmente ou por procurador com poderes especiais, mediante declaração, escrita ou oral, feita ao juiz, ao órgão do Ministério Público, ou à autoridade policial."
     },
     {
      "t": "par",
      "marca": "§ 1º",
      "txt": "A representação feita oralmente ou por escrito, sem assinatura devidamente autenticada do ofendido, de seu representante legal ou procurador, será reduzida a termo, perante o juiz ou autoridade policial, presente o órgão do Ministério Público, quando a este houver sido dirigida."
     },
     {
      "t": "par",
      "marca": "§ 2º",
      "txt": "A representação conterá todas as informações que possam servir à apuração do fato e da autoria."
     },
     {
      "t": "par",
      "marca": "§ 3º",
      "txt": "Oferecida ou reduzida a termo a representação, a autoridade policial procederá a inquérito, ou, não sendo competente, remetê-lo-á à autoridade que o for."
     },
     {
      "t": "par",
      "marca": "§ 4º",
      "txt": "A representação, quando feita ao juiz ou perante este reduzida a termo, será remetida à autoridade policial para que esta proceda a inquérito."
     },
     {
      "t": "par",
      "marca": "§ 5º",
      "txt": "O órgão do Ministério Público dispensará o inquérito, se com a representação forem oferecidos elementos que o habilitem a promover a ação penal, e, neste caso, oferecerá a denúncia no prazo de quinze dias."
     }
    ]
   },
   {
    "t": "art",
    "num": "40",
    "partes": [
     {
      "t": "caput",
      "txt": "Quando, em autos ou papéis de que conhecerem, os juízes ou tribunais verificarem a existência de crime de ação pública, remeterão ao Ministério Público as cópias e os documentos necessários ao oferecimento da denúncia."
     }
    ]
   },
   {
    "t": "art",
    "num": "41",
    "partes": [
     {
      "t": "caput",
      "txt": "A denúncia ou queixa conterá a exposição do fato criminoso, com todas as suas circunstâncias, a qualificação do acusado ou esclarecimentos pelos quais se possa identificá-lo, a classificação do crime e, quando necessário, o rol das testemunhas."
     }
    ]
   },
   {
    "t": "art",
    "num": "42",
    "partes": [
     {
      "t": "caput",
      "txt": "O Ministério Público não poderá desistir da ação penal."
     }
    ]
   },
   {
    "t": "art",
    "num": "43",
    "partes": [
     {
      "t": "caput",
      "txt": "(Revogado pela Lei nº 11.719, de 2008)."
     }
    ]
   },
   {
    "t": "art",
    "num": "44",
    "partes": [
     {
      "t": "caput",
      "txt": "A queixa poderá ser dada por procurador com poderes especiais, devendo constar do instrumento do mandato o nome do querelante e a menção do fato criminoso, salvo quando tais esclarecimentos dependerem de diligências que devem ser previamente requeridas no juízo criminal."
     }
    ]
   },
   {
    "t": "art",
    "num": "45",
    "partes": [
     {
      "t": "caput",
      "txt": "A queixa, ainda quando a ação penal for privativa do ofendido, poderá ser aditada pelo Ministério Público, a quem caberá intervir em todos os termos subseqüentes do processo."
     }
    ]
   },
   {
    "t": "art",
    "num": "46",
    "partes": [
     {
      "t": "caput",
      "txt": "O prazo para oferecimento da denúncia, estando o réu preso, será de 5 dias, contado da data em que o órgão do Ministério Público receber os autos do inquérito policial, e de 15 dias, se o réu estiver solto ou afiançado. No último caso, se houver devolução do inquérito à autoridade policial (art. 16), contar-se-á o prazo da data em que o órgão do Ministério Público receber novamente os autos."
     },
     {
      "t": "par",
      "marca": "§ 1º",
      "txt": "Quando o Ministério Público dispensar o inquérito policial, o prazo para o oferecimento da denúncia contar-se-á da data em que tiver recebido as peças de informações ou a representação"
     },
     {
      "t": "par",
      "marca": "§ 2º",
      "txt": "O prazo para o aditamento da queixa será de 3 dias, contado da data em que o órgão do Ministério Público receber os autos, e, se este não se pronunciar dentro do tríduo, entender-se-á que não tem o que aditar, prosseguindo-se nos demais termos do processo."
     }
    ]
   },
   {
    "t": "art",
    "num": "47",
    "partes": [
     {
      "t": "caput",
      "txt": "Se o Ministério Público julgar necessários maiores esclarecimentos e documentos complementares ou novos elementos de convicção, deverá requisitá-los, diretamente, de quaisquer autoridades ou funcionários que devam ou possam fornecê-los."
     }
    ]
   },
   {
    "t": "art",
    "num": "48",
    "partes": [
     {
      "t": "caput",
      "txt": "A queixa contra qualquer dos autores do crime obrigará ao processo de todos, e o Ministério Público velará pela sua indivisibilidade."
     }
    ]
   },
   {
    "t": "art",
    "num": "49",
    "partes": [
     {
      "t": "caput",
      "txt": "A renúncia ao exercício do direito de queixa, em relação a um dos autores do crime, a todos se estenderá."
     }
    ]
   },
   {
    "t": "art",
    "num": "50",
    "partes": [
     {
      "t": "caput",
      "txt": "A renúncia expressa constará de declaração assinada pelo ofendido, por seu representante legal ou procurador com poderes especiais."
     },
     {
      "t": "par",
      "marca": "Parágrafo único.",
      "txt": "A renúncia do representante legal do menor que houver completado 18 (dezoito) anos não privará este do direito de queixa, nem a renúncia do último excluirá o direito do primeiro."
     }
    ]
   },
   {
    "t": "art",
    "num": "51",
    "partes": [
     {
      "t": "caput",
      "txt": "O perdão concedido a um dos querelados aproveitará a todos, sem que produza, todavia, efeito em relação ao que o recusar."
     }
    ]
   },
   {
    "t": "art",
    "num": "52",
    "partes": [
     {
      "t": "caput",
      "txt": "Se o querelante for menor de 21 e maior de 18 anos, o direito de perdão poderá ser exercido por ele ou por seu representante legal, mas o perdão concedido por um, havendo oposição do outro, não produzirá efeito."
     }
    ]
   },
   {
    "t": "art",
    "num": "53",
    "partes": [
     {
      "t": "caput",
      "txt": "Se o querelado for mentalmente enfermo ou retardado mental e não tiver representante legal, ou colidirem os interesses deste com os do querelado, a aceitação do perdão caberá ao curador que o juiz Ihe nomear."
     }
    ]
   },
   {
    "t": "art",
    "num": "54",
    "partes": [
     {
      "t": "caput",
      "txt": "Se o querelado for menor de 21 anos, observar-se-á, quanto à aceitação do perdão, o disposto no art. 52."
     }
    ]
   },
   {
    "t": "art",
    "num": "55",
    "partes": [
     {
      "t": "caput",
      "txt": "O perdão poderá ser aceito por procurador com poderes especiais."
     }
    ]
   },
   {
    "t": "art",
    "num": "56",
    "partes": [
     {
      "t": "caput",
      "txt": "Aplicar-se-á ao perdão extraprocessual expresso o disposto no art. 50."
     }
    ]
   },
   {
    "t": "art",
    "num": "57",
    "partes": [
     {
      "t": "caput",
      "txt": "A renúncia tácita e o perdão tácito admitirão todos os meios de prova."
     }
    ]
   },
   {
    "t": "art",
    "num": "58",
    "partes": [
     {
      "t": "caput",
      "txt": "Concedido o perdão, mediante declaração expressa nos autos, o querelado será intimado a dizer, dentro de três dias, se o aceita, devendo, ao mesmo tempo, ser cientificado de que o seu silêncio importará aceitação."
     },
     {
      "t": "par",
      "marca": "Parágrafo único.",
      "txt": "Aceito o perdão, o juiz julgará extinta a punibilidade."
     }
    ]
   },
   {
    "t": "art",
    "num": "59",
    "partes": [
     {
      "t": "caput",
      "txt": "A aceitação do perdão fora do processo constará de declaração assinada pelo querelado, por seu representante legal ou procurador com poderes especiais."
     }
    ]
   },
   {
    "t": "art",
    "num": "60",
    "partes": [
     {
      "t": "caput",
      "txt": "Nos casos em que somente se procede mediante queixa, considerar-se-á perempta a ação penal:"
     },
     {
      "t": "inc",
      "marca": "I",
      "txt": "quando, iniciada esta, o querelante deixar de promover o andamento do processo durante 30 dias seguidos;"
     },
     {
      "t": "inc",
      "marca": "II",
      "txt": "quando, falecendo o querelante, ou sobrevindo sua incapacidade, não comparecer em juízo, para prosseguir no processo, dentro do prazo de 60 (sessenta) dias, qualquer das pessoas a quem couber fazê-lo, ressalvado o disposto no art. 36;"
     },
     {
      "t": "inc",
      "marca": "III",
      "txt": "quando o querelante deixar de comparecer, sem motivo justificado, a qualquer ato do processo a que deva estar presente, ou deixar de formular o pedido de condenação nas alegações finais;"
     },
     {
      "t": "inc",
      "marca": "IV",
      "txt": "quando, sendo o querelante pessoa jurídica, esta se extinguir sem deixar sucessor."
     }
    ]
   },
   {
    "t": "art",
    "num": "61",
    "partes": [
     {
      "t": "caput",
      "txt": "Em qualquer fase do processo, o juiz, se reconhecer extinta a punibilidade, deverá declará-lo de ofício."
     },
     {
      "t": "par",
      "marca": "Parágrafo único.",
      "txt": "No caso de requerimento do Ministério Público, do querelante ou do réu, o juiz mandará autuá-lo em apartado, ouvirá a parte contrária e, se o julgar conveniente, concederá o prazo de cinco dias para a prova, proferindo a decisão dentro de cinco dias ou reservando-se para apreciar a matéria na sentença final."
     }
    ]
   },
   {
    "t": "art",
    "num": "62",
    "partes": [
     {
      "t": "caput",
      "txt": "No caso de morte do acusado, o juiz somente à vista da certidão de óbito, e depois de ouvido o Ministério Público, declarará extinta a punibilidade."
     }
    ]
   }
  ]
 }
];
