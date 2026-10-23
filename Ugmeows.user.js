// ==UserScript==
// @name         UGPhone Tool v5.9
// @namespace    https://viayoo.com/
// @version      5.9
// @run-at       document-idle
// @match        https://www.ugphone.com/*
// @grant        none
// ==/UserScript==
(function(){
'use strict';
if(document.getElementById('ug-btn'))return;

const DEF_HANAMI_TOKEN='bb4f1e493153e30730b2500e0a74258c6174fff55620be';
const DEF_SERVER='SG';

const SERVER_MAP={
    'SG':'Singapore',
    'HK':'HongKong',
    'JP':'Japan',
    'DE':'Germany',
    'US':'UnitedStates'
};

const K=["ugPhoneLang","ugBrowserId","UGPHONE-ID","UGrightSlideTips","hadAgreePolicy","_gcl_ls","UGPHONE-Token","UGPHONE-MQTT"];
const S='__ugphone_gmail_store__',A='__ugphone_accounts__',
      j=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||d)}catch{return JSON.parse(d)}},
      w=(k,v)=>localStorage.setItem(k,typeof v==='object'?JSON.stringify(v):String(v)),
      gs=()=>j(S,'null'),ss=(g,p)=>w(S,{gmail:g,password:p}),
      ga=()=>j(A,'[]'),sa=l=>w(A,l),
      E=(t,s,x)=>{const e=document.createElement(t);if(s)Object.assign(e.style,s);if(x!=null)e.textContent=x;return e},
      B=(bg,x)=>E('button',{flex:'1',padding:'10px',background:bg,color:'#fff',border:'0',borderRadius:'6px',cursor:'pointer',fontSize:'13px'},x),
      msg=(n,t,err)=>{n._i=(n._i||0)+1;const i=n._i;n.textContent=t;n.style.color=err?'#e74c3c':'#27ae60';setTimeout(()=>{if(n._i===i)n.textContent=''},3500)};

async function fetchT(url,opts,ms){
    const ctrl=new AbortController();
    const to=setTimeout(()=>ctrl.abort(),ms||120000);
    try{return await fetch(url,Object.assign({},opts,{signal:ctrl.signal}))}
    finally{clearTimeout(to)}
}

function snapLS(){const d={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k===A||k===S)continue;d[k]=localStorage.getItem(k)}return d}
function addAcc(a){const l=ga(),i=l.findIndex(x=>x.gmail===a.gmail);if(i>=0)l[i]={...l[i],...a,updatedAt:Date.now()};else l.push({...a,createdAt:Date.now(),updatedAt:Date.now()});sa(l)}
function findCurrentAcc(){
    const tk=localStorage.getItem('UGPHONE-Token'),li=localStorage.getItem('UGPHONE-ID');
    if(!tk&&!li)return null;
    return ga().find(a=>{const d=a.data||{};return(tk&&d['UGPHONE-Token']===tk)||(li&&d['UGPHONE-ID']===li)})||null;
}

// ===== NÚT NỔI =====
(function m(){
    if(!document.body||document.getElementById('ug-btn'))return;
    const b=B('#4a6bdf','📋 UG Tool');
    b.id='ug-btn';
    Object.assign(b.style,{position:'fixed',top:'20px',left:'20px',zIndex:2147483647,flex:'0 0 auto',boxShadow:'0 2px 8px rgba(0,0,0,.2)'});
    b.onclick=ui;
    document.body.appendChild(b);
})();
if(document.readyState==='loading'){let c=0;const t=setInterval(()=>{if(++c>20||document.body){clearInterval(t);if(!document.getElementById('ug-btn')){const b=B('#4a6bdf','📋 UG Tool');b.id='ug-btn';Object.assign(b.style,{position:'fixed',top:'20px',left:'20px',zIndex:2147483647,flex:'0 0 auto',boxShadow:'0 2px 8px rgba(0,0,0,.2)'});b.onclick=ui;document.body.appendChild(b)}}},300)}

