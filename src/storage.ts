import { blankWorkspace, type Workspace } from './model';

const DB='writing-studio-v3-preview';
function openDB():Promise<IDBDatabase>{
  return new Promise((resolve,reject)=>{
    const r=indexedDB.open(DB,1);
    r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains('data'))r.result.createObjectStore('data')};
    r.onsuccess=()=>resolve(r.result); r.onerror=()=>reject(r.error);
  });
}
export async function loadWorkspace():Promise<{workspace:Workspace;revision:number;migrated:boolean}>{
  const db=await openDB();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction('data','readonly'); const r=tx.objectStore('data').get('workspace');
    r.onsuccess=()=>resolve({workspace:(r.result?.workspace as Workspace)||blankWorkspace(),revision:r.result?.revision||0,migrated:false});
    r.onerror=()=>reject(r.error); tx.oncomplete=()=>db.close();
  });
}
export async function saveWorkspace(workspace:Workspace,expected:number):Promise<number>{
  const db=await openDB();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction('data','readwrite'); const store=tx.objectStore('data'); const r=store.get('workspace');
    let conflict=false;
    r.onsuccess=()=>{const current=r.result?.revision||0;if(current!==expected){conflict=true;tx.abort();return;}store.put({workspace,revision:expected+1},'workspace')};
    tx.oncomplete=()=>{db.close();resolve(expected+1)};
    tx.onabort=tx.onerror=()=>{db.close();reject(new Error(conflict?'다른 탭에서 저장되었습니다. 새로고침해 주세요.':'브라우저에 저장하지 못했습니다.'))};
  });
}
