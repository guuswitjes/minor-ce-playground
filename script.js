function toggleMenu(event) {
  if (event) event.preventDefault();
  document.getElementById('sidebar').classList.toggle('open');
  document.querySelector('.sidebar-overlay').classList.toggle('open');
}

document.querySelector('.mobile-menu-btn')?.addEventListener('touchend', toggleMenu);
document.querySelector('.sidebar-overlay')?.addEventListener('touchend', toggleMenu);

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
