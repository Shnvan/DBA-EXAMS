/* Reading-only module reviewer. Structured content never restores saved HTML. */
const makeReviewerState=()=>({moduleId:REVIEWER_MODULES[0].id,lessonId:REVIEWER_MODULES[0].lessons[0].id,anchorId:null,offset:0});
let reviewerState=makeReviewerState(),reviewerQuery='',reviewerPositioning=false;
const reviewerLessons=()=>REVIEWER_MODULES.flatMap(module=>module.lessons.map(lesson=>({module,lesson})));
const reviewerTopics=()=>reviewerLessons().flatMap(({module,lesson})=>lesson.topics.map(topic=>({module,lesson,topic})));
function validReviewerState(state){
 if(!state||typeof state!=='object'||Array.isArray(state))return false;
 const module=REVIEWER_MODULES.find(m=>m.id===state.moduleId),lesson=module?.lessons.find(l=>l.id===state.lessonId);
 return !!lesson&&(state.anchorId===null||lesson.topics.some(t=>t.id===state.anchorId))&&Number.isFinite(state.offset)&&state.offset>=0&&state.offset<=100000;
}
function normalizeReviewerState(state){return validReviewerState(state)?{moduleId:state.moduleId,lessonId:state.lessonId,anchorId:state.anchorId,offset:state.offset}:makeReviewerState()}
function reviewerSelection(){const module=REVIEWER_MODULES.find(m=>m.id===reviewerState.moduleId);return{module,lesson:module.lessons.find(l=>l.id===reviewerState.lessonId)}}
const reviewerNormalize=value=>String(value).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
function reviewerSearchMatches(query){
 const words=reviewerNormalize(query).split(/\s+/).filter(Boolean);if(!words.length)return[];
 return reviewerTopics().filter(({module,lesson,topic})=>{
  const haystack=reviewerNormalize([module.title,lesson.title,topic.title,...(topic.aliases||[]),topic.definition,...topic.bullets,topic.example?.text||'',...(topic.corrections||[]).map(n=>n.text),...(topic.comparison?.rows||[]).flat()].join(' '));
  return words.every(word=>haystack.includes(word));
 });
}
function reviewerSafeLink(url){try{const parsed=new URL(url);return parsed.protocol==='https:'?parsed.href:null}catch(e){return null}}
function reviewerTopicHtml(topic){
 const example=topic.example?'<div class="reviewer-example"><p class="mu sm">'+(topic.example.kind==='client'?'MySQL client example (constructed; inside the mysql client)':topic.example.kind==='terminal'?'Terminal example (constructed; outside the SQL editor)':topic.example.kind==='column'?'Column definition (constructed; inside CREATE TABLE)':topic.example.kind==='sql'?'SQL example (constructed)':'Example (constructed)')+'</p>'+(topic.example.kind==='text'?'<p>'+h(topic.example.text)+'</p>':'<pre><code>'+h(topic.example.text)+'</code></pre>')+'</div>':'';
 const comparison=topic.comparison?'<div class="sc reviewer-comparison" tabindex="0" role="region" aria-label="'+h(topic.title)+' comparison"><table><thead><tr>'+topic.comparison.columns.map(c=>'<th scope="col">'+h(c)+'</th>').join('')+'</tr></thead><tbody>'+topic.comparison.rows.map(row=>'<tr>'+row.map(c=>'<td>'+h(c)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>':'';
 const corrections=(topic.corrections||[]).map(note=>{const url=reviewerSafeLink(note.url);return'<aside class="reviewer-correction"><p><strong>PDF correction:</strong> '+h(note.text)+'</p>'+(url?'<a href="'+h(url)+'" target="_blank" rel="noopener noreferrer">'+h(note.label||'Official documentation')+' <span class="sr-only">(opens in a new tab)</span></a>':'')+'</aside>'}).join('');
 return'<article class="reviewer-topic" id="reviewer-topic-'+h(topic.id)+'" data-topic-id="'+h(topic.id)+'" aria-labelledby="reviewer-title-'+h(topic.id)+'"><h4 id="reviewer-title-'+h(topic.id)+'" tabindex="-1">'+h(topic.title)+'</h4><p class="reviewer-definition">'+h(topic.definition)+'</p><ul>'+topic.bullets.map(point=>'<li>'+h(point)+'</li>').join('')+'</ul>'+example+comparison+corrections+'<p class="mu sm reviewer-reference">PDF '+(topic.pages.length===1?'page ':'pages ')+topic.pages.join(', ')+'</p></article>';
}
function reviewer(){
 const host=$('#reviewer');if(!host)return;
 reviewerState=normalizeReviewerState(reviewerState);const {module,lesson}=reviewerSelection(),list=reviewerLessons(),position=list.findIndex(item=>item.lesson.id===lesson.id);
 host.innerHTML='<h2 id="reviewer-heading" tabindex="-1">Reviewer</h2><p class="mu">Short definitions and the main behavior of each topic. Choose any lesson; examples and corrections are shown as study notes.</p><div class="reviewer-search"><label for="reviewer-search">Search all modules</label><div class="reviewer-search-controls"><input type="search" id="reviewer-search" value="'+h(reviewerQuery)+'" autocomplete="off" placeholder="Try primary key, CHAR, or access control" oninput="reviewerSearch(this.value)"><button id="reviewer-clear-search" class="btn l" onclick="clearReviewerSearch()"'+(!reviewerQuery?' disabled':'')+'>Clear search</button></div></div><nav id="reviewer-module-nav" class="reviewer-module-nav" aria-label="Reviewer modules">'+REVIEWER_MODULES.map(m=>'<button class="btn l'+(m.id===module.id?' on':'')+'" aria-pressed="'+(m.id===module.id)+'" onclick="openReviewerModule(\''+h(m.id)+'\')">Module '+m.number+'</button>').join('')+'</nav><p class="reviewer-module-name mu">'+h(module.title)+'</p><div id="reviewer-search-results" aria-live="polite" hidden></div><div class="reviewer-layout" id="reviewer-reading"><nav id="reviewer-lesson-list" aria-label="Lessons in Module '+module.number+'"><p class="mu sm">Lessons</p>'+module.lessons.map((l,i)=>'<button class="btn l'+(l.id===lesson.id?' on':'')+'"'+(l.id===lesson.id?' aria-current="page"':'')+' onclick="openReviewerLesson(\''+h(l.id)+'\')"><span class="mu sm">Lesson '+(i+1)+'</span><span>'+h(l.title)+'</span></button>').join('')+'</nav><div id="reviewer-content"><header class="reviewer-lesson-heading"><p class="mu sm">Module '+module.number+' · Lesson '+(module.lessons.indexOf(lesson)+1)+'</p><h3 id="reviewer-lesson-heading" tabindex="-1">'+h(lesson.title)+'</h3><nav class="reviewer-topic-contents" aria-label="Topics in this lesson">'+lesson.topics.map(t=>'<button onclick="jumpReviewerTopic(\''+h(t.id)+'\')">'+h(t.title)+'</button>').join('')+'</nav></header>'+lesson.topics.map(reviewerTopicHtml).join('')+'<div class="reviewer-lesson-navigation"><button id="reviewer-prev" class="btn l" onclick="moveReviewerLesson(-1)"'+(position===0?' disabled':'')+'>Previous lesson</button><p class="mu sm">Lesson '+(position+1)+' of '+list.length+'</p><button id="reviewer-next" class="btn l" onclick="moveReviewerLesson(1)"'+(position===list.length-1?' disabled':'')+'>Next lesson</button></div></div></div>';
 renderReviewerSearch();
}
function renderReviewerSearch(){
 const results=$('#reviewer-search-results'),reading=$('#reviewer-reading');if(!results||!reading)return;
 const searching=!!reviewerQuery.trim();results.hidden=!searching;reading.hidden=searching;
 const clear=$('#reviewer-clear-search');if(clear)clear.disabled=!reviewerQuery;
 if(!searching){results.innerHTML='';return}
 const matches=reviewerSearchMatches(reviewerQuery);
 results.innerHTML='<p class="reviewer-search-summary">'+(matches.length?matches.length+' topic'+(matches.length===1?'':'s')+' found':'No topics found. Try a shorter term or clear the search.')+'</p>'+matches.map(({module,lesson,topic})=>'<button class="reviewer-search-result" onclick="openReviewerLesson(\''+h(lesson.id)+'\',\''+h(topic.id)+'\')"><span class="mu sm">Module '+module.number+' · '+h(lesson.title)+'</span><strong>'+h(topic.title)+'</strong><span>'+h(topic.definition)+'</span></button>').join('');
}
function reviewerSearch(value){if(!reviewerQuery.trim())rememberReviewer();reviewerQuery=String(value);renderReviewerSearch()}
function clearReviewerSearch(){reviewerQuery='';const input=$('#reviewer-search');if(input)input.value='';renderReviewerSearch();input?.focus({preventScroll:true});restoreReviewerPosition();saveProgressNow()}
function openReviewerModule(moduleId){const module=REVIEWER_MODULES.find(m=>m.id===moduleId);if(!module)return;openReviewerLesson(module.lessons[0].id)}
function openReviewerLesson(lessonId,topicId=null){
 const selected=reviewerLessons().find(item=>item.lesson.id===lessonId);if(!selected||topicId!==null&&!selected.lesson.topics.some(t=>t.id===topicId))return;
 reviewerQuery='';reviewerState={moduleId:selected.module.id,lessonId,anchorId:topicId,offset:0};reviewer();
 if(topicId)jumpReviewerTopic(topicId);else{$('#reviewer-lesson-heading')?.focus({preventScroll:true});$('#reviewer-lesson-heading')?.scrollIntoView({block:'start'});saveProgressNow()}
}
function moveReviewerLesson(direction){if(![-1,1].includes(direction))return;const list=reviewerLessons(),position=list.findIndex(item=>item.lesson.id===reviewerState.lessonId),target=list[position+direction];if(target)openReviewerLesson(target.lesson.id)}
function jumpReviewerTopic(topicId){
 if(!reviewerSelection().lesson.topics.some(t=>t.id===topicId))return;
 reviewerState.anchorId=topicId;reviewerState.offset=0;const heading=document.getElementById('reviewer-title-'+topicId);heading?.focus({preventScroll:true});document.getElementById('reviewer-topic-'+topicId)?.scrollIntoView({block:'start'});saveProgressNow();
}
function rememberReviewer(){
 if(currentView!=='reviewer'||reviewerPositioning||reviewerQuery.trim())return;
 const topics=[...document.querySelectorAll('#reviewer-content .reviewer-topic')];if(!topics.length)return;
 const passed=topics.filter(el=>el.getBoundingClientRect().top<=24),topic=passed.at(-1);
 if(!topic){reviewerState.anchorId=null;reviewerState.offset=0;return}
 reviewerState.anchorId=topic.dataset.topicId;reviewerState.offset=Math.max(0,Math.min(100000,-topic.getBoundingClientRect().top));
}
function restoreReviewerPosition(){
 if(currentView!=='reviewer'||reviewerQuery.trim())return;
 reviewerPositioning=true;const anchor=reviewerState.anchorId&&document.getElementById('reviewer-topic-'+reviewerState.anchorId);
 if(anchor)scrollTo(0,Math.max(0,window.scrollY+anchor.getBoundingClientRect().top+reviewerState.offset));else scrollTo(0,0);
 reviewerPositioning=false;
}
if(typeof window!=='undefined'&&window.addEventListener)window.addEventListener('scroll',()=>{if(typeof currentView!=='undefined'&&currentView==='reviewer'&&!reviewerQuery.trim()&&!reviewerPositioning)saveProgressSoon()},{passive:true});
