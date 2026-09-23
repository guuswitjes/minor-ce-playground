function toggleMenu(event) {
  if (event) event.preventDefault();
  document.getElementById('sidebar').classList.toggle('open');
  document.querySelector('.sidebar-overlay').classList.toggle('open');
}

document.querySelector('.mobile-menu-btn')?.addEventListener('touchend', toggleMenu);
document.querySelector('.sidebar-overlay')?.addEventListener('touchend', toggleMenu);

/* ------------------------------------------------------------------
   Het menu. Eén bron voor alle pagina's, want de zijbalk stond in
   zeven bestanden apart en liep daardoor uiteen.

   Per sessie: de pagina zelf, de secties erop en het materiaal dat
   erbij hoort. De sessie waar je op staat klapt open, de rest staat
   dicht en klapt open als je op het pijltje klikt. Nieuwe sessie
   erbij is één blok in SESSIES.
   ------------------------------------------------------------------ */
var SESSIES = [
  {
    id: 'sessie-1',
    href: 'sessie-1.html',
    label: '1 · Deep research',
    datum: 'do 10 september',
    secties: [
      { href: '#belofte',    label: 'Wat je om 16:15 hebt' },
      { href: '#opdracht-1', label: 'Opdracht 1, welke meenemen' },
      { href: '#opdracht-2', label: 'Opdracht 2, klopt dit wel' },
      { href: '#opdracht-3', label: 'Opdracht 3, je opdrachtgever' },
      { href: '#afronden',   label: 'Afronden' }
    ],
    materiaal: [
      { id: 'uitkomst-1', href: 'uitkomst-1.html', label: 'Uitkomst 1' },
      { id: 'uitkomst-2', href: 'uitkomst-2.html', label: 'Uitkomst 2' },
      { id: 'uitkomst-3', href: 'uitkomst-3.html', label: 'Uitkomst 3' },
      { id: 'uitkomst-4', href: 'uitkomst-4.html', label: 'Uitkomst 4' }
    ]
  },
  {
    id: 'sessie-2',
    href: 'sessie-2.html',
    label: '2 · Van oplossing naar probleem',
    datum: 'do 24 september',
    secties: [
      { href: '#belofte',    label: 'Wat je om 16:15 hebt' },
      { href: '#werkvorm-1', label: 'Werkvorm 1, met de hand' },
      { href: '#keten',      label: 'Werkvorm 2, de keten' },
      { href: '#sporen',     label: 'Kies je spoor' },
      { href: '#startlijst', label: 'Startlijst met ideeën' }
    ],
    materiaal: []
  }
];

(function () {
  var nav = document.querySelector('.sidebar-nav');
  if (!nav) return;

  /* Welke pagina is dit. Staat op de body, met de bestandsnaam als
     terugval zodat een nieuwe pagina ook zonder attribuut klopt. */
  var pagina = document.body.getAttribute('data-pagina') ||
    (location.pathname.split('/').pop() || 'index').replace('.html', '');

  /* De sessie waar deze pagina bij hoort: de sessie zelf, of de
     sessie waar dit materiaal onder hangt. */
  var open = null;
  SESSIES.forEach(function (s) {
    if (s.id === pagina) open = s;
    if (s.materiaal.some(function (m) { return m.id === pagina; })) open = s;
  });

  function el(tag, klasse, tekst) {
    var e = document.createElement(tag);
    if (klasse) e.className = klasse;
    if (tekst) e.textContent = tekst;
    return e;
  }

  function sectie(titel) {
    var s = el('div', 'nav-section');
    s.appendChild(el('div', 'nav-section-title', titel));
    return s;
  }

  function link(href, label, actief, klasse) {
    var a = el('a', klasse || 'nav-link', label);
    a.href = href;
    if (actief) a.classList.add('active');
    return a;
  }

  var nieuw = document.createDocumentFragment();

  /* Start */
  var start = sectie('Start');
  start.appendChild(link('index.html', 'Home', pagina === 'index'));
  nieuw.appendChild(start);

  /* Sessies, elk met zijn eigen uitklap */
  var sessies = sectie('Sessies');
  SESSIES.forEach(function (s) {
    var hier = s === open;
    var groep = el('div', 'nav-groep');
    if (hier) groep.classList.add('open');

    var kop = el('div', 'nav-groep-kop');
    kop.appendChild(link(s.href, s.label, s.id === pagina));

    var knop = el('button', 'nav-klap');
    knop.type = 'button';
    knop.setAttribute('aria-expanded', hier ? 'true' : 'false');
    knop.setAttribute('aria-controls', 'nav-sub-' + s.id);
    knop.setAttribute('aria-label', 'Onderdelen van sessie ' + s.label);
    knop.innerHTML = '<span class="nav-klap-pijl" aria-hidden="true"></span>';
    kop.appendChild(knop);
    groep.appendChild(kop);

    var sub = el('div', 'nav-sub');
    sub.id = 'nav-sub-' + s.id;
    sub.hidden = !hier;

    s.secties.forEach(function (v) {
      /* Op de sessie zelf is het een anker, elders een link naar die
         pagina plus het anker. Zo werkt het menu overal hetzelfde. */
      var href = s.id === pagina ? v.href : s.href + v.href;
      sub.appendChild(link(href, v.label, false, 'nav-sublink'));
    });

    if (s.materiaal.length) {
      sub.appendChild(el('div', 'nav-sub-titel', 'Materiaal'));
      s.materiaal.forEach(function (m) {
        sub.appendChild(link(m.href, m.label, m.id === pagina, 'nav-sublink'));
      });
    }

    groep.appendChild(sub);

    knop.addEventListener('click', function () {
      var uit = groep.classList.toggle('open');
      knop.setAttribute('aria-expanded', uit ? 'true' : 'false');
      sub.hidden = !uit;
    });

    sessies.appendChild(groep);
  });
  nieuw.appendChild(sessies);

  /* Het bord */
  var bord = sectie('Het bord');
  var bordlink = link('https://ideeenbord-ce.web.app', 'Ideeënbord openen');
  bordlink.target = '_blank';
  bordlink.rel = 'noopener';
  bord.appendChild(bordlink);
  nieuw.appendChild(bord);

  nav.innerHTML = '';
  nav.appendChild(nieuw);

  /* Op mobiel schuift de zijbalk dicht zodra je iets kiest. */
  nav.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a) return;
    var zijbalk = document.getElementById('sidebar');
    if (zijbalk && zijbalk.classList.contains('open')) toggleMenu();
  });

  /* Meelopen met waar je staat: de sectie die bovenin beeld is,
     krijgt de markering. Alleen op de pagina van de sessie zelf. */
  if (open && open.id === pagina && 'IntersectionObserver' in window) {
    var sublinks = {};
    nav.querySelectorAll('.nav-sublink[href^="#"]').forEach(function (a) {
      sublinks[a.getAttribute('href').slice(1)] = a;
    });

    var zichtbaar = new Set();
    var kijker = new IntersectionObserver(function (items) {
      items.forEach(function (i) {
        if (i.isIntersecting) zichtbaar.add(i.target.id);
        else zichtbaar.delete(i.target.id);
      });
      var eerste = open.secties
        .map(function (v) { return v.href.slice(1); })
        .filter(function (id) { return zichtbaar.has(id); })[0];
      Object.keys(sublinks).forEach(function (id) {
        sublinks[id].classList.toggle('huidig', id === eerste);
      });
    }, { rootMargin: '-72px 0px -70% 0px' });

    Object.keys(sublinks).forEach(function (id) {
      var doel = document.getElementById(id);
      if (doel) kijker.observe(doel);
    });
  }
})();

