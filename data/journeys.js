/* Learning journeys: short guided stories through the Constitution.
   Each step can embed live content from the app:
     {kind:"article", id}                       – article card with plain-language summary
     {kind:"case", id}                          – landmark judgment card
     {kind:"amendment", n}                      – amendment card
     {kind:"tm", article, asof, mode, caption}  – time-machine view of an article on a date ("read" | "diff")
   Quizzes: {q, options[], answer (index), why}. */
window.COI_JOURNEYS = [
  {
    id: "how-a-bill-becomes-law",
    title: "How a Bill becomes law",
    tagline: "From an idea in a ministry to an Act of Parliament — and the shortcuts and roadblocks along the way.",
    minutes: 8,
    color: "#0369a1",
    themes: ["legislature", "executive"],
    steps: [
      {
        title: "Two Houses, one law",
        body: [
          "Parliament is the President plus two Houses: the Lok Sabha (House of the People), elected directly, and the Rajya Sabha (Council of States), elected mostly by State legislatures.",
          "An ordinary Bill can start in either House. It becomes law only when both Houses pass it in the same form and the President assents."
        ],
        embeds: [{ kind: "article", id: "79" }, { kind: "article", id: "107" }]
      },
      {
        title: "When the Houses disagree",
        body: [
          "If one House rejects a Bill passed by the other, or the Houses cannot agree on amendments, or six months pass without a decision, the President can call a joint sitting of both Houses, presided over by the Speaker.",
          "Because the Lok Sabha is much larger, it usually prevails in a joint sitting. In practice this has happened only three times: for the Dowry Prohibition Bill (1961), the Banking Service Commission (Repeal) Bill (1978) and the Prevention of Terrorism Bill (2002)."
        ],
        embeds: [{ kind: "article", id: "108" }],
        quiz: {
          q: "Which kinds of Bill can never be settled at a joint sitting?",
          options: ["Money Bills and Constitution amendment Bills", "Bills about the States", "Bills introduced in the Rajya Sabha", "Any Bill the President objects to"],
          answer: 0,
          why: "Article 108 excludes Money Bills, and a Constitution amendment under Article 368 must be passed by each House separately by a special majority."
        }
      },
      {
        title: "Money Bills: the Lok Sabha decides",
        body: [
          "A Money Bill deals only with taxes, government borrowing, the Consolidated Fund and similar financial matters. It can be introduced only in the Lok Sabha, and only on the President's recommendation.",
          "The Rajya Sabha can merely suggest changes within 14 days; the Lok Sabha may ignore them. The Speaker certifies whether a Bill is a Money Bill.",
          "That certificate has been controversial: in the Aadhaar case (2018) the Supreme Court upheld the Aadhaar Act as a Money Bill, but in 2019 a five-judge bench (Rojer Mathew) referred that ruling and the scope of the Speaker's power to a seven-judge bench, where it is still pending."
        ],
        embeds: [{ kind: "article", id: "109" }, { kind: "article", id: "110" }, { kind: "case", id: "puttaswamy-aadhaar" }],
        quiz: {
          q: "Can the Rajya Sabha reject a Money Bill?",
          options: ["Yes, by a simple majority", "Yes, but only with a two-thirds majority", "No — it can only recommend changes within 14 days", "Only if the President agrees"],
          answer: 2,
          why: "Under Article 109 the Rajya Sabha must return a Money Bill within 14 days with any recommendations, which the Lok Sabha is free to accept or reject."
        }
      },
      {
        title: "The President's assent",
        body: [
          "Once both Houses pass a Bill, the President may assent, withhold assent, or (except for a Money Bill) send it back once for reconsideration. If Parliament passes it again, the President must assent.",
          "The President acts on the advice of the Council of Ministers (Article 74), so in practice assent is almost always given."
        ],
        embeds: [{ kind: "article", id: "111" }, { kind: "article", id: "74" }]
      },
      {
        title: "Laws without Parliament: ordinances",
        body: [
          "When either House of Parliament is not in session and immediate action is needed, the President can issue an ordinance with the force of law. It must be placed before Parliament and lapses six weeks after Parliament reassembles (or sooner if both Houses disapprove it), so it must be replaced by an Act to continue.",
          "The Supreme Court has held that repeatedly re-issuing ordinances without placing them before the legislature is a fraud on the Constitution (Krishna Kumar Singh, 2017). Governors have the same power for States under Article 213."
        ],
        embeds: [{ kind: "article", id: "123" }, { kind: "article", id: "213" }]
      },
      {
        title: "In the States: the Governor's desk",
        body: [
          "State laws follow a similar path, with the Governor in the President's place. The Governor may assent, withhold assent, return a Bill, or reserve it for the President.",
          "Delays in deciding on Bills led to major litigation. In April 2025 the Supreme Court set timelines for Governors in the Tamil Nadu case; in November 2025 a five-judge bench, answering a Presidential Reference, said courts cannot impose fixed timelines or 'deemed assent', though prolonged, unexplained inaction can be challenged."
        ],
        embeds: [{ kind: "article", id: "200" }, { kind: "case", id: "tn-governor" }, { kind: "case", id: "presidential-reference-2025" }],
        quiz: {
          q: "After the November 2025 Presidential Reference opinion, can a court declare that a Governor is 'deemed' to have assented to a Bill?",
          options: ["Yes, after three months", "Yes, under Article 142", "No — but a court can direct a decision after prolonged inaction", "Only for Money Bills"],
          answer: 2,
          why: "The five-judge bench held there is no 'deemed assent', even through Article 142, while allowing a limited direction to decide where inaction is prolonged and unexplained."
        }
      }
    ]
  },

  {
    id: "the-emergency",
    title: "The Emergency, 1975–77",
    tagline: "How emergency powers were used to suspend liberties — and the safeguards written into the Constitution afterwards.",
    minutes: 9,
    color: "#b91c1c",
    themes: ["emergency", "rights", "amendment-process"],
    steps: [
      {
        title: "The power on paper",
        body: [
          "Article 352 lets the President proclaim a national emergency if the security of India is threatened. In 1950 the grounds were 'war, external aggression or internal disturbance'.",
          "Use the time machine below to see how Article 352 read on 24 June 1975 — the day before the Emergency — compared with today."
        ],
        embeds: [{ kind: "tm", article: "352", asof: "1975-06-24", mode: "diff", caption: "Article 352 on 24 June 1975, with every later change highlighted" }]
      },
      {
        title: "25 June 1975",
        body: [
          "Less than two weeks after the Allahabad High Court (on 12 June 1975) set aside Prime Minister Indira Gandhi's election to the Lok Sabha, an emergency was proclaimed on the ground of 'internal disturbance'. (A separate emergency declared during the 1971 war was still in force.)",
          "Opposition leaders were detained, the press was censored, and a Presidential order under Article 359 suspended the right to go to court to enforce Articles 14, 21 and 22."
        ],
        embeds: [{ kind: "article", id: "359" }, { kind: "case", id: "indira-gandhi-raj-narain" }]
      },
      {
        title: "Amending the Constitution to fit the moment",
        body: [
          "Parliament quickly amended the Constitution. The 38th Amendment tried to make the President's 'satisfaction' in declaring an emergency immune from court review. The 39th placed the Prime Minister's election beyond the courts; the Supreme Court struck that clause down in Indira Gandhi v. Raj Narain (1975), applying the basic structure doctrine.",
          "The 42nd Amendment (1976) was so sweeping it is called the 'mini-Constitution': it added 'socialist' and 'secular' to the Preamble, inserted Fundamental Duties, and tried to bar courts from reviewing constitutional amendments."
        ],
        embeds: [{ kind: "amendment", n: 39 }, { kind: "amendment", n: 42 }, { kind: "tm", article: "Preamble", asof: "1977-01-02", mode: "diff", caption: "The Preamble the day before the 42nd Amendment took effect" }]
      },
      {
        title: "The darkest hour: ADM Jabalpur",
        body: [
          "Could a detained person go to court while Article 21 was suspended? In ADM Jabalpur (1976) the Supreme Court said no, by four judges to one. Justice H.R. Khanna dissented, writing that the right to life does not depend on the Constitution's grant; it cost him the Chief Justiceship.",
          "In 2017 a nine-judge bench in the Privacy case formally declared the ADM Jabalpur majority wrong."
        ],
        embeds: [{ kind: "case", id: "adm-jabalpur" }, { kind: "case", id: "puttaswamy-privacy" }],
        quiz: {
          q: "What did the majority hold in ADM Jabalpur (1976)?",
          options: ["Detention without trial was unconstitutional", "Detenus could not approach courts for habeas corpus while Article 21's enforcement was suspended", "The Emergency was invalid", "Parliament could not suspend rights"],
          answer: 1,
          why: "The 4:1 majority held that during the suspension, no one could move a court to enforce the right to life and personal liberty. It was overruled in Puttaswamy (2017)."
        }
      },
      {
        title: "Never again: the 44th Amendment",
        body: [
          "After the 1977 elections, the new government passed the 44th Amendment (1978). 'Internal disturbance' became 'armed rebellion'; an emergency now needs the Cabinet's written advice and approval by each House by a special majority within one month.",
          "Crucially, Articles 20 and 21 can no longer be suspended during any emergency. The amendment also removed the right to property from the list of fundamental rights."
        ],
        embeds: [{ kind: "amendment", n: 44 }, { kind: "tm", article: "359", asof: "1979-06-19", mode: "diff", caption: "Article 359 the day before the 44th Amendment took effect" }],
        quiz: {
          q: "Since the 44th Amendment, which rights cannot be suspended even during a national emergency?",
          options: ["Articles 14 and 19", "Articles 20 and 21", "Articles 25 and 26", "All fundamental rights can still be suspended"],
          answer: 1,
          why: "The 44th Amendment amended Article 359 so that the enforcement of Articles 20 (protection in respect of conviction) and 21 (life and liberty) can never be suspended."
        }
      },
      {
        title: "The courts close the circle",
        body: [
          "In Minerva Mills (1980) the Supreme Court struck down the parts of the 42nd Amendment that tried to give Parliament unlimited power to amend the Constitution, holding that limited amending power is itself part of the basic structure.",
          "The lesson of 1975–77 is now built into the text: emergency powers remain, but with procedural brakes and a core of rights that cannot be switched off."
        ],
        embeds: [{ kind: "case", id: "minerva-mills" }, { kind: "article", id: "352" }]
      }
    ]
  },

  {
    id: "article-21",
    title: "From Gopalan to Puttaswamy: how Article 21 grew",
    tagline: "Eighteen words that have never been amended — and the judgments that turned them into a charter of dignity.",
    minutes: 8,
    color: "#be123c",
    themes: ["life-liberty", "rights"],
    steps: [
      {
        title: "Eighteen words",
        body: [
          "\"No person shall be deprived of his life or personal liberty except according to procedure established by law.\"",
          "Check it in the time machine: the text of Article 21 today is identical to the text of 1950. Everything that follows happened through interpretation, not amendment."
        ],
        embeds: [{ kind: "tm", article: "21", asof: "1950-01-26", mode: "diff", caption: "Article 21 on 26 January 1950 — compared with today" }],
        quiz: {
          q: "How many times has the wording of Article 21 been amended?",
          options: ["Never", "Once, by the 44th Amendment", "Twice", "Five times"],
          answer: 0,
          why: "The words have never changed. The 44th Amendment protected Article 21 from suspension by amending Article 359, and the 86th added a new Article 21A — but Article 21 itself is untouched."
        }
      },
      {
        title: "1950: a narrow beginning",
        body: [
          "In A.K. Gopalan (1950), a communist leader challenged his preventive detention. The Supreme Court read 'procedure established by law' literally: any procedure enacted by a legislature would do, and each fundamental right was to be read in isolation."
        ],
        embeds: [{ kind: "case", id: "ak-gopalan" }]
      },
      {
        title: "1978: fair, just and reasonable",
        body: [
          "When Maneka Gandhi's passport was impounded without reasons, a seven-judge bench changed course. The procedure must be 'fair, just and reasonable', and Articles 14, 19 and 21 must be read together.",
          "This single shift opened the door to everything that followed."
        ],
        embeds: [{ kind: "case", id: "maneka-gandhi" }],
        quiz: {
          q: "What did Maneka Gandhi (1978) require of a law that takes away personal liberty?",
          options: ["Only that it is passed by Parliament", "That its procedure is fair, just and reasonable", "That the President approves it", "That it is temporary"],
          answer: 1,
          why: "The Court held that 'procedure established by law' must be fair, just and reasonable, not arbitrary, and read Articles 14, 19 and 21 together."
        }
      },
      {
        title: "Life means more than survival",
        body: [
          "The Court then read new rights into 'life': a speedy trial for undertrial prisoners (Hussainara Khatoon, 1979), livelihood for pavement dwellers facing eviction (Olga Tellis, 1985), and a workplace free of sexual harassment (Vishaka, 1997, which laid down guidelines until Parliament legislated in 2013)."
        ],
        embeds: [{ kind: "case", id: "hussainara-khatoon" }, { kind: "case", id: "olga-tellis" }, { kind: "case", id: "vishaka" }]
      },
      {
        title: "2017: privacy",
        body: [
          "In K.S. Puttaswamy (2017), nine judges unanimously held that privacy is a fundamental right, protected mainly by Article 21 and the freedoms of Part III. They overruled earlier decisions that had said otherwise — and declared ADM Jabalpur wrong."
        ],
        embeds: [{ kind: "case", id: "puttaswamy-privacy" }]
      },
      {
        title: "Dignity, choice and the end of life",
        body: [
          "Privacy and dignity became the foundation for later rulings: decriminalising consensual same-sex relations (Navtej Singh Johar, 2018) and recognising a right to die with dignity through living wills and passive euthanasia (Common Cause, 2018).",
          "Education took a different route: the 86th Amendment wrote it into the text as Article 21A, in force since 2010."
        ],
        embeds: [{ kind: "case", id: "navtej-johar" }, { kind: "case", id: "common-cause" }, { kind: "article", id: "21A" }]
      }
    ]
  },

  {
    id: "basic-structure",
    title: "Can Parliament change everything?",
    tagline: "The 25-year tug of war between Parliament and the Supreme Court that produced the basic structure doctrine.",
    minutes: 9,
    color: "#6d28d9",
    themes: ["amendment-process", "judiciary"],
    steps: [
      {
        title: "The amending power",
        body: [
          "Article 368 lets Parliament amend the Constitution by a special majority — and, for provisions affecting the federal structure, with ratification by half the States.",
          "But the Constitution also says (Article 13) that the State shall not make any 'law' that takes away fundamental rights. Is a constitutional amendment a 'law'? That question started it all."
        ],
        embeds: [{ kind: "tm", article: "368", asof: "1971-11-04", mode: "diff", caption: "Article 368 before the 24th Amendment (1971)" }, { kind: "article", id: "13" }]
      },
      {
        title: "Round one: Parliament wins (1951, 1964)",
        body: [
          "Land-reform laws were being struck down under the right to property, so the 1st Amendment (1951) created the Ninth Schedule to shield them. In Shankari Prasad (1951) and Sajjan Singh (1964) the Court held that amendments are not 'law' under Article 13, so Parliament could amend even fundamental rights."
        ],
        embeds: [{ kind: "case", id: "shankari-prasad" }, { kind: "case", id: "sajjan-singh" }]
      },
      {
        title: "Round two: the Court strikes back (1967)",
        body: [
          "In Golaknath (1967), eleven judges ruled 6:5 that Parliament could not amend fundamental rights at all. Parliament responded with the 24th Amendment (1971), stating that Article 13 does not apply to amendments made under Article 368."
        ],
        embeds: [{ kind: "case", id: "golaknath" }, { kind: "amendment", n: 24 }],
        quiz: {
          q: "What did Golaknath (1967) hold?",
          options: ["Parliament can amend any part of the Constitution", "Parliament cannot amend fundamental rights", "Only the States can amend the Constitution", "The Ninth Schedule is invalid"],
          answer: 1,
          why: "The 6:5 majority held that a constitutional amendment is 'law' under Article 13, so it could not abridge fundamental rights."
        }
      },
      {
        title: "The compromise: Kesavananda Bharati (1973)",
        body: [
          "Thirteen judges sat — the largest bench in the Court's history. By 7:6 they held that Parliament can amend any part of the Constitution, including fundamental rights, but cannot destroy its 'basic structure'.",
          "The basic structure is not listed anywhere in the text. Over time courts have identified features such as the supremacy of the Constitution, democracy, federalism, secularism, the separation of powers, judicial review, free and fair elections and the rule of law."
        ],
        embeds: [{ kind: "case", id: "kesavananda-bharati" }],
        quiz: {
          q: "Which Article of the Constitution lists the 'basic structure'?",
          options: ["Article 13", "Article 368", "The Preamble", "None — it was developed by the courts"],
          answer: 3,
          why: "The doctrine is judge-made, from Kesavananda Bharati (1973) onwards; courts identify its features case by case."
        }
      },
      {
        title: "Testing the doctrine (1975–1980)",
        body: [
          "The doctrine was soon used: in 1975 to strike down the clause shielding the Prime Minister's election, and in Minerva Mills (1980) to strike down the 42nd Amendment's attempt to make amendments immune from review.",
          "In Waman Rao (1980) the Court drew a line: laws added to the Ninth Schedule after 24 April 1973 (the date of Kesavananda) can be tested against the basic structure."
        ],
        embeds: [{ kind: "case", id: "indira-gandhi-raj-narain" }, { kind: "case", id: "minerva-mills" }, { kind: "case", id: "waman-rao" }]
      },
      {
        title: "The doctrine today",
        body: [
          "In I.R. Coelho (2007) nine judges confirmed that Ninth Schedule laws added after 24 April 1973 can be struck down if they damage the basic structure. In 2015 the Court used the doctrine to strike down the 99th Amendment, which had created the National Judicial Appointments Commission, to protect judicial independence."
        ],
        embeds: [{ kind: "case", id: "ir-coelho" }, { kind: "case", id: "njac" }]
      }
    ]
  },

  {
    id: "reservations",
    title: "Reservations and social justice",
    tagline: "How the Constitution moved from formal equality to affirmative action — through amendments, Commissions and court battles.",
    minutes: 9,
    color: "#a16207",
    themes: ["reservation", "equality"],
    steps: [
      {
        title: "Equality, but not identical treatment",
        body: [
          "Articles 14 to 16 promise equality, but they also allow special measures for disadvantaged groups. From the start, Article 16(4) let the State reserve government posts for backward classes not adequately represented."
        ],
        embeds: [{ kind: "article", id: "14" }, { kind: "article", id: "16" }]
      },
      {
        title: "1951: the first amendment",
        body: [
          "In Champakam Dorairajan (1951) the Supreme Court struck down caste-based quotas for college admissions in Madras. Parliament's answer was the 1st Amendment, which added Article 15(4) allowing special provisions for socially and educationally backward classes, SCs and STs.",
          "See it in the time machine: Article 15 in 1950 had no clause (4) — and none of the later clauses either."
        ],
        embeds: [{ kind: "case", id: "champakam-dorairajan" }, { kind: "tm", article: "15", asof: "1950-01-26", mode: "diff", caption: "Article 15 in 1950, with later additions highlighted" }]
      },
      {
        title: "Mandal and the 50% ceiling",
        body: [
          "In 1990 the Union implemented the Mandal Commission's recommendation of 27% reservation for Other Backward Classes in central government jobs. In Indra Sawhney (1992), nine judges upheld it but laid down key limits: reservations should generally not exceed 50%, the 'creamy layer' among OBCs must be excluded, and there should be no reservation in promotions."
        ],
        embeds: [{ kind: "case", id: "indra-sawhney" }],
        quiz: {
          q: "Which case set the general 50% ceiling on reservations?",
          options: ["Champakam Dorairajan", "Indra Sawhney", "M. Nagaraj", "Janhit Abhiyan"],
          answer: 1,
          why: "Indra Sawhney (1992) held that reservations should ordinarily not exceed 50%, save in extraordinary situations."
        }
      },
      {
        title: "Promotions: a back-and-forth",
        body: [
          "Parliament responded with Article 16(4A) (77th Amendment, 1995) allowing reservation in promotion for SCs and STs, then added the carry-forward of unfilled reserved vacancies (16(4B), 81st Amendment, 2000) and consequential seniority (85th, 2001).",
          "The Court upheld these in M. Nagaraj (2006) subject to conditions, and in Jarnail Singh (2018) dropped the requirement to show data on the backwardness of SCs and STs."
        ],
        embeds: [{ kind: "tm", article: "16", asof: "1995-06-16", mode: "diff", caption: "Article 16 before the 77th Amendment" }, { kind: "case", id: "m-nagaraj" }, { kind: "case", id: "jarnail-singh" }]
      },
      {
        title: "New groups, new questions",
        body: [
          "The 103rd Amendment (2019) allowed a separate reservation of up to 10% for economically weaker sections outside the existing reserved categories; the Supreme Court upheld it 3:2 in Janhit Abhiyan (2022).",
          "The 102nd Amendment (2018) gave the National Commission for Backward Classes constitutional status; after the Maratha reservation case (2021) read it as taking away the States' power to identify backward classes, the 105th Amendment (2021) restored that power.",
          "In 2024 a seven-judge bench held in Davinder Singh that States may sub-classify Scheduled Castes to give a larger share to the most disadvantaged among them."
        ],
        embeds: [{ kind: "case", id: "janhit-abhiyan" }, { kind: "case", id: "davinder-singh" }, { kind: "article", id: "342A" }],
        quiz: {
          q: "What did the Supreme Court decide in Davinder Singh (2024)?",
          options: ["SC reservation must end by 2030", "States may sub-classify Scheduled Castes", "The EWS quota is unconstitutional", "The creamy layer applies to promotions only"],
          answer: 1,
          why: "A seven-judge bench (6:1) allowed States to sub-classify Scheduled Castes, overruling E.V. Chinnaiah (2004)."
        }
      },
      {
        title: "Women in legislatures",
        body: [
          "The 106th Amendment (2023) reserves one-third of seats in the Lok Sabha, State Assemblies and the Delhi Assembly for women. It was brought into force on 16 April 2026, but the reserved seats take effect only after a delimitation based on the first census taken after that date, once its figures are published."
        ],
        embeds: [{ kind: "article", id: "330A" }, { kind: "amendment", n: 106 }]
      }
    ]
  },

  {
    id: "federalism-gst",
    title: "Who makes which law? Federalism and GST",
    tagline: "How power is split between the Union and the States — and how GST rewired India's fiscal federalism.",
    minutes: 8,
    color: "#4338ca",
    themes: ["federalism", "finance-tax"],
    steps: [
      {
        title: "Three lists",
        body: [
          "Article 246 divides law-making power using three lists in the Seventh Schedule: the Union List (defence, foreign affairs, banking…), the State List (police, public health, agriculture…) and the Concurrent List (criminal law, education, forests…), where both can legislate.",
          "Anything not on any list — the 'residuary' power — belongs to Parliament."
        ],
        embeds: [{ kind: "article", id: "246" }, { kind: "article", id: "248" }],
        quiz: {
          q: "Who can make laws on a subject that appears in none of the three Lists?",
          options: ["The States", "Parliament", "Both, concurrently", "Nobody until the Constitution is amended"],
          answer: 1,
          why: "Article 248 gives Parliament exclusive power over any matter not listed in the Concurrent or State List (entry 97 of the Union List)."
        }
      },
      {
        title: "When laws clash",
        body: [
          "If a State law on a Concurrent List subject conflicts with a Union law, the Union law prevails — unless the State law was reserved for and received the President's assent (Article 254(2)).",
          "Parliament can also legislate on State subjects in special situations: in the national interest after a Rajya Sabha resolution, during an emergency, at the request of two or more States, or to implement treaties."
        ],
        embeds: [{ kind: "article", id: "254" }, { kind: "article", id: "249" }]
      },
      {
        title: "When a State government is dismissed",
        body: [
          "Article 356 lets the President take over a State's government if it 'cannot be carried on in accordance with the Constitution'. It has been used over a hundred times, often for political ends.",
          "S.R. Bommai (1994) changed that: the proclamation is open to judicial review, a government's majority must be tested on the floor of the House, and secularism is part of the basic structure."
        ],
        embeds: [{ kind: "article", id: "356" }, { kind: "case", id: "sr-bommai" }]
      },
      {
        title: "Sharing the money",
        body: [
          "The Union collects most of the big taxes but the States deliver most public services. Every five years a Finance Commission recommends how the divisible pool of central taxes is shared; the Fifteenth and Sixteenth Commissions set the States' share at 41%."
        ],
        embeds: [{ kind: "article", id: "270" }, { kind: "article", id: "280" }]
      },
      {
        title: "GST: one tax, two governments",
        body: [
          "The 101st Amendment (2016) created the Goods and Services Tax. New Article 246A lets both Parliament and State legislatures tax supplies of goods and services at the same time, replacing a tangle of central and state indirect taxes.",
          "Look up Article 246A as it stood on 1 January 2016 in the time machine: it did not yet exist."
        ],
        embeds: [{ kind: "amendment", n: 101 }, { kind: "tm", article: "246A", asof: "2016-01-01", mode: "read", caption: "Article 246A on 1 January 2016" }]
      },
      {
        title: "The GST Council",
        body: [
          "Rates and rules are recommended by the GST Council (Article 279A): the Union Finance Minister (as chair), a Union Minister of State for Finance or Revenue, and a minister from every State. The Union's vote counts for one-third and the States together for two-thirds; decisions need three-fourths of the weighted votes.",
          "In Mohit Minerals (2022) the Supreme Court held that the Council's recommendations are persuasive, not binding, on Parliament and the State legislatures."
        ],
        embeds: [{ kind: "article", id: "279A" }, { kind: "case", id: "mohit-minerals" }],
        quiz: {
          q: "In the GST Council, what weight do the States' votes carry together?",
          options: ["One-third", "One-half", "Two-thirds", "Three-fourths"],
          answer: 2,
          why: "Under Article 279A(9) the Union's vote carries one-third of the total votes cast and all the States together two-thirds; a decision needs at least three-fourths of the weighted votes of members present and voting."
        }
      }
    ]
  }
];
