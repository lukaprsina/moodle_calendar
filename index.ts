import puppeteer from "puppeteer";
import dotenv from "dotenv"

const LOGIN_URL = "https://ucilnica.fri.uni-lj.si/login/index.php";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function main() {
    const browser = await puppeteer.launch({
        timeout: 0,
        headless: false
    })

    const page = await browser.newPage();
    page.goto(LOGIN_URL, { waitUntil: "networkidle2" });
    await page.waitForSelector("input#username");

    const username = process.env.MOODLE_USERNAME!;
    const password = process.env.MOODLE_PASSWORD!;
    await page.type("input#username", username)
    await sleep(100)
    await page.type("input#password", password)
    await sleep(1000)
    await page.click("button#loginbtn");

    await sleep(100)
    await page.goto("https://ucilnica.fri.uni-lj.si/calendar/managesubscriptions.php", { waitUntil: "networkidle2" })
    await page.waitForSelector("button");
    await sleep(100)
    const buttons = await page.$$("button");
    for (const button of buttons) {
        let button_text = await button.evaluate(el => el.innerText)
        if (button_text == "Izvozi koledar") {
            button.click();
            await sleep(100)
            const all_events = await page.waitForSelector("input#id_events_exportevents_all");
            all_events!.click();
            await sleep(100)

            const custom_time = await page.waitForSelector("input#id_period_timeperiod_custom");
            custom_time!.click();
            await sleep(100)

            const url_element = await page.waitForSelector("input#id_export");
            await url_element?.click();
            await page.waitForNetworkIdle();
            await sleep(100)
        }
    }
}

console.log("Moodle calendar export");
dotenv.config()
main()