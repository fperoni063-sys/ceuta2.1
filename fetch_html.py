import requests
import io

session = requests.Session()
login_data = {'username': 'admceu', 'password': 'Ceu+125aH', 'button': 'Submit'}
r1 = session.post('https://www.ceuta.org.uy/admin/login/checklogin.php', data=login_data)
r2 = session.get('https://www.ceuta.org.uy/admin/panel.php?pg=inscriptos_list')
r2.encoding = r2.apparent_encoding

with io.open('scratch_inscriptos.html', 'w', encoding='utf-8') as f:
    f.write(r2.text)
