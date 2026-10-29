import type { AvatarStyle, AvatarOutfit } from '../shared/types.ts';
import { isAvatarStyle, isAvatarOutfit } from '../shared/avatar.ts';

const STORAGE = 'sitolume-avatar-v1';
export interface Look { style: AvatarStyle; outfit: AvatarOutfit }
export function readLook(): Look {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE) || '{}');
    return {style:isAvatarStyle(saved.style)?saved.style:'free',outfit:isAvatarOutfit(saved.outfit)?saved.outfit:'sage'};
  } catch { return {style:'free',outfit:'sage'}; }
}
export function saveLook(look:Look) {
  try {localStorage.setItem(STORAGE,JSON.stringify(look))} catch {}
}
const styleNames:Record<AvatarStyle,string>={woman:'Donna',man:'Uomo',free:'Stile libero'};
const outfitNames:Record<AvatarOutfit,string>={sage:'Verde salvia',sand:'Sabbia',rose:'Rosa antico'};
export function avatarPickerHtml():string {
  const look=readLook();
  return `<div class="sito-avatar-picker" role="group" aria-label="Scegli il tuo avatar"><strong>IL TUO PERSONAGGIO</strong><p>Seleziona come vuoi apparire nella città. Puoi cambiare anche dopo.</p>
    <div class="sito-avatar-row">${(['woman','man','free'] as const).map(style=>`<button type="button" data-avatar-style="${style}" aria-pressed="${look.style===style}"><span class="avatar-symbol" aria-hidden="true">${style==='woman'?'♀':style==='man'?'♂':'✧'}</span>${styleNames[style]}</button>`).join('')}</div>
    <div class="sito-outfit"><label for="avatar-outfit">Colore abito</label><select id="avatar-outfit">${(['sage','sand','rose'] as const).map(outfit=>`<option value="${outfit}" ${look.outfit===outfit?'selected':''}>${outfitNames[outfit]}</option>`).join('')}</select></div>
    <small>Gli abiti dei ruoli professionali restano associati al ruolo.</small>
  </div>`;
}
export function installAvatarPicker(onChange:(look:Look)=>void) {
  const sync=(next:Look)=>{
    saveLook(next);
    document.querySelectorAll<HTMLButtonElement>('[data-avatar-style]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.avatarStyle===next.style)));
    document.querySelectorAll<HTMLSelectElement>('#avatar-outfit, #avatar-outfit-drawer').forEach(s=>{s.value=next.outfit});
    onChange(next);
  };
  document.addEventListener('click',e=>{
    const button=(e.target as HTMLElement).closest<HTMLButtonElement>('[data-avatar-style]');
    if(button && isAvatarStyle(button.dataset.avatarStyle))sync({...readLook(),style:button.dataset.avatarStyle});
  });
  document.addEventListener('change',e=>{
    const target=e.target;
    if(target instanceof HTMLSelectElement && (target.id==='avatar-outfit'||target.id==='avatar-outfit-drawer')&&isAvatarOutfit(target.value))sync({...readLook(),outfit:target.value});
  });
}
