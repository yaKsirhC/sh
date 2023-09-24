import puppeteer from 'puppeteer-extra'
import stealth from 'puppeteer-extra-plugin-stealth'
import fs from 'fs'
import UserAgent from 'user-agents';

puppeteer.use(stealth())

const getProxies = async () => {
    return new Promise((resolve, reject) => {
        fs.readFile(`proxies.txt`, 'utf-8', (err, data) => {
            if (err) reject(err)
            const linesArray = data.split('\n')
            resolve(linesArray)
        })
    })
}

const launchMachine = async (host, port, url) => {
    try {

        const browser = await puppeteer.launch({
            headless: false,
            executablePath: '/usr/bin/google-chrome-stable',
            //executablePath: '/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome',
            args: [
                '--no-sandbox',
                '--disable-gpu',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-zygote',
                `--proxy-server=${host}:${port}`,
            ],
            env: {
                DISPLAY: ':1'
            }
        })

        const userAgent = new UserAgent();
        const page = await browser.newPage()
        await page.setUserAgent(userAgent.toString())

        await page.evaluateOnNewDocument(() => {
            localStorage.setItem('kick_video_size', '160p');
        });

        await page.goto(url)

        await new Promise(r => setTimeout(r, 5000))

        const elementExists = await page.evaluate(() => {
            const element = document.evaluate('/html/body/div/div[2]/div/div/div/div[2]/div[2]/div/div[2]/div[2]/div/div[4]/button[2]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            return element !== null;
        });

        if (elementExists) {
            await page.click('/html/body/div/div[2]/div/div/div/div[2]/div[2]/div/div[2]/div[2]/div/div[4]/button[2]');
        }

    } catch (err) {
        return []
    }
}

const start = async () => {

    const url = 'https://kick.com/jaredfps'
    const proxies = await getProxies()

    for (let i = 0; i < 300; i++) {
        const split = proxies[i].split(':')
        const host = split[0]
        const port = split[1]
        launchMachine(host, port, url)
    }

}

start()