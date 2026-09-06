export const id = () => crypto.randomUUID();
export const now = () => new Date().toISOString();

export type Kind = '권' | '장' | '회차' | '장면';
export interface Segment {
  id:string; parentId:string; kind:Kind; title:string; status:string;
  original:string; expanded:string; final:string;
  people:string; place:string; foreshadows:string; emotion:string; goal:string; before:string; after:string; notes:string;
  candidates:any[]; checked:number[]; revisions:any[]; review:Record<string,boolean>;
}
export interface Project {
  id:string; name:string; updatedAt:string; criteria:Record<string,string>; cards:any[]; rules:any[];
  banned:string; caution:string; repeat:string; threshold:number; segments:Segment[]; selectedId:string;
  sourceMode:'original'|'expanded'|'final'; imports:{id:string;title:string;text:string;date:string}[];
  importDraft:{title:string;text:string;parentId:string;kind:Kind;mode:'whole'|'heading'|'separator'};
  contextQuery:string; contextSegmentId:string; selectedCards:string[]; referenceIds:string[]; promptKind:string;
}
export interface Workspace { schemaVersion:2; projects:Project[]; activeId:string }

export const blankSegment=(title='새 원고',kind:Kind='장면',parentId=''):Segment=>({
  id:id(),parentId,kind,title,status:'초고',original:'',expanded:'',final:'',people:'',place:'',foreshadows:'',emotion:'',goal:'',before:'',after:'',notes:'',candidates:[],checked:[],revisions:[],review:{}
});

export const blankProject=(name:string):Project=>({
  id:id(),name:name.trim(),updatedAt:now(),criteria:{},cards:[],rules:[],banned:'',caution:'',repeat:'',threshold:3,segments:[],selectedId:'',sourceMode:'original',imports:[],
  importDraft:{title:'',text:'',parentId:'',kind:'회차',mode:'whole'},contextQuery:'',contextSegmentId:'',selectedCards:[],referenceIds:[],promptKind:'장면 완성도 검토'
});
export const blankWorkspace=():Workspace=>({schemaVersion:2,projects:[],activeId:''});

export function pathOf(p:Project,segment:Segment):string{
  const names=[segment.title]; let parent=segment.parentId; const seen=new Set([segment.id]);
  while(parent&&!seen.has(parent)){seen.add(parent);const s=p.segments.find(x=>x.id===parent);if(!s)break;names.unshift(s.title);parent=s.parentId}
  return names.join(' / ');
}
export function orderedSegments(p:Project,parentId=''):Segment[]{
  return p.segments.filter(s=>s.parentId===parentId).flatMap(s=>[s,...orderedSegments(p,s.id)]);
}
export function splitText(text:string,title:string,mode:Project['importDraft']['mode']):{title:string;text:string}[]{
  if(!text.trim())return [];
  if(mode==='whole')return [{title:title.trim()||'새 원고',text}];
  const cuts:{start:number;title:string}[]=[];
  for(const m of text.matchAll(/[^\r\n]*(?:\r\n|\r|\n|$)/g)){
    const line=m[0].trim();
    if(/^(?:#{1,4}\s+\S.*|(?:제\s*)?\d+\s*[권장화](?:\s.*|[.:：].*|$)|(?:프롤로그|에필로그|외전)(?:\s.*|[.:：].*|$))$/.test(line))cuts.push({start:m.index!,title:line.replace(/^#+\s+/,'')});
  }
  if(!cuts.length)return [{title:title.trim()||'새 원고',text}];
  if(cuts[0].start>0)cuts.unshift({start:0,title:(title||'원고')+' · 시작 부분'});
  return cuts.map((c,i)=>({title:c.title,text:text.slice(c.start,cuts[i+1]?.start??text.length)}));
}
