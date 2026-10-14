'use strict';
const steps = ['Guest view','Get a code','Call dibs','Create account','List an item','Share a collection','Review requests','Package','Handoff','Done'];
const hints = [
  'Start as a guest. You can browse shared items and call dibs before creating an account.',
  'Alex sends you a share code. Add it in Settings → Viewing to see the collections it covers.',
  'Select a sample item, review your selection, then call dibs. Your request waits on Alex.',
  'Create a new account from this guest profile to keep your requests and codes across devices.',
  'Now try listing your own item. Choose a collection and add its details.',
  'Your collection is private until you include it in a share code. Create a code for people you choose.',
  'Jordan uses your sample code and calls dibs. As the owner, you review the request.',
  'Select the approved item and package it for handoff.',
  'After giving Jordan the package, mark it delivered.',
  'You have followed both sides: guest → requester → account holder → listing owner → handoff.'
];
function freshState() { return {step:0,selected:false,review:false,account:false,listing:false,shared:false,approved:false,packSelected:false,packaged:false,delivered:false}; }
function transition(state, action) {
  const next={...state};
  if(action==='reset')return freshState();
  if(action==='begin'&&state.step===0)next.step=1;
  if(action==='code'&&state.step===1)next.step=2;
  if(action==='select'&&state.step===2&&!state.review)next.selected=!state.selected;
  if(action==='review'&&state.step===2&&state.selected)next.review=true;
  if(action==='back'&&state.step===2)next.review=false;
  if(action==='request'&&state.step===2&&state.selected&&state.review)next.step=3;
  if(action==='account'&&state.step===3){next.account=true;next.step=4;}
  if(action==='listing'&&state.step===4&&state.account){next.listing=true;next.step=5;}
  if(action==='share'&&state.step===5&&state.listing){next.shared=true;next.step=6;}
  if(action==='approve'&&state.step===6&&state.shared){next.approved=true;next.step=7;}
  if(action==='decline'&&state.step===6)next.step=5;
  if(action==='pack-select'&&state.step===7)next.packSelected=!state.packSelected;
  if(action==='package'&&state.step===7&&state.approved&&state.packSelected){next.packaged=true;next.step=8;}
  if(action==='deliver'&&state.step===8&&state.packaged){next.delivered=true;next.step=9;}
  return next;
}
if(typeof module!=='undefined')module.exports={freshState,transition};
if(typeof document!=='undefined'){
 let state=freshState();
 const screen=document.getElementById('screen');
 function button(action,label,extra=''){return `<button data-action="${action}" ${extra}>${label}</button>`;}
 function card(title,emoji,fact,actions=''){return `<article class="sample"><div class="item-row"><div class="emoji" aria-hidden="true">${emoji}</div><div class="item-copy"><h4>${title}</h4><p><span class="tag">${fact}</span></p></div></div>${actions}</article>`;}
 function render(){
  document.getElementById('hint').textContent=hints[state.step];
  document.getElementById('timeline').innerHTML=steps.map((label,index)=>`<li ${index===state.step?'aria-current="step"':''} class="${index<state.step?'complete':''}"><span>${index<state.step?'✓':index+1}</span>${label}</li>`).join('');
  const current=document.querySelector('[aria-current="step"]');current?.scrollIntoView({block:'nearest',inline:'center'});
  const active=state.step===1?'Settings':state.step===3||state.step===4?'My listings':state.step===5?'Settings':state.step>=6&&state.step<=8?'Requests':'Browse';
  const tabs=state.account?['Browse','My dibs','Requests','My listings']:['Browse','My dibs','My listings'];
  document.getElementById('tabs').innerHTML=tabs.map(tab=>`<span class="demo-tab ${active===tab?'active':''}">${tab}</span>`).join('');
  let html='';
  switch(state.step){
   case 0:html='<h3>Browse</h3><p>No shared items yet.</p><section class="sample"><h4>Welcome, guest</h4><p>Ask an owner for a share code to see their items. You can create an account later.</p>'+button('begin','Get a sample share code')+'</section>';break;
   case 1:html='<h3>Settings · Viewing</h3><p>Request as guest</p><section class="sample"><h4>A code from Alex</h4><p>“Here’s my share code. Have a look!”</p><code>ALEX-DEMO</code></section><label for="sample-code">Enter their share code</label><input id="sample-code" value="ALEX-DEMO" readonly aria-describedby="code-note"><p id="code-note" class="how-note">This fictional code is filled in for the walkthrough.</p>'+button('code','Add code');break;
   case 2:html=state.review?'<h3>Review your dibs</h3><p>Selected (1) · Not requested yet</p>'+card('Cozy sleep sack','👕','6–9 months')+'<p>Your request name: Sam</p>'+button('request','Call dibs')+button('back','Keep looking','class="outline"'):'<h3>Browse</h3><p>From Alex · 2 sample items</p>'+card('Cozy sleep sack','👕','6–9 months',button('select',state.selected?'Selected ✓':'Add to dibs',`aria-pressed="${state.selected}"`))+card('Stacking rings','🧸','6 months+')+button('review',`Review dibs (${state.selected?1:0})`,state.selected?'':'disabled');break;
   case 3:html='<h3>My dibs</h3>'+card('Cozy sleep sack','👕','Waiting on owner')+'<section class="sample"><h4>Keep this guest profile</h4><p>Create a new account to keep your request and saved code across devices. Signing into a separate existing account does not transfer them.</p><p>Sample account: <strong>Sam</strong><br><span class="how-note">sam@example.com · fictional details</span></p>'+button('account','Create sample account')+'</section>';break;
   case 4:html='<h3>My listings · Add item</h3><p>Your guest request and saved code are now linked to Sam’s sample account.</p><section class="sample"><dl><dt>Title</dt><dd>Soft toy bear</dd><dt>Category</dt><dd>Toys</dd><dt>Age</dt><dd>6 months+</dd><dt>Collection</dt><dd>General</dd></dl><p class="how-note">Details are filled in for this example. In the app, you enter your own and can add photos.</p>'+button('listing','Save sample item')+'</section>';break;
   case 5:html='<h3>Settings · Sharing</h3>'+card('Soft toy bear','🧸','General · 1 available item')+'<section class="sample"><h4>Share codes</h4><p>Create a code covering General, then give it to someone you choose.</p>'+button('share','Create and share sample code')+'</section>';break;
   case 6:html='<h3>Requests to review</h3><p>You shared <code>SAM-DEMO</code> with Jordan.</p><section class="sample"><h4>Jordan</h4><p>1 item</p>'+card('Soft toy bear','🧸','6 months+')+button('approve','Approve')+button('decline','Decline','class="outline"')+'</section><p class="how-note">Jordan’s request is simulated here. In the app, they add your code and call dibs themselves.</p>';break;
   case 7:html='<h3>Package up items</h3><p>Jordan · 1 approved item</p>'+card('Soft toy bear','🧸','6 months+',button('pack-select',state.packSelected?'Selected ✓':'Select for package',`aria-pressed="${state.packSelected}"`))+button('package','Package item',state.packSelected?'':'disabled');break;
   case 8:html='<h3>Ready for handoff</h3><section class="sample"><h4>Package for Jordan</h4><p>Soft toy bear · 1 item</p><p>Give Jordan the package, then record the handoff.</p>'+button('deliver','Mark delivered')+'</section>';break;
   case 9:html='<h3>Handoff complete</h3><section class="sample"><h4>Delivered to Jordan</h4><p>Your toy bear leaves available items. Jordan sees it in Received.</p></section><section class="sample"><h4>Your earlier dibs</h4><p>The sleep sack still waits on Alex. Your new account keeps that request and Alex’s code.</p></section>'+button('reset','Try the walkthrough again');break;
  }
  screen.innerHTML=html;
 }
 document.addEventListener('click',event=>{
  const target=event.target.closest('button[data-action]');if(!target)return;
  const action=target.dataset.action;state=transition(state,action);render();
  const first=screen.querySelector('h3');first.setAttribute('tabindex','-1');first.focus({preventScroll:true});
  const messages={code:'Sample code added.',request:'Sample dibs sent.',account:'Sample account created. Guest data kept.',listing:'Sample item saved.',share:'Sample code shared with Jordan.',approve:'Sample request approved.',decline:'Sample request declined. Share the code again to simulate another request.',package:'Sample item packaged.',deliver:'Sample delivery recorded.',reset:'Walkthrough reset.'};
  document.getElementById('feedback').textContent=messages[action]||'';
 });
 render();
}
