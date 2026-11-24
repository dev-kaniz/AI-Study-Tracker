(() => {
'use strict';
const $ = (s) => document.querySelector(s);
const output = $('#output'), input = $('#commandInput');
const storeKey = 'focus-os-state-v1';
const state = Object.assign({tasks:[],notes:[],xp:0,completed:0,theme:'matrix'}, JSON.parse(localStorage.getItem(storeKey)||'{}'));
let history=[], historyIndex=0, timerId=null, remaining=1500, timerMode='IDLE', audioCtx=null, soundNode=null, soundGain=null, soundKind='OFF', volume=.25, quiz=null;
const themes={matrix:{accent:'#36f2a5',bg:'#080d12'},cyberpunk:{accent:'#ff4bd8',bg:'#100817'},amber:{accent:'#ffc66d',bg:'#100d08'},obsidian:{accent:'#8eb8ff',bg:'#080b12'}};
function save(){localStorage.setItem(storeKey,JSON.stringify(state));$('#xp').textContent=state.xp+' XP';$('#doneCount').textContent=state.completed+' DONE'}
function line(text='',kind=''){const el=document.createElement('div');el.className='terminal-line '+kind;el.textContent=text;output.appendChild(el);output.scrollTop=output.scrollHeight;return el}
function commandEcho(cmd){line('focus@study:~$ '+cmd,'command')}
function clock(){ $('#clock').textContent=new Date().toLocaleTimeString([], {hour12:false}); }
setInterval(clock,1000);clock();save();
function setTheme(name){const t=themes[name];if(!t)return line('Unknown theme. Choose matrix, cyberpunk, amber, or obsidian.','error');document.documentElement.style.setProperty('--accent-color',t.accent);document.documentElement.style.setProperty('--bg-color',t.bg);state.theme=name;save();line('Theme switched to '+name+'.','success')}
setTheme(state.theme);
function renderTimer(){const m=Math.floor(remaining/60),s=remaining%60;$('#timer').textContent=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');$('#mode').textContent=timerMode}
function stopTimer(){if(timerId)clearInterval(timerId);timerId=null;timerMode='IDLE';renderTimer()}
function chime(){try{const c=new (window.AudioContext||window.webkitAudioContext)();[660,880,990].forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain();o.frequency.value=f;o.connect(g);g.connect(c.destination);g.gain.setValueAtTime(.0001,c.currentTime+i*.18);g.gain.exponentialRampToValueAtTime(.15,c.currentTime+i*.18+.03);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+i*.18+.35);o.start(c.currentTime+i*.18);o.stop(c.currentTime+i*.18+.36)});setTimeout(()=>c.close(),1300)}catch(e){line('Audio is unavailable in this browser.','error')}}
function startTimer(mins,mode){if(!Number.isFinite(mins)||mins<1||mins>240)return line('Set minutes from 1 to 240.','error');if(timerId)clearInterval(timerId);remaining=Math.round(mins*60);timerMode=mode.toUpperCase();renderTimer();timerId=setInterval(()=>{remaining--;renderTimer();if(remaining<=0){stopTimer();line(mode+' session complete. Great work! +25 XP','success');state.xp+=25;if(mode==='focus')state.completed++;save();chime()}},1000);line(mode+' timer started for '+mins+' minutes.','success')}
function ensureAudio(){const C=window.AudioContext||window.webkitAudioContext;if(!C)throw Error('Web Audio API is not supported');if(!audioCtx)audioCtx=new C();if(audioCtx.state==='suspended')audioCtx.resume();return audioCtx}
function stopSound(){if(soundNode){try{soundNode.stop()}catch{}soundNode.disconnect();soundNode=null}if(soundGain){soundGain.disconnect();soundGain=null}soundKind='OFF';$('#soundStatus').textContent=soundKind}
function sound(type){try{stopSound();if(type==='off'){line('Ambient audio off.','success');return}const c=ensureAudio(),gain=c.createGain();gain.gain.value=volume;gain.connect(c.destination);soundGain=gain;
 if(type==='brown'){const n= Math.floor(c.sampleRate*2),b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);let last=0;for(let i=0;i<n;i++){const white=Math.random()*2-1;last=(last+.02*white)/1.02;d[i]=last*3.5}const src=c.createBufferSource();src.buffer=b;src.loop=true;src.connect(gain);src.start();soundNode=src;soundKind='BROWN NOISE'}
 else if(type==='rain'){const n=c.sampleRate*2,b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*.28;const src=c.createBufferSource(),filter=c.createBiquadFilter();src.buffer=b;src.loop=true;filter.type='lowpass';filter.frequency.value=1200;src.connect(filter);filter.connect(gain);src.start();soundNode=src;soundKind='RAIN'}
 else if(type==='gamma'){const osc=c.createOscillator();osc.type='sine';osc.frequency.value=40;osc.connect(gain);osc.start();soundNode=osc;soundKind='40HZ GAMMA'}
 else return line('Use sound brown|rain|gamma|off.','error');
 $('#soundStatus').textContent=soundKind;line('Ambient sound: '+soundKind+'. Use vol 0-100 to adjust.','success')
 }catch(e){line(e.message,'error')}}