/* ------------------------------------------------------------------
   Vanaf hier: sessie 2. Alles hangt aan een class of een data-attribuut
   dat alleen op sessie-2.html staat, dus sessie 1 verandert niet.
   ------------------------------------------------------------------ */

/* Kopieerknop op elk promptblok met class "kopieerbaar".
   De tekst komt uit het code-element, niet uit de pre, want de knop
   zit in de pre en zou anders meegekopieerd worden. */
function kopieerNaarKlembord(tekst) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(tekst);
  }
  /* Terugval voor browsers zonder clipboard-rechten. */
  return new Promise(function (klaar, mislukt) {
    var hulp = document.createElement('textarea');
    hulp.value = tekst;
    hulp.setAttribute('readonly', '');
    hulp.style.position = 'fixed';
    hulp.style.top = '-1000px';
    document.body.appendChild(hulp);
    hulp.select();
    var gelukt = false;
    try { gelukt = document.execCommand('copy'); } catch (e) { gelukt = false; }
    document.body.removeChild(hulp);
    gelukt ? klaar() : mislukt();
  });
}

document.querySelectorAll('pre.kopieerbaar').forEach(function (blok) {
  var code = blok.querySelector('code');
  if (!code) return;

  var knop = document.createElement('button');
  knop.type = 'button';
  knop.className = 'kopieer-knop';
  knop.textContent = 'Kopieer';

  knop.addEventListener('click', function () {
    kopieerNaarKlembord(code.textContent).then(function () {
      knop.textContent = 'Gekopieerd';
      knop.classList.add('gelukt');
      setTimeout(function () {
        knop.textContent = 'Kopieer';
        knop.classList.remove('gelukt');
      }, 1600);
    }).catch(function () {
      knop.textContent = 'Selecteer zelf';
      setTimeout(function () { knop.textContent = 'Kopieer'; }, 2400);
    });
  });

  blok.appendChild(knop);
});

/* Spoor A en spoor B achter twee tabs. Zonder JavaScript staat spoor A
   open en spoor B dicht, en dat is de stand waarin de meesten werken. */
(function () {
  var knoppen = document.querySelectorAll('.spoor-knoppen button[data-spoor]');
  if (!knoppen.length) return;

  function toon(spoor) {
    knoppen.forEach(function (k) {
      var actief = k.getAttribute('data-spoor') === spoor;
      k.setAttribute('aria-selected', actief ? 'true' : 'false');
      var paneel = document.getElementById(k.getAttribute('aria-controls'));
      if (paneel) paneel.hidden = !actief;
    });
  }

  knoppen.forEach(function (k) {
    k.addEventListener('click', function () {
      toon(k.getAttribute('data-spoor'));
    });
  });
})();

/* Klapbare blokken, voor de startlijst. */
document.querySelectorAll('.collapsible-header').forEach(function (kop) {
  function wissel() {
    var blok = kop.closest('.collapsible');
    if (!blok) return;
    var open = blok.classList.toggle('open');
    kop.setAttribute('aria-expanded', open ? 'true' : 'false');
    /* Het plusje draait naar een kruisje via de CSS, op .collapsible.open. */
  }

  kop.addEventListener('click', wissel);
  kop.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      wissel();
    }
  });
});
