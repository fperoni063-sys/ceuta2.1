import io
from bs4 import BeautifulSoup

with io.open('scratch_inscriptos.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

tables = soup.find_all('table')
for i, table in enumerate(tables):
    rows = table.find_all('tr')
    if len(rows) > 1:
        print(f"Table {i} has {len(rows)} rows.")
        headers = [th.text.strip() for th in rows[0].find_all(['th', 'td'])]
        print(f"Headers: {headers}")
        if len(rows) > 1:
            first_data = [td.text.strip() for td in rows[1].find_all(['td', 'th'])]
            print(f"First data row: {first_data}")
        print("-" * 50)
