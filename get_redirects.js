const urls = [
  "https://www.google.com/maps/place//data=!4m2!3m1!1s0x2e3b75d8f7f682f5:0x66b6fd4e1ad9c3a0?entry=gemini&utm_source=gemini&utm_campaign=gem-default",
  "https://www.google.com/maps/place//data=!4m2!3m1!1s0x2e3b75e09ae76da1:0xdcf3254f2655cae?entry=gemini&utm_source=gemini&utm_campaign=gem-default",
  "https://www.google.com/maps/place//data=!4m2!3m1!1s0x2e3b7685c2470ba3:0xbd2a7064a4e507db?entry=gemini&utm_source=gemini&utm_campaign=gem-default"
];

async function run() {
  for (const url of urls) {
    try {
      const res = await fetch(url);
      const text = await res.text();
      const match = text.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (match) {
        console.log(`${url} => ${match[1]}, ${match[2]}`);
      } else {
        console.log(`${url} => No match`);
      }
    } catch(e) { console.error(e) }
  }
}
run();
