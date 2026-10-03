"""Serveur d'essai local en MODE DÉMONSTRATION : répond 404 sur prepalog-config.json,
donc le site n'ouvre aucune connexion au vrai projet Firebase. Usage : python outils/serveur-demo.py [port]"""
import sys, os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))


class Demo(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.split('?')[0].endswith('prepalog-config.json'):
            self.send_error(404)
            return
        super().do_GET()

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()


port = int(sys.argv[1]) if len(sys.argv) > 1 else int(os.environ.get('PORT', 8001))
ThreadingHTTPServer(('127.0.0.1', port), Demo).serve_forever()
