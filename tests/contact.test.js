const {test}=require('node:test');
const assert=require('node:assert/strict');
const nodemailer=require('nodemailer');
const handler=require('../api/contact');
function run(body, headers={}, method='POST') {
 const req={method,headers:{accept:'application/json',origin:'https://innoledge.com',...headers},body};
 const res={headers:{},setHeader(k,v){this.headers[k]=v;},end(value){this.body=value;}};
 return handler(req,res).then(()=>res);
}
const valid={name:'Test Person',email:'visitor@example.com',service:'sourcing',message:'Hello\nSecond line',language:'en'};
test('contact delivery and rejection cases',async()=>{
 let calls=[],options=[];const original=nodemailer.createTransport;const previous={...process.env};
 nodemailer.createTransport=config=>{options.push(config);return {sendMail:async mail=>{calls.push(mail);return {accepted:['info@innoledge.com']};}};};
 process.env.SMTP_USER='info@innoledge.com';process.env.SMTP_PASS='test-only';
 try {
  for(const language of ['en','fr','zh']) {
   const r=await run({...valid,language});assert.equal(r.statusCode,200);assert.equal(JSON.parse(r.body).ok,true);
  }
  assert.equal(calls[0].to,'info@innoledge.com');assert.equal(calls[0].replyTo,valid.email);assert.match(calls[0].text,/Hello\nSecond line/);
  assert.equal(options[0].host,'smtp.gmail.com');assert.equal(options[0].secure,true);assert.equal(options[0].requireTLS,true);assert.equal(calls[0].from,'info@innoledge.com');
  process.env.SMTP_PORT='587';await run(valid);assert.equal(options.at(-1).secure,false);assert.equal(options.at(-1).requireTLS,true);delete process.env.SMTP_PORT;
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
  delete process.env.SMTP_PASS;assert.equal((await run(valid)).statusCode,503);
  process.env.SMTP_PASS='test-only';nodemailer.createTransport=()=>({sendMail:async()=>({accepted:[]})});assert.equal((await run(valid)).statusCode,502);
  nodemailer.createTransport=()=>({sendMail:async()=>{throw new Error('Authentication failure');}});assert.equal((await run(valid)).statusCode,502);
 } finally {nodemailer.createTransport=original;for(const k of ['SMTP_USER','SMTP_PASS','SMTP_PORT']){if(previous[k]===undefined)delete process.env[k];else process.env[k]=previous[k];}}
});
