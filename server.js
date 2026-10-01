require('dotenv').config();
const express = require('express');
const path = require('path');
const https = require('https');
const crypto = require('crypto');
const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function darajaHost(){ return process.env.DARAJA_ENV === 'production' ? 'api.safaricom.co.ke' : 'sandbox.safaricom.co.ke'; }
function requestHttps(host, p, method, headers, body='') {
  return new Promise((resolve,reject)=>{
    const req=https.request({host,path:p,method,headers},res=>{let data='';res.on('data',d=>data+=d);res.on('end',()=>{try{resolve({status:res.statusCode,data:JSON.parse(data||'{}')})}catch{resolve({status:res.statusCode,data})}})});
    req.on('error',reject); if(body) req.write(body); req.end();
  });
}
async function getToken(){
  const auth=Buffer.from(`${process.env.DARAJA_CONSUMER_KEY}:${process.env.DARAJA_CONSUMER_SECRET}`).toString('base64');
  const r=await requestHttps(darajaHost(),'/oauth/v1/generate?grant_type=client_credentials','GET',{Authorization:`Basic ${auth}`});
  if(!r.data.access_token) throw new Error(r.data.errorMessage||'Unable to obtain Daraja access token');
  return r.data.access_token;
}
function timestamp(){const d=new Date(); const p=n=>String(n).padStart(2,'0'); return `${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;}
app.post('/api/mpesa/stkpush', async (req,res)=>{
  try{
    const {phone,amount,accountReference='WCSH-ORDER',transactionDesc='Wide City Smart Digital Homes purchase'}=req.body;
    if(!/^2547\d{8}$/.test(phone)) return res.status(400).json({success:false,message:'Use phone format 2547XXXXXXXX'});
    const total=Math.round(Number(amount)); if(!total || total<1) return res.status(400).json({success:false,message:'Invalid amount'});
    const ts=timestamp(); const password=Buffer.from(`${process.env.DARAJA_SHORTCODE}${process.env.DARAJA_PASSKEY}${ts}`).toString('base64');
    const token=await getToken();
    const payload={BusinessShortCode:process.env.DARAJA_SHORTCODE,Password:password,Timestamp:ts,TransactionType:'CustomerPayBillOnline',Amount:total,PartyA:phone,PartyB:process.env.DARAJA_SHORTCODE,PhoneNumber:phone,CallBackURL:process.env.DARAJA_CALLBACK_URL,AccountReference:String(accountReference).slice(0,12),TransactionDesc:String(transactionDesc).slice(0,13)};
    const body=JSON.stringify(payload);
    const r=await requestHttps(darajaHost(),'/mpesa/stkpush/v1/processrequest','POST',{Authorization:`Bearer ${token}`,'Content-Type':'application/json','Content-Length':Buffer.byteLength(body)},body);
    res.status(r.status).json({success:r.status>=200&&r.status<300,...r.data});
  }catch(e){res.status(500).json({success:false,message:e.message});}
});
app.post('/api/mpesa/callback',(req,res)=>{console.log('M-Pesa callback:',JSON.stringify(req.body));res.json({ResultCode:0,ResultDesc:'Accepted'});});
app.get('/api/health',(req,res)=>res.json({ok:true,store:'Wide City Smart Digital Homes'}));
app.get('*',(req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));
app.listen(PORT,()=>console.log(`Wide City Smart Digital Homes running at http://localhost:${PORT}`));
