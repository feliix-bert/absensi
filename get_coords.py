import urllib.request
import re

urls = [
    "https://www.google.com/maps/place//data=!4m2!3m1!1s0x2e3b75d8f7f682f5:0x66b6fd4e1ad9c3a0?entry=gemini&utm_source=gemini&utm_campaign=gem-default",
    "https://www.google.com/maps/place//data=!4m2!3m1!1s0x2e3b75e09ae76da1:0xdcf3254f2655cae?entry=gemini&utm_source=gemini&utm_campaign=gem-default",
    "https://www.google.com/maps/place//data=!4m2!3m1!1s0x2e3b7685c2470ba3:0xbd2a7064a4e507db?entry=gemini&utm_source=gemini&utm_campaign=gem-default"
]

for url in urls:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        resp = urllib.request.urlopen(req)
        content = resp.read().decode('utf-8')
        # Google maps usually has [lat, lon] in the initial data
        matches = re.findall(r'\[(-?\d+\.\d+),(-?\d+\.\d+)\]', content)
        if matches:
            print(url)
            # print first few distinct coordinates
            print(list(set(matches))[:3])
    except Exception as e:
        print(e)
