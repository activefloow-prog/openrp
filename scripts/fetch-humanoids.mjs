// Download pinned CC0 source models when building from a fresh Git clone.
// Runtime assets are served by this project's own Cloudflare deployment.
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const upstream='db3df04d1e4714298a09510b26fb6de6645138a2';
const base=`https://raw.githubusercontent.com/agentkaerf/FreeModels/${upstream}/`;
const assets=[
  {name:'female-casual.gltf',path:'Ultimate Modular Women - April 2022/Individual Characters/glTF/Casual.gltf',sha256:'b0fe6e92219cd71808844a20a1a8b960fd1cf640a6546dc6362b5add6604e87c'},
  {name:'male-hoodie.gltf',path:'Ultimate Modular Men- Feb 2022/Individual Characters/glTF/Casual_Hoodie.gltf',sha256:'dd74886c26998a0fa888b4ce557a0932d7d97b0265dd4c763154d081b7a6cb98'}
];
const target=join(process.cwd(),'public','avatars','quaternius');
const hash=b=>createHash('sha256').update(b).digest('hex');
await mkdir(target,{recursive:true});
for(const model of assets){
  const file=join(target,model.name);
  let bytes;
  try{bytes=await readFile(file)}catch{}
  if(bytes&&hash(bytes)===model.sha256)continue;
  const url=base+model.path.split('/').map(encodeURIComponent).join('/');
  const response=await fetch(url,{signal:AbortSignal.timeout(45000)});
  if(!response.ok)throw Error('Download failed for '+model.name+' ('+response.status+')');
  bytes=Buffer.from(await response.arrayBuffer());
  if(hash(bytes)!==model.sha256)throw Error('SHA256 mismatch for '+model.name);
  await writeFile(file,bytes);
  console.log('Verified original CC0 Quaternius model: '+model.name);
}
