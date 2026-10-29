import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone as cloneSkeleton } from 'three/addons/utils/SkeletonUtils.js';
import type { Avatar } from './entities.ts';
import type { Player } from '../shared/types.ts';

/**
 * Licensed CC0 Quaternius Ultimate Modular Men/Women.
 * GLTF assets: https://github.com/agentkaerf/FreeModels
 * Each original character has 24 authored clips (Idle, Walk, Run, Interact, etc.).
 * This module only handles rendering. Multiplayer identity and object ownership
 * remain entirely validated by the SitoLume server.
 */
type Rig = { scene: THREE.Group; clips: THREE.AnimationClip[] };
type Instance = { model: THREE.Group; mixer: THREE.AnimationMixer; actions: Map<string, THREE.AnimationAction>; current: string; pocketCount: number; pickupTime: number; legs: THREE.Object3D[] };
const loader = new GLTFLoader();
const sourceFiles = {
  woman: '/avatars/quaternius/female-casual.gltf',
  man: '/avatars/quaternius/male-hoodie.gltf',
} as const;
const rigs = new Map<'woman'|'man', Promise<Rig>>();
const instances = new WeakMap<Avatar,Instance>();
function template(style: 'woman' | 'man'): Promise<Rig> {
  let result=rigs.get(style);
  if(!result){
    result=new Promise((resolve,reject)=>{
      loader.load(sourceFiles[style],gltf=>resolve({scene:gltf.scene,clips:gltf.animations}),undefined,reject);
    });
    rigs.set(style,result);
  }
  return result;
}
function visibleStyle(p:Player):'woman'|'man' {
  return p.avatarStyle==='woman'?'woman':'man';
}
export async function addProfessionalAvatar(avatar:Avatar,p:Player):Promise<void> {
  const style=visibleStyle(p);
  try {
    const {scene,clips}=await template(style);
    // The original procedural avatar serves as a fallback until the glTF loads.
    if(avatar.root.userData.disposed) return;
    const body=cloneSkeleton(scene) as THREE.Group;
    body.traverse(obj=>{
      if(obj instanceof THREE.Mesh){
        // Every instance owns its mesh resources: safe to dispose on disconnect.
        obj.geometry=obj.geometry.clone();
        obj.material=Array.isArray(obj.material)?obj.material.map(m=>m.clone()):obj.material.clone();
        // Outfit palette controls only clothing materials, never skin, hair or eyes.
        const palette={sage:'#719c7c',sand:'#c3a16e',rose:'#c37a8d'};
        const tint=palette[p.avatarOutfit??'sage'];
        for(const mat of Array.isArray(obj.material)?obj.material:[obj.material]){
          if(mat instanceof THREE.MeshStandardMaterial && (style==='woman'?mat.name==='Orange':mat.name==='Purple'))
            mat.color.set(tint);
        }
        obj.castShadow=true;
      }
    });
    const bounds=new THREE.Box3().setFromObject(body);
    const size=new THREE.Vector3();bounds.getSize(size);
    if(size.y<0.001)throw Error('Invalid character dimensions');
    const center=new THREE.Vector3();bounds.getCenter(center);
    const scale=1.78/size.y;
    const group=new THREE.Group();
    group.name='ProfessionalQuaterniusAvatar';
    body.scale.setScalar(scale);
    body.position.set(-center.x*scale,-bounds.min.y*scale,-center.z*scale);
    group.add(body);
    // Quaternius exports face +Z; this game walks toward -Z.
    group.rotation.y=Math.PI;
    avatar.root.add(group);
    const mixer=new THREE.AnimationMixer(body);
    const actions=new Map<string,THREE.AnimationAction>();
    for(const clip of clips){
      if(['Idle','Walk','Run','Interact','Wave'].includes(clip.name)){
        const action=mixer.clipAction(clip);
        action.enabled=true;
        action.setLoop(THREE.LoopRepeat,Infinity);
        actions.set(clip.name,action);
      }
    }
    if(!actions.has('Idle')||!actions.has('Walk')) throw Error('Missing original Quaternius clips');
    const idle=actions.get('Idle')!;
    idle.play();
    const legs = ['UpperLeg.L','UpperLeg.R','LowerLeg.L','LowerLeg.R'].map(name=>body.getObjectByName(name)).filter((item):item is THREE.Object3D=>!!item);
    instances.set(avatar,{model:group,mixer,actions,current:'Idle',pocketCount:p.pocket?.length??0,pickupTime:0,legs});
    avatar.body.visible=false; // hide old boxy body without changing movement physics
  }catch(e){
    console.warn('Animated human model unavailable; keeping original avatar',e);
  }
}
export function updateProfessionalAvatar(avatar:Avatar,p:Player,dt:number):void{
  const inst=instances.get(avatar);
  if(!inst)return;
  const speed=avatar.speed;
  const pocketCount=p.pocket?.length??0;
  if(pocketCount>inst.pocketCount)inst.pickupTime=0.8;
  inst.pocketCount=pocketCount;
  inst.pickupTime=Math.max(0,inst.pickupTime-dt);
  const animation=p.holding||inst.pickupTime>0?'Interact':speed>3.6?'Run':speed>0.32?'Walk':'Idle';
  const selected=inst.actions.has(animation)?animation:'Idle';
  if(selected!==inst.current){
    inst.actions.get(inst.current)?.fadeOut(0.2);
    const next=inst.actions.get(selected)!;
    next.reset().fadeIn(0.2).play();
    inst.current=selected;
  }
  // Crouch is a smooth bend at the knees/hips using the authored skeleton pose.
  inst.model.scale.y=THREE.MathUtils.damp(inst.model.scale.y,p.crouch?0.73:1,12,dt);
  inst.mixer.update(Math.min(dt,0.08));
  // Rotate the original rigged knees and hips after the animation mixer to
  // create a visible crouch without replacing the authored walking clips.
  const crouch=Number(p.crouch);
  for(let i=0;i<inst.legs.length;i++){
    const bone=inst.legs[i];
    bone.rotation.x += (i<2?-0.38:0.73)*crouch;
  }
  inst.model.visible=!p.deadUntil;
}
export function professionalAvatarStatus(avatar:Avatar|undefined):string {
  if(!avatar)return 'nessun-avatar';
  const instance=instances.get(avatar);
  return instance?`modello-3d:${instance.current}`:'avatar-predefinito';
}
export function clearProfessionalAvatar(avatar:Avatar):void{
  const inst=instances.get(avatar);
  if(inst){inst.mixer.stopAllAction();inst.mixer.uncacheRoot(inst.model.children[0]);instances.delete(avatar)}
  avatar.root.userData.disposed=true;
}
