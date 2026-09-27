import { alphabetCard, coverCard, introduceCard, listCard, mapCard, pdfDoc, esc } from "./cards.js";
import { clock, ex, S, type Spec } from "./kit.js";

const FOOTER = "Nina · Tu profe de español";

export const lessonsA: Spec[] = [
  // ——— Lesson 1 · ¡Hola! ———
  {
    title: "Los saludos",
    type: "INFO_CARD",
    estMinutes: 3,
    build: async (m) => ({
      pages: await m.cards(
        [
          coverCard({ hand: "¡Hola!", titleKa: "მისალმება", subtitleKa: "როგორ მივესალმოთ ესპანურად — დილით, დღისით და საღამოს", image: "saludo", page: "1 / 4" }),
          listCard({
            overline: "LOS SALUDOS",
            titleEs: "Buenos días",
            titleKa: "დღის სხვადასხვა დროს",
            image: "manana",
            rows: [
              { es: "¡Hola!", ka: "გამარჯობა — ნებისმიერ დროს" },
              { es: "Buenos días", ka: "დილა მშვიდობისა — შუადღემდე" },
              { es: "Buenas tardes", ka: "დღე მშვიდობისა — სადილიდან საღამომდე" },
              { es: "Buenas noches", ka: "საღამო / ღამე მშვიდობისა" },
            ],
            tipKa: "ესპანეთში „tarde“ გვიანამდე გრძელდება — საღამოს რვა საათზეც ხშირად ამბობენ „buenas tardes“.",
            page: "2 / 4",
          }),
          listCard({
            overline: "¿QUÉ TAL?",
            titleEs: "¿Qué tal?",
            titleKa: "როგორ ხარ?",
            rows: [
              { es: "¡Hola! ¿Qué tal?", ka: "გამარჯობა! როგორ ხარ?" },
              { es: "Muy bien, gracias.", ka: "ძალიან კარგად, გმადლობ." },
              { es: "Bien. ¿Y tú?", ka: "კარგად. შენ?" },
              { es: "Más o menos.", ka: "ასე რა, არაუშავს." },
              { es: "¿Cómo está usted?", ka: "როგორ ბრძანდებით? (თავაზიანად)" },
            ],
            tipKa: "„¿Qué tal?“ მეგობრულია. უცნობთან, მაგალითად სასტუმროში, უფრო ხშირად გაიგებ „¿Cómo está?“",
            page: "3 / 4",
          }),
          listCard({
            overline: "DESPEDIDAS",
            titleEs: "¡Adiós!",
            titleKa: "დამშვიდობება",
            image: "noche",
            rows: [
              { es: "Adiós", ka: "ნახვამდის" },
              { es: "Hasta luego", ka: "მოგვიანებით შევხვდებით" },
              { es: "Hasta mañana", ka: "ხვალამდე" },
              { es: "Nos vemos", ka: "შევხვდებით!" },
            ],
            tipKa: "„Hasta luego“ ესპანეთში ყველაზე ხშირია — მაღაზიიდან გასვლისასაც ასე ამბობენ.",
            page: "4 / 4",
          }),
        ],
        "Los saludos",
        "მისალმების ბარათი",
      ),
      altKa: "ოთხი ბარათი: მისალმება დღის სხვადასხვა დროს, „¿Qué tal?“ და დამშვიდობება",
      captionKa: "Los saludos · მისალმება",
    }),
  },
  {
    title: "Buenos días",
    type: "DIALOGUE",
    estMinutes: 4,
    build: async (m) =>
      m.dialogue({
        context: { es: "En la calle, por la mañana", ka: "დილაა. ანა და ლუკასი ქუჩაში ხვდებიან ერთმანეთს." },
        speakers: [S.ana, S.lucas],
        lines: [
          ["ana", "¡Buenos días, Lucas!", "Good morning, Lucas!"],
          ["lucas", "¡Hola, Ana! ¿Qué tal?", "Hi, Ana! How are you?"],
          ["ana", "Muy bien, gracias. ¿Y tú?", "Very well, thanks. And you?"],
          ["lucas", "Bien, bien. Voy al trabajo.", "Good, good. I'm going to work."],
          ["ana", "¡Vale! Hasta luego.", "OK! See you later."],
          ["lucas", "¡Adiós, Ana! Hasta mañana.", "Bye, Ana! See you tomorrow."],
        ],
      }),
  },
  {
    title: "აირჩიე სწორი მისალმება",
    type: "EXERCISE",
    estMinutes: 4,
    build: async () =>
      ex(
        "multiple_choice",
        "აირჩიე სწორი მისალმება",
        "აირჩიე სწორი პასუხი",
        [
          { prompt: { es: "Good night", ka: "ღამე მშვიდობისა" }, options: [{ id: "a", text: "buenas noches" }, { id: "b", text: "buenos días" }], correctId: "a", explanationKa: "ღამით და გვიან საღამოს — „buenas noches“." },
          { prompt: { ka: "დილის 9 საათია. როგორ მიესალმები მეზობელს?" }, options: [{ id: "a", text: "Buenos días" }, { id: "b", text: "Buenas noches" }, { id: "c", text: "Adiós" }], correctId: "a", explanationKa: "შუადღემდე — „buenos días“." },
          { prompt: { ka: "საღამოს 10 საათზე მეგობარს ემშვიდობები, ძილის წინ." }, options: [{ id: "a", text: "Buenos días" }, { id: "b", text: "Buenas noches" }, { id: "c", text: "Hola" }], correctId: "b" },
          { context: "— ¡Hola! ¿Qué tal?", prompt: { ka: "რას უპასუხებ?" }, options: [{ id: "a", text: "Muy bien, gracias." }, { id: "b", text: "Me llamo Ana." }, { id: "c", text: "Hasta luego." }], correctId: "a", explanationKa: "„¿Qué tal?“ — როგორ ხარ? პასუხი: „Muy bien, gracias.“" },
          { prompt: { es: "Hasta mañana", ka: "რას ნიშნავს?" }, options: [{ id: "a", text: "ხვალამდე" }, { id: "b", text: "დილა მშვიდობისა" }, { id: "c", text: "გმადლობ" }], correctId: "a" },
          { prompt: { ka: "კაფედან გადიხარ. რას ეტყვი მიმტანს?" }, options: [{ id: "a", text: "¡Hasta luego!" }, { id: "b", text: "¿Qué tal?" }, { id: "c", text: "Buenos días." }], correctId: "a", explanationKa: "გასვლისას ესპანეთში ყველაზე ბუნებრივია „¡Hasta luego!“" },
          { prompt: { es: "Good afternoon", ka: "დღე მშვიდობისა" }, options: [{ id: "a", text: "buenas tardes" }, { id: "b", text: "buenas noches" }, { id: "c", text: "buenos días" }], correctId: "a" },
        ],
        { variant: "list", feedback: { correctKa: "ზუსტად!", finishTitleEs: "¡Muy bien!" } },
      ),
  },
  {
    title: "hola / adiós",
    type: "VOCAB",
    estMinutes: 5,
    build: async (m) => ({
      layout: "list",
      title: { es: "Los saludos", ka: "მისალმება" },
      introKa: "ეს სიტყვები ყოველდღე დაგჭირდება. დააჭირე მოსმენის ღილაკს და გაიმეორე ხმამაღლა.",
      entries: await m.entries([
        { es: "hola", ka: "გამარჯობა", en: "hello", exampleEs: "¡Hola, Ana!", exampleKa: "გამარჯობა, ანა!" },
        { es: "buenos días", ka: "დილა მშვიდობისა", en: "good morning", exampleEs: "Buenos días, señora.", exampleKa: "დილა მშვიდობისა, ქალბატონო." },
        { es: "buenas tardes", ka: "დღე მშვიდობისა", en: "good afternoon", exampleEs: "Buenas tardes, ¿qué tal?", exampleKa: "დღე მშვიდობისა, როგორ ხარ?" },
        { es: "buenas noches", ka: "ღამე მშვიდობისა", en: "good night", exampleEs: "Buenas noches, hasta mañana.", exampleKa: "ღამე მშვიდობისა, ხვალამდე." },
        { es: "¿qué tal?", ka: "როგორ ხარ?", en: "how are you?", exampleEs: "Hola, Lucas, ¿qué tal?", exampleKa: "გამარჯობა, ლუკას, როგორ ხარ?" },
        { es: "muy bien", ka: "ძალიან კარგად", en: "very well" },
        { es: "gracias", ka: "გმადლობ", en: "thank you", exampleEs: "Muchas gracias, Laura.", exampleKa: "დიდი მადლობა, ლაურა." },
        { es: "adiós", ka: "ნახვამდის", en: "goodbye" },
        { es: "hasta luego", ka: "მოგვიანებით შევხვდებით", en: "see you later", exampleEs: "Hasta luego, Lucas.", exampleKa: "მოგვიანებით შევხვდებით, ლუკას." },
        { es: "hasta mañana", ka: "ხვალამდე", en: "see you tomorrow" },
      ]),
    }),
  },
  {
    title: "დააკავშირე სიტყვა და სურათი",
    type: "EXERCISE",
    estMinutes: 3,
    build: async (m) =>
      ex(
        "matching_pairs",
        "დააკავშირე სიტყვა და სურათი",
        "დააკავშირე სიტყვა სწორ სურათთან",
        [
          { mode: "word_image", pairs: [{ left: "el café", right: await m.image("cafe-con-leche", "el café") }, { left: "el té", right: await m.image("te", "el té") }, { left: "el zumo", right: await m.image("zumo", "el zumo") }, { left: "la tostada", right: await m.image("tostada", "la tostada") }] },
          { mode: "word_image", pairs: [{ left: "el cruasán", right: await m.image("cruasan", "el cruasán") }, { left: "el agua", right: await m.image("agua", "el agua") }, { left: "la cuenta", right: await m.image("cuenta", "la cuenta") }, { left: "el cuaderno", right: await m.image("cuaderno", "el cuaderno") }] },
        ],
        { variant: "tap_pairs", feedback: { correctKa: "ყოჩაღ!", finishTitleEs: "¡Genial!" } },
      ),
  },

  // ——— Lesson 2 · El alfabeto ———
  {
    title: "El alfabeto",
    type: "INFO_CARD",
    estMinutes: 3,
    build: async (m) => ({
      pages: await m.cards(
        [
          alphabetCard(
            [
              { letter: "A a", word: "agua" }, { letter: "B b", word: "bien" }, { letter: "C c", word: "café" }, { letter: "D d", word: "día" },
              { letter: "E e", word: "España" }, { letter: "F f", word: "familia" }, { letter: "G g", word: "gracias" }, { letter: "H h", word: "hola" },
              { letter: "I i", word: "isla" }, { letter: "J j", word: "jamón" }, { letter: "K k", word: "kilo" }, { letter: "L l", word: "leche" },
              { letter: "M m", word: "mañana" }, { letter: "N n", word: "noche" },
            ],
            "1 / 2",
            "ანბანი · A–N",
          ),
          alphabetCard(
            [
              { letter: "Ñ ñ", word: "niño" }, { letter: "O o", word: "once" }, { letter: "P p", word: "plaza" }, { letter: "Q q", word: "queso" },
              { letter: "R r", word: "rosa" }, { letter: "S s", word: "sí" }, { letter: "T t", word: "té" }, { letter: "U u", word: "uno" },
              { letter: "V v", word: "vale" }, { letter: "W w", word: "wifi" }, { letter: "X x", word: "taxi" }, { letter: "Y y", word: "yo" },
              { letter: "Z z", word: "zumo" },
            ],
            "2 / 2",
            "ანბანი · Ñ–Z",
          ),
        ],
        "El alfabeto",
        "ესპანური ანბანი",
      ),
      altKa: "ესპანური ანბანი: 27 ასო მაგალითის სიტყვებით",
      captionKa: "27 ასო — ერთი მათგანი, ñ, მხოლოდ ესპანურშია.",
    }),
  },
  {
    title: "გამოთქმა: ll, ñ, j",
    type: "PRONUNCIATION",
    estMinutes: 4,
    build: async (m) => ({
      title: "ll · ñ · j",
      items: [
        { grapheme: "ll", hintKa: "ჟღერს როგორც „ი“ ხმოვანთან ერთად: me llamo — „მე იამო“. ზოგიერთ ქვეყანაში „ჟ“-ს ჰგავს.", example: "me llamo", audio: await m.say("me llamo… me llamo", "nina", "-30%") },
        { grapheme: "ñ", hintKa: "როგორც „ნი“ ერთად, ერთი ბგერით: España — „ესპანია“.", example: "España", audio: await m.say("España… España", "nina", "-30%") },
        { grapheme: "j", hintKa: "ღრმა, ხრინწიანი ბგერა — ზუსტად ქართული „ხ“.", example: "jamón", audio: await m.say("jamón… jamón", "nina", "-30%") },
      ],
      examples: ["me llamo", "la paella", "España", "mañana", "jamón", "joven", "el ajo"],
      tipKa: "ქართველებს „j“ ყველაზე ადვილად გამოგვდის — ჩვენი „ხ“ თითქმის იგივეა. ¡Qué suerte!",
    }),
  },
  {
    title: "ბგერები — აუდიო",
    type: "AUDIO",
    estMinutes: 3,
    build: async (m) => {
      const { audio, transcript, seconds } = await m.track(
        {
          context: { es: "Los sonidos", ka: "ხმოვნები და განსაკუთრებული ბგერები" },
          speakers: [S.nina],
          lines: [
            ["nina", "a… agua", "a — water"],
            ["nina", "e… España", "e — Spain"],
            ["nina", "i… isla", "i — island"],
            ["nina", "o… once", "o — eleven"],
            ["nina", "u… uno", "u — one"],
            ["nina", "elle… me llamo", "ll — my name is"],
            ["nina", "eñe… mañana", "ñ — tomorrow"],
            ["nina", "jota… jamón", "j — ham"],
            ["nina", "erre… perro", "rr — dog"],
            ["nina", "ce… cena", "ce — dinner"],
            ["nina", "zeta… zumo", "z — juice"],
          ],
        },
        2.2,
      );
      m.subtitle = `აუდიო · ${clock(seconds)}`;
      return { audio, introKa: "მოუსმინე ბგერებს და სიტყვებს. ყოველი სიტყვის შემდეგ პაუზაა — გაიმეორე ხმამაღლა.", transcript };
    },
  },
  {
    title: "ანბანის ბარათები",
    type: "VOCAB",
    estMinutes: 4,
    build: async (m) => ({
      layout: "list",
      title: { es: "Las letras", ka: "ასოების სახელები" },
      introKa: "ასე ეძახიან ასოებს ესპანურად. გამოგადგება, როცა გვარს ან ქალაქს უნდა ასოებით უთხრა ვინმეს: „¿Cómo se escribe?“",
      entries: await m.entries([
        { es: "be", ka: "ასო B", exampleEs: "Barcelona se escribe con be.", exampleKa: "Barcelona B-თი იწერება." },
        { es: "ce", ka: "ასო C" },
        { es: "de", ka: "ასო D" },
        { es: "efe", ka: "ასო F" },
        { es: "ge", ka: "ასო G" },
        { es: "hache", ka: "ასო H — არ გამოითქმის", exampleEs: "La hache no suena: hola.", exampleKa: "H არ ისმის: hola." },
        { es: "jota", ka: "ასო J", exampleEs: "Jamón se escribe con jota.", exampleKa: "Jamón J-თი იწერება." },
        { es: "ele", ka: "ასო L" },
        { es: "eñe", ka: "ასო Ñ", exampleEs: "España se escribe con eñe.", exampleKa: "España Ñ-ით იწერება." },
        { es: "erre", ka: "ასო R" },
        { es: "uve", ka: "ასო V", exampleEs: "Vale se escribe con uve.", exampleKa: "Vale V-თი იწერება." },
        { es: "i griega", ka: "ასო Y" },
        { es: "zeta", ka: "ასო Z", exampleEs: "Zumo se escribe con zeta.", exampleKa: "Zumo Z-ით იწერება." },
      ]),
    }),
  },
  {
    title: "წაიკითხე ხმამაღლა",
    type: "DOCUMENT",
    estMinutes: 5,
    build: async (m) => {
      const rows = [
        ["ca · que · qui · co · cu", "casa, queso, quiero, cosa, cuenta"],
        ["ga · gue · gui · go · gu", "gato, guerra, guitarra, gordo, agua"],
        ["ja · je · ji · jo · ju", "jamón, gente, jirafa, joven, jueves"],
        ["ce · ci · za · zo · zu", "cena, cinco, zapato, zorro, zumo"],
        ["lla · lle · llo · llu", "llamo, calle, pollo, lluvia"],
        ["ña · ñe · ño", "España, muñeca, niño, mañana"],
      ];
      const file = await m.file(
        await pdfDoc(
          [
            {
              overline: "LEER EN VOZ ALTA",
              title: "Sílabas y palabras",
              html: `<p class="ka muted" style="margin-top:4mm;font-size:12pt">წაიკითხე ჯერ მარცვლები, მერე სიტყვები. ნელა — ჩქარობა არ გვჭირდება.</p>
              <table><tr><th>მარცვლები</th><th>სიტყვები</th></tr>${rows.map(([s, w]) => `<tr><td style="font-weight:700;font-size:14pt">${esc(s!)}</td><td lang="es" style="font-size:13pt">${esc(w!)}</td></tr>`).join("")}</table>
              <h2>Un texto corto</h2>
              <div class="box" lang="es" style="font-size:15pt;line-height:1.8">Hola, me llamo Ana. Soy de Georgia, de Tbilisi. Me gusta el café con leche y el zumo de naranja. Por la mañana digo «¡Buenos días!» y por la noche «¡Buenas noches!». ¡Hasta mañana!</div>
              <p class="hand" lang="es" style="margin-top:8mm;font-size:26pt;color:var(--burgundy)">¡Poco a poco!</p>`,
            },
          ],
          FOOTER,
        ),
        "Leer en voz alta.pdf",
        "მარცვლები და სიტყვები ხმამაღლა წასაკითხად",
      );
      return { file, noteKa: "დაბეჭდე ან გახსენი ტელეფონზე და წაიკითხე ხმამაღლა — ჯერ ნელა, მერე უფრო სწრაფად.", allowDownload: true };
    },
  },
  {
    title: "ბლოკი 1",
    type: "CHECKPOINT",
    subtitle: "19 / 20",
    estMinutes: 10,
    build: async () =>
      ex("checkpoint", "ბლოკი 1", "შეამოწმე პირველი ბლოკი: მისალმება, ანბანი, პირველი ფრაზები", [
        {
          sections: [
            {
              labelKa: "მისალმება",
              stepRefs: [
                { templateId: "multiple_choice", prompt: { ka: "დილაა. როგორ მიესალმები?" }, options: [{ id: "a", text: "Buenos días" }, { id: "b", text: "Buenas noches" }], correctId: "a" },
                { templateId: "multiple_choice", prompt: { es: "Hasta luego", ka: "რას ნიშნავს?" }, options: [{ id: "a", text: "მოგვიანებით შევხვდებით" }, { id: "b", text: "დილა მშვიდობისა" }], correctId: "a" },
              ],
            },
            {
              labelKa: "ანბანი და ბგერები",
              stepRefs: [
                { templateId: "swipe_true_false", statement: "„hola“ სიტყვაში h არ გამოითქმის.", isTrue: true },
                { templateId: "matching_pairs", mode: "word_translation", pairs: [{ left: "jamón", right: "ლორი" }, { left: "mañana", right: "ხვალ" }, { left: "once", right: "თერთმეტი" }] },
              ],
            },
            {
              labelKa: "პირველი ფრაზები",
              stepRefs: [{ templateId: "sentence_builder", promptKa: "ძალიან კარგად, გმადლობ.", tiles: ["gracias", "bien", "Muy"], answer: ["Muy", "bien,", "gracias"] }],
            },
          ],
        },
      ]),
  },

  // ——— Lesson 3 · Me presento ———
  {
    title: "Me llamo…",
    type: "DIALOGUE",
    subtitle: "დიალოგი · 8 ხაზი",
    estMinutes: 4,
    build: async (m) =>
      m.dialogue({
        context: { es: "En una fiesta", ka: "მეგობრის დაბადების დღეზე ანა ლაურას ეცნობა." },
        speakers: [S.ana, S.laura],
        lines: [
          ["laura", "¡Hola! ¿Cómo te llamas?", "Hi! What's your name?"],
          ["ana", "Hola, me llamo Ana. ¿Y tú?", "Hi, my name is Ana. And you?"],
          ["laura", "Yo me llamo Laura. Encantada.", "I'm Laura. Nice to meet you."],
          ["ana", "Encantada. ¿De dónde eres, Laura?", "Nice to meet you. Where are you from, Laura?"],
          ["laura", "Soy de Valencia. ¿Y tú?", "I'm from Valencia. And you?"],
          ["ana", "Soy de Georgia, de Tbilisi.", "I'm from Georgia, from Tbilisi."],
          ["laura", "¡Qué bien! ¿Y dónde vives?", "How nice! And where do you live?"],
          ["ana", "Ahora vivo en Barcelona.", "Now I live in Barcelona."],
        ],
      }),
  },
  {
    title: "თავის გაცნობის ბარათები",
    type: "INFO_CARD",
    estMinutes: 3,
    build: async (m) => ({
      pages: await m.cards(
        [
          introduceCard({
            image: "saludo",
            page: "1 / 2",
            lines: [
              { es: "Me llamo…", ka: "მე მქვია…" },
              { es: "Soy de…", ka: "…-დან ვარ (წარმოშობა)" },
              { es: "Vivo en…", ka: "…-ში ვცხოვრობ" },
              { es: "Tengo … años.", ka: "… წლის ვარ." },
            ],
          }),
          listCard({
            overline: "PREGUNTAS",
            titleEs: "¿Y tú?",
            titleKa: "კითხვები გასაცნობად",
            rows: [
              { es: "¿Cómo te llamas?", ka: "რა გქვია?" },
              { es: "¿De dónde eres?", ka: "საიდან ხარ?" },
              { es: "¿Dónde vives?", ka: "სად ცხოვრობ?" },
              { es: "¿Cuántos años tienes?", ka: "რამდენი წლის ხარ?" },
              { es: "Encantado / Encantada", ka: "სასიამოვნოა (კაცი / ქალი)" },
            ],
            tipKa: "„Encantado“ — თუ კაცი ხარ, „encantada“ — თუ ქალი. ფორმა შენზეა დამოკიდებული და არა თანამოსაუბრეზე.",
            page: "2 / 2",
          }),
        ],
        "Me presento",
        "თავის გაცნობის ბარათი",
      ),
      altKa: "ორი ბარათი: როგორ წარვადგინოთ თავი და რა ვკითხოთ ახალ ნაცნობს",
      captionKa: "Me presento · თავის გაცნობა",
    }),
  },
  {
    title: "ჩასვი სწორი ფორმა: ser",
    type: "EXERCISE",
    estMinutes: 5,
    build: async () =>
      ex(
        "fill_blank",
        "ჩასვი სწორი ფორმა: ser",
        "ჩასვი ser-ის სწორი ფორმა",
        [
          { verbHint: "ser", rows: [{ before: "Yo", after: "Ana.", answer: "soy" }, { before: "Tú", after: "de Tbilisi.", answer: "eres" }, { before: "Él", after: "Lucas.", answer: "es" }] },
          { verbHint: "ser", rows: [{ before: "Nosotros", after: "amigos.", answer: "somos" }, { before: "Vosotras", after: "de Madrid.", answer: "sois" }, { before: "Ellos", after: "profesores.", answer: "son" }] },
          { verbHint: "ser", rows: [{ before: "Ana", after: "de Georgia.", answer: "es", options: ["es", "eres", "soy"] }, { before: "Yo", after: "estudiante.", answer: "soy", options: ["soy", "es", "somos"] }, { before: "¿Tú", after: "Laura?", answer: "eres", options: ["eres", "es", "sois"] }] },
          { verbHint: "ser", rows: [{ before: "Laura y Lucas", after: "de España.", answer: "son" }, { before: "¿De dónde", after: "vosotros?", answer: "sois" }, { before: "Mi profe", after: "muy simpática.", answer: "es" }] },
        ],
        { feedback: { correctKa: "სწორია!", finishTitleEs: "¡Perfecto!" } },
      ),
  },
  {
    title: "ser — soy, eres, es",
    type: "GRAMMAR",
    estMinutes: 6,
    build: async () => ({
      titleEs: "El verbo ser",
      ruleKa: "**ser** = ყოფნა. ვიყენებთ, როცა ვამბობთ **ვინ ვართ**, **საიდან ვართ** და **რა პროფესიის** ვართ.",
      body: "ser ყველაზე მნიშვნელოვანი ზმნაა — პირველივე დღიდან დაგჭირდება.\n\n- **Soy Ana.** — სახელი\n- **Soy de Georgia.** — წარმოშობა\n- **Soy estudiante.** — პროფესია ან როლი\n\nქართულის მსგავსად, ესპანურშიც ნაცვალსახელს ხშირად არ ვამბობთ: „Soy Ana“ საკმარისია, „Yo soy Ana“ — მხოლოდ ხაზგასასმელად.",
      table: {
        caption: "ser — აწმყო დრო",
        headers: ["", "ser", "ქართულად"],
        rows: [
          ["yo", "**soy**", "მე ვარ"],
          ["tú", "**eres**", "შენ ხარ"],
          ["él / ella / usted", "**es**", "ის არის / თქვენ ბრძანდებით"],
          ["nosotros / nosotras", "**somos**", "ჩვენ ვართ"],
          ["vosotros / vosotras", "**sois**", "თქვენ ხართ"],
          ["ellos / ellas / ustedes", "**son**", "ისინი არიან"],
        ],
      },
      examples: [
        { es: "**Soy** de Tbilisi.", ka: "თბილისიდან ვარ." },
        { es: "¿**Eres** Laura?", ka: "ლაურა ხარ?" },
        { es: "Lucas **es** camarero.", ka: "ლუკასი მიმტანია." },
        { es: "**Somos** amigos.", ka: "მეგობრები ვართ." },
      ],
      mistakes: [
        { wrong: "Yo es Ana.", right: "Yo soy Ana.", noteKa: "yo-სთან ყოველთვის soy" },
        { wrong: "Soy de la Georgia.", right: "Soy de Georgia.", noteKa: "ქვეყნის სახელთან არტიკლი არ გვჭირდება" },
      ],
      tipKa: "პირველ რიგში ოთხი ფორმა დაიმახსოვრე: soy, eres, es, son — დანარჩენი თავისით მოვა.",
    }),
  },
  {
    title: "encantada",
    type: "VOCAB",
    estMinutes: 4,
    build: async (m) => ({
      layout: "list",
      title: { es: "Me presento", ka: "თავის გაცნობა" },
      introKa: "ფრაზები, რომლითაც თავს წარადგენ. ყველა მათგანი დიალოგშიც შეგხვდება.",
      entries: await m.entries([
        { es: "encantado / encantada", ka: "სასიამოვნოა", en: "nice to meet you", exampleEs: "Encantada, Laura.", exampleKa: "სასიამოვნოა, ლაურა." },
        { es: "mucho gusto", ka: "ძალიან სასიამოვნოა", en: "pleased to meet you", exampleEs: "Mucho gusto, señor.", exampleKa: "ძალიან სასიამოვნოა, ბატონო." },
        { es: "me llamo", ka: "მე მქვია", en: "my name is", exampleEs: "Me llamo Mariam.", exampleKa: "მარიამი მქვია." },
        { es: "¿cómo te llamas?", ka: "რა გქვია?", en: "what's your name?" },
        { es: "soy de", ka: "…-დან ვარ", en: "I'm from", exampleEs: "Soy de Georgia.", exampleKa: "საქართველოდან ვარ." },
        { es: "¿de dónde eres?", ka: "საიდან ხარ?", en: "where are you from?" },
        { es: "vivo en", ka: "…-ში ვცხოვრობ", en: "I live in", exampleEs: "Vivo en Tbilisi.", exampleKa: "თბილისში ვცხოვრობ." },
        { article: "el", es: "nombre", ka: "სახელი", en: "name", exampleEs: "¿Tu nombre, por favor?", exampleKa: "შენი სახელი, გთხოვ?" },
        { article: "el", es: "apellido", ka: "გვარი", en: "surname", exampleEs: "Mi apellido es Beridze.", exampleKa: "ჩემი გვარია ბერიძე." },
        { es: "¿y tú?", ka: "შენ?", en: "and you?" },
      ]),
    }),
  },
  {
    title: "ვიდეო: Me presento",
    type: "VIDEO",
    estMinutes: 4,
    build: async (m) => {
      const { video, dialogue, seconds } = await m.dialogueVideo({
        name: "Me presento",
        image: "saludo",
        hand: "¡Hola!",
        titleKa: "ანა და ლუკასი ეცნობიან ერთმანეთს",
        context: { es: "En la calle", ka: "ანა და ლუკასი პირველად ხვდებიან." },
        speakers: [S.ana, S.lucas],
        lines: [
          ["lucas", "¡Hola! Me llamo Lucas. ¿Y tú?", "Hi! I'm Lucas. And you?"],
          ["ana", "Hola, Lucas. Yo soy Ana. Encantada.", "Hi, Lucas. I'm Ana. Nice to meet you."],
          ["lucas", "Encantado. ¿Eres de aquí?", "Nice to meet you. Are you from here?"],
          ["ana", "No, soy de Georgia. ¿Y tú?", "No, I'm from Georgia. And you?"],
          ["lucas", "Yo soy de Sevilla, pero vivo en Barcelona.", "I'm from Seville, but I live in Barcelona."],
          ["ana", "¡Yo también vivo en Barcelona!", "I live in Barcelona too!"],
          ["lucas", "¡Genial! Bienvenida, Ana.", "Great! Welcome, Ana."],
        ],
      });
      m.subtitle = `ვიდეო · ${clock(seconds)}`;
      return { video, introKa: "უყურე, როგორ ეცნობიან ანა და ლუკასი. მერე ქვემოთ ტექსტი წაიკითხე და ხმამაღლა გაიმეორე.", dialogue };
    },
  },
  {
    title: "el / la — გადაიტანე სწორ ყუთში",
    type: "GAME",
    estMinutes: 4,
    build: async () =>
      ex(
        "drag_sort",
        "el / la",
        "გადაიტანე სიტყვა სწორ ყუთში",
        [
          { buckets: [{ id: "el", label: "el" }, { id: "la", label: "la" }], items: [{ id: "1", text: "café", bucketId: "el" }, { id: "2", text: "cuenta", bucketId: "la" }, { id: "3", text: "té", bucketId: "el" }, { id: "4", text: "tostada", bucketId: "la" }, { id: "5", text: "zumo", bucketId: "el" }, { id: "6", text: "leche", bucketId: "la" }] },
          { buckets: [{ id: "el", label: "el" }, { id: "la", label: "la" }], items: [{ id: "1", text: "día", bucketId: "el" }, { id: "2", text: "casa", bucketId: "la" }, { id: "3", text: "nombre", bucketId: "el" }, { id: "4", text: "calle", bucketId: "la" }, { id: "5", text: "problema", bucketId: "el" }, { id: "6", text: "noche", bucketId: "la" }] },
          { buckets: [{ id: "el", label: "el" }, { id: "la", label: "la" }, { id: "los", label: "los" }, { id: "las", label: "las" }], items: [{ id: "1", text: "amigos", bucketId: "los" }, { id: "2", text: "chicas", bucketId: "las" }, { id: "3", text: "metro", bucketId: "el" }, { id: "4", text: "estación", bucketId: "la" }, { id: "5", text: "días", bucketId: "los" }, { id: "6", text: "noches", bucketId: "las" }] },
        ],
        { variant: "two_buckets", feedback: { correctKa: "ყველა თავის ადგილზეა!", finishTitleEs: "¡Muy bien!" } },
      ),
  },
  {
    title: "ჩემი წარდგენა",
    type: "DOCUMENT",
    estMinutes: 10,
    build: async (m) => {
      const blank = `<span class="line"></span>`;
      const file = await m.file(
        await pdfDoc(
          [
            {
              overline: "ME PRESENTO",
              title: "Mi presentación",
              html: `<p class="ka muted" style="margin-top:4mm;font-size:12pt">შეავსე შენს შესახებ. ესპანურად — რამდენიც შეგიძლია, დანარჩენს ერთად დავამატებთ.</p>
              <div class="box" lang="es" style="font-size:15pt;line-height:2.4">
                Hola, me llamo ${blank}.<br>Soy de ${blank}.<br>Vivo en ${blank}.<br>Tengo ${blank} años.<br>Soy ${blank} (profesión).<br>Hablo georgiano, ${blank} y un poco de español.
              </div>
              <h2>Un ejemplo: Ana</h2>
              <div class="box" lang="es" style="font-size:13pt;line-height:1.8">Hola, me llamo Ana. Soy de Georgia, de Tbilisi. Vivo en Barcelona. Tengo veintiocho años. Soy diseñadora. Hablo georgiano, inglés y un poco de español. ¡Encantada!</div>
              <h2>Pregunta a un amigo</h2>
              <table><tr><th>Pregunta</th><th>Respuesta</th></tr>
                <tr><td lang="es">¿Cómo te llamas?</td><td>${blank}</td></tr>
                <tr><td lang="es">¿De dónde eres?</td><td>${blank}</td></tr>
                <tr><td lang="es">¿Dónde vives?</td><td>${blank}</td></tr>
                <tr><td lang="es">¿Cuántos años tienes?</td><td>${blank}</td></tr>
              </table>`,
            },
          ],
          FOOTER,
        ),
        "Mi presentación.pdf",
        "სამუშაო ფურცელი: ჩემი წარდგენა",
      );
      return { file, noteKa: "შეავსე ფურცელი შენს შესახებ და შემდეგ გაკვეთილზე წამიკითხე — 30 წამი, მეტი არა. ¡Tú puedes!", allowDownload: true };
    },
  },
  {
    title: "გაიმეორე დიალოგი",
    type: "AUDIO",
    estMinutes: 4,
    build: async (m) => {
      const { audio, transcript, seconds } = await m.track(
        {
          context: { es: "Repite", ka: "გაიმეორე ჩემ შემდეგ" },
          speakers: [S.nina],
          lines: [
            ["nina", "Hola, me llamo Ana.", "Hi, my name is Ana."],
            ["nina", "Soy de Georgia.", "I'm from Georgia."],
            ["nina", "Vivo en Barcelona.", "I live in Barcelona."],
            ["nina", "Encantada.", "Nice to meet you."],
            ["nina", "¿Cómo te llamas?", "What's your name?"],
            ["nina", "¿De dónde eres?", "Where are you from?"],
            ["nina", "¿Dónde vives?", "Where do you live?"],
            ["nina", "Mucho gusto.", "Pleased to meet you."],
          ],
        },
        3,
      );
      m.subtitle = `აუდიო · ${clock(seconds)}`;
      return { audio, introKa: "ყოველი ფრაზის შემდეგ პაუზაა — გაიმეორე ხმამაღლა, სანამ შემდეგი დაიწყება.", transcript };
    },
  },

  // ——— Lesson 4 · Ana en Barcelona ———
  {
    title: "Ana en Barcelona",
    type: "STORY",
    estMinutes: 8,
    build: async (m) => ({
      characters: [S.ana, S.laura],
      place: { es: "Barcelona, España", ka: "ბარსელონა, ესპანეთი" },
      image: await m.image("barcelona", "ანა ჩემოდნით ბარსელონას ქუჩაში"),
      contextKa: "ანა ბარსელონაში პირველად ჩამოვიდა. ჩემოდნით ხელში ის პატარა სასტუმროში შედის — მიმღებში ლაურა ხვდება.",
      dialogue: await m.dialogue({
        context: { es: "En el Hostal Sol", ka: "სასტუმროს მიმღებში" },
        speakers: [S.ana, S.laura],
        lines: [
          ["laura", "¡Buenas tardes! Bienvenida al Hostal Sol.", "Good afternoon! Welcome to Hostal Sol."],
          ["ana", "Buenas tardes. Tengo una reserva. Me llamo Ana Beridze.", "Good afternoon. I have a reservation. My name is Ana Beridze."],
          ["laura", "¿Beridze? ¿Cómo se escribe?", "Beridze? How do you spell it?"],
          ["ana", "Be, e, erre, i, de, zeta, e.", "B, E, R, I, D, Z, E."],
          ["laura", "¡Perfecto! ¿Es usted de Grecia?", "Perfect! Are you from Greece?"],
          ["ana", "No, no. Georgia no es Grecia. Soy de Georgia, de Tbilisi.", "No, no. Georgia isn't Greece. I'm from Georgia, from Tbilisi."],
          ["laura", "¡Qué bonito! Su habitación es la número once.", "How lovely! Your room is number eleven."],
          ["ana", "Muchas gracias. ¡Barcelona es preciosa!", "Thank you very much. Barcelona is beautiful!"],
        ],
      }),
      grammarKa: "**usted** — თავაზიანი „თქვენ“. მასთან ზმნა მესამე პირშია: „¿Es usted de Grecia?“ — ისევე, როგორც „él es“.\n\n**¿Cómo se escribe?** — როგორ იწერება? ქართული გვარის გამო ეს კითხვა ხშირად დაგჭირდება.",
      cultureKa: "ბარსელონაში ორი ოფიციალური ენაა: ესპანური და კატალანური. აბრებზე ხშირად დაინახავ „Bon dia“ — კატალანურად „დილა მშვიდობისა“. ესპანურად ილაპარაკე თამამად — ყველა გაგიგებს.",
    }),
  },
  {
    title: "Ana es de Barcelona.",
    type: "EXERCISE",
    estMinutes: 3,
    build: async () =>
      ex(
        "swipe_true_false",
        "Ana en Barcelona",
        "წაიკითხე და გადაწყვიტე: მართალია თუ მცდარი?",
        [
          { statement: "Ana es de Barcelona.", isTrue: false },
          { statement: "Ana es de Georgia.", isTrue: true },
          { statement: "Ana tiene una reserva.", isTrue: true },
          { statement: "La habitación de Ana es la número doce.", isTrue: false },
          { statement: "Laura trabaja en el hostal.", isTrue: true },
          { statement: "Ana llega por la mañana.", isTrue: false, context: "Laura dice: «¡Buenas tardes!»" },
          { statement: "El apellido de Ana es Beridze.", isTrue: true },
        ],
        { variant: "card_stack", feedback: { correctKa: "სწორად გაიგე!", finishTitleEs: "¡Muy bien!" } },
      ),
  },
  {
    title: "ქვეყნები",
    type: "VOCAB",
    estMinutes: 5,
    build: async (m) => ({
      layout: "list",
      title: { es: "Países y nacionalidades", ka: "ქვეყნები და ეროვნებები" },
      introKa: "ქვეყანა და ეროვნება — კაცისთვის და ქალისთვის. ეროვნებები ესპანურად პატარა ასოთი იწერება.",
      entries: await m.entries([
        { es: "España", ka: "ესპანეთი", en: "Spain", exampleEs: "Soy español. Soy española.", exampleKa: "ესპანელი ვარ (კაცი / ქალი)." },
        { es: "Georgia", ka: "საქართველო", en: "Georgia", exampleEs: "Soy georgiano. Soy georgiana.", exampleKa: "ქართველი ვარ (კაცი / ქალი)." },
        { es: "Francia", ka: "საფრანგეთი", en: "France", exampleEs: "Es francés. Es francesa.", exampleKa: "ფრანგია." },
        { es: "Italia", ka: "იტალია", en: "Italy", exampleEs: "Es italiano. Es italiana.", exampleKa: "იტალიელია." },
        { es: "Alemania", ka: "გერმანია", en: "Germany", exampleEs: "Es alemán. Es alemana.", exampleKa: "გერმანელია." },
        { es: "Inglaterra", ka: "ინგლისი", en: "England", exampleEs: "Es inglés. Es inglesa.", exampleKa: "ინგლისელია." },
        { es: "México", ka: "მექსიკა", en: "Mexico" },
        { es: "Argentina", ka: "არგენტინა", en: "Argentina" },
        { es: "Portugal", ka: "პორტუგალია", en: "Portugal" },
        { es: "Grecia", ka: "საბერძნეთი", en: "Greece", exampleEs: "Georgia no es Grecia.", exampleKa: "საქართველო საბერძნეთი არ არის." },
      ]),
    }),
  },
  {
    title: "ser და estar — პირველი ნახვა",
    type: "GRAMMAR",
    estMinutes: 7,
    build: async () => ({
      titleEs: "Ser y estar",
      ruleKa: "ორივე ნიშნავს „ყოფნას“, მაგრამ: **ser** — ვინ ან რა ხარ, **estar** — სად ხარ ან როგორ ხარ ახლა.",
      body: "ქართულში ერთი „ვარ“ გვაქვს, ესპანურში — ორი. დღეს მხოლოდ მთავარს ვნახავთ:\n\n- **ser** — სახელი, წარმოშობა, პროფესია: Soy Ana. Soy de Georgia.\n- **estar** — ადგილი და მდგომარეობა: Estoy en Barcelona. Estoy bien.\n\nკითხვა, რომელიც დაგეხმარება: „ეს ჩემი ნაწილია, თუ ახლა ასეა?“",
      table: {
        caption: "აწმყო დრო",
        headers: ["", "ser", "estar"],
        rows: [
          ["yo", "soy", "estoy"],
          ["tú", "eres", "estás"],
          ["él / ella", "es", "está"],
          ["nosotros", "somos", "estamos"],
          ["vosotros", "sois", "estáis"],
          ["ellos / ellas", "son", "están"],
        ],
      },
      examples: [
        { es: "**Soy** de Georgia, pero **estoy** en Barcelona.", ka: "საქართველოდან ვარ, მაგრამ ახლა ბარსელონაში ვარ." },
        { es: "Lucas **es** camarero.", ka: "ლუკასი მიმტანია." },
        { es: "Lucas **está** cansado.", ka: "ლუკასი დაღლილია (ახლა)." },
        { es: "¿Dónde **está** el hostal?", ka: "სად არის სასტუმრო?" },
      ],
      mistakes: [
        { wrong: "Soy en Barcelona.", right: "Estoy en Barcelona.", noteKa: "ადგილისთვის — estar" },
        { wrong: "Estoy de Georgia.", right: "Soy de Georgia.", noteKa: "წარმოშობისთვის — ser" },
      ],
      tipKa: "ჯერ ყველა წესის დამახსოვრებას ნუ ეცდები. „Soy de…“ და „Estoy en…“ — ეს ორი ფრაზა თითქმის ყველა სიტუაციას დაფარავს.",
    }),
  },
  {
    title: "რუკა",
    type: "INFO_CARD",
    estMinutes: 2,
    build: async (m) => ({
      pages: [
        await m.card(
          mapCard({
            page: "1 / 1",
            cities: [
              { es: "Madrid", ka: "დედაქალაქი, ქვეყნის ცენტრში" },
              { es: "Barcelona", ka: "ზღვასთან, ჩრდილო-აღმოსავლეთით" },
              { es: "Valencia", ka: "ფორთოხლების და პაელიას ქალაქი" },
              { es: "Sevilla", ka: "სამხრეთი და ფლამენკო" },
              { es: "Bilbao", ka: "ჩრდილოეთი, მთები და ოკეანე" },
              { es: "Málaga", ka: "მზიანი სამხრეთის სანაპირო" },
            ],
          }),
          "España mapa",
          "ესპანეთის რუკა",
        ),
      ],
      altKa: "ესპანეთის ილუსტრირებული რუკა და ექვსი დიდი ქალაქი",
      captionKa: "¿De dónde eres? — ესპანეთის ქალაქები",
    }),
  },
  {
    title: "დიალოგი ბარსელონაში",
    type: "DIALOGUE",
    estMinutes: 4,
    build: async (m) =>
      m.dialogue({
        context: { es: "En la Rambla", ka: "ანა ქუჩაში კაფეს ეძებს და ლუკასს ხვდება." },
        speakers: [S.ana, S.lucas],
        lines: [
          ["ana", "Perdona, ¿hay un café por aquí?", "Excuse me, is there a café around here?"],
          ["lucas", "Sí, hay uno en la plaza. ¿Eres turista?", "Yes, there's one in the square. Are you a tourist?"],
          ["ana", "No, vivo aquí. Soy de Georgia.", "No, I live here. I'm from Georgia."],
          ["lucas", "¡Ah, qué interesante! Yo soy Lucas.", "Oh, how interesting! I'm Lucas."],
          ["ana", "Encantada, Lucas. Yo soy Ana.", "Nice to meet you, Lucas. I'm Ana."],
          ["lucas", "¿Vamos juntos al café? Está muy cerca.", "Shall we go to the café together? It's very close."],
          ["ana", "¡Vale, vamos!", "OK, let's go!"],
        ],
      }),
  },
  {
    title: "მოსმენა: Ana",
    type: "AUDIO",
    estMinutes: 4,
    build: async (m) => {
      const { audio, transcript, seconds } = await m.track(
        {
          context: { es: "Ana habla de sí misma", ka: "ანა თავის შესახებ ყვება" },
          speakers: [S.ana],
          lines: [
            ["ana", "¡Hola! Me llamo Ana.", "Hi! My name is Ana."],
            ["ana", "Soy de Georgia, de Tbilisi.", "I'm from Georgia, from Tbilisi."],
            ["ana", "Tengo veintiocho años.", "I'm twenty-eight."],
            ["ana", "Ahora vivo en Barcelona.", "Now I live in Barcelona."],
            ["ana", "Soy diseñadora y trabajo en casa.", "I'm a designer and I work from home."],
            ["ana", "Me gusta mucho el café con leche.", "I really like white coffee."],
            ["ana", "Por las mañanas camino por la playa.", "In the mornings I walk on the beach."],
            ["ana", "¡Barcelona es preciosa!", "Barcelona is beautiful!"],
          ],
        },
        0.9,
      );
      m.subtitle = `აუდიო · ${clock(seconds)}`;
      return { audio, introKa: "მოუსმინე ანას. რამდენი რამ გაიგე მის შესახებ? ჯერ ტექსტის გარეშე სცადე.", transcript };
    },
  },
  {
    title: "ტექსტი",
    type: "DOCUMENT",
    estMinutes: 10,
    build: async (m) => {
      const blank = `<span class="line" style="min-width:120mm"></span>`;
      const file = await m.file(
        await pdfDoc(
          [
            {
              overline: "LECTURA",
              title: "Ana en Barcelona",
              html: `<div class="box" lang="es" style="font-size:14pt;line-height:1.9">
                <p>Ana es de Georgia. Es de Tbilisi, la capital. Tiene veintiocho años y es diseñadora.</p>
                <p style="margin-top:4mm">Ahora Ana vive en Barcelona. Su casa está cerca de la playa. Por la mañana, Ana toma un café con leche en un bar pequeño de la plaza. El camarero se llama Lucas. Es de Sevilla y es muy simpático.</p>
                <p style="margin-top:4mm">Ana trabaja en casa. Por la tarde camina por la ciudad. Barcelona es grande y bonita, y hay muchos turistas. ¡Pero Ana no es turista: Ana vive aquí!</p>
              </div>
              <h2>Vocabulario</h2>
              <table>
                <tr><td lang="es"><b>la capital</b></td><td>დედაქალაქი</td><td lang="es"><b>cerca de</b></td><td>ახლოს</td></tr>
                <tr><td lang="es"><b>la playa</b></td><td>პლაჟი</td><td lang="es"><b>pequeño</b></td><td>პატარა</td></tr>
                <tr><td lang="es"><b>simpático</b></td><td>სასიამოვნო, კეთილი</td><td lang="es"><b>camina</b></td><td>სეირნობს</td></tr>
                <tr><td lang="es"><b>la ciudad</b></td><td>ქალაქი</td><td lang="es"><b>hay</b></td><td>არის, არსებობს</td></tr>
              </table>`,
            },
            {
              overline: "PREGUNTAS",
              title: "¿Qué sabes de Ana?",
              html: `<h2>1. Contesta</h2>
              <div class="box" lang="es" style="font-size:13pt;line-height:2.4">
                ¿De dónde es Ana? ${blank}<br>¿Cuántos años tiene? ${blank}<br>¿Dónde vive ahora? ${blank}<br>¿Cómo se llama el camarero? ${blank}
              </div>
              <h2>2. ¿Verdadero o falso?</h2>
              <table><tr><th></th><th>V</th><th>F</th></tr>
                <tr><td lang="es">Ana es de Barcelona.</td><td>☐</td><td>☐</td></tr>
                <tr><td lang="es">Lucas es de Sevilla.</td><td>☐</td><td>☐</td></tr>
                <tr><td lang="es">Ana trabaja en un bar.</td><td>☐</td><td>☐</td></tr>
                <tr><td lang="es">La casa de Ana está cerca de la playa.</td><td>☐</td><td>☐</td></tr>
              </table>
              <p class="ka muted" style="margin-top:8mm;font-size:12pt">პასუხებს შემდეგ გაკვეთილზე ერთად შევამოწმებთ.</p>`,
            },
          ],
          FOOTER,
        ),
        "Ana en Barcelona — lectura.pdf",
        "საკითხავი ტექსტი და კითხვები",
      );
      return { file, noteKa: "წაიკითხე ტექსტი, მერე მეორე გვერდზე კითხვებს უპასუხე. უცნობი სიტყვები ტექსტის ქვემოთაა.", allowDownload: true };
    },
  },
];
