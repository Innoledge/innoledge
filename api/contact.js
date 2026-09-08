const EMAIL = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
const copy = {
 en: {success:'Your message has been sent. We will be in touch shortly.', error:'Your message could not be sent. Please email info@innoledge.com.', invalid:'Please complete your name, email address, service and message.', back:'Back to the website'},
 fr: {success:'Votre message a été envoyé. Nous vous répondrons bientôt.', error:'Votre message n’a pas pu être envoyé. Écrivez à info@innoledge.com.', invalid:'Veuillez renseigner votre nom, votre adresse e-mail, le service et votre message.', back:'Retour au site'},
 zh: {success:'您的留言已发送。我们会尽快回复您。', error:'留言未能发送。请发送邮件至 info@innoledge.com。', invalid:'请填写姓名、电子邮箱、服务和留言。', back:'返回网站'}
};
const escape = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function allowed(origin) {
 const hosts = ['https://innoledge.com','https://www.innoledge.com','https://innoledge-com.vercel.app',process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`,process.env.VERCEL_BRANCH_URL && `https://${process.env.VERCEL_BRANCH_URL}`];
 return !origin || hosts.includes(origin);
}
async function bodyOf(req) {
 if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body;
 let raw = typeof req.body === 'string' || Buffer.isBuffer(req.body) ? String(req.body) : '';
 if (!raw) for await (const chunk of req) { raw += chunk; if (Buffer.byteLength(raw)>16384) throw new Error('body size'); }
 if (Buffer.byteLength(raw)>16384) throw new Error('body size');
 return (req.headers['content-type'] || '').includes('application/json') ? JSON.parse(raw) : Object.fromEntries(new URLSearchParams(raw));
}
module.exports = async function contact(req, res) {
 res.setHeader('Cache-Control','no-store');
 const json = (status, data) => {res.statusCode=status;res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify(data));};
 if (req.method !== 'POST') {res.setHeader('Allow','POST');return json(405,{ok:false});}
 if (!allowed(req.headers.origin)) return json(403,{ok:false});
 let body;
 try {body=await bodyOf(req);if(!body || Array.isArray(body) || typeof body !== 'object') throw new Error('invalid');}
 catch {return json(400,{ok:false});}
 const lang = Object.hasOwn(copy, body.language) ? body.language : 'en';
 const t = copy[lang];
 const reply = (status, ok, message) => {
  if ((req.headers.accept || '').includes('application/json')) return json(status,{ok,message});
  res.statusCode=status;res.setHeader('Content-Type','text/html; charset=utf-8');
  res.end(`<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Innoledge</title></head><body style="font:18px/1.6 system-ui;max-width:640px;margin:10vh auto;padding:24px"><main><h1>Innoledge</h1><p>${escape(message)}</p><p><a href="mailto:info@innoledge.com">info@innoledge.com</a></p><a href="/${lang}/contact/">${t.back}</a></main></body></html>`);
 };
 if (body.website) return reply(200,true,t.success);
 const limits={name:200,email:254,service:100,message:5000};
 const fields={};
 for(const [key,max] of Object.entries(limits)) {
  if(typeof body[key] !== 'string' || !body[key].trim() || body[key].length>max) return reply(400,false,t.invalid);
  fields[key]=body[key].trim();
 }
 if(!EMAIL.test(fields.email) || /[\r\n\x00-\x1f]/.test(fields.name+fields.email+fields.service)) return reply(400,false,t.invalid);
 if (!process.env.RESEND_API_KEY) return reply(503,false,t.error);
 try {
  const response=await fetch('https://api.resend.com/emails',{
   method:'POST',signal:AbortSignal.timeout(10000),
   headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json'},
   body:JSON.stringify({from:process.env.MAIL_FROM || 'website@innoledge.com',to:[process.env.MAIL_TO || 'info@innoledge.com'],reply_to:fields.email,subject:`Website enquiry: ${fields.service}`,text:`Name: ${fields.name}\nEmail: ${fields.email}\nService: ${fields.service}\nLanguage: ${lang}\n\n${fields.message}`})
  });
  if(!response.ok) throw new Error(`Provider status ${response.status}`);
  return reply(200,true,t.success);
 } catch(error) {
  console.error('Email delivery failed:',error.name);
  return reply(502,false,t.error);
 }
};
