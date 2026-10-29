import { test } from 'node:test';
import assert from 'node:assert/strict';
import { guestDisplayName } from '../client/guest-entry.ts';

test('returns existing guest name instead of forcing another registration', () => {
  const store = new Map<string,string>([['openrp-name','OspiteABC1234']]);
  const cache = { getItem: (key:string) => store.get(key) ?? null, setItem: (key:string,value:string)=>{store.set(key,value)} };
  assert.equal(guestDisplayName(cache, () => 'different'), 'OspiteABC1234');
});

test('generates and stores a safe guest name on first visit', () => {
  const store = new Map<string,string>();
  const cache = { getItem: (key:string) => store.get(key) ?? null, setItem: (key:string,value:string)=>{store.set(key,value)} };
  assert.equal(guestDisplayName(cache, () => 'ab3-c2ef9'), 'OspiteAB3C2EF');
  assert.equal(guestDisplayName(cache, () => 'another'), 'OspiteAB3C2EF');
});

test('guest entry still works if browser storage is denied', () => {
  const denied = { getItem: (_key:string):string|null => { throw Error('denied') }, setItem:(_key:string,_value:string) => { throw Error('denied') } };
  assert.equal(guestDisplayName(denied, ()=> '92cd3a1'), 'Ospite92CD3A1');
});

test('never inherits an HTML-like name as a guest display name', () => {
  const store = new Map<string,string>([['openrp-name','<script>']]);
  const cache = { getItem: (key:string) => store.get(key) ?? null, setItem: (key:string,value:string)=>{store.set(key,value)} };
  assert.equal(guestDisplayName(cache, ()=> '998877a'), 'Ospite998877A');
});
