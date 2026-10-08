"""Stemserver voor het debat met de advocaat.

Draait op je eigen laptop en zet tekst om naar spraak met edge-tts
(de natuurlijke Microsoft-stemmen, zoals Maarten en Fenna). De debatpagina
stuurt elke zin hierheen. Werkt in elke browser, ook in Chrome.

Starten: dubbelklik op start-stemserver.bat, of: python stemserver.py
Stoppen: sluit het venster.
"""
import asyncio
import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import edge_tts

POORT = 8765
STEMMEN = {
    'nl-NL-MaartenNeural': 'Maarten (man, Nederland)',
    'nl-NL-FennaNeural': 'Fenna (vrouw, Nederland)',
    'nl-NL-ColetteNeural': 'Colette (vrouw, Nederland)',
    'nl-BE-ArnaudNeural': 'Arnaud (man, Vlaanderen)',
    'nl-BE-DenaNeural': 'Dena (vrouw, Vlaanderen)',
}


async def maak_audio(tekst, stem, tempo):
    stukken = []
    async for deel in edge_tts.Communicate(tekst, stem, rate=tempo).stream():
        if deel['type'] == 'audio':
            stukken.append(deel['data'])
    return b''.join(stukken)


class Handler(BaseHTTPRequestHandler):
    def koppen(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'content-type')
        # Nodig als de pagina van internet komt en deze server op je eigen laptop draait.
        self.send_header('Access-Control-Allow-Private-Network', 'true')

    def do_OPTIONS(self):
        self.send_response(204)
        self.koppen()
        self.end_headers()

    def do_GET(self):
        if self.path.startswith('/stemmen'):
            lijf = json.dumps(STEMMEN).encode('utf-8')
            self.send_response(200)
            self.koppen()
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(lijf)))
            self.end_headers()
            self.wfile.write(lijf)
        else:
            self.send_response(404)
            self.koppen()
            self.end_headers()

    def do_POST(self):
        if not self.path.startswith('/tts'):
            self.send_response(404)
            self.koppen()
            self.end_headers()
            return
        try:
            n = int(self.headers.get('Content-Length', '0'))
            vraag = json.loads(self.rfile.read(n) or b'{}')
            tekst = (vraag.get('tekst') or '').strip()[:2000]
            stem = vraag.get('stem') if vraag.get('stem') in STEMMEN else 'nl-NL-MaartenNeural'
            tempo = vraag.get('tempo') or '+0%'
            if not tekst:
                raise ValueError('geen tekst')
            audio = asyncio.run(maak_audio(tekst, stem, tempo))
            self.send_response(200)
            self.koppen()
            self.send_header('Content-Type', 'audio/mpeg')
            self.send_header('Content-Length', str(len(audio)))
            self.end_headers()
            self.wfile.write(audio)
        except Exception as fout:
            lijf = json.dumps({'fout': str(fout)}).encode('utf-8')
            self.send_response(500)
            self.koppen()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(lijf)

    def log_message(self, *args):
        pass


if __name__ == '__main__':
    print(f'Stemserver draait op http://localhost:{POORT}')
    print('Laat dit venster open tijdens het debat. Sluiten = stoppen.')
    ThreadingHTTPServer(('127.0.0.1', POORT), Handler).serve_forever()
