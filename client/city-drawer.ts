import { avatarPickerHtml, readLook } from './avatar-picker.ts';

export function installCityDrawer(onOpenMenu:(menu:string)=>void,onItemAction:(action:string)=>void){
  const panel=document.createElement('aside');
  panel.id='city-drawer';
  panel.hidden=true;
  panel.innerHTML=`<button id="city-drawer-toggle" aria-expanded="false" aria-controls="city-drawer-content" type="button">☰ GUIDA · NEGOZI · AVATAR <span>⌃</span></button>
    <div id="city-drawer-content" hidden>
      <nav class="city-drawer-tabs" aria-label="Sezioni della città">
        <button data-city-tab="guida" aria-pressed="true">⌨ Guida</button>
        <button data-city-tab="negozi" aria-pressed="false">▣ Negozi</button>
        <button data-city-tab="avatar" aria-pressed="false">◈ Avatar</button>
      </nav>
      <section data-city-section="guida">
        <h3>Come si gioca</h3>
        <div class="sito-help-grid"><span><kbd>W A S D</kbd> Cammina</span><span><kbd>FRECCE</kbd> Muovi / gira</span><span><kbd>B</kbd> Telecamera</span><span><kbd>X</kbd> Abbassati / alzati</span><span><kbd>SHIFT</kbd> Corri</span><span><kbd>SPAZIO</kbd> Salta</span><span><kbd>C</kbd> Porta / proprietà</span><span><kbd>E</kbd> Apri / utilizza</span><span><kbd>Q</kbd> Arreda</span><span><kbd>F4</kbd> Catalogo / lavori</span><span><kbd>Y</kbd> Chat</span><span><kbd>G</kbd> Afferra / posa</span><span><kbd>P</kbd> Raccogli nello zaino</span></div>
        <details open><summary>Come acquistare un negozio?</summary>
          <ol><li>Esplora la città e raggiungi un locale con una porta privata.</li><li>Se è libero, avvicinati, guardalo e premi <kbd>C</kbd>.</li><li>Nel menu scegli <b>Acquista proprietà</b> se hai sufficienti dollari di gioco.</li><li>Ora puoi rinominare la proprietà, gestire porta e chiavi.</li></ol>
          <p>Le proprietà costano dollari di gioco, <b>non euro</b> e non Lume Coin. L'accesso ai negozi acquistati in denaro reale non è ancora attivo.</p>
        </details>
        <details><summary>Come metto arredi e materiali?</summary>
          <ol><li>Premi <kbd>Q</kbd> per creare gratuitamente tavoli, scaffali, casse e altri oggetti.</li><li>Avvicinati a un tuo oggetto davanti al personaggio. Se è basso premi <b>X</b> per abbassarti; poi premi <b>G</b> o il pulsante <b>Afferra</b> qui sotto. Muoviti per trasportarlo; premi di nuovo <b>G</b> o <b>Posa e fissa</b> per sistemarlo. Per metterlo nello zaino, guarda un tuo oggetto non fissato e premi <b>Raccogli nello zaino</b>.</li><li>Premi <kbd>F4</kbd> → <b>Shop</b> per acquistare gli articoli virtuali consentiti al tuo ruolo.</li><li>Per vendere, usa le attività già previste dal motore: il lavoro e gli articoli disponibili variano per ruolo.</li></ol>
          <p>Gli arredi e i prodotti sono simulati dal gioco. Per caricare prodotti veri di un'attività servono un catalogo e un sistema vendite separati, ancora in preparazione.</p>
        </details>
        <details><summary>Come funziona il negozio degli altri?</summary><p>Le proprietà acquistate da altri giocatori possono essere visitate se il proprietario lascia l'accesso aperto. Gli oggetti visibili e le transazioni sono soltanto <b>nel gioco</b>. Stripe e crediti premium non sono ancora collegati.</p></details>
        <div class="city-drawer-actions"><button data-item-action="grab-near">✋ Afferra</button><button data-item-action="place-near">▣ Posa e fissa</button><button data-item-action="collect-near">↓ Raccogli nello zaino</button><button data-open-game-menu="pocket">Apri zaino</button></div><div class="city-drawer-actions"><button data-open-game-menu="shop">Apri catalogo</button><button data-open-game-menu="build">Apri arredi</button><button data-open-game-menu="help">Guida completa</button></div>
      </section>
      <section data-city-section="negozi" hidden>
        <h3>Vetrine e negozi</h3>
        <p>Le attività possono proporre prodotti e servizi. Questa è la prima directory; i negozi di altri utenti e gli acquisti con Stripe verranno abilitati solo dopo la verifica del sistema commerciale.</p>
        <a href="https://activefloow-prog.github.io/sitolume-studio/" target="_blank" rel="noopener noreferrer">▣ SitoLume Studio · Siti e preventivi ↗</a>
        <a href="https://payhip.com/nicostudioai" target="_blank" rel="noopener noreferrer">◈ Nico Lab · Kit digitali ↗</a>
        <div class="city-drawer-actions"><button data-open-game-menu="shop">Acquista materiali virtuali</button><button data-open-game-menu="build">Arreda il tuo locale</button><button data-open-game-menu="pocket">Apri zaino</button></div>
        <p class="city-disclaimer">Dollari del gioco ≠ denaro reale. Non sono acquistabili né convertibili in euro.</p>
      </section>
      <section data-city-section="avatar" hidden>
        <h3>Il tuo personaggio</h3>
        ${avatarPickerHtml().replace('id="avatar-outfit"','id="avatar-outfit-drawer"')}
        <p>Le modifiche vengono salvate e condivise con gli altri giocatori attraverso il server.</p>
      </section>
    </div>`;
  document.body.append(panel);
  const toggle=panel.querySelector<HTMLButtonElement>('#city-drawer-toggle')!;
  const content=panel.querySelector<HTMLElement>('#city-drawer-content')!;
  const show=(open:boolean)=>{
    content.hidden=!open;
    toggle.setAttribute('aria-expanded',String(open));
    toggle.querySelector('span')!.textContent=open?'⌄':'⌃';
  };
  toggle.addEventListener('click',()=>show(content.hidden));
  panel.addEventListener('click',e=>{
    const target=e.target as HTMLElement;
    const tab=target.closest<HTMLButtonElement>('[data-city-tab]');
    if(tab){
      const id=tab.dataset.cityTab;
      panel.querySelectorAll<HTMLButtonElement>('[data-city-tab]').forEach(b=>b.setAttribute('aria-pressed',String(b===tab)));
      panel.querySelectorAll<HTMLElement>('[data-city-section]').forEach(sec=>sec.hidden=sec.dataset.citySection!==id);
    }
    const command=target.closest<HTMLButtonElement>('[data-item-action]');
    if(command?.dataset.itemAction){show(false);onItemAction(command.dataset.itemAction);return;}
    const menu=target.closest<HTMLButtonElement>('[data-open-game-menu]');
    if(menu?.dataset.openGameMenu){
      show(false);
      onOpenMenu(menu.dataset.openGameMenu);
    }
  });
  return {panel,show};
}
