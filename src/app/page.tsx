"use client";

import { FormEvent, useRef, useState } from "react";

type LeadForm = {
  name: string;
  phone: string;
  email: string;
  company: string;
  industry: string;
  revenue: string;
  goal: string;
};

const emptyForm: LeadForm = {
  name: "",
  phone: "",
  email: "",
  company: "",
  industry: "",
  revenue: "",
  goal: "",
};

const services = [
  { number: "01", title: "Digitālais mārketings", description: "Reklāmas kampaņas un jaunu klientu piesaiste.", symbol: "↗" },
  { number: "02", title: "Zīmola attīstība", description: "Pārdomāts dizains un atpazīstama identitāte.", symbol: "◇" },
  { number: "03", title: "AI automatizācija", description: "Gudrāki procesi un mazāk ikdienas rutīnas.", symbol: "✳" },
  { number: "04", title: "CRM un pārdošana", description: "Klientu pārvaldība un efektīvāka pārdošana.", symbol: "◎" },
  { number: "05", title: "Mārketinga stratēģija", description: "Skaidri mērķi, datu analīze un labāki lēmumi.", symbol: "◈" },
  { number: "06", title: "Digitālais saturs", description: "Saturs, kas piesaista uzmanību un palīdz pārdot.", symbol: "✦" },
];

const advantages = [
  "Skaidra stratēģija",
  "Pārdomāts dizains",
  "Datos un mērķos balstīti risinājumi",
  "AI automatizācija ikdienas procesos",
];

const audiences = [
  "Jauniem uzņēmumiem",
  "Augošiem zīmoliem",
  "Uzņēmumiem, kas vēlas vairāk klientu",
  "Komandām, kas vēlas izmantot AI",
];