function showTasks(){if(!state.tasks.length)return line('No tasks yet. Add one with: add Read chapter 3');state.tasks.forEach(t=>line((t.done?'[x] ':'[ ] ')+t.id+'  '+t.text,t.done?'dim':''))}
function help(){line('CORE COMMANDS','success');[
'focus <mins> · break <mins> · pause · resume · stop',
'sound brown|rain|gamma|off · vol <0-100>',
'add <task> · tasks · done <id> · rm <id>',
'note <text> · notes · export',
'ask <question> · explain <topic> · quiz <topic> · summarize <text>',
'theme matrix|cyberpunk|amber|obsidian · clear · help'
].forEach(x=>line('  '+x))}
async function ai(command,prompt,render=true){if(!prompt.trim())return line('Please provide a prompt.','error');line('Connecting to study AI…','');$('#apiState').textContent='requesting';try{const r=await fetch('/api/study/ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({command,prompt})});if(!r.ok)throw Error('AI server returned HTTP '+r.status);const data=await r.json();if(render)line(data.response||'No response returned.','ai');$('#apiState').textContent='online';return data.response||''}catch(e){line('AI request failed: '+e.message+'. Start the Spring Boot backend and configure AI_API_KEY / AI_API_URL.','error');$('#apiState').textContent='offline'}}
async function run(raw){const cmd=raw.trim();if(!cmd)return;commandEcho(cmd);if(quiz){const n=Number(cmd);if(!Number.isInteger(n)||n<1||n>3){line('Answer with 1, 2, or 3.');return}const q=quiz.questions[quiz.index];if(n===q.answer){line('Correct! +10 XP','success');state.xp+=10}else line('Not quite. '+q.explanation,'error');quiz.index++;if(quiz.index>=quiz.questions.length){line('Quiz complete. Score: '+quiz.score+'/'+quiz.questions.length+'.');quiz=null}else{quiz.score+=n===q.answer?1:0;askQuizQuestion()}save();return}
const [head,...tail]=cmd.split(' '),arg=tail.join(' ').trim(),n=Number(arg);
switch(head.toLowerCase()){
case 'help':help();break;case 'clear':output.innerHTML='';break;
case 'focus':case 'break':startTimer(n,head);break;
case 'pause':if(timerId){clearInterval(timerId);timerId=null;timerMode='PAUSED';renderTimer();line('Timer paused.')}else line('No active timer.','error');break;
case 'resume':if(!timerId&&timerMode==='PAUSED'){timerMode='FOCUS';renderTimer();timerId=setInterval(()=>{remaining--;renderTimer();if(remaining<=0){stopTimer();line('Session complete! +25 XP','success');state.xp+=25;state.completed++;save();chime()}},1000);line('Timer resumed.','success')}else line('No paused timer.','error');break;
case 'stop':stopTimer();line('Timer stopped.');break;
case 'sound':sound(arg.toLowerCase());break;
case 'vol':if(!Number.isFinite(n)||n<0||n>100)line('Volume must be 0-100.','error');else{volume=n/100;if(soundGain)soundGain.gain.setTargetAtTime(volume,audioCtx.currentTime,.05);line('Volume set to '+n+'%.','success')}break;
case 'theme':setTheme(arg.toLowerCase());break;
case 'add':if(!arg)line('Usage: add <task>','error');else{const id=state.tasks.reduce((m,t)=>Math.max(m,t.id),0)+1;state.tasks.push({id,text:arg,done:false});save();line('Task #'+id+' added.','success')}break;
case 'tasks':showTasks();break;
case 'done':case 'rm':{const id=Number(arg),idx=state.tasks.findIndex(t=>t.id===id);if(idx<0)line('Task not found.','error');else if(head==='done'){if(!state.tasks[idx].done){state.tasks[idx].done=true;state.xp+=15;state.completed++;save()}line('Task #'+id+' completed. +15 XP','success')}else{state.tasks.splice(idx,1);save();line('Task #'+id+' removed.')}break}
case 'note':if(!arg)line('Usage: note <text>','error');else{state.notes.push({text:arg,at:new Date().toISOString()});save();line('Note saved.','success')}break;
case 'notes':state.notes.length?state.notes.forEach((x,i)=>line((i+1)+'. '+x.text)):line('No notes saved.');break;
case 'export':{const md='# FOCUS_OS Study Report\n\nGenerated: '+new Date().toLocaleString()+'\n\n## Progress\n- XP: '+state.xp+'\n- Completed tasks: '+state.completed+'\n\n## Tasks\n'+(state.tasks.map(t=>'- ['+(t.done?'x':' ')+'] '+t.text).join('\n')||'- None')+'\n\n## Notes\n'+(state.notes.map(x=>'- '+x.text).join('\n')||'- None');const a=document.createElement('a'),url=URL.createObjectURL(new Blob([md],{type:'text/markdown'}));a.href=url;a.download='focus-os-study-report.md';a.click();URL.revokeObjectURL(url);line('Study report exported.','success');break}
case 'ask':case 'explain':case 'summarize':await ai(head,arg);break;
case 'quiz':{const raw=await ai('quiz',arg,false);if(raw){try{const parsed=JSON.parse(raw.replace(/^\s*```(?:json)?/i,'').replace(/```\s*$/,'').trim());if(!Array.isArray(parsed.questions)||parsed.questions.length!==3)throw Error('Expected three questions');quiz={questions:parsed.questions,index:0,score:0};line('QUIZ MODE — answer each question with 1, 2, or 3.','success');askQuizQuestion()}catch(e){line('Could not parse quiz JSON. AI response: '+raw,'error')}}break}
default:line('Command not found: '+head+'. Type help.','error')
}}
function askQuizQuestion(){const q=quiz.questions[quiz.index];line('Q'+(quiz.index+1)+': '+q.question,'ai');q.options.forEach((x,i)=>line((i+1)+') '+x,'quiz-option'))}
$('#commandForm').addEventListener('submit',e=>{e.preventDefault();const v=input.value;input.value='';if(v.trim()){history.push(v);historyIndex=history.length;run(v)}});
input.addEventListener('keydown',e=>{if(e.key==='ArrowUp'){e.preventDefault();historyIndex=Math.max(0,historyIndex-1);input.value=history[historyIndex]||''}else if(e.key==='ArrowDown'){e.preventDefault();historyIndex=Math.min(history.length,historyIndex+1);input.value=history[historyIndex]||''}else if(e.key==='Tab'){e.preventDefault();const options=['help','focus','break','pause','resume','stop','sound','vol','theme','add','tasks','done','rm','note','notes','export','ask','explain','quiz','summarize','clear'];const matches=options.filter(x=>x.startsWith(input.value.toLowerCase()));if(matches.length===1)input.value=matches[0]+' ' }});
$('#fullscreenBtn').addEventListener('click',async()=>{try{if(!document.fullscreenElement)await document.documentElement.requestFullscreen();else await document.exitFullscreen()}catch(e){line('Fullscreen request was blocked by the browser.','error')}});
document.addEventListener('fullscreenchange',()=>{$('#fullscreenBtn').innerHTML=document.fullscreenElement?'<i class="bi bi-fullscreen-exit"></i><span class="d-none d-sm-inline ms-1">Exit</span>':'<i class="bi bi-fullscreen"></i><span class="d-none d-sm-inline ms-1">Fullscreen</span>'});
})();