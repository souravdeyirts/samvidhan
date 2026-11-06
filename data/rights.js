/* "Know your rights": everyday situations mapped to constitutional rights.
   General information, not legal advice. Schema:
   { id, cat, q (the situation, in the user's words), tags (search words), short (one-paragraph answer),
     rights: [{ text, refs: [article ids] }], steps: [what you can do], limits: [exceptions / what the right does not cover],
     cases: [case ids in judgments.js], also: [other judgments or laws named in text], help: [helpline keys] } */
window.COI_RIGHTS_HELP = {
  emergency: { label: "Emergency (police, fire, ambulance)", number: "112" },
  legalaid: { label: "Free legal aid — National Legal Services Authority", number: "15100" },
  child: { label: "Childline (children in distress)", number: "1098" },
  women: { label: "Women's helpline", number: "181" }
};

window.COI_RIGHTS_CATS = [
  { id: "police", name: "Police, arrest & custody" },
  { id: "speech", name: "Speech, protest & the internet" },
  { id: "equality", name: "Equality & dignity" },
  { id: "work", name: "Work & exploitation" },
  { id: "religion", name: "Religion & conscience" },
  { id: "privacy", name: "Privacy & your data" },
  { id: "education", name: "Education" },
  { id: "home", name: "Home, land & property" },
  { id: "health", name: "Health, food & environment" },
  { id: "family", name: "Family & personal life" },
  { id: "identity", name: "Citizenship, language & identity" },
  { id: "civic", name: "Voting & information" },
  { id: "court", name: "Going to court" }
];