function ui(){
    const ex=document.getElementById('ug-overlay');
    if(ex){ex.style.display='flex';return}

    const ov=E('div',{position:'fixed',inset:0,background:'rgba(0,0,0,.75)',zIndex:2147483646,display:'flex',justifyContent:'center',alignItems:'center',padding:'10px',boxSizing:'border-box'});
    ov.id='ug-overlay';ov.onclick=e=>{if(e.target===ov)ov.style.display='none'};

    const bx=E('div',{width:'100%',maxWidth:'500px',maxHeight:'92vh',background:'#fff',borderRadius:'10px',padding:'12px',boxSizing:'border-box',display:'flex',flexDirection:'column',gap:'8px',overflowY:'auto'});

    const tabs=E('div',{display:'flex',gap:'4px',flexWrap:'wrap'});
    const tL=B('#4a6bdf','🔑 Login'),tI=B('#e0e0e0','📥 Import'),tE=B('#e0e0e0','📤 Export'),tB=B('#e0e0e0','🌸 Buy');
    tL.style.color='#fff';tI.style.color='#333';tE.style.color='#333';tB.style.color='#333';
    tabs.append(tL,tI,tE,tB);

    const mk=()=>E('div',{display:'none',flexDirection:'column',gap:'6px'});
    const pL=mk(),pI=mk(),pE=mk(),pB=mk();

    // ===== TAB 🔑 LOGIN =====
    const taL=E('textarea',{width:'100%',minHeight:'140px',fontSize:'13px',fontFamily:'monospace',border:'1px solid #ccc',borderRadius:'6px',padding:'8px',boxSizing:'border-box',resize:'none'});
    taL.placeholder='abc@gmail.com|matkhau\ndef@gmail.com|matkhau\n\nPaste nhiều acc rồi bấm "Điền form login"';
    const rL=E('div',{display:'flex',gap:'6px'});
    const bFill=B('#27ae60','✍️ Điền form login');
    const bIdx=B('#3498db','▶️ Acc tiếp theo');
    rL.append(bFill,bIdx);
    const bSaveCur=B('#8e44ad','💾 Lưu acc này vào list');
    const msgL=E('div',{fontSize:'12px',textAlign:'center',minHeight:'16px'});
    pL.append(
        E('div',{fontSize:'12px',color:'#666'},'Paste danh sách acc (mỗi dòng gmail|pass):'),
        taL,rL,bSaveCur,
        E('div',{fontSize:'11px',color:'#888',textAlign:'center'},'Login acc 1 xong → bấm "Acc tiếp theo" để qua acc 2'),
        msgL
    );

    // ===== TAB 📥 IMPORT =====
    const inpJson=E('textarea',{width:'100%',minHeight:'220px',fontSize:'12px',fontFamily:'monospace',border:'1px solid #ccc',borderRadius:'6px',padding:'8px',boxSizing:'border-box',resize:'none'});
    inpJson.placeholder='Paste JSON localStorage vào đây:\n{\n  "UGPHONE-Token": "...",\n  "UGPHONE-ID": "...",\n  ...\n}';
    const rI=E('div',{display:'flex',gap:'6px'});
    const bImport=B('#27ae60','🔑 Login bằng Local');
    const bClearLS=B('#e74c3c','🗑️ Xóa localStorage');
    rI.append(bImport,bClearLS);
    const msgI=E('div',{fontSize:'12px',textAlign:'center',minHeight:'16px'});
    pI.append(
        E('div',{fontSize:'12px',color:'#666'},'Paste JSON (từ tab Export hoặc từ nguồn khác):'),
        inpJson,rI,
        E('div',{fontSize:'11px',color:'#888',textAlign:'center'},'Nạp xong → tự reload trang để áp dụng token'),
        msgI
    );

    // ===== TAB 📤 EXPORT =====
    const modeRow=E('div',{display:'flex',gap:'10px',fontSize:'13px',alignItems:'center',padding:'6px',background:'#f5f5f5',borderRadius:'6px'});
    const rAll=E('input');rAll.type='radio';rAll.name='em';rAll.checked=true;
    const rImp=E('input');rImp.type='radio';rImp.name='em';
    modeRow.append(rAll,E('label',null,'Toàn bộ'),rImp,E('label',null,'Quan trọng'));
    const out=E('textarea',{width:'100%',minHeight:'200px',fontSize:'12px',fontFamily:'monospace',border:'1px solid #ccc',borderRadius:'6px',padding:'8px',boxSizing:'border-box',resize:'none'});
    out.readOnly=true;out.placeholder='localStorage sẽ xuất ở đây...';
    const rE=E('div',{display:'flex',gap:'6px'});
    const bGet=B('#4a6bdf','📤 Xuất Local');
    const bCopy=B('#8e44ad','📋 Copy');
    const bGP=B('#c2185b','📋 Xuất Gmail|Pass');
    rE.append(bGet,bCopy,bGP);
    const msgE=E('div',{fontSize:'12px',textAlign:'center',minHeight:'16px'});
    pE.append(
        E('div',{fontSize:'12px',color:'#666'},'Chọn chế độ xuất:'),
        modeRow,
        E('div',{fontSize:'11px',color:'#888'},'• Toàn bộ: cả trăm key rác từ page\n• Quan trọng: chỉ 8 key cốt lõi (token, id, mqtt...)'),
        out,rE,msgE
    );

    // ===== TAB 🌸 BUY =====
    const tokenIn=E('input',{width:'100%',padding:'10px',boxSizing:'border-box',border:'1px solid #ccc',borderRadius:'6px',fontSize:'12px'});
    tokenIn.type='password';
    tokenIn.placeholder='Hanami Token';
    tokenIn.value=localStorage.getItem('__hanami_token__')||DEF_HANAMI_TOKEN;
    if(!localStorage.getItem('__hanami_token__'))localStorage.setItem('__hanami_token__',DEF_HANAMI_TOKEN);
    tokenIn.oninput=()=>localStorage.setItem('__hanami_token__',tokenIn.value.trim());

    const serverSel=E('select',{width:'100%',padding:'10px',boxSizing:'border-box',border:'1px solid #ccc',borderRadius:'6px',fontSize:'13px'});
    ['SG','HK','JP','DE','US'].forEach(s=>{
        const o=E('option',null,s+' ('+(SERVER_MAP[s]||s)+')');
        o.value=s;
        serverSel.appendChild(o);
    });
    serverSel.value=localStorage.getItem('__hanami_server__')||DEF_SERVER;
    serverSel.onchange=()=>localStorage.setItem('__hanami_server__',serverSel.value);

    // Nút thử tất cả server tự động
    const autoRow=E('div',{display:'flex',gap:'6px'});
    const bAuto=B('#f39c12','🔄 Thử tất cả server');
    autoRow.append(bAuto);

    const buyLog=E('textarea',{width:'100%',minHeight:'200px',fontSize:'12px',fontFamily:'monospace',border:'1px solid #ccc',borderRadius:'6px',padding:'8px',boxSizing:'border-box',resize:'none',background:'#1e1e1e',color:'#d4d4d4'});
    buyLog.readOnly=true;buyLog.placeholder='Log...';
    const rB=E('div',{display:'flex',gap:'6px'});
    const bBuy=B('#e91e63','🌸 Mua Trial');
    const bClr=B('#95a5a6','🧹 Clear');
    rB.append(bBuy,bClr);

    pB.append(
        E('div',{fontWeight:'bold',color:'#555',fontSize:'12px'},'Hanami Token (đã có sẵn)'),
        tokenIn,
        E('div',{fontWeight:'bold',color:'#555',fontSize:'12px'},'Server'),
        serverSel,
        autoRow,
        buyLog,rB,
        E('div',{fontSize:'11px',color:'#888',textAlign:'center',lineHeight:'1.5'},
          'Nếu server chính hết máy → bấm "🔄 Thử tất cả server"\nTự động thử lần lượt SG → HK → JP → DE → US')
    );

    const bX=B('#95a5a6','Đóng');bX.onclick=()=>ov.style.display='none';
    bx.append(E('div',{fontWeight:'bold',fontSize:'14px',color:'#333'},'UGPhone Tool v5.9'),tabs,pL,pI,pE,pB,bX);
    ov.appendChild(bx);document.body.appendChild(ov);

    const show=w=>{
        const mp={l:pL,i:pI,e:pE,b:pB},tb={l:tL,i:tI,e:tE,b:tB};
        for(const k in mp)mp[k].style.display=k===w?'flex':'none';
        for(const k in tb){tb[k].style.background=k===w?'#4a6bdf':'#e0e0e0';tb[k].style.color=k==='w'?'#fff':'#333'}
    };
    tL.onclick=()=>show('l');tI.onclick=()=>show('i');tE.onclick=()=>show('e');tB.onclick=()=>show('b');

    // ===== LOGIN LOGIC =====
    let accIdx=0;
    const parse=t=>t.split(/\r?\n/).map(l=>l.trim()).filter(Boolean).map(l=>{
        const p=l.split('|');
        return p.length>=2?{gmail:p[0].trim(),pass:p.slice(1).join('|').trim()}:null;
    }).filter(Boolean);

    const setV=(i,v)=>{
        const P=i.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;
        Object.getOwnPropertyDescriptor(P,'value').set.call(i,v);
        i.dispatchEvent(new Event('input',{bubbles:true}));
        i.dispatchEvent(new Event('change',{bubbles:true}));
    };

    async function doLogin(idx){
        const accs=parse(taL.value);
        if(!accs.length)return msg(msgL,'❌ Chưa có acc trong danh sách',1);
        if(idx>=accs.length)return msg(msgL,'✅ Đã hết danh sách',1);
        const a=accs[idx];
        const ins=[...document.querySelectorAll('input')];
        const em=ins.find(i=>i.type==='email'||/email|gmail|tài khoản|account/i.test(i.placeholder||''));
        const pw2=ins.find(i=>i.type==='password');
        if(!em||!pw2)return msg(msgL,'❌ Không thấy form login',1);
        setV(em,a.gmail);await new Promise(r=>setTimeout(r,200));
        setV(pw2,a.pass);await new Promise(r=>setTimeout(r,200));
        const btn=[...document.querySelectorAll('button,[role=button],a')].find(x=>/^(đăng nhập|login|sign in)$/i.test((x.textContent||'').trim()));
        if(btn){btn.click();msg(msgL,`✅ Login #${idx+1}: ${a.gmail}`)}
        else msg(msgL,`✅ Đã điền #${idx+1}: ${a.gmail} — tự bấm login`);
    }

    bFill.onclick=()=>{accIdx=0;doLogin(0)};
    bIdx.onclick=()=>{accIdx++;doLogin(accIdx)};

    bSaveCur.onclick=()=>{
        const tk=localStorage.getItem('UGPHONE-Token');
        if(!tk)return msg(msgL,'❌ Chưa login — không có token để lưu',1);
        const st=gs();
        let g=st&&st.gmail;
        if(!g){
            g=prompt('Nhập Gmail cho acc này:');
            if(!g)return;
        }
        addAcc({gmail:g,password:st?.password||'',data:snapLS()});
        msg(msgL,`✅ Đã lưu acc ${g}`);
    };

    // ===== IMPORT LOGIC =====
    bImport.onclick=()=>{
        let o;
        try{o=JSON.parse(inpJson.value)}catch(e){
            return msg(msgI,'❌ JSON lỗi: '+e.message,1);
        }
        if(typeof o!=='object'||Array.isArray(o)){
            return msg(msgI,'❌ Phải là object JSON',1);
        }
        if(!o['UGPHONE-Token']&&!o['UGPHONE-ID']){
            return msg(msgI,'❌ JSON không có UGPHONE-Token/ID',1);
        }
        let count=0;
        for(const k in o){
            if(k===A||k===S)continue;
            w(k,o[k]);
            count++;
        }
        msg(msgI,`✅ Đã nạp ${count} key — đang reload...`);
        setTimeout(()=>location.reload(),800);
    };

    bClearLS.onclick=()=>{
        if(!confirm('Xóa toàn bộ localStorage?'))return;
        localStorage.clear();
        msg(msgI,'Đã xóa — đang reload...');
        setTimeout(()=>location.reload(),600);
    };

    // ===== EXPORT LOGIC =====
    bGet.onclick=()=>{
        const d={};
        if(rImp.checked){
            for(const k of K){
                const v=localStorage.getItem(k);
                if(v!=null)d[k]=v;
            }
        }else{
            for(let i=0;i<localStorage.length;i++){
                const k=localStorage.key(i);
                d[k]=localStorage.getItem(k);
            }
        }
        if(!d['UGPHONE-Token']&&!d['UGPHONE-ID']){
            return msg(msgE,'❌ Chưa login hoặc localStorage trống',1);
        }
        const p={};
        for(const k in d){
            try{p[k]=JSON.parse(d[k])}catch{p[k]=d[k]}
        }
        out.value=JSON.stringify(p,null,2);
        const mode=rImp.checked?'quan trọng':'toàn bộ';
        msg(msgE,`✅ Đã xuất ${Object.keys(d).length} key (${mode})`);
    };

    bCopy.onclick=()=>{
        if(!out.value)return msg(msgE,'Bấm "Xuất Local" trước',1);
        try{
            navigator.clipboard.writeText(out.value)
                .then(()=>msg(msgE,'✅ Đã copy'))
                .catch(()=>{out.focus();out.select();msg(msgE,'Bôi đen + copy tay')});
        }catch{out.focus();out.select();msg(msgE,'Bôi đen + copy tay')}
    };

    bGP.onclick=()=>{
        const list=ga(),cur=findCurrentAcc(),seen=new Set(list.map(a=>a.gmail)),all=[...list];
        if(cur&&!seen.has(cur.gmail))all.push(cur);
        if(!cur){
            const s=gs();
            if(s&&s.gmail&&!seen.has(s.gmail))all.push(s);
        }
        if(!all.length)return msg(msgE,'❌ Chưa có acc nào',1);
        out.value=all.map(a=>`${a.gmail}|${a.password||''}`).join('\n');
        msg(msgE,`📋 ${all.length} acc — copy ở textarea`);
        try{navigator.clipboard.writeText(out.value).then(()=>msg(msgE,'✅ Đã copy')).catch(()=>{})}catch{}
    };

    // ===== BUY LOGIC — Core function dùng chung =====
    const L=(m,e)=>{buyLog.value+=(e?'❌ ':'')+m+'\n';buyLog.scrollTop=buyLog.scrollHeight};
    bClr.onclick=()=>buyLog.value='';

    async function tryBuy(token, serverName){
        const tk=localStorage.getItem('UGPHONE-Token');
        const li=localStorage.getItem('UGPHONE-ID');
        const lsData={};
        for(let i=0;i<localStorage.length;i++){
            const k=localStorage.key(i);
            if(k.startsWith('__hanami_')||k===A)continue;
            lsData[k]=localStorage.getItem(k);
        }

        const t0=Date.now();
        L(`🌸 Đang mua máy ${serverName}...`);

        const r=await fetchT('https://api.hanaminikata.com/v2/buy_device_ugphone',{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({
                token: token,
                data: JSON.stringify(lsData),
                server: serverName
            })
        },120000);

        const dur=((Date.now()-t0)/1000).toFixed(1);
        const txt=await r.text();
        let j2;
        try{j2=JSON.parse(txt)}catch{j2=null}

        return {j2, dur};
    }

    // ===== BUY 1 SERVER =====
    bBuy.onclick=async()=>{
        const token=tokenIn.value.trim()||DEF_HANAMI_TOKEN;
        const tk=localStorage.getItem('UGPHONE-Token');
        const li=localStorage.getItem('UGPHONE-ID');
        if(!tk||!li)return L('❌ Chưa login UGPhone',1);

        const selectedServer=serverSel.value;
        const serverName=SERVER_MAP[selectedServer]||selectedServer;

        bBuy.disabled=true;bBuy.style.opacity='.6';
        try{
            const {j2,dur}=await tryBuy(token,serverName);

            if(!j2){L('❌ Server không phản hồi đúng định dạng',1);return}

            const isSuccess =
                j2.success === true ||
                /thành công|success/i.test(j2.message||'') ||
                j2.code === 0 ||
                j2.code === 200;

            if(isSuccess){
                L(`🎉 THÀNH CÔNG (${dur}s)`);
                L(`   ${j2.message||'Đã đặt máy'}`);
                L(`👉 Tự reload sau 3s...`);
                setTimeout(()=>location.reload(),3000);
            }else{
                L(`💥 Thất bại (${dur}s)`,1);
                L(`   ${j2.message||'Không rõ lỗi'}`,1);
                const msgStr=(j2.message||'').toLowerCase();

                if(/hết máy|không còn máy|hết slot|hết thiết bị|server.*đầy|full|out.?of.?stock|sold.?out|no.?device|no.?slot|không khả dụng|unavailable/i.test(msgStr)){
                    L('🚫 HẾT MÁY — đổi server khác thử:',1);
                    L('   • HK (HongKong) • JP (Japan) • DE • US',1);
                    L('   Hoặc bấm "🔄 Thử tất cả server"',1);
                }
                else if(/server.*không hợp lệ|invalid.*server/i.test(msgStr))
                    L('👉 Server sai → thử server khác',1);
                else if(/already|used|quota|exceed|limit|đã dùng/i.test(msgStr))
                    L('👉 ACC ĐÃ DÙNG TRIAL → đổi acc khác',1);
                else if(/token|invalid/i.test(msgStr))
                    L('👉 Token Hanami sai',1);
                else if(/ip|whitelist/i.test(msgStr))
                    L('👉 IP chưa whitelist',1);
                else if(/credit|balance|hết lượt|không đủ/i.test(msgStr))
                    L('👉 Hết credit Hanami',1);
            }
        }catch(e){
            L(`💥 ${e.message}`,1);
        }finally{
            bBuy.disabled=false;bBuy.style.opacity='1';
        }
    };

    // ===== AUTO BUY — Thử tất cả server =====
    bAuto.onclick=async()=>{
        const token=tokenIn.value.trim()||DEF_HANAMI_TOKEN;
        const tk=localStorage.getItem('UGPHONE-Token');
        const li=localStorage.getItem('UGPHONE-ID');
        if(!tk||!li)return L('❌ Chưa login UGPhone',1);

        bAuto.disabled=true;bAuto.style.opacity='.6';bBuy.disabled=true;bBuy.style.opacity='.6';
        buyLog.value='';
        L('🔄 Thử tất cả server: SG → HK → JP → DE → US');
        L('━━━━━━━━━━━━━━━━━━━━━━━━━━');

        const servers=['SG','HK','JP','DE','US'];
        let success=false;
        let allOutOfStock=true;

        for(const srv of servers){
            if(success)break;
            const serverName=SERVER_MAP[srv]||srv;
            try{
                const {j2,dur}=await tryBuy(token,serverName);

                if(!j2){
                    L(`[${srv}] ❌ Server không phản hồi`);
                    continue;
                }

                const isSuccess =
                    j2.success === true ||
                    /thành công|success/i.test(j2.message||'') ||
                    j2.code === 0 ||
                    j2.code === 200;

                if(isSuccess){
                    L(`[${srv}] 🎉 THÀNH CÔNG (${dur}s)`);
                    L(`   ${j2.message||'Đã đặt máy'}`);
                    L(`━━━━━━━━━━━━━━━━━━━━━━━━━━`);
                    L(`👉 Tự reload sau 3s...`);
                    success=true;
                    setTimeout(()=>location.reload(),3000);
                    break;
                }else{
                    const msgStr=(j2.message||'').toLowerCase();
                    const isOutOfStock=/hết máy|không còn máy|hết slot|hết thiết bị|server.*đầy|full|out.?of.?stock|sold.?out|no.?device|no.?slot|không khả dụng|unavailable/i.test(msgStr);
                    const isTrialUsed=/already