export default function Home() {
  const [form, setForm] = useState<LeadForm>(emptyForm);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [servicePage, setServicePage] = useState(0);

  function update(field: keyof LeadForm, value: string) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  function moveServices(direction: -1 | 1) {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const card = carousel.querySelector<HTMLElement>(".service-card");
    if (!card) return;
    const gap = 16;
    const visible = window.innerWidth <= 640 ? 1 : window.innerWidth <= 1000 ? 2 : 3;
    carousel.scrollBy({ left: direction * (card.offsetWidth + gap) * visible, behavior: "smooth" });
  }

  function updateServicePage() {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const maxScroll = carousel.scrollWidth - carousel.clientWidth;
    if (maxScroll <= 0) return;
    setServicePage(Math.round((carousel.scrollLeft / maxScroll) * 100));
  }

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    setSending(true);
    setMessage("");
    setSuccess(false);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error("Request failed");
      setForm(emptyForm);
      setSuccess(true);
      setMessage("Paldies! Tavs pieteikums ir saņemts.");
    } catch {
      setSuccess(false);
      setMessage("Pieteikumu pašlaik neizdevās nosūtīt. Lūdzu, mēģini vēlāk.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main>
      <header className="site-header">
        <a className="logo" href="#sakums" aria-label="FORMA sākums">FORMA<span>.</span></a>
        <nav className="desktop-nav" aria-label="Galvenā navigācija">
          <a href="#par-mums">Par mums</a>
          <a href="#pakalpojumi">Pakalpojumi</a>
          <a href="#kam">Kam palīdzam</a>
          <a href="#pieteikums">Kontakti</a>
        </nav>
        <a className="header-button" href="#pieteikums">Sākt sadarbību <span>↗</span></a>
      </header>

      <section className="hero" id="sakums">
        <div className="hero-image" aria-hidden="true" />
        <div className="hero-content">
          <p className="eyebrow light">DIGITAL GROWTH STUDIO</p>
          <h1>Idejām ir<br />vajadzīga <em>forma.</em></h1>
          <p className="hero-description">Mēs palīdzam uzņēmumiem augt ar labu stratēģiju, radošām idejām un modernām tehnoloģijām.</p>
          <a className="primary-button" href="#pieteikums">Parunāsim par tavu ideju <span>↗</span></a>
        </div>
        <div className="hero-bottom"><span>RĪGA · LATVIJA</span><a href="#par-mums">ATKLĀJ VAIRĀK ↓</a></div>
      </section>

      <section className="about-section section-wrap" id="par-mums">
        <div className="about-left">
          <p className="eyebrow">01 / PAR MUMS</p>
          <h2>Mazāk trokšņa.<br /><span>Vairāk rezultātu.</span></h2>
          <p>FORMA palīdz uzņēmumiem atrast labākus veidus, kā piesaistīt klientus, attīstīt savu zīmolu un uzlabot pārdošanu.</p>
          <p>Mēs apvienojam dizainu, stratēģiju un tehnoloģijas, lai idejas pārvērstos reālos rezultātos.</p>
        </div>
        <div className="about-right">
          <p className="eyebrow">KĀPĒC FORMA</p>
          <h3>Radošums ar skaidru mērķi.</h3>
          <div className="advantages-list">
            {advantages.map((advantage, index) => (
              <div className="advantage" key={advantage}>
                <span>0{index + 1}</span><p>{advantage}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="services-section section-wrap" id="pakalpojumi">
        <div className="section-heading compact-heading">
          <div><p className="eyebrow">02 / KO MĒS DARĀM</p><h2>Idejas, kas strādā.</h2></div>
          <div className="carousel-buttons">
            <button type="button" aria-label="Iepriekšējie pakalpojumi" onClick={() => moveServices(-1)}>←</button>
            <button type="button" aria-label="Nākamie pakalpojumi" onClick={() => moveServices(1)}>→</button>
          </div>
        </div>
        <div className="services-carousel" ref={carouselRef} onScroll={updateServicePage}>
          {services.map((service) => (
            <article className="service-card" key={service.number}>
              <div className="service-top"><span>{service.number} / 06</span><span className="service-symbol" aria-hidden="true">{service.symbol}</span></div>
              <div><h3>{service.title}</h3><p>{service.description}</p></div>
            </article>
          ))}
        </div>
        <div className="carousel-bottom"><span>VELC UZ SĀNIEM VAI IZMANTO BULTIŅAS</span><div className="carousel-progress"><div style={{ width: `${Math.max(15, servicePage)}%` }} /></div></div>
      </section>

      <section className="audience-philosophy section-wrap" id="kam">
        <div className="audience-content">
          <p className="eyebrow">03 / KAM MĒS PALĪDZAM</p>
          <h2>Katram biznesam<br />ir sava <em>forma.</em></h2>
          <div className="audience-grid">
            {audiences.map((audience, index) => (
              <div className="audience-item" key={audience}>
                <span>0{index + 1}</span><p>{audience}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="philosophy-card">
          <div className="philosophy-picture" aria-hidden="true" />
          <div className="philosophy-text">
            <p className="eyebrow light">FORMA / OUR PHILOSOPHY</p>
            <h3>Labs dizains piesaista.<br />Gudra stratēģija pārdod.</h3>
          </div>
        </div>
      </section>

      <section className="contact-section" id="pieteikums">
        <div className="contact-layout">
          <div className="contact-intro">
            <p className="eyebrow">04 / SĀKSIM SARUNU</p>
            <h2>Tavs nākamais<br /><em>solis sākas šeit.</em></h2>
            <p>Katram uzņēmumam ir savi mērķi un iespējas. Tāpēc vēlamies uzzināt par Tavu nozari, mēneša apgrozījumu un plāniem, lai piedāvātu piemērotāko risinājumu.</p>
            <div className="contact-decoration"><span>F.</span><p>IDEJAS. STRATĒĢIJA. IZAUGSME.</p></div>
          </div>
          <div className="form-card">
            <div className="form-heading"><span>JAUNS PIETEIKUMS</span><span>↗</span></div>
            <h3>Pieteikt konsultāciju</h3>
            <p className="form-subtitle">Aizpildi formu, un mēs ar tevi sazināsimies.</p>
            <form onSubmit={submitForm}>
              <div className="form-grid">
                <label>Vārds *<input required minLength={2} maxLength={100} autoComplete="name" placeholder="Tavs vārds" value={form.name} onChange={(e) => update("name", e.target.value)} /></label>
                <label>Telefons *<input required type="tel" minLength={7} maxLength={30} autoComplete="tel" placeholder="+371 20000000" value={form.phone} onChange={(e) => update("phone", e.target.value)} /></label>
                <label>E-pasts *<input required type="email" maxLength={200} autoComplete="email" placeholder="vards@uznemums.lv" value={form.email} onChange={(e) => update("email", e.target.value)} /></label>
                <label>Uzņēmums *<input required maxLength={150} placeholder="Uzņēmuma nosaukums" value={form.company} onChange={(e) => update("company", e.target.value)} /></label>
                <label>Nozare *<select required value={form.industry} onChange={(e) => update("industry", e.target.value)}><option value="">Izvēlies nozari</option><option>E-komercija</option><option>Pakalpojumi</option><option>IT un tehnoloģijas</option><option>Ražošana</option><option>Nekustamais īpašums</option><option>Cita</option></select></label>
                <label>Mēneša apgrozījums *<select required value={form.revenue} onChange={(e) => update("revenue", e.target.value)}><option value="">Izvēlies apgrozījumu</option><option>Līdz 5 000 €</option><option>5 000–20 000 €</option><option>20 000–50 000 €</option><option>50 000–100 000 €</option><option>Virs 100 000 €</option></select></label>
              </div>
              <label className="full-field">Ko vēlies sasniegt? *<textarea required minLength={10} maxLength={2000} rows={3} placeholder="Pastāsti par saviem mērķiem..." value={form.goal} onChange={(e) => update("goal", e.target.value)} /></label>
              <button className="submit-button" type="submit" disabled={sending}>{sending ? "Nosūta..." : "Nosūtīt pieteikumu"}<span>↗</span></button>
              {message && <p className={success ? "form-success" : "form-error"} role="status">{message}</p>}
              <p className="form-note">Pieteikumā norādītos datus izmantosim saziņai par Tavu pieprasījumu. Pirms publiskas palaišanas pievienosim pilnu privātuma informāciju.</p>
            </form>
          </div>
        </div>
      </section>
      <footer className="footer" id="kontakti"><a className="logo" href="#sakums">FORMA<span>.</span></a><span>DIGITAL GROWTH STUDIO</span><span>© {new Date().getFullYear()} FORMA · Demo projekts</span></footer>
    </main>
  );
}
