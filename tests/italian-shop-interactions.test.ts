import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../server/game.ts';
import type {Player} from '../shared/types.ts';

function setup(){
 let time=100_000;
 const game=new Game({now:()=>time,salarySeconds:60});
 const owner=game.join('Proprietaria').player;
 Object.assign(owner,{x:0,y:0,z:0,yaw:0,pitch:0});
 const shelf=game.createEntity('shelf',owner.id,{x:0,y:1.15,z:-2.8});
 const act=(p:Player, action:string)=>{
  time+=110;
  game.handle(p.id,{type:'action',action});
 };
 return {game,owner,shelf,act};
}
test('player can grab, place and collect their own shelf in Italian shop flow',()=>{
 const {game,owner,shelf,act}=setup();
 act(owner,'grab-near');
 assert.equal(owner.holding,shelf.id,'the character should grab their own object');
 assert.equal(game.entities.get(shelf.id)?.heldBy,owner.id);
 act(owner,'place-near');
 assert.equal(owner.holding,null);
 assert.equal(game.entities.get(shelf.id)?.frozen,true);
 act(owner,'collect-near');
 assert.equal(game.entities.has(shelf.id),false);
 assert.equal(owner.pocket?.length,1);
 assert.equal(owner.pocket?.[0]?.kind,'shelf');
});
test('cannot grab another player owned object',()=>{
 const {game,owner,shelf,act}=setup();
 const visitor=game.join('Visitatore').player;
 Object.assign(visitor,{x:0,y:0,z:0,yaw:0,pitch:0});
 act(visitor,'grab-near');
 assert.equal(visitor.holding,null);
 assert.equal(shelf.heldBy,null);
 act(visitor,'collect-near');
 assert.equal(game.entities.has(shelf.id),true);
 assert.equal(visitor.pocket?.length,0);
});
