const {test}=require('node:test');
const assert=require('node:assert/strict');
const handler=require('../api/contact');
function run(body, headers={}, method='POST') {
 const req={method,headers:{accept:'application/json',origin:'https://innoledge.com',...headers},body};
 const res={headers:{},setHeader(k,v){this.headers[k]=v;},end(value){this.body=value;}};
 return handler(req,res).then(()=>res);
}
const valid={name:'Test Person',email:'visitor@example.com',service:'sourcing',message:'Hello\nSecond line',language:'en'};
test('contact delivery and rejection cases',async()=>{
 let calls=[];const original=global.fetch;const key=process.env.RESEND_API_KEY;
 global.fetch=async(url,init)=>{calls.push(JSON.parse(init.body));return {ok:true};};
 process.env.RESEND_API_KEY='test-only';
 try {
  for(const language of ['en','fr','zh']) {
   const r=await run({...valid,language});assert.equal(r.statusCode,200);assert.equal(JSON.parse(r.body).ok,true);
  }
  assert.equal(calls[0].to[0],'info@innoledge.com');assert.equal(calls[0].reply_to,valid.email);assert.match(calls[0].text,/Hello\nSecond line/);
  const html=await run({...valid,language:'fr'},{accept:'text/html'});assert.match(html.body,/lang="fr"/);assert.match(html.body,/href="\/fr\/contact\/"/);
  const count=calls.length;
  assert.equal((await run({...valid,website:'spam'})).statusCode,200);assert.equal(calls.length,count);
  assert.equal((await run(valid,{},'GET')).statusCode,405);
  assert.equal((await run(valid,{origin:'https://attacker.vercel.app'})).statusCode,403);
  assert.equal((await run({...valid,email:'bad'})).statusCode,400);
  assert.equal((await run({...valid,name:'Injected\r\nBcc:evil@example.com'})).statusCode,400);
  assert.equal((await run({...valid,message:'a'.repeat(5001)})).statusCode,400);
  assert.equal((await run({...valid,service:''})).statusCode,400);
  assert.equal((await run('null',{'content-type':'application/json'})).statusCode,400);
  delete process.env.RESEND_API_KEY;assert.equal((await run(valid)).statusCode,503);
  process.env.RESEND_API_KEY='test-only';global.fetch=async()=>({ok:false});assert.equal((await run(valid)).statusCode,502);
 } finally {global.fetch=original;if(key===undefined)delete process.env.RESEND_API_KEY;else process.env.RESEND_API_KEY=key;}
});
