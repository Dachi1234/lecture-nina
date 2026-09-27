import { bigTextSlide, clockCard, directionsCard, esc, listCard, menuCard, pdfDoc, titleSlide, wordCard } from "./cards.js";
import { clock, ex, S, type Line, type Spec } from "./kit.js";
import { duration, makeVideo, tts, type VideoSlide } from "./media.js";

const FOOTER = "Nina · Tu profe de español";

const NUMBERS = ["cero", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez", "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve", "veinte"];
const NUMBERS_KA = ["ნული", "ერთი", "ორი", "სამი", "ოთხი", "ხუთი", "ექვსი", "შვიდი", "რვა", "ცხრა", "ათი", "თერთმეტი", "თორმეტი", "ცამეტი", "თოთხმეტი", "თხუთმეტი", "თექვსმეტი", "ჩვიდმეტი", "თვრამეტი", "ცხრამეტი", "ოცი"];
const NUMBER_EXAMPLES: Record<number, [string, string]> = {
  1: ["Un café, por favor.", "ერთი ყავა, გთხოვ."],
  2: ["Tengo dos hermanos.", "ორი ძმა მყავს."],
  3: ["Son las tres.", "სამი საათია."],
  5: ["Cinco minutos a pie.", "ფეხით ხუთი წუთი."],
  7: ["Siete euros, por favor.", "შვიდი ევრო, გთხოვ."],
  10: ["La clase es a las diez.", "გაკვეთილი ათზეა."],
  11: ["La habitación número once.", "ოთახი ნომერი თერთმეტი."],
  12: ["Son doce euros.", "თორმეტი ევროა."],
  13: ["El autobús trece.", "ავტობუსი ნომერი ცამეტი."],
  15: ["Tengo quince años.", "თხუთმეტი წლის ვარ."],
  20: ["Somos veinte en clase.", "კლასში ოცნი ვართ."],
};

export const lessonsB: Spec[] = [
  // ——— Lesson 5 · Los números y la hora ———
  {
    title: "რიცხვები 1–20",
    type: "VOCAB",
    estMinutes: 6,
    build: async (m) => ({
      layout: "list",
      title: { es: "Los números", ka: "რიცხვები 0–20" },
      introKa: "ჯერ 0–10 ისწავლე, მერე 11–15 (ისინი განსაკუთრებულია). 16-დან ყველაფერი ლოგიკურია: dieci + seis = dieciséis.",
      entries: await m.entries(
        NUMBERS.map((es, index) => ({ es, ka: `${index} — ${NUMBERS_KA[index]}`, en: String(index), exampleEs: NUMBER_EXAMPLES[index]?.[0], exampleKa: NUMBER_EXAMPLES[index]?.[1] })),
      ),
    }),
  },
  {
    title: "¿Qué hora es?",
    type: "GRAMMAR",
    estMinutes: 6,
    build: async (m) => ({
      titleEs: "¿Qué hora es?",
      ruleKa: "**Es la una**, მაგრამ **son las dos, las tres…** — ერთისთვის მხოლობითი, დანარჩენისთვის მრავლობითი.",
      body: "დროის სათქმელად გვჭირდება: საათი + **y** (და) ან **menos** (აკლია).\n\n- **y cuarto** — თხუთმეტი წუთი\n- **y media** — ნახევარი\n- **menos cuarto** — აკლია თხუთმეტი\n\n„¿Qué hora es?“ — რომელი საათია? „¿A qué hora…?“ — რომელ საათზე?",
      table: {
        caption: "დრო ესპანურად",
        headers: ["საათი", "español", "ქართულად"],
        rows: [
          ["1:00", "Es la una.", "პირველი საათია."],
          ["2:00", "Son las dos.", "ორი საათია."],
          ["3:15", "Son las tres y cuarto.", "სამის თხუთმეტი წუთია."],
          ["4:30", "Son las cuatro y media.", "ოთხის ნახევარია."],
          ["5:45", "Son las seis menos cuarto.", "ექვსს აკლია თხუთმეტი."],
          ["7:10", "Son las siete y diez.", "შვიდის ათი წუთია."],
        ],
      },
      image: await m.image("reloj", "საათი"),
      examples: [
        { es: "— ¿Qué hora es? — **Son las ocho.**", ka: "— რომელი საათია? — რვა საათია." },
        { es: "La clase es **a las siete y media**.", ka: "გაკვეთილი შვიდის ნახევარზეა." },
        { es: "**Es la una y diez.**", ka: "პირველის ათი წუთია." },
      ],
      mistakes: [
        { wrong: "Son la una.", right: "Es la una.", noteKa: "ერთი — მხოლობითი" },
        { wrong: "Son las tres y quince.", right: "Son las tres y cuarto.", noteKa: "ორივეს გაიგებენ, მაგრამ „cuarto“ უფრო ბუნებრივია" },
      ],
      tipKa: "ესპანეთში სადილი 14:00–15:00-ზეა, ვახშამი კი 21:00-ზე ან უფრო გვიან. ასე რომ, „¿A qué hora cenamos?“ — მზად იყავი გვიანი პასუხისთვის.",
    }),
  },
  {
    title: "საათი — ბარათები",
    type: "INFO_CARD",
    estMinutes: 3,
    build: async (m) => ({
      pages: await m.cards(
        [
          clockCard({
            title: "¿Qué hora es?",
            page: "1 / 2",
            rows: [
              { hour: 1, minute: 0, es: "Es la una.", ka: "პირველი საათია." },
              { hour: 3, minute: 30, es: "Son las tres y media.", ka: "სამის ნახევარია." },
              { hour: 8, minute: 15, es: "Son las ocho y cuarto.", ka: "რვის თხუთმეტი წუთია." },
              { hour: 9, minute: 45, es: "Son las diez menos cuarto.", ka: "ათს აკლია თხუთმეტი." },
            ],
          }),
          clockCard({
            title: "¿A qué hora?",
            page: "2 / 2",
            rows: [
              { hour: 12, minute: 0, es: "Son las doce.", ka: "თორმეტი საათია." },
              { hour: 2, minute: 10, es: "Son las dos y diez.", ka: "ორის ათი წუთია." },
              { hour: 6, minute: 20, es: "Son las seis y veinte.", ka: "ექვსის ოცი წუთია." },
              { hour: 7, minute: 50, es: "Son las ocho menos diez.", ka: "რვას აკლია ათი წუთი." },
            ],
          }),
        ],
        "La hora",
        "საათის ბარათი",
      ),
      altKa: "ორი ბარათი საათის ციფერბლატებით და დროის გამოთქმებით",
      captionKa: "La hora · რომელი საათია?",
    }),
  },
  {
    title: "დიალოგი: დრო",
    type: "DIALOGUE",
    estMinutes: 4,
    build: async (m) =>
      m.dialogue({
        context: { es: "Por teléfono", ka: "ლუკასი ლაურას ურეკავს, რომ კაფეში შეხვედრაზე შეთანხმდნენ." },
        speakers: [S.lucas, S.laura],
        lines: [
          ["lucas", "¡Hola, Laura! ¿Tomamos un café mañana?", "Hi, Laura! Shall we have a coffee tomorrow?"],
          ["laura", "¡Sí! ¿A qué hora?", "Yes! What time?"],
          ["lucas", "¿A las diez?", "At ten?"],
          ["laura", "Uf, a las diez tengo clase. ¿A las once y media?", "Ugh, I have class at ten. At half past eleven?"],
          ["lucas", "Perfecto. ¿Dónde?", "Perfect. Where?"],
          ["laura", "En el café de la plaza.", "At the café in the square."],
          ["lucas", "Vale. ¿Y qué hora es ahora?", "OK. And what time is it now?"],
          ["laura", "Son las nueve menos cuarto. ¡Me voy!", "It's a quarter to nine. I'm off!"],
        ],
      }),
  },
  {
    title: "მოსმენა: la hora",
    type: "AUDIO",
    estMinutes: 4,
    build: async (m) => {
      const megafonia = { id: "megafonia", name: "Megafonía", initial: "M", tone: "navy" as const };
      const { audio, transcript, seconds } = await m.track(
        {
          context: { es: "En la estación de tren", ka: "რკინიგზის სადგურის განცხადებები" },
          speakers: [megafonia],
          lines: [
            ["megafonia", "El tren a Madrid sale a las ocho y cuarto.", "The train to Madrid leaves at a quarter past eight."],
            ["megafonia", "El tren a Valencia sale a las nueve y media.", "The train to Valencia leaves at half past nine."],
            ["megafonia", "El tren a Sevilla sale a las diez menos diez.", "The train to Seville leaves at ten to ten."],
            ["megafonia", "El tren a Bilbao sale a la una.", "The train to Bilbao leaves at one o'clock."],
            ["megafonia", "El tren a Málaga sale a las tres y veinte.", "The train to Málaga leaves at twenty past three."],
          ],
        },
        1.6,
      );
      m.subtitle = `აუდიო · ${clock(seconds)}`;
      return { audio, introKa: "სადგურის განცხადებებია. ჩაიწერე, რომელ საათზე გადის თითოეული მატარებელი — მერე ტექსტით შეამოწმე.", transcript };
    },
  },
  {
    title: "ვიდეო: los números",
    type: "VIDEO",
    estMinutes: 3,
    build: async (m) => {
      const slides: VideoSlide[] = [{ image: await titleSlide({ image: "reloj", hand: "Los números", titleKa: "რიცხვები 0–12" }), seconds: 3 }];
      for (let n = 0; n <= 12; n += 1) {
        slides.push({ image: await bigTextSlide({ overline: "LOS NÚMEROS", big: String(n), ka: `${NUMBERS[n]} — ${NUMBERS_KA[n]}` }), audio: await tts(NUMBERS[n]!, "nina", "-25%") });
      }
      const file = await makeVideo(slides);
      m.subtitle = `ვიდეო · ${clock(await duration(file))}`;
      return {
        video: await m.file(file, "Los números 0-12.mp4", "რიცხვები 0–12"),
        introKa: "უყურე და ყოველ რიცხვს ხმამაღლა გაიმეორე. მეორედ სცადე, თქვა რიცხვი მანამ, სანამ გაიგებ.",
        dialogue: {
          speakers: [S.nina],
          lines: [
            { speakerId: "nina", es: "Cero, uno, dos, tres, cuatro.", en: "Zero, one, two, three, four." },
            { speakerId: "nina", es: "Cinco, seis, siete, ocho.", en: "Five, six, seven, eight." },
            { speakerId: "nina", es: "Nueve, diez, once, doce.", en: "Nine, ten, eleven, twelve." },
          ],
        },
      };
    },
  },
  {
    title: "სავარჯიშო: რიცხვები",
    type: "EXERCISE",
    subtitle: "მოსმენა · 6 ნაბიჯი",
    estMinutes: 5,
    build: async (m) =>
      ex(
        "listening",
        "Los números",
        "მოუსმინე და აირჩიე რიცხვი",
        [
          { audio: await m.say("Tengo quince años.", "laura"), questionEs: "¿Cuántos años tiene?", questionKa: "რამდენი წლისაა?", options: [{ id: "5", text: "5" }, { id: "15", text: "15" }, { id: "50", text: "50" }], correctId: "15" },
          { audio: await m.say("El autobús número trece, por favor.", "lucas"), questionEs: "¿Qué autobús?", questionKa: "რომელი ავტობუსი?", options: [{ id: "3", text: "3" }, { id: "13", text: "13" }, { id: "30", text: "30" }], correctId: "13" },
          { audio: await m.say("Son doce euros.", "camarero"), questionEs: "¿Cuánto es?", questionKa: "რა ღირს?", options: [{ id: "2", text: "2 €" }, { id: "12", text: "12 €" }, { id: "20", text: "20 €" }], correctId: "12" },
          { audio: await m.say("Su habitación es la número once.", "laura"), questionEs: "¿Qué habitación?", questionKa: "რომელი ოთახი?", options: [{ id: "1", text: "1" }, { id: "11", text: "11" }, { id: "7", text: "7" }], correctId: "11" },
          { audio: await m.say("Somos catorce en clase.", "ana"), questionEs: "¿Cuántos son?", questionKa: "რამდენნი არიან?", options: [{ id: "4", text: "4" }, { id: "14", text: "14" }, { id: "40", text: "40" }], correctId: "14" },
          { audio: await m.say("Mi teléfono es el cinco, cinco, cinco, nueve, ocho, siete.", "lucas"), questionEs: "¿Qué número es?", questionKa: "რომელი ნომერია?", options: [{ id: "a", text: "555 987" }, { id: "b", text: "555 978" }, { id: "c", text: "565 987" }], correctId: "a" },
        ],
        { feedback: { correctKa: "კარგი ყური გაქვს!", finishTitleEs: "¡Muy bien!" } },
      ),
  },
  {
    title: "PDF: los números",
    type: "DOCUMENT",
    estMinutes: 8,
    build: async (m) => {
      const cells = NUMBERS.map((es, index) => `<tr><td style="font-weight:700;font-size:14pt;color:var(--teal)">${index}</td><td lang="es" style="font-weight:700">${esc(es)}</td><td>${esc(NUMBERS_KA[index]!)}</td></tr>`);
      const half = Math.ceil(cells.length / 2);
      const blank = `<span class="line" style="min-width:60mm"></span>`;
      const file = await m.file(
        await pdfDoc(
          [
            {
              overline: "LOS NÚMEROS",
              title: "Del 0 al 20",
              html: `<div style="display:flex;gap:8mm"><table>${cells.slice(0, half).join("")}</table><table>${cells.slice(half).join("")}</table></div>
              <div class="box ka" style="font-size:12pt">11–15 დაიმახსოვრე, როგორც ცალკე სიტყვები: once, doce, trece, catorce, quince. 16–19 კი ასე იწყობა: <b lang="es">dieci + seis</b> = dieciséis.</div>`,
            },
            {
              overline: "EJERCICIOS",
              title: "¡A practicar!",
              html: `<h2>1. Escribe con letras</h2>
              <div class="box" lang="es" style="font-size:14pt;line-height:2.4">7 → ${blank}<br>12 → ${blank}<br>15 → ${blank}<br>18 → ${blank}<br>20 → ${blank}</div>
              <h2>2. Tu número de teléfono</h2>
              <div class="box ka" style="font-size:12pt;line-height:2.2">დაწერე შენი ტელეფონის ნომერი ესპანურად, ციფრ-ციფრ:<br><span class="line" style="min-width:160mm"></span></div>
              <h2>3. ¿Cuánto es?</h2>
              <table><tr><td lang="es">Un café con leche</td><td>1,60 €</td><td lang="es">un euro con sesenta</td></tr><tr><td lang="es">Un zumo</td><td>2,80 €</td><td>${blank}</td></tr><tr><td lang="es">Una tostada</td><td>2,50 €</td><td>${blank}</td></tr></table>`,
            },
          ],
          FOOTER,
        ),
        "Los números 0-20.pdf",
        "რიცხვების ცხრილი და სავარჯიშოები",
      );
      return { file, noteKa: "პირველ გვერდზე რიცხვების ცხრილია, მეორეზე — სავარჯიშოები. შეავსე და ფოტო გამომიგზავნე.", allowDownload: true };
    },
  },
  {
    title: "გამოთქმა: ce",
    type: "PRONUNCIATION",
    estMinutes: 4,
    build: async (m) => ({
      title: "ce · ci · ca",
      items: [
        { grapheme: "ce", hintKa: "ესპანეთში — როგორც ინგლისური „th“ (think): ენა კბილებს შორის. ლათინურ ამერიკაში — „ს“.", example: "cero", audio: await m.say("cero… cena", "nina", "-30%") },
        { grapheme: "ci", hintKa: "იგივე ბგერა: cinco — „θინკო“.", example: "cinco", audio: await m.say("cinco… gracias", "nina", "-30%") },
        { grapheme: "ca", hintKa: "ca, co, cu — ჩვეულებრივი „კ“.", example: "casa", audio: await m.say("casa… café", "nina", "-30%") },
      ],
      examples: ["once", "doce", "trece", "la cena", "gracias", "Barcelona", "el café"],
      tipKa: "„Gracias“ ესპანეთში ჟღერს „გრაθიას“, სევილიასა და მექსიკაში — „გრასიას“. ორივე სწორია!",
    }),
  },
  {
    title: "ბლოკი 2",
    type: "CHECKPOINT",
    subtitle: "17 / 20",
    estMinutes: 12,
    build: async (m) =>
      ex("checkpoint", "ბლოკი 2", "შეამოწმე მეორე ბლოკი: თავის გაცნობა, ser და estar, რიცხვები", [
        {
          sections: [
            {
              labelKa: "თავის გაცნობა",
              stepRefs: [
                { templateId: "fill_blank", verbHint: "ser", rows: [{ before: "Yo", after: "de Georgia.", answer: "soy" }, { before: "Ella", after: "Laura.", answer: "es" }] },
                { templateId: "multiple_choice", prompt: { ka: "როგორ იკითხავ სახელს?" }, options: [{ id: "a", text: "¿Cómo te llamas?" }, { id: "b", text: "¿De dónde eres?" }, { id: "c", text: "¿Qué tal?" }], correctId: "a" },
              ],
            },
            {
              labelKa: "ser და estar",
              stepRefs: [
                { templateId: "drag_sort", buckets: [{ id: "ser", label: "ser" }, { id: "estar", label: "estar" }], items: [{ id: "1", text: "de Georgia", bucketId: "ser" }, { id: "2", text: "en Barcelona", bucketId: "estar" }, { id: "3", text: "estudiante", bucketId: "ser" }, { id: "4", text: "bien", bucketId: "estar" }] },
                { templateId: "swipe_true_false", statement: "„Soy en Madrid.“ — სწორია.", isTrue: false },
              ],
            },
            {
              labelKa: "რიცხვები და დრო",
              stepRefs: [
                { templateId: "listening", audio: await m.say("Son las tres y media.", "laura"), questionEs: "¿Qué hora es?", questionKa: "რომელი საათია?", options: [{ id: "a", text: "3:30" }, { id: "b", text: "3:15" }, { id: "c", text: "2:30" }], correctId: "a" },
                { templateId: "matching_pairs", mode: "word_translation", pairs: [{ left: "doce", right: "12" }, { left: "quince", right: "15" }, { left: "veinte", right: "20" }, { left: "siete", right: "7" }] },
              ],
            },
          ],
        },
      ]),
  },

  // ——— Lesson 6 · En el café ———
  {
    title: "Por favor",
    type: "DIALOGUE",
    estMinutes: 4,
    build: async (m) =>
      m.dialogue({
        context: { es: "En la barra", ka: "ლაურა ბარის დახლთან დგას და თავაზიანად უკვეთავს." },
        speakers: [S.laura, S.camarero],
        lines: [
          ["camarero", "Buenos días. ¿Qué le pongo?", "Good morning. What can I get you?"],
          ["laura", "Buenos días. Un café con leche, por favor.", "Good morning. A white coffee, please."],
          ["camarero", "¿Algo más?", "Anything else?"],
          ["laura", "Sí, una tostada con tomate, por favor.", "Yes, a toast with tomato, please."],
          ["camarero", "Muy bien. Aquí tiene.", "Very good. Here you are."],
          ["laura", "Muchas gracias.", "Thank you very much."],
          ["camarero", "De nada. ¡Que aproveche!", "You're welcome. Enjoy your meal!"],
        ],
      }),
  },
  {
    title: "Un café con leche",
    type: "VOCAB",
    estMinutes: 6,
    build: async (m) => ({
      layout: "list",
      title: { es: "En el café", ka: "კაფეში" },
      introKa: "ყველაფერი, რაც ესპანურ კაფეში დილით დაგჭირდება. el — მამრობითი, la — მდედრობითი (ფერებითაც მონიშნულია).",
      entries: await m.entries([
        { article: "el", es: "café con leche", ka: "ყავა რძით", en: "white coffee", exampleEs: "Un café con leche, por favor.", exampleKa: "ერთი ყავა რძით, გთხოვ.", image: "cafe-con-leche" },
        { article: "el", es: "café solo", ka: "შავი ყავა (ესპრესო)", en: "espresso", exampleEs: "Para mí, un café solo.", exampleKa: "ჩემთვის შავი ყავა." },
        { article: "el", es: "cortado", ka: "ყავა ცოტა რძით", en: "coffee with a dash of milk", exampleEs: "Un cortado y un té, por favor.", exampleKa: "ერთი კორტადო და ერთი ჩაი, გთხოვ." },
        { article: "el", es: "té", ka: "ჩაი", en: "tea", exampleEs: "¿Tienen té verde?", exampleKa: "მწვანე ჩაი გაქვთ?", image: "te" },
        { article: "el", es: "zumo de naranja", ka: "ფორთოხლის წვენი", en: "orange juice", exampleEs: "Un zumo de naranja natural.", exampleKa: "ახალი ფორთოხლის წვენი.", image: "zumo" },
        { article: "el", es: "agua", ka: "წყალი", en: "water", exampleEs: "Agua sin gas, por favor.", exampleKa: "უგაზო წყალი, გთხოვ.", image: "agua" },
        { article: "la", es: "tostada", ka: "ტოსტი", en: "toast", exampleEs: "Una tostada con tomate.", exampleKa: "ტოსტი პომიდვრით.", image: "tostada" },
        { article: "el", es: "cruasán", ka: "კრუასანი", en: "croissant", image: "cruasan" },
        { article: "el", es: "azúcar", ka: "შაქარი", en: "sugar", exampleEs: "Sin azúcar, gracias.", exampleKa: "უშაქროდ, გმადლობ." },
        { article: "la", es: "cuenta", ka: "ანგარიში", en: "the bill", exampleEs: "La cuenta, por favor.", exampleKa: "ანგარიში, გთხოვ.", image: "cuenta" },
      ]),
    }),
  },
  {
    title: "Ana y Lucas en el café",
    type: "VIDEO",
    estMinutes: 5,
    build: async (m) => {
      const { video, dialogue, seconds } = await m.dialogueVideo({
        name: "Ana y Lucas en el café",
        image: "cafe-pedido",
        hand: "¡Vamos!",
        titleKa: "ანა და ლუკასი კაფეში",
        context: { es: "En el café", ka: "ანა და ლუკასი საუზმეს უკვეთავენ." },
        speakers: [S.ana, S.lucas, S.camarero],
        lines: CAFE_LINES,
      });
      m.subtitle = `ვიდეო-დიალოგი · ${clock(seconds)}`;
      return { video, introKa: "ანა და ლუკასი კაფეში შედიან. ჯერ ერთხელ უყურე ტექსტის გარეშე, მერე — ტექსტით.", dialogue };
    },
  },
  {
    title: "დიალოგის ტექსტი (ES / EN)",
    type: "DIALOGUE",
    estMinutes: 4,
    build: async (m) =>
      m.dialogue({
        context: { es: "En el café", ka: "ვიდეოს სრული ტექსტი. დააჭირე ხაზის ღილაკს და მოუსმინე." },
        speakers: [S.ana, S.lucas, S.camarero],
        lines: CAFE_LINES,
      }),
  },
  {
    title: "En el café · ლექსიკის ბარათები",
    type: "VOCAB",
    estMinutes: 3,
    build: async (m) => ({
      layout: "image",
      title: { es: "En el café", ka: "კაფეში" },
      introKa: "გადაფურცლე ბარათები, მერე ქვემოთ სიტყვებს მოუსმინე.",
      pages: await m.cards(
        [
          wordCard({ overline: "EN EL CAFÉ", image: "cafe-con-leche", article: "el", word: "café con leche", ka: "ყავა რძით", exampleEs: "Un café con leche, por favor.", exampleKa: "ერთი ყავა რძით, გთხოვ.", page: "1 / 4" }),
          wordCard({ overline: "EN EL CAFÉ", image: "tostada", article: "la", word: "tostada", ka: "ტოსტი", exampleEs: "Una tostada con tomate.", exampleKa: "ტოსტი პომიდვრით.", page: "2 / 4" }),
          wordCard({ overline: "EN EL CAFÉ", image: "zumo", article: "el", word: "zumo de naranja", ka: "ფორთოხლის წვენი", exampleEs: "¿Tienen zumo natural?", exampleKa: "ახალი წვენი გაქვთ?", page: "3 / 4" }),
          wordCard({ overline: "EN EL CAFÉ", image: "cuenta", article: "la", word: "cuenta", ka: "ანგარიში", exampleEs: "La cuenta, por favor.", exampleKa: "ანგარიში, გთხოვ.", page: "4 / 4" }),
        ],
        "En el café tarjeta",
        "ლექსიკის ბარათი",
      ),
      entries: await m.entries([
        { article: "el", es: "café con leche", ka: "ყავა რძით", en: "white coffee" },
        { article: "la", es: "tostada", ka: "ტოსტი", en: "toast" },
        { article: "el", es: "zumo de naranja", ka: "ფორთოხლის წვენი", en: "orange juice" },
        { article: "la", es: "cuenta", ka: "ანგარიში", en: "the bill" },
      ]),
    }),
  },
  {
    title: "El menú del día",
    type: "INFO_CARD",
    estMinutes: 3,
    build: async (m) => ({
      pages: await m.cards(
        [
          menuCard({
            titleEs: "Café Sol",
            subtitleKa: "დილის მენიუ",
            page: "1 / 2",
            sections: [
              {
                name: "BEBIDAS",
                items: [
                  { es: "café solo", ka: "შავი ყავა", price: "1,30 €" },
                  { es: "café con leche", ka: "ყავა რძით", price: "1,60 €" },
                  { es: "cortado", ka: "ყავა ცოტა რძით", price: "1,40 €" },
                  { es: "té", ka: "ჩაი", price: "1,50 €" },
                  { es: "zumo de naranja", ka: "ფორთოხლის წვენი", price: "2,80 €" },
                ],
              },
              {
                name: "PARA COMER",
                items: [
                  { es: "tostada con tomate", ka: "ტოსტი პომიდვრით", price: "2,50 €" },
                  { es: "cruasán", ka: "კრუასანი", price: "1,80 €" },
                  { es: "bocadillo de jamón", ka: "სენდვიჩი ლორით", price: "4,50 €" },
                ],
              },
            ],
          }),
          listCard({
            overline: "PEDIR",
            titleEs: "¿Qué le pongo?",
            titleKa: "როგორ შევუკვეთოთ",
            image: "cafe-pedido",
            rows: [
              { es: "Quiero un café, por favor.", ka: "ყავა მინდა, გთხოვ." },
              { es: "Para mí, una tostada.", ka: "ჩემთვის ტოსტი." },
              { es: "¿Cuánto es?", ka: "რა ღირს?" },
              { es: "La cuenta, por favor.", ka: "ანგარიში, გთხოვ." },
            ],
            page: "2 / 2",
          }),
        ],
        "Menú del día",
        "კაფის მენიუ",
      ),
      altKa: "კაფე „Sol“-ის დილის მენიუ ფასებით და შეკვეთის ფრაზები",
      captionKa: "Café Sol — დილის მენიუ და ფრაზები შესაკვეთად",
    }),
  },
  {
    title: "La cuenta, por favor",
    type: "DIALOGUE",
    estMinutes: 3,
    build: async (m) =>
      m.dialogue({
        context: { es: "Al final", ka: "საუზმე დასრულდა. ლუკასი ანგარიშს ითხოვს." },
        speakers: [S.lucas, S.camarero, S.ana],
        lines: [
          ["lucas", "Perdone, ¡la cuenta, por favor!", "Excuse me, the bill, please!"],
          ["camarero", "Sí, ahora mismo. Son siete euros con cuarenta.", "Yes, right away. That's seven euros forty."],
          ["lucas", "¿Puedo pagar con tarjeta?", "Can I pay by card?"],
          ["camarero", "Claro que sí.", "Of course."],
          ["ana", "No, no, Lucas. ¡Hoy invito yo!", "No, no, Lucas. Today it's my treat!"],
          ["lucas", "¡Muchas gracias, Ana!", "Thanks a lot, Ana!"],
          ["camarero", "Gracias a vosotros. ¡Hasta luego!", "Thank you. See you!"],
        ],
      }),
  },
  {
    title: "querer — quiero, quieres…",
    type: "GRAMMAR",
    estMinutes: 7,
    build: async (m) => ({
      titleEs: "El verbo querer",
      ruleKa: "**querer** = სურვილი. ფუძეში **e → ie** იცვლება: quiero, quieres, quiere… მაგრამ nosotros და vosotros უცვლელია: queremos, queréis.",
      body: "კაფეში ყველაზე ხშირი ზმნა! **Quiero** + საგანი = რაღაც მინდა.\n\n- **Quiero un café.** — ყავა მინდა.\n- **¿Quieres agua?** — წყალი გინდა?\n\n**Quiero** + ზმნა = რაღაცის გაკეთება მინდა.\n\n- **Quiero pagar.** — გადახდა მინდა.\n\nუფრო რბილად რომ ჟღერდეს, თქვი **Quería…** („მინდოდა…“) ან უბრალოდ დაამატე **por favor**.",
      table: {
        caption: "querer — აწმყო (e → ie)",
        headers: ["", "querer", "ქართულად"],
        rows: [
          ["yo", "**quiero**", "მე მინდა"],
          ["tú", "**quieres**", "შენ გინდა"],
          ["él / ella / usted", "**quiere**", "მას უნდა"],
          ["nosotros", "**queremos**", "ჩვენ გვინდა"],
          ["vosotros", "**queréis**", "თქვენ გინდათ"],
          ["ellos / ellas", "**quieren**", "მათ უნდათ"],
        ],
      },
      image: await m.image("cafe-pedido", "ანა და ლუკასი კაფეში უკვეთავენ"),
      examples: [
        { es: "**Quiero** un café con leche, por favor.", ka: "ყავა რძით მინდა, გთხოვ." },
        { es: "¿Qué **quieres** tomar?", ka: "რისი დალევა გინდა?" },
        { es: "Ana y Lucas **quieren** una mesa.", ka: "ანას და ლუკასს მაგიდა უნდათ." },
        { es: "¿**Queréis** algo más?", ka: "კიდევ რამე გინდათ?" },
      ],
      mistakes: [
        { wrong: "Yo quero un té.", right: "Yo quiero un té.", noteKa: "e → ie: quiero" },
        { wrong: "Nosotros quieremos…", right: "Nosotros queremos…", noteKa: "nosotros-თან ფუძე არ იცვლება" },
      ],
      tipKa: "დაიმახსოვრე „ფეხსაცმლის“ წესი: e → ie იცვლება ყველგან, გარდა nosotros-ისა და vosotros-ისა. ცხრილში შეცვლილი ფორმები ფეხსაცმლის მოხაზულობას ქმნის.",
    }),
  },
  {
    title: "გამოთქმა: c / z",
    type: "PRONUNCIATION",
    estMinutes: 4,
    build: async (m) => ({
      title: "c · z",
      items: [
        { grapheme: "z", hintKa: "z ყოველთვის ერთნაირად ჟღერს: ესპანეთში — როგორც ინგლისური „th“, ლათინურ ამერიკაში — „ს“.", example: "zumo", audio: await m.say("zumo… zumo", "nina", "-30%") },
        { grapheme: "c", hintKa: "c e-სა და i-ს წინ იგივე ბგერაა, რაც z: cerveza — „θერბეθა“.", example: "cerveza", audio: await m.say("cerveza… cerveza", "nina", "-30%") },
      ],
      examples: ["cerveza", "zumo", "azúcar", "la cena", "gracias", "la plaza", "cinco"],
      tipKa: "„Zumo“ და „cena“ ერთი და იგივე ბგერით იწყება, თუმცა სხვადასხვა ასოთი იწერება. ესაა ესპანური ორთოგრაფიის პატარა ხრიკი.",
    }),
  },
  {
    title: "დაწერე დიალოგი",
    type: "DIALOGUE",
    estMinutes: 15,
    build: async (m) =>
      m.dialogue({
        context: { es: "Tu turno", ka: "ეს ნიმუშია. დაწერე შენი დიალოგი კაფეში, 6–8 ხაზი, და გამომიგზავნე. გამოიყენე: quiero, para mí, ¿cuánto es?, la cuenta." },
        speakers: [S.camarero, S.tu],
        lines: [
          ["camarero", "¡Buenas tardes! ¿Qué quieres tomar?", "Good afternoon! What would you like?"],
          ["tu", "Hola. Quiero un té, por favor.", "Hi. I want a tea, please."],
          ["camarero", "¿Con limón o con leche?", "With lemon or with milk?"],
          ["tu", "Con limón. Y un cruasán.", "With lemon. And a croissant."],
          ["camarero", "Muy bien. ¿Algo más?", "Very good. Anything else?"],
          ["tu", "No, gracias. ¿Cuánto es?", "No, thanks. How much is it?"],
          ["camarero", "Son tres euros con treinta.", "That's three euros thirty."],
          ["tu", "Aquí tienes. ¡Gracias!", "Here you are. Thanks!"],
        ],
      }),
  },
  {
    title: "მოუსმინე: Diálogo 3",
    type: "AUDIO",
    estMinutes: 5,
    build: async (m) => {
      const { audio, transcript, seconds } = await m.track(
        {
          context: { es: "En el restaurante", ka: "ლაურა და ლუკასი რესტორანში ვახშმობენ." },
          speakers: [S.camarero, S.laura, S.lucas],
          lines: [
            ["camarero", "Buenas noches. ¿Una mesa para dos?", "Good evening. A table for two?"],
            ["laura", "Sí, por favor. Cerca de la ventana.", "Yes, please. Near the window."],
            ["camarero", "Aquí tienen la carta.", "Here is the menu."],
            ["lucas", "Gracias. Yo quiero una paella.", "Thanks. I want a paella."],
            ["laura", "Para mí, una ensalada y agua con gas.", "For me, a salad and sparkling water."],
            ["camarero", "¿Y de postre?", "And for dessert?"],
            ["laura", "Un flan, por favor. ¡Me encanta el flan!", "A flan, please. I love flan!"],
            ["lucas", "¿Cuánto es todo?", "How much is everything?"],
            ["camarero", "Son veintitrés euros.", "That's twenty-three euros."],
          ],
        },
        0.6,
      );
      m.subtitle = `აუდიო · ${clock(seconds)}`;
      return { audio, introKa: "მოუსმინე ორჯერ. პირველად — უბრალოდ მოუსმინე. მეორედ უპასუხე: რა შეუკვეთეს და რა ღირდა?", transcript };
    },
  },

  // ——— Lesson 7 · ¿Dónde está el metro? ———
  {
    title: "¿Dónde está…?",
    type: "GRAMMAR",
    estMinutes: 6,
    build: async (m) => ({
      titleEs: "¿Dónde está…?",
      ruleKa: "ადგილს **estar**-ით ვეკითხებით: **¿Dónde está** el metro? — სად არის მეტრო? მრავლობითში: **¿Dónde están** los servicios?",
      body: "როცა არ იცი, საერთოდ არის თუ არა რამე ახლოს — გამოიყენე **hay**:\n\n- **¿Hay** un banco por aquí? — აქ ახლოს ბანკი არის?\n- **¿Dónde está** el banco? — სად არის (ის) ბანკი?\n\nპასუხისთვის:\n\n- **Está a la derecha.** — მარჯვნივაა.\n- **Está cerca / lejos.** — ახლოსაა / შორსაა.\n- **Está al lado del café.** — კაფის გვერდითაა.",
      table: {
        caption: "ადგილი და მიმართულება",
        headers: ["", "español", "ქართულად"],
        rows: [
          ["→", "a la derecha", "მარჯვნივ"],
          ["←", "a la izquierda", "მარცხნივ"],
          ["↑", "todo recto", "პირდაპირ"],
          ["", "cerca de", "ახლოს"],
          ["", "lejos de", "შორს"],
          ["", "al lado de", "გვერდით"],
          ["", "enfrente de", "მოპირდაპირედ"],
        ],
      },
      image: await m.image("metro", "ანა ქუჩაში გზას კითხულობს"),
      examples: [
        { es: "Perdone, ¿**dónde está** la estación?", ka: "უკაცრავად, სად არის სადგური?" },
        { es: "¿**Hay** una farmacia cerca?", ka: "ახლოს აფთიაქია?" },
        { es: "El metro **está** enfrente del museo.", ka: "მეტრო მუზეუმის მოპირდაპირედაა." },
      ],
      mistakes: [
        { wrong: "¿Dónde es el metro?", right: "¿Dónde está el metro?", noteKa: "ადგილი — ყოველთვის estar" },
        { wrong: "¿Dónde hay el banco?", right: "¿Hay un banco? / ¿Dónde está el banco?", noteKa: "hay — un / una-სთან, está — el / la-სთან" },
      ],
      tipKa: "„უკაცრავად“ — Perdone (თქვენობით) ან Perdona (შენობით). ქუჩაში უცნობთან უკეთესია „perdone“.",
    }),
  },
  {
    title: "მიმართულებების ბარათები",
    type: "INFO_CARD",
    estMinutes: 3,
    build: async (m) => ({
      pages: await m.cards(
        [
          directionsCard({
            titleEs: "¿Por dónde?",
            titleKa: "საით წავიდე?",
            page: "1 / 2",
            rows: [
              { arrow: "left", es: "a la izquierda", ka: "მარცხნივ" },
              { arrow: "right", es: "a la derecha", ka: "მარჯვნივ" },
              { arrow: "straight", es: "todo recto", ka: "პირდაპირ" },
              { arrow: "back", es: "da la vuelta", ka: "მობრუნდი" },
            ],
          }),
          directionsCard({
            titleEs: "¿Dónde está?",
            titleKa: "სად არის?",
            page: "2 / 2",
            rows: [
              { arrow: "corner", es: "en la esquina", ka: "კუთხეში" },
              { arrow: "opposite", es: "enfrente", ka: "მოპირდაპირედ" },
              { arrow: "right", es: "la primera a la derecha", ka: "პირველი ქუჩა მარჯვნივ" },
              { arrow: "left", es: "la segunda a la izquierda", ka: "მეორე ქუჩა მარცხნივ" },
            ],
          }),
        ],
        "Direcciones",
        "მიმართულებების ბარათი",
      ),
      altKa: "ორი ბარათი ისრებით: მარცხნივ, მარჯვნივ, პირდაპირ, კუთხეში, მოპირდაპირედ",
      captionKa: "Direcciones · მიმართულებები",
    }),
  },
  {
    title: "ელ მეტრო — ვიდეო",
    type: "VIDEO",
    estMinutes: 4,
    build: async (m) => {
      const { video, dialogue, seconds } = await m.dialogueVideo({
        name: "Dónde está el metro",
        image: "metro",
        hand: "¿Dónde está?",
        titleKa: "ანა მეტროს ეძებს",
        context: { es: "En la calle", ka: "ანა ქუჩაში მოხუც ბატონს გზას ეკითხება." },
        speakers: [S.ana, S.senor],
        lines: [
          ["ana", "Perdone, señor. ¿Dónde está el metro?", "Excuse me, sir. Where is the metro?"],
          ["senor", "¿El metro? Está muy cerca.", "The metro? It's very close."],
          ["senor", "Siga todo recto y luego gire a la izquierda.", "Go straight ahead and then turn left."],
          ["ana", "¿Todo recto y a la izquierda?", "Straight ahead and to the left?"],
          ["senor", "Eso es. Está enfrente de la farmacia.", "That's it. It's opposite the pharmacy."],
          ["ana", "¿Está lejos?", "Is it far?"],
          ["senor", "No, no. Cinco minutos a pie.", "No, no. Five minutes on foot."],
          ["ana", "¡Muchas gracias!", "Thank you very much!"],
          ["senor", "De nada. ¡Buen día!", "You're welcome. Have a good day!"],
        ],
      });
      m.subtitle = `ვიდეო · ${clock(seconds)}`;
      return { video, introKa: "ანა მეტროს ეძებს. ყურადღება მიაქციე, როგორ ხსნის ბატონი გზას — ეს ფრაზები მოგზაურობისას აუცილებლად დაგჭირდება.", dialogue };
    },
  },
  {
    title: "მოსმენა: ¿Qué pide Laura?",
    type: "EXERCISE",
    subtitle: "აუდიო + კითხვა · 4 ნაბიჯი",
    estMinutes: 5,
    build: async (m) =>
      ex(
        "listening",
        "მოუსმინე და უპასუხე",
        "მოუსმინე ლაურას და უპასუხე კითხვებს",
        [
          { audio: await m.clip([["camarero", "Hola, ¿qué te pongo?", ""], ["laura", "Un café, por favor. Sin azúcar.", ""]], "Laura pide 1"), questionEs: "¿Qué pide Laura?", questionKa: "რა შეუკვეთა ლაურამ?", options: [{ id: "te", text: "un té" }, { id: "zumo", text: "un zumo" }, { id: "cafe", text: "un café" }, { id: "agua", text: "agua" }], correctId: "cafe" },
          { audio: await m.clip([["camarero", "¿Algo para comer?", ""], ["laura", "Sí, una tostada con tomate.", ""]], "Laura pide 2"), questionEs: "¿Qué come Laura?", questionKa: "რას ჭამს ლაურა?", options: [{ id: "cruasan", text: "un cruasán" }, { id: "tostada", text: "una tostada" }, { id: "bocadillo", text: "un bocadillo" }], correctId: "tostada" },
          { audio: await m.clip([["laura", "¿Cuánto es?", ""], ["camarero", "Son dos euros con cincuenta.", ""]], "Laura pide 3"), questionEs: "¿Cuánto es?", questionKa: "რა ღირს?", options: [{ id: "a", text: "2,15 €" }, { id: "b", text: "2,50 €" }, { id: "c", text: "12,50 €" }], correctId: "b" },
          { audio: await m.clip([["laura", "¿Puedo pagar con tarjeta?", ""], ["camarero", "Sí, claro.", ""]], "Laura pide 4"), questionEs: "¿Cómo paga Laura?", questionKa: "როგორ იხდის ლაურა?", options: [{ id: "tarjeta", text: "con tarjeta" }, { id: "efectivo", text: "en efectivo" }, { id: "movil", text: "con el móvil" }], correctId: "tarjeta" },
        ],
        { feedback: { correctKa: "ზუსტად გაიგე!", finishTitleEs: "¡Buen oído!" } },
      ),
  },
  {
    title: "La carta del café",
    type: "DOCUMENT",
    estMinutes: 8,
    build: async (m) => {
      const row = (es: string, ka: string, price: string) => `<tr><td lang="es" style="font-weight:700;font-size:13pt">${esc(es)}</td><td class="muted">${esc(ka)}</td><td style="text-align:right;font-weight:700;color:var(--teal)">${esc(price)}</td></tr>`;
      const file = await m.file(
        await pdfDoc(
          [
            {
              overline: "LA CARTA",
              title: "Café Sol",
              html: `<p class="hand" lang="es" style="font-size:24pt;color:var(--burgundy);margin-top:2mm">Desayunos todo el día</p>
              <h2>Bebidas calientes</h2><table>${row("Café solo", "შავი ყავა", "1,30 €")}${row("Cortado", "ყავა ცოტა რძით", "1,40 €")}${row("Café con leche", "ყავა რძით", "1,60 €")}${row("Té o infusión", "ჩაი ან ბალახის ჩაი", "1,50 €")}${row("Chocolate caliente", "ცხელი შოკოლადი", "2,20 €")}</table>
              <h2>Bebidas frías</h2><table>${row("Zumo de naranja natural", "ახალი ფორთოხლის წვენი", "2,80 €")}${row("Agua (con o sin gas)", "წყალი (გაზიანი ან უგაზო)", "1,20 €")}${row("Refresco", "გამაგრილებელი სასმელი", "2,00 €")}</table>
              <h2>Para comer</h2><table>${row("Tostada con tomate", "ტოსტი პომიდვრით", "2,50 €")}${row("Tostada con jamón", "ტოსტი ლორით", "3,50 €")}${row("Cruasán", "კრუასანი", "1,80 €")}${row("Bocadillo de tortilla", "სენდვიჩი ომლეტით", "4,00 €")}</table>`,
            },
            {
              overline: "FRASES ÚTILES",
              title: "Para pedir",
              html: `<table>
                <tr><th>El camarero dice</th><th>ქართულად</th></tr>
                <tr><td lang="es"><b>¿Qué le pongo?</b></td><td>რა მოგართვათ?</td></tr>
                <tr><td lang="es"><b>¿Algo más?</b></td><td>კიდევ რამე?</td></tr>
                <tr><td lang="es"><b>¿Para tomar aquí o para llevar?</b></td><td>აქ დალევთ თუ თან წაიღებთ?</td></tr>
              </table>
              <table style="margin-top:8mm">
                <tr><th>Tú dices</th><th>ქართულად</th></tr>
                <tr><td lang="es"><b>Quiero un café con leche, por favor.</b></td><td>ყავა რძით მინდა, გთხოვ.</td></tr>
                <tr><td lang="es"><b>Para mí, una tostada con tomate.</b></td><td>ჩემთვის ტოსტი პომიდვრით.</td></tr>
                <tr><td lang="es"><b>Para llevar, por favor.</b></td><td>თან წასაღებად, გთხოვ.</td></tr>
                <tr><td lang="es"><b>¿Cuánto es?</b></td><td>რა ღირს?</td></tr>
                <tr><td lang="es"><b>La cuenta, por favor.</b></td><td>ანგარიში, გთხოვ.</td></tr>
              </table>
              <div class="box ka" style="font-size:12pt">ესპანეთში კაფეში ჩაის ფულს (propina) ხშირად არ ტოვებენ, მაგრამ წვრილმანის დატოვება სასიამოვნო ჟესტია.</div>`,
            },
          ],
          FOOTER,
        ),
        "La carta del café.pdf",
        "კაფის მენიუ და ფრაზები შესაკვეთად",
      );
      return { file, noteKa: "ეს ნამდვილი კაფის მენიუს ჰგავს. წაიკითხე, და შემდეგ გაკვეთილზე ჩემთან „შეუკვეთე“ — მე ვიქნები მიმტანი.", allowDownload: true };
    },
  },
  {
    title: "შენ კაფეში ხარ. რას უპასუხებ?",
    type: "EXERCISE",
    estMinutes: 5,
    build: async () =>
      ex(
        "branching_dialogue",
        "შენ კაფეში ხარ",
        "მიმტანი გელაპარაკება. აირჩიე, რას უპასუხებ",
        [
          {
            start: "h",
            speakers: [S.camarero],
            nodes: [
              { id: "h", speakerId: "camarero", text: "¡Hola! ¿Qué quieres tomar?", choices: [{ text: "Un café con leche, por favor.", next: "eat", isGood: true }, { text: "Me llamo Mariam.", next: "h_bad", isGood: false }] },
              { id: "h_bad", speakerId: "camarero", text: "¡Encantado! Pero… ¿qué quieres tomar?", choices: [{ text: "Perdón, un café con leche, por favor.", next: "eat", isGood: true }] },
              { id: "eat", speakerId: "camarero", text: "¿Quieres algo para comer?", choices: [{ text: "Sí, una tostada, por favor.", next: "more", isGood: true }, { text: "Sí, un zumo.", next: "eat_bad", isGood: false }, { text: "No, gracias.", next: "pay", isGood: true }] },
              { id: "eat_bad", speakerId: "camarero", text: "El zumo es para beber. ¿Y para comer?", choices: [{ text: "Ah, una tostada, por favor.", next: "more", isGood: true }] },
              { id: "more", speakerId: "camarero", text: "Aquí tienes. ¿Algo más?", choices: [{ text: "No, gracias. ¿Cuánto es?", next: "pay", isGood: true }] },
              { id: "pay", speakerId: "camarero", text: "Son cuatro euros con diez.", choices: [{ text: "Aquí tienes. ¡Gracias!", next: "end", isGood: true }, { text: "¿Cuatro euros? ¡Es muy caro!", next: "end_rude", isGood: false }] },
              { id: "end", speakerId: "camarero", text: "¡Gracias a ti! ¡Hasta luego!" },
              { id: "end_rude", speakerId: "camarero", text: "Bueno… es el precio normal. ¡Hasta luego!" },
            ],
          },
        ],
        { variant: "chat", feedback: { correctKa: "ბუნებრივად ჟღერს!", finishTitleEs: "¡Qué bien hablas!" } },
      ),
  },
  {
    title: "izquierda / derecha",
    type: "VOCAB",
    estMinutes: 5,
    build: async (m) => ({
      layout: "list",
      title: { es: "Direcciones", ka: "მიმართულებები" },
      introKa: "სიტყვები, რომლითაც ქალაქში გზას იკითხავ და გაიგებ პასუხს.",
      entries: await m.entries([
        { es: "a la izquierda", ka: "მარცხნივ", en: "to the left", exampleEs: "El banco está a la izquierda.", exampleKa: "ბანკი მარცხნივაა." },
        { es: "a la derecha", ka: "მარჯვნივ", en: "to the right", exampleEs: "Gire a la derecha.", exampleKa: "მოუხვიეთ მარჯვნივ." },
        { es: "todo recto", ka: "პირდაპირ", en: "straight ahead", exampleEs: "Siga todo recto.", exampleKa: "პირდაპირ იარეთ." },
        { es: "cerca", ka: "ახლოს", en: "near", exampleEs: "Está muy cerca.", exampleKa: "ძალიან ახლოსაა." },
        { es: "lejos", ka: "შორს", en: "far" },
        { es: "al lado de", ka: "გვერდით", en: "next to", exampleEs: "Al lado del café.", exampleKa: "კაფის გვერდით." },
        { es: "enfrente de", ka: "მოპირდაპირედ", en: "opposite" },
        { article: "la", es: "esquina", ka: "კუთხე", en: "corner" },
        { article: "la", es: "calle", ka: "ქუჩა", en: "street", exampleEs: "La calle Mayor.", exampleKa: "მაიორის ქუჩა." },
        { article: "la", es: "plaza", ka: "მოედანი", en: "square" },
        { article: "el", es: "semáforo", ka: "შუქნიშანი", en: "traffic light" },
        { article: "la", es: "parada", ka: "გაჩერება", en: "stop", exampleEs: "¿Dónde está la parada?", exampleKa: "სად არის გაჩერება?" },
      ]),
    }),
  },
  {
    title: "დიალოგი ქუჩაში",
    type: "DIALOGUE",
    estMinutes: 4,
    build: async (m) =>
      m.dialogue({
        context: { es: "En la calle", ka: "ქუჩაში აფთიაქს ეძებ და გამვლელს ეკითხები." },
        speakers: [S.tu, S.senor],
        lines: [
          ["tu", "Perdone, ¿hay una farmacia por aquí?", "Excuse me, is there a pharmacy around here?"],
          ["senor", "Sí, hay una en la calle Mayor.", "Yes, there's one on Mayor Street."],
          ["tu", "¿Y dónde está la calle Mayor?", "And where is Mayor Street?"],
          ["senor", "La primera a la derecha. Al lado del banco.", "The first on the right. Next to the bank."],
          ["tu", "¿Está lejos?", "Is it far?"],
          ["senor", "No, está a dos minutos.", "No, it's two minutes away."],
          ["tu", "Muchas gracias. ¡Adiós!", "Thanks a lot. Bye!"],
        ],
      }),
  },
  {
    title: "გამოთქმა: rr",
    type: "PRONUNCIATION",
    estMinutes: 4,
    build: async (m) => ({
      title: "r · rr",
      items: [
        { grapheme: "r", hintKa: "ერთი მოკლე დარტყმა — ქართული „რ“-ის მსგავსი: pero, caro.", example: "pero", audio: await m.say("pero… caro", "nina", "-30%") },
        { grapheme: "rr", hintKa: "გრძელი, მოგორავე „რრრ“. სიტყვის დასაწყისში r-იც ასე ჟღერს: Roma, rosa.", example: "perro", audio: await m.say("perro… carro… Roma", "nina", "-30%") },
      ],
      examples: ["pero / perro", "caro / carro", "Roma", "el arroz", "la guitarra", "correcto"],
      tipKa: "კარგი ამბავი: ქართული „რ“ ესპანურ r-ს ძალიან ჰგავს. rr-სთვის ენა უბრალოდ ცოტა უფრო დიდხანს „აგორავე“.",
    }),
  },
  {
    title: "Transporte en Valencia",
    type: "VOCAB",
    subtitle: "ლექსიკა · ნინასგან შენთვის",
    estMinutes: 5,
    build: async (m) => ({
      layout: "list",
      title: { es: "Transporte en Valencia", ka: "ტრანსპორტი ვალენსიაში" },
      introKa: "მარიამ, ეს სიტყვები სპეციალურად შენი ვალენსიის მოგზაურობისთვისაა. ¡Buen viaje!",
      entries: await m.entries([
        { article: "el", es: "metro", ka: "მეტრო", en: "subway", exampleEs: "¿Dónde está el metro?", exampleKa: "სად არის მეტრო?" },
        { article: "el", es: "autobús", ka: "ავტობუსი", en: "bus", exampleEs: "¿Este autobús va a la playa?", exampleKa: "ეს ავტობუსი პლაჟზე მიდის?" },
        { article: "el", es: "tranvía", ka: "ტრამვაი", en: "tram" },
        { article: "la", es: "bicicleta", ka: "ველოსიპედი", en: "bicycle", exampleEs: "En Valencia hay muchas bicicletas.", exampleKa: "ვალენსიაში ბევრი ველოსიპედია." },
        { article: "la", es: "parada", ka: "გაჩერება", en: "stop" },
        { article: "la", es: "estación", ka: "სადგური", en: "station" },
        { article: "el", es: "billete", ka: "ბილეთი", en: "ticket", exampleEs: "Un billete, por favor.", exampleKa: "ერთი ბილეთი, გთხოვ." },
        { article: "la", es: "tarjeta de transporte", ka: "სამგზავრო ბარათი", en: "transport card" },
        { article: "el", es: "aeropuerto", ka: "აეროპორტი", en: "airport", exampleEs: "¿Cómo voy al aeropuerto?", exampleKa: "როგორ მივიდე აეროპორტში?" },
        { article: "la", es: "playa", ka: "პლაჟი", en: "beach" },
        { es: "¿cuánto cuesta un billete?", ka: "რა ღირს ბილეთი?", en: "how much is a ticket?" },
        { es: "¿qué línea va al centro?", ka: "რომელი ხაზი მიდის ცენტრში?", en: "which line goes downtown?" },
      ]),
    }),
  },
];

const CAFE_LINES: Line[] = [
  ["camarero", "¡Hola, buenos días! ¿Qué queréis tomar?", "Hi, good morning! What would you like?"],
  ["lucas", "Hola. Yo quiero un café solo, por favor.", "Hi. I want an espresso, please."],
  ["camarero", "¿Y tú?", "And you?"],
  ["ana", "Para mí, un café con leche.", "For me, a white coffee."],
  ["camarero", "¿Queréis algo para comer?", "Do you want something to eat?"],
  ["lucas", "Sí, un cruasán.", "Yes, a croissant."],
  ["ana", "Y una tostada con tomate, por favor.", "And a toast with tomato, please."],
  ["camarero", "Perfecto. Ahora mismo.", "Perfect. Right away."],
];