window.COI_RIGHTS = [
  {
    id: "arrested-not-told-why",
    cat: "police",
    q: "I was arrested and the police won't tell me why",
    tags: ["arrest", "arrested", "police", "detained", "grounds", "custody", "lawyer", "why"],
    short: "You have a constitutional right to be told the grounds of your arrest as soon as possible, and to consult a lawyer of your choice. In February 2025 the Supreme Court held that an arrest made without informing the person of the grounds violates Article 21 and is illegal, and in November 2025 it held that the grounds must be given in writing, in a language the person understands.",
    rights: [
      { text: "To be informed, as soon as may be, of the grounds of arrest.", refs: ["22"] },
      { text: "To consult, and be defended by, a lawyer of your choice.", refs: ["22"] },
      { text: "Not to be deprived of personal liberty except by a fair, just and reasonable procedure established by law.", refs: ["21"] }
    ],
    steps: [
      "Ask the arresting officer, calmly, for the grounds of arrest in writing and for an arrest memo; you are entitled to know the offence alleged.",
      "Ask that a relative or friend be informed of the arrest and where you are being held — the police must do this under the Bharatiya Nagarik Suraksha Sanhita, 2023 (which replaced the Code of Criminal Procedure from 1 July 2024).",
      "Ask whether the offence is bailable; for bailable offences you have a right to be released on bail.",
      "Ask for a lawyer. If you cannot afford one, ask for free legal aid — the Magistrate must inform you of it.",
      "If someone is detained illegally, a relative or friend can file a habeas corpus petition in the High Court (Article 226) or the Supreme Court (Article 32)."
    ],
    limits: [
      "Article 22's arrest safeguards do not apply to an enemy alien, or to a person detained under a preventive detention law; preventive detention has its own safeguards in Article 22(4)–(7)."
    ],
    cases: ["maneka-gandhi"],
    also: ["D.K. Basu v. State of West Bengal (1997) — arrest and custody guidelines", "Vihaan Kumar v. State of Haryana (2025) — failure to inform grounds of arrest makes the arrest illegal", "Mihir Rajesh Shah v. State of Maharashtra (2025) — grounds of arrest to be given in writing, in a language the person understands"],
    help: ["legalaid", "emergency"]
  },
  {
    id: "custodial-violence",
    cat: "police",
    q: "The police beat me or ill-treated me in custody",
    tags: ["beaten", "beat", "torture", "custody", "lockup", "custodial violence", "police brutality", "assault", "third degree", "injury"],
    short: "Torture and ill-treatment in custody violate the right to life with dignity. The Supreme Court has laid down binding safeguards for everyone in custody (D.K. Basu, 1997), held that courts can order the State to pay compensation for custodial violence (Nilabati Behera, 1993), and directed CCTV cameras in police stations (Paramvir Singh Saini, 2020).",
    rights: [
      { text: "Life and personal liberty, including dignity and freedom from torture and cruel treatment.", refs: ["21"] },
      { text: "Not to be compelled to incriminate yourself — confessions extracted by force are not evidence.", refs: ["20"] },
      { text: "To consult a lawyer and to be produced before a Magistrate within 24 hours.", refs: ["22"] },
      { text: "To approach the High Court or Supreme Court for protection and compensation.", refs: ["226", "32"] }
    ],
    steps: [
      "When produced before the Magistrate, say clearly that you were ill-treated, show any injuries, and ask for a medical examination and for this to be recorded.",
      "Ask your family or lawyer to file complaints with the Superintendent of Police and the Magistrate, and with the State Human Rights Commission or the National Human Rights Commission.",
      "Ask for preservation of CCTV footage from the police station as early as possible.",
      "A petition in the High Court can seek protection, an independent inquiry and compensation; free legal aid is available on 15100."
    ],
    limits: ["Compensation awarded by a court is in addition to — not a substitute for — criminal or disciplinary action against the officers responsible."],
    cases: [],
    also: ["D.K. Basu v. State of West Bengal (1997)", "Nilabati Behera v. State of Orissa (1993) — compensation for custodial death", "Paramvir Singh Saini v. Baljit Singh (2020) — CCTV in police stations"],
    help: ["legalaid", "emergency"]
  },
  {
    id: "held-more-than-24-hours",
    cat: "police",
    q: "I've been held at the police station for more than 24 hours",
    tags: ["24 hours", "magistrate", "custody", "lockup", "police station", "detained", "illegal detention"],
    short: "Anyone arrested must be produced before the nearest Magistrate within 24 hours (excluding travel time). Holding you longer without a Magistrate's order is illegal.",
    rights: [
      { text: "To be produced before the nearest Magistrate within 24 hours of arrest, excluding the time needed for the journey.", refs: ["22"] },
      { text: "Not to be kept in custody beyond that period without the Magistrate's authority.", refs: ["22"] },
      { text: "To approach the High Court or Supreme Court for a writ of habeas corpus.", refs: ["226", "32"] }
    ],
    steps: [
      "Note the date and time of arrest — it is recorded in the arrest memo.",
      "Tell your family or lawyer the time of arrest; they can raise it before the Magistrate or file a habeas corpus petition.",
      "At the Magistrate's court, tell the Magistrate if you were held beyond 24 hours or ill-treated; you can ask for a medical examination."
    ],
    limits: ["Does not apply to preventive detention, which is governed by Article 22(4)–(7) and the relevant detention law."],
    cases: [],
    also: ["D.K. Basu v. State of West Bengal (1997)"],
    help: ["legalaid"]
  },
  {
    id: "forced-to-confess",
    cat: "police",
    q: "The police are pressuring me to confess or take a lie-detector test",
    tags: ["confess", "confession", "narco", "polygraph", "lie detector", "brain mapping", "interrogation", "statement", "self-incrimination"],
    short: "No person accused of an offence can be compelled to be a witness against themselves. Narco-analysis, polygraph and brain-mapping tests cannot be conducted without your consent, and a confession made to a police officer cannot be used as evidence against you.",
    rights: [
      { text: "Not to be compelled to be a witness against yourself.", refs: ["20"] },
      { text: "To personal liberty and freedom from coercive interrogation.", refs: ["21"] }
    ],
    steps: [
      "You may decline to answer questions that would incriminate you, and decline consent to narco, polygraph or brain-mapping tests.",
      "Ask for your lawyer; you can have a lawyer present during interrogation, though not throughout it.",
      "If you are threatened or mistreated, tell the Magistrate when you are produced and ask for a medical examination."
    ],
    limits: [
      "The protection is against testimonial compulsion. You can still be required to give fingerprints, handwriting samples or blood samples under law.",
      "A confession recorded before a Magistrate, following the required safeguards, can be used as evidence."
    ],
    cases: [],
    also: ["Selvi v. State of Karnataka (2010) — involuntary narco, polygraph and brain-mapping tests unconstitutional", "Bharatiya Sakshya Adhiniyam, 2023 — confessions to police officers not provable"],
    help: ["legalaid"]
  },
  {
    id: "undertrial-long-time",
    cat: "police",
    q: "My relative has been in jail for years waiting for trial",
    tags: ["undertrial", "jail", "trial delay", "bail", "speedy trial", "prison", "waiting"],
    short: "A speedy trial is part of the right to life and personal liberty. The law also provides for release on bail of undertrials who have spent a long part of the maximum possible sentence in custody.",
    rights: [
      { text: "To a speedy trial, read into the right to life and personal liberty.", refs: ["21"] },
      { text: "To free legal aid if they cannot afford a lawyer.", refs: ["39A", "21"] }
    ],
    steps: [
      "Contact the District Legal Services Authority (or call 15100) for a free lawyer to file a bail application.",
      "Under the Bharatiya Nagarik Suraksha Sanhita, an undertrial who has been detained for half the maximum sentence for the offence (one-third for a first-time offender) must ordinarily be released on bail — this does not apply to offences punishable with death or life imprisonment, or where investigations or trials in more than one offence or case are pending against the person.",
      "Prolonged delay can itself be a ground for bail in the High Court or Supreme Court."
    ],
    limits: ["Courts weigh the seriousness of the offence and other factors; bail is not automatic for every undertrial."],
    cases: ["hussainara-khatoon"],
    also: ["Bharatiya Nagarik Suraksha Sanhita, 2023 — release of undertrials"],
    help: ["legalaid"]
  },
  {
    id: "cant-afford-lawyer",
    cat: "court",
    q: "I need a lawyer but can't afford one",
    tags: ["lawyer", "legal aid", "free lawyer", "poor", "advocate", "afford", "money", "nalsa"],
    short: "The State must ensure that no one is denied justice because they are poor. Free legal services are available through Legal Services Authorities in every district — and an accused person must be offered free legal aid from their first production before a Magistrate.",
    rights: [
      { text: "Equal justice and free legal aid (a Directive Principle the courts have enforced through Article 21).", refs: ["39A", "21"] },
      { text: "An arrested person's right to be defended by a lawyer.", refs: ["22"] }
    ],
    steps: [
      "Contact your District Legal Services Authority at the district court, or call the national legal aid helpline 15100.",
      "People eligible regardless of income include women, children, members of Scheduled Castes and Scheduled Tribes, persons in custody, persons with disabilities, victims of trafficking or disasters, and industrial workmen; others qualify below an income limit.",
      "If you are in custody, ask the Magistrate for a legal-aid lawyer at your first appearance."
    ],
    limits: ["Legal aid covers lawyers and court costs in eligible cases; it does not cover every kind of private dispute or business matter."],
    cases: ["hussainara-khatoon"],
    also: ["Legal Services Authorities Act, 1987", "Khatri v. State of Bihar (1981) — legal aid from first production"],
    help: ["legalaid"]
  },
  {
    id: "social-media-post",
    cat: "speech",
    q: "Can I be arrested for criticising the government on social media?",
    tags: ["social media", "post", "tweet", "facebook", "criticise", "government", "free speech", "66a", "online"],
    short: "Criticising the government is protected speech. The Supreme Court struck down Section 66A of the IT Act in 2015, so 'offensive' or 'annoying' online posts are not a crime in themselves. But speech can still be restricted on the grounds listed in Article 19(2), such as public order, defamation or incitement to an offence.",
    rights: [
      { text: "Freedom of speech and expression, including online and including criticism of the government.", refs: ["19"] },
      { text: "Restrictions must be reasonable and fall within the grounds in Article 19(2).", refs: ["19"] }
    ],
    steps: [
      "If a case is registered against you under Section 66A, it is invalid — the provision was struck down in 2015; point this out and seek legal help.",
      "If you are booked under other laws (for example defamation or promoting enmity between groups), consult a lawyer; you may seek anticipatory bail or have the case quashed by the High Court.",
      "Keep copies of what you posted and any notices you receive."
    ],
    limits: [
      "Speech that defames a person, incites violence or an offence, promotes enmity between groups, or threatens public order or the sovereignty of India can be restricted by law.",
      "Platforms can also remove content under their own rules and under IT law."
    ],
    cases: ["shreya-singhal"],
    also: [],
    help: ["legalaid"]
  },
  {
    id: "peaceful-protest",
    cat: "speech",
    q: "Do I have a right to protest?",
    tags: ["protest", "demonstration", "march", "assembly", "dharna", "rally", "strike", "gathering"],
    short: "Yes — all citizens have the right to assemble peaceably and without arms. The State can impose reasonable restrictions in the interests of public order or the sovereignty and integrity of India, such as requiring permission or designating protest sites.",
    rights: [
      { text: "To assemble peaceably and without arms.", refs: ["19"] },
      { text: "Freedom of speech and expression, which protest also expresses.", refs: ["19"] }
    ],
    steps: [
      "Check local rules: many cities require intimation or permission from the police for public meetings and processions.",
      "Keep the protest peaceful and unarmed; follow lawful directions about place and time.",
      "If permission is refused arbitrarily, the decision can be challenged in the High Court."
    ],
    limits: [
      "Prohibitory orders can be issued to prevent disturbance of public order.",
      "The Supreme Court has held that public roads and spaces cannot be occupied indefinitely for protests (Amit Sahni, 2020)."
    ],
    cases: [],
    also: ["Amit Sahni v. Commissioner of Police (2020)"],
    help: []
  },
  {
    id: "internet-shutdown",
    cat: "speech",
    q: "The government has shut down the internet in my area",
    tags: ["internet", "shutdown", "mobile data", "suspension", "network", "telecom", "blackout"],
    short: "Freedom of speech and the freedom to carry on trade through the internet are protected. In Anuradha Bhasin (2020) the Supreme Court held that internet shutdowns must be necessary and proportionate, cannot be indefinite, and that the orders must be published and periodically reviewed.",
    rights: [
      { text: "Freedom of speech and expression through the internet.", refs: ["19"] },
      { text: "Freedom to practise a profession or carry on business, including online.", refs: ["19"] }
    ],
    steps: [
      "Ask for, or look up, the suspension order — it must be published and state its reasons and duration.",
      "A shutdown order can be challenged before the High Court as disproportionate or unreasoned.",
      "Businesses affected can raise the impact on their right to trade."
    ],
    limits: ["The internet can be suspended temporarily for public safety or public order under telecom law, subject to the safeguards above."],
    cases: ["anuradha-bhasin"],
    also: [],
    help: []
  },
  {
    id: "denied-entry-caste-religion",
    cat: "equality",
    q: "I was refused entry to a shop, hotel or public place because of my caste or religion",
    tags: ["caste", "religion", "discrimination", "shop", "hotel", "restaurant", "temple", "well", "untouchability", "dalit", "entry"],
    short: "No citizen can be denied access to shops, restaurants, hotels, places of entertainment, or public wells, tanks, roads and places of public resort on grounds of religion, race, caste, sex or place of birth. 'Untouchability' is abolished and practising it in any form is a crime.",
    rights: [
      { text: "Equal access to shops, public restaurants, hotels, places of public entertainment and public facilities.", refs: ["15"] },
      { text: "Abolition of untouchability; enforcing any disability arising from it is an offence.", refs: ["17"] },
      { text: "Hindu religious institutions of a public character can be thrown open to all classes and sections of Hindus by law.", refs: ["25"] }
    ],
    steps: [
      "Report the incident to the police and ask for an FIR; caste-based exclusion of Scheduled Castes or Scheduled Tribes is an offence under the SC/ST (Prevention of Atrocities) Act, 1989, and untouchability under the Protection of Civil Rights Act, 1955.",
      "If the police do not register the complaint, you can approach the Superintendent of Police, the Magistrate, or the National/State Commission for Scheduled Castes or Scheduled Tribes.",
      "Collect evidence: names, time, witnesses, photos or video."
    ],
    limits: ["Article 15(2) covers access to shops and public places; it does not by itself regulate every private home or private club."],
    cases: [],
    also: ["Scheduled Castes and Scheduled Tribes (Prevention of Atrocities) Act, 1989", "Protection of Civil Rights Act, 1955"],
    help: ["emergency", "legalaid"]
  },
  {
    id: "government-job-discrimination",
    cat: "equality",
    q: "A government employer treated me differently because of my sex, religion or where I'm from",
    tags: ["government job", "public employment", "discrimination", "sex", "gender", "religion", "domicile", "residence", "recruitment"],
    short: "In government jobs there must be equality of opportunity. No citizen can be ineligible for, or discriminated against in, public employment on grounds of religion, race, caste, sex, descent, place of birth or residence — subject to reservations and to residence requirements Parliament may prescribe.",
    rights: [
      { text: "Equality before the law and equal protection of the laws.", refs: ["14"] },
      { text: "Equality of opportunity in public employment.", refs: ["16"] }
    ],
    steps: [
      "Ask for the written reasons for the decision; you can use the Right to Information Act to obtain records.",
      "Use the department's grievance or appeal process first; service disputes of government employees often go to the Central or State Administrative Tribunal.",
      "Arbitrary or discriminatory decisions can be challenged before the High Court under Article 226."
    ],
    limits: ["Reservations for backward classes, SCs, STs and economically weaker sections, and some residence requirements for State jobs, are permitted by the Constitution itself."],
    cases: ["indra-sawhney"],
    also: [],
    help: []
  },
  {
    id: "transgender-recognition",
    cat: "equality",
    q: "I'm transgender — what does the Constitution protect?",
    tags: ["transgender", "third gender", "gender identity", "trans", "lgbt", "hijra", "identity"],
    short: "In NALSA (2014) the Supreme Court recognised transgender persons as a 'third gender' with the right to self-identify their gender, protected by Articles 14, 15, 16, 19 and 21. Consensual same-sex relations between adults were decriminalised in 2018. A 2026 amendment to the transgender persons law (assented to on 30 March 2026) removed the statutory right to self-perceived gender identity and narrowed who is covered; it is under challenge in the Supreme Court.",
    rights: [
      { text: "Equality and non-discrimination, which include gender identity.", refs: ["14", "15", "16"] },
      { text: "Expression of gender identity as part of free expression.", refs: ["19"] },
      { text: "Dignity, privacy and personal autonomy.", refs: ["21"] }
    ],
    steps: [
      "A certificate of identity as a transgender person is issued by the District Magistrate under the Transgender Persons (Protection of Rights) Act, 2019; since the 2026 amendment, the Magistrate decides after a recommendation from a medical board. Check the current procedure with the district social welfare office.",
      "Discrimination in education, employment, healthcare or housing against persons covered by that Act is prohibited; complaints can be made to the complaint officer of the establishment.",
      "Violence or harassment can be reported to the police."
    ],
    limits: ["The Supreme Court in 2023 declined to recognise a right to marry for same-sex or queer couples, leaving the question to Parliament, though transgender persons in heterosexual relationships can marry under existing law.", "The constitutional rights recognised in NALSA continue; how far the 2026 amendment can restrict them is for the Supreme Court to decide."],
    cases: ["nalsa", "navtej-johar", "supriyo-chakraborty"],
    also: ["Transgender Persons (Protection of Rights) Act, 2019", "Transgender Persons (Protection of Rights) Amendment Act, 2026"],
    help: []
  },
  {
    id: "harassment-at-work",
    cat: "work",
    q: "I'm facing sexual harassment at my workplace",
    tags: ["sexual harassment", "posh", "workplace", "office", "boss", "colleague", "women", "internal committee"],
    short: "A workplace free of sexual harassment is part of the rights to equality, to practise a profession and to life with dignity. The Vishaka guidelines (1997) became the POSH Act, 2013: workplaces with 10 or more employees must have an Internal Committee to hear complaints.",
    rights: [
      { text: "Equality and freedom from sex discrimination.", refs: ["14", "15"] },
      { text: "Freedom to practise any profession or occupation.", refs: ["19"] },
      { text: "Life with dignity.", refs: ["21"] }
    ],
    steps: [
      "Make a written complaint to your employer's Internal Committee within three months of the incident (the Committee can extend this by another three months for good reason).",
      "If your workplace has fewer than 10 employees, or the complaint is against the employer, approach the Local Committee set up by the District Officer.",
      "Sexual harassment is also a criminal offence — you can file a police complaint as well.",
      "Keep records: messages, emails, dates and witnesses."
    ],
    limits: ["The POSH Act protects women; workplace policies may extend protection to others."],
    cases: ["vishaka"],
    also: ["Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013"],
    help: ["women", "emergency"]
  },
  {
    id: "forced-labour",
    cat: "work",
    q: "I'm being made to work without pay, or to pay off a debt",
    tags: ["forced labour", "bonded labour", "unpaid", "debt", "begar", "minimum wage", "trafficking", "slavery"],
    short: "Trafficking in human beings, begar (unpaid forced work) and other forms of forced labour are prohibited, and the prohibition applies to private employers too. The Supreme Court has held that paying less than the minimum wage can itself amount to forced labour.",
    rights: [
      { text: "Freedom from trafficking, begar and forced labour.", refs: ["23"] },
      { text: "Life with dignity, including fair conditions of work.", refs: ["21"] }
    ],
    steps: [
      "Bonded labour is abolished: any debt bondage is void. Report it to the District Magistrate, who is responsible for releasing and rehabilitating bonded labourers.",
      "Non-payment of minimum wages can be raised with the labour department.",
      "Trafficking can be reported to the police (112)."
    ],
    limits: ["The State can impose compulsory service for public purposes (for example military or social service) without discrimination."],
    cases: [],
    also: ["Bonded Labour System (Abolition) Act, 1976", "People's Union for Democratic Rights v. Union of India (1982)"],
    help: ["emergency", "legalaid"]
  },
  {
    id: "child-labour",
    cat: "work",
    q: "I've seen a child working in a factory or dangerous job",
    tags: ["child labour", "child", "factory", "mine", "hazardous", "minor", "working child", "dhaba"],
    short: "No child below 14 may be employed in any factory, mine or other hazardous work. Under the child labour law, children below 14 cannot be employed in any occupation at all, except helping their family after school or as child artists; adolescents (14–18) cannot work in hazardous occupations.",
    rights: [
      { text: "Prohibition of employment of children below 14 in factories, mines and hazardous employment.", refs: ["24"] },
      { text: "Free and compulsory education for children aged 6–14.", refs: ["21A"] }
    ],
    steps: [
      "Call Childline 1098 or the emergency number 112.",
      "Report to the police or the district labour department; employing a child is an offence.",
      "The rescued child is entitled to rehabilitation and admission to school."
    ],
    limits: ["Helping the family or a family enterprise outside school hours, and work as a child artist, are permitted subject to conditions."],
    cases: [],
    also: ["Child and Adolescent Labour (Prohibition and Regulation) Act, 1986"],
    help: ["child", "emergency"]
  },
  {
    id: "practise-or-change-religion",
    cat: "religion",
    q: "Can I freely practise my religion — or change it?",
    tags: ["religion", "faith", "convert", "conversion", "worship", "practise", "propagate", "belief", "atheist"],
    short: "Everyone has freedom of conscience and the right to freely profess, practise and propagate religion, subject to public order, morality and health. You can choose and change your own faith, but the Supreme Court has held there is no fundamental right to convert another person.",
    rights: [
      { text: "Freedom of conscience and to profess, practise and propagate religion.", refs: ["25"] },
      { text: "Religious denominations can manage their own religious affairs.", refs: ["26"] },
      { text: "No tax may be used specifically to promote a particular religion.", refs: ["27"] }
    ],
    steps: [
      "Several States have laws regulating religious conversion, some requiring prior notice to the District Magistrate — check the law in your State.",
      "If you are threatened or attacked for your faith, report it to the police.",
      "Discrimination by the State on grounds of religion can be challenged in court."
    ],
    limits: ["The State can regulate secular activities linked to religion, and enact social welfare and reform laws.", "Practices must not violate public order, morality or health."],
    cases: [],
    also: ["Rev. Stainislaus v. State of Madhya Pradesh (1977)"],
    help: []
  },
  {
    id: "religious-instruction-school",
    cat: "religion",
    q: "My child's school is making them attend religious prayers or instruction",
    tags: ["school", "prayer", "religious instruction", "assembly", "child", "worship", "government school"],
    short: "Schools wholly funded by the government cannot give religious instruction at all. In schools that are recognised by or receive aid from the State, no student can be made to take part in religious instruction or worship without consent (a parent's consent for a minor).",
    rights: [
      { text: "No religious instruction in institutions wholly maintained out of State funds; no compulsion in State-recognised or aided institutions.", refs: ["28"] },
      { text: "Freedom of conscience.", refs: ["25"] }
    ],
    steps: [
      "Write to the school stating that you do not consent to your child attending religious instruction or worship.",
      "If the school is government-run or aided and does not comply, complain to the district education officer.",
      "The decision can be challenged in the High Court."
    ],
    limits: ["Institutions established under an endowment or trust that requires religious instruction are an exception, even if administered by the State."],
    cases: [],
    also: [],
    help: []
  },
  {
    id: "data-privacy-aadhaar",
    cat: "privacy",
    q: "Do I have to give my Aadhaar or personal data everywhere?",
    tags: ["privacy", "aadhaar", "data", "personal data", "kyc", "bank", "mobile", "phone", "surveillance", "dpdp"],
    short: "Privacy is a fundamental right (Puttaswamy, 2017). In the Aadhaar case (2018) the Supreme Court upheld Aadhaar for government welfare benefits and tax filing, but held it cannot be made mandatory for opening bank accounts, getting mobile connections or school admissions.",
    rights: [
      { text: "The right to privacy, including informational privacy.", refs: ["21"] },
      { text: "Freedom of speech and other Part III freedoms, which privacy supports.", refs: ["19"] }
    ],
    steps: [
      "You can offer other identity documents where Aadhaar is not legally required.",
      "The Digital Personal Data Protection Act, 2023 and its Rules (notified November 2025) are coming into force in phases. The Data Protection Board has been set up, but the duties of organisations and your rights to information, correction, erasure and grievance redress apply only from May 2027.",
      "Until then, complain about misuse of personal data to the organisation's grievance officer; the older data-protection rules under the Information Technology Act still apply."
    ],
    limits: ["Privacy can be limited by a law that pursues a legitimate aim and is necessary and proportionate — the test laid down in Puttaswamy."],
    cases: ["puttaswamy-privacy", "puttaswamy-aadhaar"],
    also: ["Digital Personal Data Protection Act, 2023"],
    help: []
  },
  {
    id: "school-admission",
    cat: "education",
    q: "A school refused admission to my child, or is asking for a donation",
    tags: ["school", "admission", "rte", "education", "fees", "donation", "capitation", "25%", "private school", "ews"],
    short: "Every child aged 6–14 has a fundamental right to free and compulsory education in a neighbourhood school. Private unaided schools must reserve 25% of entry-level seats for children from weaker sections and disadvantaged groups, free of cost. Schools cannot charge capitation fees or screen children for admission.",
    rights: [
      { text: "Free and compulsory education for all children aged 6 to 14.", refs: ["21A"] },
      { text: "Early childhood care and education until age six (a Directive Principle).", refs: ["45"] }
    ],
    steps: [
      "Apply for a 25% reserved seat through your State's RTE admission process (usually an online lottery).",
      "A school cannot deny admission for lack of a birth certificate or transfer certificate, or hold a screening test or interview.",
      "Complain to the district education officer or the State Commission for Protection of Child Rights."
    ],
    limits: ["Minority educational institutions are exempt from the 25% requirement (Pramati, 2014)."],
    cases: ["unni-krishnan"],
    also: ["Right of Children to Free and Compulsory Education Act, 2009", "Society for Unaided Private Schools of Rajasthan v. Union of India (2012)"],
    help: ["child"]
  },
  {
    id: "eviction-demolition",
    cat: "home",
    q: "The authorities want to demolish my house or evict me",
    tags: ["eviction", "demolition", "bulldozer", "slum", "house", "home", "encroachment", "notice"],
    short: "The right to life includes the right to livelihood, so eviction must follow a fair procedure. In November 2024 the Supreme Court held that homes cannot be demolished as punishment for an alleged crime, and laid down safeguards for demolitions, including prior notice and a hearing.",
    rights: [
      { text: "Life and livelihood, which require a fair procedure before eviction.", refs: ["21"] },
      { text: "No deprivation of property except by authority of law.", refs: ["300A"] },
      { text: "Equal treatment — the State cannot single you out arbitrarily.", refs: ["14"] }
    ],
    steps: [
      "Ask for the written notice and the order under which demolition or eviction is proposed; the Supreme Court's 2024 guidelines require a personal notice giving at least 15 days to respond, a hearing, a reasoned final order, and a further 15 days before demolition to remove the structure or challenge the order.",
      "Reply to the notice and attend any hearing; you can ask about rehabilitation or resettlement schemes.",
      "You can approach the High Court urgently to stop an illegal demolition."
    ],
    limits: ["The 2024 guidelines do not protect unauthorised structures in public places such as roads, footpaths, railway lines or water bodies, or where a court has ordered demolition."],
    cases: ["olga-tellis"],
    also: ["In re: Directions in the matter of demolition of structures (Supreme Court, 13 November 2024)"],
    help: ["legalaid"]
  },
  {
    id: "land-acquired",
    cat: "home",
    q: "The government is taking my land",
    tags: ["land", "acquisition", "compensation", "property", "farm", "highway", "project"],
    short: "Property is no longer a fundamental right, but it is a constitutional right: no one can be deprived of property except by authority of law. Land acquisition must follow the 2013 land acquisition law, which provides for fair compensation and rehabilitation.",
    rights: [
      { text: "No deprivation of property save by authority of law.", refs: ["300A"] },
      { text: "Fair procedure and equal treatment.", refs: ["14", "21"] }
    ],
    steps: [
      "Check whether a notification has been issued under the Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act, 2013; you can file objections within the time allowed.",
      "You are entitled to compensation and, where applicable, rehabilitation and resettlement benefits.",
      "Taking land without following the law — or without paying compensation — can be challenged in the High Court."
    ],
    limits: ["Property can be acquired for public purposes if the law is followed; the right is not a fundamental right under Part III."],
    cases: ["property-owners"],
    also: ["Kolkata Municipal Corporation v. Bimal Kumar Shah (2024) — seven procedural sub-rights under Article 300A", "Vidya Devi v. State of Himachal Pradesh (2020)"],
    help: ["legalaid"]
  },
  {
    id: "voting",
    cat: "civic",
    q: "I'm 18 — how do I vote, and what do I have a right to know?",
    tags: ["vote", "voting", "election", "voter id", "epic", "voter list", "nota", "candidate", "18"],
    short: "Every citizen aged 18 or above who is not otherwise disqualified has the right to be registered as a voter (universal adult franchise). You also have the right to know the criminal records, assets and education of candidates, and to choose 'None of the Above' (NOTA).",
    rights: [
      { text: "Elections on the basis of adult suffrage for everyone aged 18 and above.", refs: ["326"] },
      { text: "One general electoral roll — no exclusion on grounds of religion, race, caste or sex.", refs: ["325"] },
      { text: "Freedom of expression, which includes the voter's right to information about candidates and to vote NOTA.", refs: ["19"] }
    ],
    steps: [
      "Register using Form 6 on the Election Commission's Voters' Service Portal (voters.eci.gov.in), its official mobile app (ECINET, which is replacing the Voter Helpline app), or through your Booth Level Officer.",
      "Check that your name is on the electoral roll before the election.",
      "Read candidates' affidavits on criminal cases, assets and education, published by the Election Commission."
    ],
    limits: ["Persons of unsound mind, those disqualified for corrupt practices and some others can be excluded by law."],
    cases: ["union-v-adr", "pucl-nota"],
    also: [],
    help: []
  },
  {
    id: "government-information",
    cat: "civic",
    q: "How can I get information from a government office?",
    tags: ["rti", "information", "government", "records", "transparency", "file", "public information officer"],
    short: "The right to information flows from the freedom of speech and expression. The Right to Information Act, 2005 lets any citizen request information from public authorities, which must reply within 30 days (48 hours if life or liberty is involved).",
    rights: [
      { text: "Freedom of speech and expression, which includes the right to know.", refs: ["19"] }
    ],
    steps: [
      "Send a written application to the Public Information Officer of the public authority (online for many Central and State bodies), with the prescribed fee.",
      "If there is no reply in 30 days, or you are unhappy with it, file a first appeal with the senior officer named by the authority.",
      "A second appeal or complaint lies with the Central or State Information Commission."
    ],
    limits: ["Some information is exempt, for example where disclosure would harm national security, or personal information about individuals — an exemption widened from November 2025 by the data protection law."],
    cases: ["sp-gupta"],
    also: ["Right to Information Act, 2005"],
    help: []
  },
  {
    id: "rights-violated-where-to-go",
    cat: "court",
    q: "My fundamental rights have been violated — where do I go?",
    tags: ["writ", "court", "supreme court", "high court", "habeas corpus", "mandamus", "pil", "petition", "remedy", "fundamental rights"],
    short: "The right to approach the Supreme Court directly to enforce fundamental rights is itself a fundamental right (Article 32). High Courts can issue the same writs, and more, under Article 226. Public interest litigation lets someone approach the court on behalf of those who cannot.",
    rights: [
      { text: "To move the Supreme Court directly for enforcement of fundamental rights.", refs: ["32"] },
      { text: "To move the High Court for fundamental rights and other legal rights.", refs: ["226"] }
    ],
    steps: [
      "Usually start with the High Court of your State; it is closer and has wider powers.",
      "The main writs: habeas corpus (unlawful detention), mandamus (directing an official to do their duty), prohibition and certiorari (controlling lower courts and tribunals), and quo warranto (challenging someone's right to hold a public office).",
      "For public causes, a public interest litigation can be filed; courts have even acted on letters.",
      "Free legal aid is available through the Legal Services Authorities (15100)."
    ],
    limits: ["Fundamental rights are mostly enforceable against the State; disputes with private parties usually go to ordinary courts, though some rights (such as Articles 15(2), 17, 23 and 24) apply to private persons too."],
    cases: ["sp-gupta"],
    also: [],
    help: ["legalaid"]
  },
  {
    id: "fir-not-registered",
    cat: "police",
    q: "The police refuse to register my complaint (FIR)",
    tags: ["fir", "complaint", "police station", "refuse", "register", "report crime", "zero fir", "e-fir"],
    short: "If your complaint discloses a cognizable offence, the police must register an FIR — the Supreme Court held this is mandatory (Lalita Kumari, 2013). Under the new criminal procedure law you can also file a 'Zero FIR' at any police station regardless of where the crime happened, and in many cases file electronically.",
    rights: [
      { text: "Equal protection of the laws — the police cannot pick and choose whose crime to record.", refs: ["14"] },
      { text: "Life and personal liberty, which include access to justice.", refs: ["21"] },
      { text: "To approach the High Court if the authorities fail in their legal duty.", refs: ["226"] }
    ],
    steps: [
      "Give a written complaint at the police station and ask for a free copy of the FIR once it is registered.",
      "If the station refuses, send the complaint in writing (or by post) to the Superintendent of Police.",
      "If it is still not registered, apply to the Magistrate (with an affidavit showing you first approached the Superintendent of Police), who can order the police to register and investigate.",
      "For offences punishable with three to seven years' imprisonment, the police may first hold a preliminary inquiry, with a senior officer's permission, to be completed within 14 days; ask to be told the outcome."
    ],
    limits: ["For non-cognizable (minor) offences the police record the complaint and refer you to the Magistrate rather than registering an FIR."],
    cases: [],
    also: ["Lalita Kumari v. Government of Uttar Pradesh (2013)", "Bharatiya Nagarik Suraksha Sanhita, 2023 — Zero FIR and e-FIR"],
    help: ["emergency", "women", "legalaid"]
  },
  {
    id: "woman-arrest",
    cat: "police",
    q: "Can the police arrest a woman at night, or without a woman officer?",
    tags: ["woman", "women", "arrest", "night", "sunset", "female officer", "lady police", "custody"],
    short: "As a rule, a woman should not be arrested after sunset or before sunrise. In exceptional cases a woman police officer must first obtain the prior permission of a Judicial Magistrate. Any search of a woman's body must be done by a woman, with strict regard to decency.",
    rights: [
      { text: "Personal liberty and dignity.", refs: ["21"] },
      { text: "Special provision for women is permitted under the equality guarantee.", refs: ["15"] },
      { text: "The arrest safeguards — grounds, a lawyer, and a Magistrate within 24 hours.", refs: ["22"] }
    ],
    steps: [
      "Ask to see the Magistrate's permission if an arrest is attempted after sunset or before sunrise.",
      "Insist that any personal search is done by a woman officer.",
      "Ask that a relative or friend be informed, and contact a lawyer or free legal aid (15100).",
      "Report violations to the Magistrate at the first production and to the Superintendent of Police."
    ],
    limits: ["The night-time rule allows exceptions with a Magistrate's prior permission; the other arrest safeguards still apply."],
    cases: [],
    also: ["Bharatiya Nagarik Suraksha Sanhita, 2023 — arrest of women"],
    help: ["women", "legalaid", "emergency"]
  },
  {
    id: "denied-emergency-treatment",
    cat: "health",
    q: "A hospital refused to treat someone injured in an emergency",
    tags: ["hospital", "emergency", "treatment", "accident", "doctor", "medical", "injured", "health", "ambulance", "good samaritan"],
    short: "Preserving human life is paramount. The Supreme Court has held that doctors must give emergency medical aid to the injured without waiting for police formalities (Parmanand Katara, 1989), and that a government hospital's failure to provide timely emergency treatment violates the right to life (Paschim Banga Khet Mazdoor Samity, 1996).",
    rights: [
      { text: "Life, which includes timely emergency medical care.", refs: ["21"] },
      { text: "The State's duty to improve public health (a Directive Principle).", refs: ["47"] }
    ],
    steps: [
      "Call 112 for an ambulance; insist on immediate first aid and stabilisation — treatment must not wait for an FIR or police clearance.",
      "A person who helps a road-accident victim in good faith (a 'Good Samaritan') cannot be held liable for harm caused while giving emergency help and cannot be compelled to give personal details; under Supreme Court-approved guidelines, hospitals and police should not detain them or ask them to pay.",
      "Complaints about refusal can go to the hospital's medical superintendent, the district Chief Medical Officer, or the State Medical Council; serious cases can be taken to the High Court."
    ],
    limits: ["The right requires reasonable emergency care; it does not entitle a person to any particular treatment free of cost at a private hospital in every case."],
    cases: [],
    also: ["Parmanand Katara v. Union of India (1989)", "Paschim Banga Khet Mazdoor Samity v. State of West Bengal (1996)", "Motor Vehicles Act, 1988, section 134A (2019) — protection of Good Samaritans"],
    help: ["emergency"]
  },
  {
    id: "pollution",
    cat: "health",
    q: "A factory near my home is polluting the air or water",
    tags: ["pollution", "air", "water", "factory", "smoke", "environment", "river", "waste", "noise", "dust"],
    short: "The right to life includes the right to a pollution-free environment and clean water. The State must protect the environment, and every citizen has a duty to do so too. You can complain to the State Pollution Control Board, and environmental disputes can be taken to the National Green Tribunal.",
    rights: [
      { text: "Life, including a healthy, pollution-free environment.", refs: ["21"] },
      { text: "The State's duty to protect and improve the environment.", refs: ["48A"] },
      { text: "Every citizen's duty to protect the natural environment.", refs: ["51A"] }
    ],
    steps: [
      "Record evidence: photos, videos, dates, health effects, and the name and location of the unit.",
      "Complain in writing to the State Pollution Control Board (and the district administration); ask for inspection and action under the Air and Water Acts.",
      "If authorities do not act, approach the National Green Tribunal, or the High Court in a public interest petition."
    ],
    limits: ["Courts balance environmental protection with development; not every inconvenience amounts to a rights violation."],
    cases: ["mc-mehta-oleum"],
    also: ["Subhash Kumar v. State of Bihar (1991)", "National Green Tribunal Act, 2010"],
    help: []
  },
  {
    id: "ration-food",
    cat: "health",
    q: "My family isn't getting our ration under the food scheme",
    tags: ["ration", "food", "pds", "ration card", "hunger", "grain", "nfsa", "mid-day meal", "anganwadi"],
    short: "The Supreme Court has treated the right to food as part of the right to life, and Parliament gave it legal force through the National Food Security Act, 2013, which entitles eligible households to subsidised foodgrains and provides meals for children and support for pregnant women and mothers.",
    rights: [
      { text: "Life with dignity, including freedom from hunger.", refs: ["21"] },
      { text: "The State's duty to raise the level of nutrition and public health (a Directive Principle).", refs: ["47"] }
    ],
    steps: [
      "Check your entitlement and ration-card status on your State's public distribution system portal or at the fair price shop.",
      "Complain to the District Grievance Redressal Officer under the food security law; appeals lie to the State Food Commission.",
      "If ration is refused because Aadhaar authentication fails, ask the shop about the alternative verification allowed and raise it with the grievance officer."
    ],
    limits: ["Entitlements depend on eligibility categories set under the Act and State rules."],
    cases: [],
    also: ["People's Union for Civil Liberties v. Union of India (right to food orders, from 2001)", "National Food Security Act, 2013"],
    help: []
  },
  {
    id: "marriage-choice",
    cat: "family",
    q: "Our families are threatening us because we want to marry each other",
    tags: ["marriage", "love", "inter-caste", "inter-faith", "elope", "honour killing", "family", "partner", "khap", "threat"],
    short: "Adults have the right to choose whom to marry; the Supreme Court has held this choice is part of the right to life and personal liberty (Shafin Jahan, 2018). The police must protect couples facing threats, and the Court has laid down measures to prevent 'honour' crimes (Shakti Vahini, 2018).",
    rights: [
      { text: "Personal liberty, including the choice of a life partner.", refs: ["21"] },
      { text: "Freedom of conscience and religion.", refs: ["25"] },
      { text: "Equality before the law.", refs: ["14"] }
    ],
    steps: [
      "If you are in danger, call 112 and approach the Superintendent of Police for protection; many districts have special cells for couples under threat.",
      "Adults of different religions or castes can marry under the Special Marriage Act, 1954: give notice to the Marriage Officer of the district where one of you has lived for at least 30 days; the marriage can take place after 30 days from the notice.",
      "The High Court can order police protection on a petition under Article 226."
    ],
    limits: ["Under central law the minimum age of marriage is 21 for men and 18 for women; some States have laws regulating conversion for marriage."],
    cases: [],
    also: ["Lata Singh v. State of U.P. (2006)", "Shakti Vahini v. Union of India (2018)", "Shafin Jahan v. Asokan K.M. (2018)", "Special Marriage Act, 1954"],
    help: ["emergency", "women"]
  },
  {
    id: "elderly-parents",
    cat: "family",
    q: "My elderly parents have been abandoned by their children",
    tags: ["senior citizen", "elderly", "parents", "old age", "maintenance", "abandoned", "pension"],
    short: "The State should provide public assistance in old age (a Directive Principle), and the Maintenance and Welfare of Parents and Senior Citizens Act, 2007 lets parents and senior citizens claim monthly maintenance from their children or relatives through a quick tribunal process.",
    rights: [
      { text: "Public assistance in old age, sickness and disablement (a Directive Principle).", refs: ["41"] },
      { text: "Life with dignity.", refs: ["21"] }
    ],
    steps: [
      "Apply to the Maintenance Tribunal (usually the Sub-Divisional Magistrate) for a maintenance order; lawyers are not required.",
      "Property transferred to children on condition of care can be declared void by the Tribunal if that care is not provided.",
      "Abandoning a senior citizen is a criminal offence under the Act; report it to the police."
    ],
    limits: ["Maintenance under the Act is capped at ₹10,000 a month, and depends on the means of the children or relatives."],
    cases: [],
    also: ["Maintenance and Welfare of Parents and Senior Citizens Act, 2007"],
    help: ["emergency"]
  },
  {
    id: "equal-pay-maternity",
    cat: "work",
    q: "I'm paid less than men for the same work, or was fired for being pregnant",
    tags: ["equal pay", "salary", "women", "maternity", "pregnant", "pregnancy", "fired", "dismissed", "gender pay"],
    short: "Equal pay for equal work for men and women is a constitutional goal and a legal requirement: wage discrimination on the ground of sex is prohibited by labour law. Women employees are entitled to paid maternity leave, and dismissal because of pregnancy is unlawful.",
    rights: [
      { text: "Equal pay for equal work for men and women (a Directive Principle).", refs: ["39"] },
      { text: "Just and humane conditions of work and maternity relief (a Directive Principle).", refs: ["42"] },
      { text: "Equality and freedom from sex discrimination.", refs: ["14", "15"] }
    ],
    steps: [
      "Raise the issue in writing with your employer and keep records of pay, roles and duties.",
      "Complain to the labour department; wage equality and maternity benefits are enforced under the labour laws.",
      "Paid maternity leave is up to 26 weeks for most women employees in covered establishments, and dismissal during maternity leave is prohibited."
    ],
    limits: ["Equal pay applies to work of the same or similar nature; pay differences based on genuine differences in duties or qualifications can be lawful."],
    cases: [],
    also: ["Randhir Singh v. Union of India (1982) — equal pay for equal work", "Code on Wages, 2019 and Code on Social Security, 2020 (in force from 21 November 2025)"],
    help: ["women"]
  },
  {
    id: "disability-access",
    cat: "equality",
    q: "I have a disability and was denied a job, admission or access",
    tags: ["disability", "disabled", "wheelchair", "blind", "deaf", "accessibility", "divyang", "reasonable accommodation", "pwd"],
    short: "Persons with disabilities have equal rights to dignity, education and work. The Rights of Persons with Disabilities Act, 2016 requires reasonable accommodation and accessible public buildings and services, and reserves at least 4% of vacancies in government posts and 5% of seats in government-funded higher education for persons with benchmark disabilities.",
    rights: [
      { text: "Equality, including reasonable accommodation.", refs: ["14"] },
      { text: "Life with dignity.", refs: ["21"] },
      { text: "Public assistance in cases of disablement (a Directive Principle).", refs: ["41"] }
    ],
    steps: [
      "Obtain a disability certificate and UDID card through the Swavlamban portal or your district medical board.",
      "Complain to the State Commissioner or the Chief Commissioner for Persons with Disabilities, who can inquire and make recommendations.",
      "Denial of reasonable accommodation can be challenged in the High Court."
    ],
    limits: ["Some posts may be exempted from disability reservation by notification, for reasons recorded."],
    cases: [],
    also: ["Rights of Persons with Disabilities Act, 2016", "Vikash Kumar v. UPSC (2021) — reasonable accommodation"],
    help: []
  },
  {
    id: "minority-school",
    cat: "education",
    q: "Can our religious or language community run its own school or college?",
    tags: ["minority", "school", "college", "institution", "religious minority", "linguistic minority", "management", "aid"],
    short: "All religious and linguistic minorities have the right to establish and administer educational institutions of their choice, and the State cannot discriminate against them when giving aid. The State can regulate standards, but not take over their management (T.M.A. Pai, 2002).",
    rights: [
      { text: "To establish and administer educational institutions of their choice.", refs: ["30"] },
      { text: "To conserve a distinct language, script or culture.", refs: ["29"] }
    ],
    steps: [
      "Apply to the National Commission for Minority Educational Institutions or the competent State authority for a minority status certificate.",
      "Minority institutions are exempt from the 25% RTE admissions quota and from reservation in admissions under Article 15(5).",
      "Unreasonable interference with administration can be challenged in the High Court."
    ],
    limits: ["Reasonable regulation of academic standards, teachers' qualifications and fair admissions applies to minority institutions too."],
    cases: ["tma-pai"],
    also: ["National Commission for Minority Educational Institutions Act, 2004", "Pramati Educational and Cultural Trust v. Union of India (2014) — RTE Act does not apply to minority schools"],
    help: []
  },
  {
    id: "forest-rights",
    cat: "home",
    q: "Our village has lived in the forest for generations — can we be removed?",
    tags: ["forest", "tribal", "adivasi", "land", "gram sabha", "scheduled area", "displacement", "mining", "forest rights"],
    short: "Scheduled Tribes and other traditional forest dwellers can claim legal rights to the land and forest resources they depend on, through their Gram Sabha, under the Forest Rights Act, 2006. The Constitution gives special protection to Scheduled Areas, and in the Niyamgiri case (2013) the Supreme Court directed that the Gram Sabhas decide whether proposed mining would affect their religious, cultural and forest rights before the government took a final decision on diverting the forest land.",
    rights: [
      { text: "Special administration and protection of Scheduled Areas and tribal areas (Fifth and Sixth Schedules).", refs: ["244"] },
      { text: "Life and livelihood.", refs: ["21"] },
      { text: "Promotion of the interests of Scheduled Tribes and protection from exploitation (a Directive Principle).", refs: ["46"] }
    ],
    steps: [
      "File individual or community claims with the Gram Sabha's Forest Rights Committee; claims then go to sub-divisional and district committees.",
      "No forest dweller should be evicted until the recognition and verification of claims is complete.",
      "Attend Gram Sabha meetings on forest diversion or land acquisition and record objections in the resolution."
    ],
    limits: ["Claims must meet the Act's conditions, such as occupation of the land before 13 December 2005 (other traditional forest dwellers must also show residence for three generations, i.e. 75 years)."],
    cases: [],
    also: ["Scheduled Tribes and Other Traditional Forest Dwellers (Recognition of Forest Rights) Act, 2006", "Orissa Mining Corporation v. Ministry of Environment and Forests (2013)"],
    help: ["legalaid"]
  },
  {
    id: "mother-tongue",
    cat: "identity",
    q: "Can I deal with the government, or study, in my own language?",
    tags: ["language", "mother tongue", "hindi", "english", "regional language", "linguistic minority", "school", "petition"],
    short: "Every person can submit a representation for redress of a grievance to any Union or State authority in any language used in the Union or the State. States should provide adequate facilities for primary education in the mother tongue for children of linguistic minorities.",
    rights: [
      { text: "To submit representations in any language used in the Union or the State.", refs: ["350"] },
      { text: "Facilities for instruction in the mother tongue at the primary stage.", refs: ["350A"] },
      { text: "To conserve a distinct language, script or culture.", refs: ["29"] },
      { text: "A Special Officer for linguistic minorities to investigate and report on their safeguards.", refs: ["350B"] }
    ],
    steps: [
      "Write your complaint or application in your language; the authority should accept it.",
      "Ask the school or education department about instruction in your mother tongue at the primary level.",
      "Linguistic minorities can raise issues with the Commissioner for Linguistic Minorities (the Special Officer under Article 350B), who reports to the President."
    ],
    limits: ["Article 350A is a direction to States; the precise facilities depend on numbers and State policy."],
    cases: [],
    also: [],
    help: []
  },
  {
    id: "am-i-a-citizen",
    cat: "identity",
    q: "Am I an Indian citizen by birth?",
    tags: ["citizen", "citizenship", "birth", "passport", "nationality", "documents", "parents", "foreigner"],
    short: "The Constitution settled citizenship at the start (1950) and left later rules to Parliament. Under the Citizenship Act, 1955, a person born in India between 26 January 1950 and 30 June 1987 is a citizen by birth; between 1 July 1987 and 2 December 2004, if at least one parent was a citizen at the time of birth; on or after 3 December 2004, if both parents were citizens, or one was a citizen and the other was not an illegal migrant, at the time of birth.",
    rights: [
      { text: "Citizenship at the commencement of the Constitution, and Parliament's power to regulate it.", refs: ["5", "11"] },
      { text: "Equality before the law and the right to life and liberty apply to every person, not only citizens.", refs: ["14", "21"] }
    ],
    steps: [
      "Keep your birth certificate and your parents' citizenship documents; they establish citizenship by birth.",
      "Citizenship can also be acquired by descent, registration or naturalisation under the Citizenship Act.",
      "Decisions on citizenship can be challenged before the courts."
    ],
    limits: ["Children of foreign diplomats and of enemy aliens do not get citizenship by birth. India does not allow dual citizenship; Overseas Citizenship of India (OCI) is a separate status with limited rights."],
    cases: [],
    also: ["Citizenship Act, 1955"],
    help: []
  }
];
