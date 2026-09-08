const nodemailer = require('nodemailer');
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
 if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return reply(503,false,t.error);
 try {
  const port = Number(process.env.SMTP_PORT || 465);
  if (![465,587].includes(port)) throw new Error('Invalid SMTP port');
  const transport = nodemailer.createTransport({
   host: process.env.SMTP_HOST || 'smtp.gmail.com', port,
   secure: port === 465, requireTLS: true,
   auth: {user:process.env.SMTP_USER, pass:process.env.SMTP_PASS},
   connectionTimeout:10000, greetingTimeout:10000, socketTimeout:10000,
   disableFileAccess:true, disableUrlAccess:true
  });
  const result = await transport.sendMail({
   from:process.env.MAIL_FROM || process.env.SMTP_USER,
   to:process.env.MAIL_TO || 'info@innoledge.com', replyTo:fields.email,
   subject:`Website enquiry: ${fields.service}`,
   text:`Name: ${fields.name}\nEmail: ${fields.email}\nService: ${fields.service}\nLanguage: ${lang}\n\n${fields.message}`
  });
  if (!result.accepted || !result.accepted.length) throw new Error('SMTP recipient rejected');
  return reply(200,true,t.success);
 } catch(error) {
  console.error('Email delivery failed:',error.name);
  return reply(502,false,t.error);
 }
};
